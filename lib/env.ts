const parseBoolean = (value: string | undefined) => value === "true";
const parseString = (value: string | undefined) => value?.trim() ?? "";
const parseList = (value: string | undefined) =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
const parseReasoningEffort = (value: string | undefined) => {
  switch (value) {
    case "none":
    case "minimal":
    case "low":
    case "medium":
    case "high":
    case "xhigh":
      return value;
    default:
      return "low";
  }
};
const parseSearchContextSize = (value: string | undefined) => {
  switch (value) {
    case "low":
    case "medium":
    case "high":
      return value;
    default:
      return "medium";
  }
};

export const env = {
  openAIBaseURL:
    process.env.OPENAI_BASE_URL ??
    process.env.TENCENT_RELAY_BASE_URL ??
    "https://api.openai.com/v1",
  openAIApiKey:
    process.env.OPENAI_API_KEY ??
    process.env.TENCENT_RELAY_API_KEY ??
    "",
  openAIModel: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
  openAIResearchModel: process.env.OPENAI_RESEARCH_MODEL ?? "gpt-5.4-mini",
  aiChatModelOptions: parseList(process.env.AI_CHAT_MODEL_OPTIONS),
  aiResearchModelOptions: parseList(process.env.AI_RESEARCH_MODEL_OPTIONS),
  adminAccessEmails: parseList(process.env.ADMIN_ACCESS_EMAILS).map((email) =>
    email.toLowerCase(),
  ),
  openAIResearchReasoningEffort: parseReasoningEffort(
    process.env.OPENAI_RESEARCH_REASONING_EFFORT,
  ),
  openAIResearchSearchContextSize: parseSearchContextSize(
    process.env.OPENAI_RESEARCH_SEARCH_CONTEXT_SIZE,
  ),
  supabaseURL: process.env.SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  appSessionSecret: parseString(process.env.APP_SESSION_SECRET),
  enableTurnstile: parseBoolean(
    process.env.ENABLE_TURNSTILE ??
      process.env.NEXT_PUBLIC_ENABLE_TURNSTILE ??
      "false",
  ),
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY ?? "",
  turnstileExpectedHostname: process.env.TURNSTILE_EXPECTED_HOSTNAME ?? "",
  enableResearchMode: parseBoolean(process.env.ENABLE_RESEARCH_MODE),
  researchBotAPIKey: process.env.RESEARCH_BOT_API_KEY ?? "",
  aiGatewayEnabled: parseBoolean(process.env.AI_GATEWAY_ENABLED ?? "true"),
  aiGatewayBaseURL: parseString(process.env.AI_GATEWAY_BASE_URL),
  aiGatewayAccountID: parseString(process.env.AI_GATEWAY_ACCOUNT_ID),
  aiGatewayGatewayID: parseString(process.env.AI_GATEWAY_GATEWAY_ID),
  aiGatewayAPIToken: parseString(process.env.AI_GATEWAY_API_TOKEN),
  aiGatewayBypassOnError: parseBoolean(
    process.env.AI_GATEWAY_BYPASS_ON_ERROR ?? "true",
  ),
  aiChatFallbackEnabled: parseBoolean(
    process.env.AI_CHAT_FALLBACK_ENABLED ?? "false",
  ),
  aiResearchFallbackEnabled: parseBoolean(
    process.env.AI_RESEARCH_FALLBACK_ENABLED ?? "false",
  ),
  auditLoggingEnabled: parseBoolean(
    process.env.AUDIT_LOGGING_ENABLED ?? "true",
  ),
  workersAIEnabled: parseBoolean(process.env.WORKERS_AI_ENABLED ?? "false"),
  workersAIAccountID: parseString(process.env.WORKERS_AI_ACCOUNT_ID),
  workersAIAPIToken: parseString(process.env.WORKERS_AI_API_TOKEN),
  vectorizeEnabled: parseBoolean(process.env.VECTORIZE_ENABLED ?? "false"),
  vectorizeIndexName: parseString(process.env.VECTORIZE_INDEX_NAME),
  agentsEnabled: parseBoolean(process.env.AGENTS_ENABLED ?? "false"),
  publicResearchMode: parseBoolean(
    process.env.NEXT_PUBLIC_ENABLE_RESEARCH_MODE ??
      process.env.ENABLE_RESEARCH_MODE,
  ),
  publicTurnstileSiteKey: parseBoolean(
    process.env.NEXT_PUBLIC_ENABLE_TURNSTILE ??
      process.env.ENABLE_TURNSTILE ??
      "false",
  )
    ? (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "")
    : "",
  nodeEnv: process.env.NODE_ENV ?? "development",
};

export const isProduction = env.nodeEnv === "production";
