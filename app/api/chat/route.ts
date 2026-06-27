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
import { resolveAITransport } from "@/lib/ai-transport";
import { SYSTEM_PROMPT } from "@/lib/chat-prompt";
import { sanitizeMessages } from "@/lib/chat-input";
import { env } from "@/lib/env";
import {
  createRetrievalSessionContext,
  runForegroundChatTask,
  runForegroundResearchStreamingTask,
} from "@/lib/foreground-tasks";
import { isAllowedChatModel, isAllowedResearchModel } from "@/lib/model-options";
import { getOpenAIClientBundle } from "@/lib/openai-client";
import { checkRateLimit } from "@/lib/rate-limit";
import { deriveApproximateUserLocation } from "@/lib/request-location";
import { finalizeResearchBotResponse } from "@/lib/research-bot";
import { validateTurnstileToken } from "@/lib/turnstile";
import type {
  AITaskKind,
  AuditOperationErrorPhase,
  ChatMessage,
  ResearchRequest,
  SourceLink,
} from "@/lib/types";

type ChatRequestBody = {
  sessionId?: string;
  messages?: ChatMessage[];
  input?: string;
  model?: string;
  researchEnabled?: boolean;
  researchOptions?: Omit<ResearchRequest, "input" | "instructions" | "messages">;
  turnstileToken?: string;
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

const getSelectedModel = (task: AITaskKind, body: ChatRequestBody) =>
  task === "research_generation"
    ? (body.researchOptions?.model ?? env.openAIResearchModel)
    : (body.model?.trim() || env.openAIModel);

export async function POST(request: NextRequest) {
  let body: ChatRequestBody;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const sessionId = body.sessionId?.trim();
  const input = body.input?.trim();

  if (!sessionId || !input) {
    return NextResponse.json(
      { error: "sessionId and input are required." },
      { status: 400 },
    );
  }

  const requestId = crypto.randomUUID();
  const requestStartedAtMs = Date.now();
  const requestStartedAt = new Date(requestStartedAtMs).toISOString();
  const accessContext = await requireInviteAccess(request);

  if (!accessContext) {
    return createForbiddenResponse(
      "Invite-unlocked or admin access is required to use the AI workspace.",
    );
  }

  const transcript = sanitizeMessages(body.messages);
  const requiresTurnstile = false;
  const ipHeader =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for") ??
    "unknown";
  const remoteIp = ipHeader.split(",")[0]?.trim() || "unknown";
  const userLocation =
    body.researchOptions?.userLocation ??
    deriveApproximateUserLocation(request.headers);
  const useResearch =
    accessContext.settings.researchModeEnabled &&
    body.researchEnabled === true;
  const task: AITaskKind = useResearch
    ? "research_generation"
    : "chat_generation";
  const selectedModel = getSelectedModel(task, body);

  if (
    useResearch &&
    !isAllowedResearchModel(selectedModel, accessContext.settings)
  ) {
    return NextResponse.json(
      {
        error: "The selected research model is not enabled for this environment.",
      },
      { status: 400 },
    );
  }

  if (!useResearch && !isAllowedChatModel(selectedModel, accessContext.settings)) {
    return NextResponse.json(
      {
        error: "The selected model is not enabled for this environment.",
      },
      { status: 400 },
    );
  }

  const ipHash = await hashAuditValue(remoteIp);

  await ensureSession({
    sessionId,
    route: "/api/chat",
    ipHash,
    researchEnabled: useResearch,
    userLocation,
    accessState: accessContext.accessState,
    leadSubmissionId: accessContext.leadSubmission?.id,
    inviteRedemptionId: accessContext.inviteRedemption?.id,
    adminEmail: accessContext.adminEmail,
    requestContext: {
      requestId,
      requestStartedAt,
      requiresTurnstile,
      transcriptLength: transcript.length,
      accessState: accessContext.accessState,
    },
  });

  const operationContext = resolveAITransport(task);
  const operationId = await startOperation({
    sessionId,
    route: "/api/chat",
    feature: "chat",
    requestId,
    provider: operationContext.provider,
    model: selectedModel,
    gatewayUsed: operationContext.gatewayUsed,
    transportMode: operationContext.mode,
    fallbackEnabled: operationContext.fallbackEnabled,
    requestContext: {
      requestStartedAt,
      researchRequested: body.researchEnabled === true,
      researchActive: useResearch,
      accessState: accessContext.accessState,
    },
  });

  await appendOperationEvent({
    operationId,
    eventType: "request_accepted",
    payload: {
      requestStartedAt,
      sessionId,
      useResearch,
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
      errorMessage: "Too many requests. Please wait a moment and try again.",
      durationMs: getDurationMs(requestStartedAtMs),
    });

    return NextResponse.json(
      {
        error: "Too many requests. Please wait a moment and try again.",
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

  if (requiresTurnstile) {
    await appendOperationEvent({
      operationId,
      eventType: "turnstile_required",
      payload: {},
    });

    const turnstileResult = await validateTurnstileToken(
      body.turnstileToken,
      remoteIp,
    );

    if (!turnstileResult.success) {
      await appendOperationEvent({
        operationId,
        eventType: "turnstile_failed",
        payload: {
          errors: turnstileResult.errors,
        },
      });
      await failOperation({
        operationId,
        errorPhase: "security",
        errorMessage: "Turnstile verification failed.",
        durationMs: getDurationMs(requestStartedAtMs),
      });

      return NextResponse.json(
        {
          error: "Turnstile verification failed.",
          details: turnstileResult.errors,
        },
        { status: 403 },
      );
    }

    await appendOperationEvent({
      operationId,
      eventType: "turnstile_passed",
      payload: {},
    });
  }

  await logConversationMessage({
    sessionId,
    role: "user",
    content: input,
  });

  let clientBundle;

  try {
    clientBundle = getOpenAIClientBundle(task);
  } catch (error) {
    console.error(error);
    await appendOperationEvent({
      operationId,
      eventType: "ai_client_configuration_failed",
      payload: {
        errorMessage: getErrorMessage(error),
      },
    });
    await failOperation({
      operationId,
      errorPhase: "startup",
      errorMessage: "The chat relay is not configured yet.",
      durationMs: getDurationMs(requestStartedAtMs),
    });

    return NextResponse.json(
      {
        error: "The chat relay is not configured yet.",
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

  let stream;
  let researchRequest: Awaited<
    ReturnType<typeof runForegroundResearchStreamingTask>
  > | null = null;

  try {
    if (useResearch) {
      researchRequest = await runForegroundResearchStreamingTask({
        client: clientBundle.client,
        requestOptions: clientBundle.requestOptions,
        sessionContext: createRetrievalSessionContext("research", sessionId),
        input,
        instructions: SYSTEM_PROMPT,
        sessionId,
        messages: transcript,
        allowedDomains: body.researchOptions?.allowedDomains,
        blockedDomains: body.researchOptions?.blockedDomains,
        externalWebAccess: body.researchOptions?.externalWebAccess ?? true,
        userLocation,
        background: body.researchOptions?.background ?? false,
        forceSearch: body.researchOptions?.forceSearch,
        maxOutputTokens: body.researchOptions?.maxOutputTokens ?? 2200,
        model: selectedModel,
        reasoningEffort: body.researchOptions?.reasoningEffort,
        searchContextSize: body.researchOptions?.searchContextSize,
      });
      stream = researchRequest.stream;
    } else {
      const chatTask = await runForegroundChatTask({
        client: clientBundle.client,
        requestOptions: clientBundle.requestOptions,
        sessionContext: createRetrievalSessionContext("chat", sessionId),
        transcript,
        input,
        instructions: SYSTEM_PROMPT,
        model: selectedModel,
      });
      stream = chatTask.stream;
    }
  } catch (error) {
    console.error("OpenAI request failed", {
      requestId,
      sessionId,
      requestStartedAt,
      useResearch,
      errorMessage: getErrorMessage(error),
    });

    await appendOperationEvent({
      operationId,
      eventType: "ai_request_failed",
      payload: {
        errorMessage: getErrorMessage(error),
      },
    });
    await failOperation({
      operationId,
      errorPhase: "upstream",
      errorMessage: "The request failed.",
      durationMs: getDurationMs(requestStartedAtMs),
    });

    return NextResponse.json(
      {
        error: "The request failed.",
      },
      { status: 502 },
    );
  }

  const encoder = new TextEncoder();
  let assistantMessage = "";
  let sources: SourceLink[] = [];
  let researchUsed = false;
  let querySummary: string | undefined;
  let fetchedAt: string | undefined;
  let responseId: string | undefined;
  const providerRequestId: string | null = null;
  let lastEventType = "ready";
  let deltaCount = 0;
  let responseCompleted = false;
  let finalizeErrorMessage: string | undefined;
  let completedModel = selectedModel;

  const sendEvent = (
    controller: ReadableStreamDefaultController<Uint8Array>,
    event: string,
    payload: Record<string, unknown>,
  ) => {
    controller.enqueue(
      encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`),
    );
  };

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      sendEvent(controller, "ready", {
        researchEnabled: useResearch,
        requestId,
      });

      await appendOperationEvent({
        operationId,
        eventType: "stream_opened",
        payload: {
          researchEnabled: useResearch,
        },
      });

      try {
        for await (const event of stream) {
          lastEventType = event.type;

          if (event.type === "response.output_text.delta") {
            assistantMessage += event.delta;
            deltaCount += 1;
            sendEvent(controller, "delta", { delta: event.delta });
          }

          if (event.type === "response.completed") {
            responseCompleted = true;
            responseId = event.response.id;
            completedModel = event.response.model ?? completedModel;
            await appendOperationEvent({
              operationId,
              eventType: "response_completed",
              payload: {
                responseId,
                model: completedModel,
                status: event.response.status ?? null,
              },
            });

            if (useResearch && researchRequest) {
              try {
                const finalized = finalizeResearchBotResponse({
                  response: event.response,
                  policy: researchRequest.prepared.policy,
                  querySummary: researchRequest.prepared.querySummary,
                  blockedDomains: researchRequest.prepared.blockedDomains,
                });

                sources = finalized.sources;
                researchUsed = finalized.researchUsed;
                querySummary = finalized.querySummary;
                fetchedAt = finalized.fetchedAt;
                assistantMessage = finalized.answer || assistantMessage;

                await appendOperationEvent({
                  operationId,
                  eventType: "research_post_processed",
                  payload: {
                    sourceCount: sources.length,
                    researchUsed,
                  },
                });
              } catch (error) {
                finalizeErrorMessage = getErrorMessage(error);
                console.error("Failed to finalize research response.", {
                  requestId,
                  sessionId,
                  responseId,
                  errorMessage: finalizeErrorMessage,
                });
                await appendOperationEvent({
                  operationId,
                  eventType: "research_post_processing_failed",
                  payload: {
                    errorMessage: finalizeErrorMessage,
                  },
                });
              }
            }
          }

          if (event.type === "response.failed") {
            responseId = event.response.id;
            completedModel = event.response.model ?? completedModel;
            throw new Error(
              `Response failed with status ${event.response.status ?? "failed"}.`,
            );
          }

          if (event.type === "error") {
            throw new Error(event.message);
          }
        }

        try {
          const finalResponse = await stream.finalResponse();
          completedModel = finalResponse.model ?? completedModel;
        } catch {
          // The streamed events are already enough for success/failure handling.
        }

        const finalMessage =
          assistantMessage.trim() ||
          "抱歉，这次没有生成到可用内容，请再试一次。";

        await logConversationMessage({
          sessionId,
          role: "assistant",
          content: finalMessage,
          sources,
          researchUsed,
          querySummary,
          fetchedAt,
        });

        await completeOperation({
          operationId,
          responseId,
          providerRequestId,
          model: completedModel,
          streamedChars: assistantMessage.length,
          durationMs: getDurationMs(requestStartedAtMs),
          fallbackUsed: false,
          retryCount: null,
        });

        sendEvent(controller, "done", {
          message: finalMessage,
          researchUsed,
          sources,
          querySummary,
          fetchedAt,
          requestId,
          responseId,
        });
      } catch (error) {
        const phase: AuditOperationErrorPhase = responseCompleted
          ? "post-processing"
          : assistantMessage.trim()
            ? "streaming"
            : "startup";

        console.error("Chat route failed.", {
          requestId,
          sessionId,
          requestStartedAt,
          useResearch,
          phase,
          lastEventType,
          deltaCount,
          streamedChars: assistantMessage.length,
          responseCompleted,
          responseId,
          finalizeErrorMessage,
          errorMessage: getErrorMessage(error),
        });

        await failOperation({
          operationId,
          errorPhase: phase,
          errorMessage: getErrorMessage(error),
          responseId,
          providerRequestId,
          streamedChars: assistantMessage.length,
          durationMs: getDurationMs(requestStartedAtMs),
          fallbackUsed: false,
          retryCount: null,
        });

        sendEvent(controller, "error", {
          message: "生成失败，请稍后再试。",
          requestId,
          phase,
          streamedChars: assistantMessage.length,
          responseId,
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
      "X-Accel-Buffering": "no",
    },
  });
}
