import type OpenAI from "openai";
import type {
  ResponseCreateParamsStreaming,
} from "openai/resources/responses/responses";
import type { ConversationInputItem } from "@/lib/chat-input";
import { appendRetrievedContextToInstructions, retrieveContext } from "@/lib/retrieval";
import {
  finalizeResearchBotResponse,
  prepareNonStreamingResearchBotRequest,
  prepareStreamingResearchBotRequest,
} from "@/lib/research-bot";
import type {
  AuditOperationFeature,
  ResearchRequest,
  RetrievedContext,
  RetrievalSessionContext,
} from "@/lib/types";

type OpenAIRequestOptions = NonNullable<
  Parameters<OpenAI["responses"]["create"]>[1]
>;

type ForegroundTaskBase = {
  client: OpenAI;
  requestOptions: OpenAIRequestOptions;
  sessionContext: RetrievalSessionContext;
};

type ChatTaskOptions = ForegroundTaskBase & {
  transcript: ConversationInputItem[];
  input: string;
  instructions: string;
  model: string;
};

type ResearchTaskOptions = ForegroundTaskBase &
  Omit<ResearchRequest, "messages"> & {
    instructions?: string;
    messages?: ConversationInputItem[];
  };

const buildSessionContext = (
  feature: AuditOperationFeature,
  sessionId: string,
): RetrievalSessionContext => ({
  sessionId,
  route: feature === "chat" ? "/api/chat" : "/api/research",
  feature,
});

export const createRetrievalSessionContext = (
  feature: AuditOperationFeature,
  sessionId: string,
) => buildSessionContext(feature, sessionId);

const withRetrievedContext = async (
  input: string,
  instructions: string | undefined,
  sessionContext: RetrievalSessionContext,
) => {
  const retrievedContext = await retrieveContext(input, sessionContext);

  return {
    retrievedContext,
    instructions: appendRetrievedContextToInstructions({
      baseInstructions: instructions,
      retrievedContext,
    }),
  };
};

export const runForegroundChatTask = async ({
  client,
  requestOptions,
  sessionContext,
  transcript,
  input,
  instructions,
  model,
}: ChatTaskOptions) => {
  const { instructions: effectiveInstructions, retrievedContext } =
    await withRetrievedContext(input, instructions, sessionContext);

  const params: ResponseCreateParamsStreaming = {
    model,
    instructions: effectiveInstructions,
    input: [
      ...transcript,
      {
        role: "user",
        content: [{ type: "input_text", text: input }],
      },
    ] as unknown as ResponseCreateParamsStreaming["input"],
    max_output_tokens: 2200,
    stream: true,
    tool_choice: "none",
    tools: [],
  };

  return {
    retrievedContext,
    stream: client.responses.stream(params, requestOptions),
  };
};

export const runForegroundResearchStreamingTask = async ({
  client,
  requestOptions,
  sessionContext,
  input,
  instructions,
  ...options
}: ResearchTaskOptions) => {
  const { instructions: effectiveInstructions, retrievedContext } =
    await withRetrievedContext(input, instructions, sessionContext);
  const prepared = prepareStreamingResearchBotRequest({
    input,
    instructions: effectiveInstructions,
    ...options,
  });

  return {
    prepared,
    retrievedContext,
    stream: client.responses.stream(prepared.params, requestOptions),
  };
};

export const runForegroundResearchTask = async ({
  client,
  requestOptions,
  sessionContext,
  input,
  instructions,
  ...options
}: ResearchTaskOptions) => {
  const { instructions: effectiveInstructions, retrievedContext } =
    await withRetrievedContext(input, instructions, sessionContext);
  const prepared = prepareNonStreamingResearchBotRequest({
    input,
    instructions: effectiveInstructions,
    ...options,
  });

  const result = await client.responses
    .create(prepared.params, requestOptions)
    .withResponse();
  const finalized = finalizeResearchBotResponse({
    response: result.data,
    policy: prepared.policy,
    querySummary: prepared.querySummary,
    blockedDomains: prepared.blockedDomains,
  });

  return {
    finalized,
    prepared,
    response: result.data,
    responseHeaders: result.response.headers,
    retrievedContext,
    requestId: result.request_id,
  };
};
export type { RetrievedContext };
