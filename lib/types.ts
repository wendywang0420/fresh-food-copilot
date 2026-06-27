export type ChatRole = "user" | "assistant";
export type AITaskKind = "chat_generation" | "research_generation";
export type AuditOperationFeature = "chat" | "research";
export type AuditOperationStatus = "started" | "completed" | "failed";
export type AccessState =
  | "public_visitor"
  | "lead_unlocked"
  | "invite_unlocked"
  | "admin";
export type AuditOperationErrorPhase =
  | "validation"
  | "security"
  | "rate_limit"
  | "startup"
  | "streaming"
  | "post-processing"
  | "upstream";
export type ResearchReasoningEffort =
  | "none"
  | "minimal"
  | "low"
  | "medium"
  | "high"
  | "xhigh";
export type ResearchSearchMode = "none" | "auto" | "required";
export type ResearchSearchContextSize = "low" | "medium" | "high";

export interface SourceLink {
  title: string;
  url: string;
}

export interface RetrievedContext {
  id: string;
  title: string;
  content: string;
  score?: number;
  metadata?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  sources?: SourceLink[];
  researchUsed?: boolean;
  querySummary?: string;
  fetchedAt?: string;
}

export interface ResearchUserLocation {
  type?: "approximate";
  city?: string;
  region?: string;
  country?: string;
  timezone?: string;
}

export interface RetrievalSessionContext {
  sessionId: string;
  route: string;
  feature: AuditOperationFeature;
}

export interface ResearchPolicyDecision {
  searchMode: ResearchSearchMode;
  freshnessSensitive: boolean;
  liveWebAccess: boolean;
  reason: string;
  allowedDomains: string[];
  blockedDomains: string[];
}

export interface ResearchRequest {
  input: string;
  instructions?: string;
  sessionId?: string;
  messages?: ChatMessage[];
  allowedDomains?: string[];
  blockedDomains?: string[];
  externalWebAccess?: boolean;
  userLocation?: ResearchUserLocation;
  background?: boolean;
  forceSearch?: boolean;
  maxOutputTokens?: number;
  model?: string;
  reasoningEffort?: ResearchReasoningEffort;
  searchContextSize?: ResearchSearchContextSize;
}

export interface ResearchResponse {
  answer: string;
  sources: SourceLink[];
  researchUsed: boolean;
  querySummary: string;
  fetchedAt: string;
  policy: ResearchPolicyDecision;
  responseId: string;
  status?: string;
  model?: string;
}

export interface AITransportMetadata {
  task: AITaskKind;
  provider: "openai";
  mode: "direct-openai" | "gateway-openai";
  gatewayEnabled: boolean;
  gatewayConfigured: boolean;
  gatewayUsed: boolean;
  fallbackEnabled: boolean;
  baseURL: string;
  requestTimeoutMs?: number;
  maxAttempts?: number;
  retryDelayMs?: number;
  retryBackoff?: "constant" | "linear" | "exponential";
}

export interface AIGatewayResponseMetadata {
  requestId?: string | null;
  gatewayStep?: number | null;
  fallbackUsed?: boolean;
  retryCount?: number | null;
}

export interface AIModelOption {
  value: string;
  label: string;
}

export interface AccessCapabilities {
  canViewPublic: boolean;
  canViewFullProduct: boolean;
  canUseAI: boolean;
  canAccessAdmin: boolean;
}

export interface AppRuntimeSettings {
  leadGateEnabled: boolean;
  inviteGateEnabled: boolean;
  researchModeEnabled: boolean;
  chatModelOptions: string[];
  researchModelOptions: string[];
}

export interface LeadSubmissionSummary {
  id: number;
  name: string;
  workEmail: string;
  company: string;
  roleTitle: string;
  sessionId?: string;
  createdAt: string;
}

export interface InviteRedemptionSummary {
  id: number;
  inviteCodeId: number;
  sessionId?: string;
  redeemedAt: string;
}

export interface AccessSessionPayload {
  accessState: AccessState;
  issuedAt: string;
  leadSubmissionId?: number;
  inviteRedemptionId?: number;
  adminEmail?: string;
}

export interface AccessSessionResponse {
  accessState: AccessState;
  capabilities: AccessCapabilities;
  settings: AppRuntimeSettings;
  chatModelOptions: AIModelOption[];
  researchModelOptions: AIModelOption[];
  adminEmail?: string;
  leadSubmission?: LeadSubmissionSummary;
  inviteRedemption?: InviteRedemptionSummary;
}

export interface AuditSessionContext {
  sessionId: string;
  route: string;
  ipHash?: string;
  researchEnabled?: boolean;
  userLocation?: ResearchUserLocation;
  accessState?: AccessState;
  leadSubmissionId?: number;
  inviteRedemptionId?: number;
  adminEmail?: string;
  requestContext?: Record<string, unknown>;
}

export interface AuditConversationMessageInput {
  sessionId: string;
  role: ChatRole;
  content: string;
  createdAt?: string;
  sources?: SourceLink[];
  researchUsed?: boolean;
  querySummary?: string;
  fetchedAt?: string;
}

export interface AuditOperationStartInput {
  sessionId: string;
  route: string;
  feature: AuditOperationFeature;
  requestId: string;
  provider: string;
  model: string;
  gatewayUsed: boolean;
  transportMode: AITransportMetadata["mode"];
  fallbackEnabled?: boolean;
  requestContext?: Record<string, unknown>;
}

export interface AuditOperationEventInput {
  operationId: number | string | null;
  eventType: string;
  payload?: Record<string, unknown>;
}

export interface AuditOperationCompletionInput {
  operationId: number | string | null;
  responseId?: string;
  providerRequestId?: string | null;
  model?: string;
  streamedChars?: number;
  durationMs?: number;
  fallbackUsed?: boolean;
  retryCount?: number | null;
}

export interface AuditOperationFailureInput {
  operationId: number | string | null;
  errorPhase: AuditOperationErrorPhase;
  errorMessage: string;
  responseId?: string;
  providerRequestId?: string | null;
  streamedChars?: number;
  durationMs?: number;
  fallbackUsed?: boolean;
  retryCount?: number | null;
}
