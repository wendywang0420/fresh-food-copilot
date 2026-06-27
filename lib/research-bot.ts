import OpenAI from "openai";
import type {
  Response as OpenAIResponse,
  ResponseCreateParamsNonStreaming,
  ResponseCreateParamsStreaming,
  ResponseInputItem,
  WebSearchTool,
} from "openai/resources/responses/responses";
import { env } from "@/lib/env";
import type {
  ConversationInputItem,
} from "@/lib/chat-input";
import type {
  ResearchPolicyDecision,
  ResearchRequest,
  ResearchResponse,
  ResearchSearchMode,
  ResearchUserLocation,
  SourceLink,
} from "@/lib/types";

const REQUIRED_SEARCH_PATTERNS = [
  /\b(latest|current|today|tonight|this week|this month|recent|breaking)\b/i,
  /\b(news|headline|headlines|press release|release notes)\b/i,
  /\b(price|pricing|stock|quote|exchange rate|market cap)\b/i,
  /\b(law|laws|legal|regulation|regulations|rule|rules)\b/i,
  /\b(schedule|schedules|standings|score|weather|forecast)\b/i,
  /\b(look it up|search (the )?web|browse|find online|verify online|check online)\b/i,
  /\b(cite|citation|citations|source|sources)\b/i,
];

const FRESHNESS_SENSITIVE_PATTERNS = [
  /\b(as of|currently|current state|what's happening|what is happening)\b/i,
  /\b(trend|trends|market|competitor|competitors)\b/i,
  /\b(202[4-9]|203[0-9])\b/,
  /\b(launch|launched|announced|announcement|update|updated)\b/i,
  /\b(ceo|president|prime minister|chair|founder)\b/i,
];

const normalizeWhitespace = (value: string) =>
  value.replace(/\s+/g, " ").trim();

const normalizeDomainList = (domains: string[] | undefined) =>
  Array.from(
    new Set(
      (domains ?? [])
        .map((domain) => domain.trim().toLowerCase())
        .map((domain) => domain.replace(/^https?:\/\//, ""))
        .map((domain) => domain.replace(/\/+$/, ""))
        .filter(Boolean),
    ),
  );

const buildQuerySummary = (input: string) => {
  const normalized = normalizeWhitespace(input);

  if (normalized.length <= 180) {
    return normalized;
  }

  return `${normalized.slice(0, 177)}...`;
};

const hostnameMatchesDomain = (hostname: string, domain: string) =>
  hostname === domain || hostname.endsWith(`.${domain}`);

const isBlockedSource = (url: string, blockedDomains: string[]) => {
  if (blockedDomains.length === 0) {
    return false;
  }

  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return blockedDomains.some((domain) => hostnameMatchesDomain(hostname, domain));
  } catch {
    return false;
  }
};

const isReasoningModel = (model: string) =>
  model.startsWith("gpt-5") || model.startsWith("o");

const buildResearchInstructions = ({
  instructions,
  allowedDomains,
  blockedDomains,
}: {
  instructions?: string;
  allowedDomains: string[];
  blockedDomains: string[];
}) => {
  const instructionParts = [
    instructions?.trim(),
    [
      "You are the dedicated real-time research bot for a wider chatbot network.",
      "Use web search only when current, externally verifiable, or freshness-sensitive information is needed.",
      "If the user explicitly asks you to look something up, verify it online before answering.",
      "If you cannot verify a claim confidently, say you could not verify it instead of guessing.",
      "Separate sourced facts from synthesis or inference when that distinction matters.",
    ].join(" "),
  ];

  if (allowedDomains.length > 0) {
    instructionParts.push(
      `If web search is used, prefer and stay within these allowed domains: ${allowedDomains.join(
        ", ",
      )}.`,
    );
  }

  if (blockedDomains.length > 0) {
    instructionParts.push(
      `Do not rely on, quote, or cite these blocked domains: ${blockedDomains.join(
        ", ",
      )}. If verification would depend on them, say so plainly.`,
    );
  }

  return instructionParts.filter(Boolean).join("\n\n");
};

const createPolicyDecision = ({
  input,
  forceSearch,
  allowedDomains,
  blockedDomains,
  externalWebAccess,
}: {
  input: string;
  forceSearch?: boolean;
  allowedDomains: string[];
  blockedDomains: string[];
  externalWebAccess: boolean;
}): ResearchPolicyDecision => {
  const normalizedInput = normalizeWhitespace(input);
  const requiresSearch =
    forceSearch === true ||
    REQUIRED_SEARCH_PATTERNS.some((pattern) => pattern.test(normalizedInput));
  const freshnessSensitive =
    requiresSearch ||
    FRESHNESS_SENSITIVE_PATTERNS.some((pattern) => pattern.test(normalizedInput));

  let searchMode: ResearchSearchMode = "none";
  let reason = "No fresh or externally verifiable information was detected.";

  if (requiresSearch) {
    searchMode = "required";
    reason = "The request explicitly asks for current or verifiable web research.";
  } else if (freshnessSensitive) {
    searchMode = "auto";
    reason = "The request appears freshness-sensitive, so search is available if needed.";
  }

  return {
    searchMode,
    freshnessSensitive,
    liveWebAccess: externalWebAccess,
    reason,
    allowedDomains,
    blockedDomains,
  };
};

const buildWebSearchTool = ({
  allowedDomains,
  blockedDomains,
  externalWebAccess,
  userLocation,
  searchContextSize,
}: {
  allowedDomains: string[];
  blockedDomains: string[];
  externalWebAccess: boolean;
  userLocation?: ResearchUserLocation;
  searchContextSize?: ResearchRequest["searchContextSize"];
}) => {
  const tool: Record<string, unknown> = {
    type: "web_search",
    search_context_size:
      searchContextSize ?? env.openAIResearchSearchContextSize,
  };

  if (allowedDomains.length > 0 || blockedDomains.length > 0) {
    tool.filters = {};

    if (allowedDomains.length > 0) {
      (tool.filters as Record<string, unknown>).allowed_domains = allowedDomains;
    }

    if (blockedDomains.length > 0) {
      (tool.filters as Record<string, unknown>).blocked_domains = blockedDomains;
    }
  }

  if (userLocation) {
    tool.user_location = {
      type: "approximate",
      ...userLocation,
    };
  }

  if (!externalWebAccess) {
    tool.external_web_access = false;
  }

  return tool as unknown as WebSearchTool;
};

type PreparedResearchBotRequest = {
  params: ResponseCreateParamsNonStreaming | ResponseCreateParamsStreaming;
  policy: ResearchPolicyDecision;
  blockedDomains: string[];
  querySummary: string;
};

type PreparedResearchBotOptions = Omit<ResearchRequest, "messages"> & {
  messages?: ConversationInputItem[];
  stream: boolean;
};

const prepareResearchBotRequest = ({
  input,
  instructions,
  sessionId,
  messages,
  allowedDomains: rawAllowedDomains,
  blockedDomains: rawBlockedDomains,
  externalWebAccess = true,
  userLocation,
  background = false,
  forceSearch,
  maxOutputTokens = 2200,
  model = env.openAIResearchModel,
  reasoningEffort = env.openAIResearchReasoningEffort,
  searchContextSize,
  stream,
}: PreparedResearchBotOptions): PreparedResearchBotRequest => {
  const allowedDomains = normalizeDomainList(rawAllowedDomains);
  const blockedDomains = normalizeDomainList(rawBlockedDomains);
  const policy = createPolicyDecision({
    input,
    forceSearch,
    allowedDomains,
    blockedDomains,
    externalWebAccess,
  });
  const querySummary = buildQuerySummary(input);
  const tools =
    policy.searchMode === "none"
      ? []
      : [
          buildWebSearchTool({
            allowedDomains,
            blockedDomains,
            externalWebAccess,
            userLocation,
            searchContextSize,
      }),
        ];
  const requestInput = [
    ...(messages ?? []),
    {
      role: "user",
      content: [{ type: "input_text", text: input }],
    },
  ] as unknown as ResponseInputItem[];

  const params: ResponseCreateParamsNonStreaming | ResponseCreateParamsStreaming = {
    background,
    include:
      policy.searchMode === "none"
        ? undefined
        : ["web_search_call.action.sources"],
    input: requestInput,
    instructions: buildResearchInstructions({
      instructions,
      allowedDomains,
      blockedDomains,
    }),
    max_output_tokens: maxOutputTokens,
    metadata: {
      service: "research-bot",
      search_mode: policy.searchMode,
      live_web_access: String(policy.liveWebAccess),
      freshness_sensitive: String(policy.freshnessSensitive),
      query_summary: querySummary,
    },
    model,
    parallel_tool_calls: false,
    reasoning: isReasoningModel(model)
      ? {
          effort: reasoningEffort,
          summary: "auto",
        }
      : undefined,
    safety_identifier: sessionId?.slice(0, 64),
    stream,
    tool_choice: policy.searchMode,
    tools,
  };

  return {
    params,
    policy,
    blockedDomains,
    querySummary,
  };
};

export const prepareStreamingResearchBotRequest = (
  options: Omit<PreparedResearchBotOptions, "stream">,
) => {
  const prepared = prepareResearchBotRequest({
    ...options,
    stream: true,
  });

  return {
    ...prepared,
    params: prepared.params as ResponseCreateParamsStreaming,
  };
};

export const prepareNonStreamingResearchBotRequest = (
  options: Omit<PreparedResearchBotOptions, "stream">,
) => {
  const prepared = prepareResearchBotRequest({
    ...options,
    stream: false,
  });

  return {
    ...prepared,
    params: prepared.params as ResponseCreateParamsNonStreaming,
  };
};

const extractSources = (
  response: OpenAIResponse,
  blockedDomains: string[],
): {
  sources: SourceLink[];
  researchUsed: boolean;
} => {
  const seen = new Map<string, SourceLink>();
  let researchUsed = false;

  for (const item of response.output ?? []) {
    if (item.type === "web_search_call") {
      researchUsed = true;

      const actionSources =
        (
          item.action as
            | {
                sources?: Array<{
                  title?: string | null;
                  url?: string | null;
                }>;
              }
            | undefined
        )?.sources ?? [];

      for (const source of actionSources) {
        if (
          source.url &&
          !seen.has(source.url) &&
          !isBlockedSource(source.url, blockedDomains)
        ) {
          seen.set(source.url, {
            title: source.title ?? source.url,
            url: source.url,
          });
        }
      }
    }

    if (item.type !== "message") {
      continue;
    }

    for (const part of item.content ?? []) {
      if (part.type !== "output_text") {
        continue;
      }

      for (const annotation of part.annotations ?? []) {
        if (
          annotation.type === "url_citation" &&
          annotation.url &&
          !seen.has(annotation.url) &&
          !isBlockedSource(annotation.url, blockedDomains)
        ) {
          seen.set(annotation.url, {
            title: annotation.title ?? annotation.url,
            url: annotation.url,
          });
          researchUsed = true;
        }
      }
    }
  }

  return {
    researchUsed,
    sources: Array.from(seen.values()),
  };
};

const extractAnswerText = (response: OpenAIResponse) => {
  if (typeof response.output_text === "string") {
    const trimmedOutput = response.output_text.trim();

    if (trimmedOutput) {
      return trimmedOutput;
    }
  }

  const messageParts: string[] = [];

  for (const item of response.output ?? []) {
    if (item.type !== "message") {
      continue;
    }

    for (const part of item.content ?? []) {
      if (part.type === "output_text" && typeof part.text === "string") {
        const trimmedPart = part.text.trim();

        if (trimmedPart) {
          messageParts.push(trimmedPart);
        }
      }
    }
  }

  return messageParts.join("\n\n").trim();
};

export const finalizeResearchBotResponse = ({
  response,
  policy,
  querySummary,
  blockedDomains,
}: {
  response: OpenAIResponse;
  policy: ResearchPolicyDecision;
  querySummary: string;
  blockedDomains: string[];
}): ResearchResponse => {
  const { sources, researchUsed } = extractSources(response, blockedDomains);
  const answerText = extractAnswerText(response);

  return {
    answer:
      answerText ||
      (response.status === "completed"
        ? "抱歉，这次没有生成到可用内容，请再试一次。"
        : ""),
    fetchedAt: new Date(response.created_at * 1000).toISOString(),
    model: response.model,
    policy,
    querySummary,
    researchUsed,
    responseId: response.id,
    sources,
    status: response.status,
  };
};

export const executeResearchBot = async (
  client: OpenAI,
  options: Omit<PreparedResearchBotOptions, "stream">,
) => {
  const prepared = prepareNonStreamingResearchBotRequest(options);
  const response = await client.responses.create(prepared.params);

  return finalizeResearchBotResponse({
    response,
    policy: prepared.policy,
    querySummary: prepared.querySummary,
    blockedDomains: prepared.blockedDomains,
  });
};
