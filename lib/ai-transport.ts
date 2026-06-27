import OpenAI from "openai";
import { env } from "@/lib/env";
import type {
  AIGatewayResponseMetadata,
  AITaskKind,
  AITransportMetadata,
} from "@/lib/types";

type OpenAIRequestOptions = NonNullable<
  Parameters<OpenAI["responses"]["create"]>[1]
>;

type TaskPolicy = {
  requestTimeoutMs: number;
  maxAttempts: number;
  retryDelayMs: number;
  retryBackoff: "constant" | "linear" | "exponential";
  fallbackEnabled: boolean;
};

const TASK_POLICIES: Record<AITaskKind, TaskPolicy> = {
  chat_generation: {
    requestTimeoutMs: 8_000,
    maxAttempts: 2,
    retryDelayMs: 250,
    retryBackoff: "linear",
    fallbackEnabled: env.aiChatFallbackEnabled,
  },
  research_generation: {
    requestTimeoutMs: 12_000,
    maxAttempts: 3,
    retryDelayMs: 500,
    retryBackoff: "exponential",
    fallbackEnabled: env.aiResearchFallbackEnabled,
  },
};

type ClientCacheKey = `${AITaskKind}:${"direct-openai" | "gateway-openai"}`;

const clientCache = new Map<ClientCacheKey, OpenAI>();

const buildGatewayBaseURL = () => {
  if (env.aiGatewayBaseURL) {
    return env.aiGatewayBaseURL.replace(/\/+$/, "");
  }

  if (!env.aiGatewayAccountID) {
    return "";
  }

  const gatewayID = env.aiGatewayGatewayID || "default";
  return `https://gateway.ai.cloudflare.com/v1/${env.aiGatewayAccountID}/${gatewayID}/openai`;
};

const getTaskPolicy = (task: AITaskKind) => TASK_POLICIES[task];

export const resolveAITransport = (task: AITaskKind): AITransportMetadata => {
  const taskPolicy = getTaskPolicy(task);
  const gatewayBaseURL = buildGatewayBaseURL();
  const gatewayConfigured = Boolean(gatewayBaseURL && env.aiGatewayAPIToken);
  const gatewayUsed = env.aiGatewayEnabled && gatewayConfigured;

  return {
    task,
    provider: "openai",
    mode: gatewayUsed ? "gateway-openai" : "direct-openai",
    gatewayEnabled: env.aiGatewayEnabled,
    gatewayConfigured,
    gatewayUsed,
    fallbackEnabled: taskPolicy.fallbackEnabled,
    baseURL: gatewayUsed ? gatewayBaseURL : env.openAIBaseURL,
    requestTimeoutMs: taskPolicy.requestTimeoutMs,
    maxAttempts: taskPolicy.maxAttempts,
    retryDelayMs: taskPolicy.retryDelayMs,
    retryBackoff: taskPolicy.retryBackoff,
  };
};

const getCachedClient = (cacheKey: ClientCacheKey, config: OpenAI): OpenAI => {
  const cached = clientCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  clientCache.set(cacheKey, config);
  return config;
};

export const getOpenAIClientBundle = (task: AITaskKind) => {
  if (!env.openAIApiKey) {
    throw new Error("Missing OPENAI_API_KEY or TENCENT_RELAY_API_KEY.");
  }

  const transport = resolveAITransport(task);

  if (
    env.aiGatewayEnabled &&
    !transport.gatewayConfigured &&
    !env.aiGatewayBypassOnError
  ) {
    throw new Error(
      "AI Gateway is enabled but not fully configured, and bypass is disabled.",
    );
  }

  const cacheKey: ClientCacheKey = `${task}:${transport.mode}`;
  const client = getCachedClient(
    cacheKey,
    new OpenAI({
      apiKey: env.openAIApiKey,
      baseURL: transport.baseURL,
    }),
  );

  const requestOptions: OpenAIRequestOptions = transport.gatewayUsed
    ? {
        headers: {
          "cf-aig-authorization": `Bearer ${env.aiGatewayAPIToken}`,
          "cf-aig-backoff": transport.retryBackoff,
          "cf-aig-collect-log-payload": "false",
          "cf-aig-max-attempts": String(transport.maxAttempts ?? 1),
          "cf-aig-request-timeout": String(transport.requestTimeoutMs ?? 8_000),
          "cf-aig-retry-delay": String(transport.retryDelayMs ?? 0),
        },
      }
    : {};

  return {
    client,
    requestOptions,
    transport,
  };
};

const parseIntegerHeader = (value: string | null) => {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

export const extractGatewayResponseMetadata = (
  response:
    | Response
    | {
        headers: Headers;
      }
    | null
    | undefined,
): AIGatewayResponseMetadata => {
  if (!response) {
    return {};
  }

  const gatewayStep = parseIntegerHeader(response.headers.get("cf-aig-step"));

  return {
    requestId: response.headers.get("x-request-id"),
    gatewayStep,
    fallbackUsed: gatewayStep !== null ? gatewayStep > 0 : undefined,
    retryCount: null,
  };
};
