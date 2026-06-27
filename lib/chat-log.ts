import type {
  AuditConversationMessageInput,
  AuditOperationCompletionInput,
  AuditOperationEventInput,
  AuditOperationFailureInput,
  AuditOperationStartInput,
  AuditSessionContext,
} from "@/lib/types";
import { env } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const logSupabaseError = (action: string, error: unknown) => {
  console.error(`Audit log failure during ${action}.`, error);
};

const encodeHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

export const hashAuditValue = async (value: string) => {
  const normalized = value.trim();

  if (!normalized) {
    return "";
  }

  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(normalized),
  );

  return encodeHex(new Uint8Array(digest));
};

export const ensureSession = async ({
  sessionId,
  route,
  ipHash,
  researchEnabled,
  userLocation,
  accessState,
  leadSubmissionId,
  inviteRedemptionId,
  adminEmail,
  requestContext,
}: AuditSessionContext) => {
  const supabase = env.auditLoggingEnabled ? getSupabaseAdminClient() : null;

  if (!supabase || !sessionId.trim()) {
    return;
  }

  const timestamp = new Date().toISOString();
  const { error } = await supabase.from("conversation_sessions").upsert(
    {
      session_id: sessionId,
      route,
      ip_hash: ipHash || null,
      research_enabled: researchEnabled ?? false,
      access_state: accessState ?? "public_visitor",
      lead_submission_id: leadSubmissionId ?? null,
      invite_redemption_id: inviteRedemptionId ?? null,
      admin_email: adminEmail ?? null,
      request_context_json: {
        ...(requestContext ?? {}),
        userLocation: userLocation ?? null,
      },
      updated_at: timestamp,
    },
    {
      onConflict: "session_id",
      ignoreDuplicates: false,
    },
  );

  if (error) {
    logSupabaseError("ensureSession", error);
  }
};

export const logConversationMessage = async ({
  sessionId,
  role,
  content,
  createdAt,
  sources,
  researchUsed,
  querySummary,
  fetchedAt,
}: AuditConversationMessageInput) => {
  const supabase = env.auditLoggingEnabled ? getSupabaseAdminClient() : null;

  if (!supabase || !content.trim()) {
    return;
  }

  const { error } = await supabase.from("conversation_messages").insert({
    session_id: sessionId,
    role,
    content,
    created_at: createdAt ?? new Date().toISOString(),
    sources: sources ?? null,
    research_used: researchUsed ?? false,
    query_summary: querySummary ?? null,
    fetched_at: fetchedAt ?? null,
  });

  if (error) {
    logSupabaseError("logConversationMessage", error);
  }
};

export const startOperation = async ({
  sessionId,
  route,
  feature,
  requestId,
  provider,
  model,
  gatewayUsed,
  transportMode,
  fallbackEnabled,
  requestContext,
}: AuditOperationStartInput) => {
  const supabase = env.auditLoggingEnabled ? getSupabaseAdminClient() : null;

  if (!supabase) {
    return null;
  }

  const startedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("ai_operations")
    .insert({
      session_id: sessionId,
      route,
      feature,
      request_id: requestId,
      provider,
      model,
      gateway_used: gatewayUsed,
      fallback_used: false,
      retry_count: null,
      transport_mode: transportMode,
      fallback_enabled: fallbackEnabled ?? false,
      status: "started",
      started_at: startedAt,
      request_context_json: requestContext ?? null,
    })
    .select("id")
    .single();

  if (error) {
    logSupabaseError("startOperation", error);
    return null;
  }

  return data?.id ?? null;
};

export const appendOperationEvent = async ({
  operationId,
  eventType,
  payload,
}: AuditOperationEventInput) => {
  const supabase = env.auditLoggingEnabled ? getSupabaseAdminClient() : null;

  if (!supabase || operationId === null) {
    return;
  }

  const { error } = await supabase.from("ai_operation_events").insert({
    operation_id: operationId,
    event_type: eventType,
    payload_json: payload ?? {},
  });

  if (error) {
    logSupabaseError("appendOperationEvent", error);
  }
};

export const completeOperation = async ({
  operationId,
  responseId,
  providerRequestId,
  model,
  streamedChars,
  durationMs,
  fallbackUsed,
  retryCount,
}: AuditOperationCompletionInput) => {
  const supabase = env.auditLoggingEnabled ? getSupabaseAdminClient() : null;

  if (!supabase || operationId === null) {
    return;
  }

  const { error } = await supabase
    .from("ai_operations")
    .update({
      response_id: responseId ?? null,
      provider_request_id: providerRequestId ?? null,
      model: model ?? null,
      streamed_chars: streamedChars ?? null,
      duration_ms: durationMs ?? null,
      fallback_used: fallbackUsed ?? false,
      retry_count: retryCount ?? null,
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", operationId);

  if (error) {
    logSupabaseError("completeOperation", error);
  }
};

export const failOperation = async ({
  operationId,
  errorPhase,
  errorMessage,
  responseId,
  providerRequestId,
  streamedChars,
  durationMs,
  fallbackUsed,
  retryCount,
}: AuditOperationFailureInput) => {
  const supabase = env.auditLoggingEnabled ? getSupabaseAdminClient() : null;

  if (!supabase || operationId === null) {
    return;
  }

  const { error } = await supabase
    .from("ai_operations")
    .update({
      response_id: responseId ?? null,
      provider_request_id: providerRequestId ?? null,
      streamed_chars: streamedChars ?? null,
      duration_ms: durationMs ?? null,
      fallback_used: fallbackUsed ?? false,
      retry_count: retryCount ?? null,
      status: "failed",
      error_phase: errorPhase,
      error_message: errorMessage,
      completed_at: new Date().toISOString(),
    })
    .eq("id", operationId);

  if (error) {
    logSupabaseError("failOperation", error);
  }
};
