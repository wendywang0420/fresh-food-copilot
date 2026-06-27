import { NextRequest, NextResponse } from "next/server";
import {
  appendOperationEvent,
  completeOperation,
  ensureSession,
  failOperation,
  hashAuditValue,
  logConversationMessage,
  startOperation,
} from "@/lib/chat-log";
import { createForbiddenResponse, requireInviteAccess } from "@/lib/access-control";
import { getAppSettings } from "@/lib/app-settings";
import { env } from "@/lib/env";
import { extractGatewayResponseMetadata } from "@/lib/ai-transport";
import {
  createRetrievalSessionContext,
  runForegroundResearchTask,
} from "@/lib/foreground-tasks";
import { isAllowedResearchModel } from "@/lib/model-options";
import { getOpenAIClientBundle } from "@/lib/openai-client";
import { checkRateLimit } from "@/lib/rate-limit";
import { deriveApproximateUserLocation } from "@/lib/request-location";
import { sanitizeMessages } from "@/lib/chat-input";
import type { ChatMessage, ResearchRequest } from "@/lib/types";

type ResearchRouteBody = Omit<ResearchRequest, "messages"> & {
  messages?: ChatMessage[];
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown error";
};

const getDurationMs = (startedAtMs: number) => Date.now() - startedAtMs;

export async function POST(request: NextRequest) {
  let body: ResearchRouteBody;

  try {
    body = (await request.json()) as ResearchRouteBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const input = body.input?.trim();
  const sessionIdFromBody = body.sessionId?.trim();
  const selectedModel = body.model?.trim() || env.openAIResearchModel;
  const runtimeSettings = await getAppSettings();

  if (!input) {
    return NextResponse.json(
      { error: "input is required." },
      { status: 400 },
    );
  }

  if (!isAllowedResearchModel(selectedModel, runtimeSettings)) {
    return NextResponse.json(
      {
        error: "The selected research model is not enabled for this environment.",
      },
      { status: 400 },
    );
  }

  if (env.researchBotAPIKey) {
    const providedKey = request.headers.get("x-research-bot-key")?.trim();

    if (providedKey !== env.researchBotAPIKey) {
      return NextResponse.json(
        { error: "Unauthorized research bot request." },
        { status: 401 },
      );
    }
  }

  const requestId = crypto.randomUUID();
  const requestStartedAtMs = Date.now();
  const requestStartedAt = new Date(requestStartedAtMs).toISOString();
  const accessContext = await requireInviteAccess(request);

  if (!accessContext) {
    return createForbiddenResponse(
      "Invite-unlocked or admin access is required to use the research API.",
    );
  }

  if (
    !accessContext.settings.researchModeEnabled &&
    accessContext.accessState !== "admin"
  ) {
    return createForbiddenResponse("Research mode is currently disabled.");
  }

  const ipHeader =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for") ??
    "unknown";
  const remoteIp = ipHeader.split(",")[0]?.trim() || "unknown";
  const sessionId = sessionIdFromBody || remoteIp;
  const userLocation =
    body.userLocation ?? deriveApproximateUserLocation(request.headers);
  const ipHash = await hashAuditValue(remoteIp);

  await ensureSession({
    sessionId,
    route: "/api/research",
    ipHash,
    researchEnabled: true,
    userLocation,
    accessState: accessContext.accessState,
    leadSubmissionId: accessContext.leadSubmission?.id,
    inviteRedemptionId: accessContext.inviteRedemption?.id,
    adminEmail: accessContext.adminEmail,
    requestContext: {
      requestId,
      requestStartedAt,
      accessState: accessContext.accessState,
    },
  });

  const clientBundle = (() => {
    try {
      return getOpenAIClientBundle("research_generation");
    } catch (error) {
      console.error(error);
      return null;
    }
  })();

  const operationId = await startOperation({
    sessionId,
    route: "/api/research",
    feature: "research",
    requestId,
    provider: clientBundle?.transport.provider ?? "openai",
    model: selectedModel,
    gatewayUsed: clientBundle?.transport.gatewayUsed ?? false,
    transportMode: clientBundle?.transport.mode ?? "direct-openai",
    fallbackEnabled: clientBundle?.transport.fallbackEnabled ?? false,
    requestContext: {
      requestStartedAt,
      externalWebAccess: body.externalWebAccess ?? true,
      accessState: accessContext.accessState,
    },
  });

  await appendOperationEvent({
    operationId,
    eventType: "request_accepted",
    payload: {
      requestStartedAt,
      sessionId,
    },
  });

  const rateLimit = checkRateLimit(`${remoteIp}:${sessionId}`);

  if (!rateLimit.allowed) {
    await appendOperationEvent({
      operationId,
      eventType: "rate_limit_blocked",
      payload: {
        retryAfter: rateLimit.retryAfter,
      },
    });
    await failOperation({
      operationId,
      errorPhase: "rate_limit",
      errorMessage: "Too many research requests. Please wait a moment and try again.",
      durationMs: getDurationMs(requestStartedAtMs),
    });

    return NextResponse.json(
      {
        error: "Too many research requests. Please wait a moment and try again.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfter),
        },
      },
    );
  }

  await appendOperationEvent({
    operationId,
    eventType: "rate_limit_passed",
    payload: {
      retryAfter: rateLimit.retryAfter,
    },
  });

  await logConversationMessage({
    sessionId,
    role: "user",
    content: input,
  });

  if (!clientBundle) {
    await appendOperationEvent({
      operationId,
      eventType: "ai_client_configuration_failed",
      payload: {},
    });
    await failOperation({
      operationId,
      errorPhase: "startup",
      errorMessage: "The research bot is not configured yet.",
      durationMs: getDurationMs(requestStartedAtMs),
    });

    return NextResponse.json(
      {
        error: "The research bot is not configured yet.",
      },
      { status: 500 },
    );
  }

  await appendOperationEvent({
    operationId,
    eventType: "ai_request_started",
    payload: {
      transport: clientBundle.transport,
      model: selectedModel,
    },
  });

  try {
    const result = await runForegroundResearchTask({
      client: clientBundle.client,
      requestOptions: clientBundle.requestOptions,
      sessionContext: createRetrievalSessionContext("research", sessionId),
      input,
      instructions: body.instructions,
      sessionId,
      messages: sanitizeMessages(body.messages),
      allowedDomains: body.allowedDomains,
      blockedDomains: body.blockedDomains,
      externalWebAccess: body.externalWebAccess ?? true,
      userLocation,
      background: body.background ?? false,
      forceSearch: body.forceSearch,
      maxOutputTokens: body.maxOutputTokens,
      model: selectedModel,
      reasoningEffort: body.reasoningEffort,
      searchContextSize: body.searchContextSize,
    });

    const gatewayMetadata = extractGatewayResponseMetadata({
      headers: result.responseHeaders,
    });

    await appendOperationEvent({
      operationId,
      eventType: "response_completed",
      payload: {
        responseId: result.finalized.responseId,
        researchUsed: result.finalized.researchUsed,
        sourceCount: result.finalized.sources.length,
        gatewayStep: gatewayMetadata.gatewayStep ?? null,
      },
    });

    await logConversationMessage({
      sessionId,
      role: "assistant",
      content: result.finalized.answer,
      sources: result.finalized.sources,
      researchUsed: result.finalized.researchUsed,
      querySummary: result.finalized.querySummary,
      fetchedAt: result.finalized.fetchedAt,
    });

    await completeOperation({
      operationId,
      responseId: result.finalized.responseId,
      providerRequestId: result.requestId,
      model: result.finalized.model,
      streamedChars: result.finalized.answer.length,
      durationMs: getDurationMs(requestStartedAtMs),
      fallbackUsed: gatewayMetadata.fallbackUsed ?? false,
      retryCount: gatewayMetadata.retryCount ?? null,
    });

    return NextResponse.json(result.finalized);
  } catch (error) {
    console.error("Research route failed", error);

    await appendOperationEvent({
      operationId,
      eventType: "research_failed",
      payload: {
        errorMessage: getErrorMessage(error),
      },
    });
    await failOperation({
      operationId,
      errorPhase: "upstream",
      errorMessage: "The research request failed.",
      durationMs: getDurationMs(requestStartedAtMs),
    });

    return NextResponse.json(
      {
        error: "The research request failed.",
      },
      { status: 502 },
    );
  }
}
