"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdminConsole } from "@/components/admin-console";
import { ChatMarkdown } from "@/components/chat-markdown";
import { appConfig } from "@/lib/app-config";
import type {
  AccessSessionResponse,
  AccessState,
  AIModelOption,
  ChatMessage,
  LeadSubmissionSummary,
  InviteRedemptionSummary,
  SourceLink,
} from "@/lib/types";

type StreamFailurePhase = "startup" | "streaming" | "post-processing";

type StreamEvent =
  | { type: "delta"; payload: { delta?: string } }
  | {
      type: "done";
      payload: {
        message?: string;
        researchUsed?: boolean;
        sources?: SourceLink[];
        querySummary?: string;
        fetchedAt?: string;
        requestId?: string;
        responseId?: string;
      };
    }
  | {
      type: "error";
      payload: {
        message?: string;
        requestId?: string;
        phase?: StreamFailurePhase;
        streamedChars?: number;
        responseId?: string;
      };
    }
  | { type: "ready"; payload: { researchEnabled?: boolean; requestId?: string } };

type StoredStreamSnapshot = {
  sessionId: string;
  requestId?: string;
  responseId?: string;
  input: string;
  content: string;
  startedAt: string;
  updatedAt: string;
  researchEnabled: boolean;
};

type StoredFailureSnapshot = StoredStreamSnapshot & {
  failedAt: string;
  errorMessage: string;
  phase?: StreamFailurePhase;
  streamedChars?: number;
};

const readStoredValue = (key: string) => {
  if (typeof window === "undefined") {
    return "";
  }

  return window.sessionStorage.getItem(key) ?? "";
};

const readSessionJson = <T,>(key: string) => {
  if (typeof window === "undefined") {
    return null as T | null;
  }

  const rawValue = window.sessionStorage.getItem(key);

  if (!rawValue) {
    return null as T | null;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    window.sessionStorage.removeItem(key);
    return null as T | null;
  }
};

const writeSessionJson = (key: string, value: unknown) => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(key, JSON.stringify(value));
};

const removeSessionValue = (key: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(key);
};

const createSessionId = () =>
  typeof window === "undefined"
    ? ""
    : window.sessionStorage.getItem(appConfig.storageKey) ?? crypto.randomUUID();

const createInitialMessages = () => {
  if (typeof window === "undefined") {
    return [] as ChatMessage[];
  }

  const savedMessages = window.sessionStorage.getItem(appConfig.messagesKey);

  if (!savedMessages) {
    return [] as ChatMessage[];
  }

  try {
    return JSON.parse(savedMessages) as ChatMessage[];
  } catch {
    window.sessionStorage.removeItem(appConfig.messagesKey);
    return [] as ChatMessage[];
  }
};

const createMessage = (
  role: ChatMessage["role"],
  content: string,
): ChatMessage => ({
  id: crypto.randomUUID(),
  role,
  content,
  createdAt: new Date().toISOString(),
});

const parseSseChunk = (chunk: string) => {
  const events: StreamEvent[] = [];
  const blocks = chunk.split("\n\n");

  for (const block of blocks) {
    if (!block.trim()) {
      continue;
    }

    const lines = block.split("\n");
    const eventLine = lines.find((line) => line.startsWith("event:"));
    const dataLine = lines.find((line) => line.startsWith("data:"));

    if (!eventLine || !dataLine) {
      continue;
    }

    const eventType = eventLine.replace("event:", "").trim();
    const data = dataLine.replace("data:", "").trim();

    try {
      const payload = JSON.parse(data) as StreamEvent["payload"];
      events.push({ type: eventType as StreamEvent["type"], payload } as StreamEvent);
    } catch {
      continue;
    }
  }

  const remainder = chunk.endsWith("\n\n") ? "" : blocks.at(-1) ?? "";

  return { events, remainder };
};

const getAccessLabel = (accessState: AccessState) => {
  switch (accessState) {
    case "lead_unlocked":
      return "Qualified visitor";
    case "invite_unlocked":
      return "Invited AI user";
    case "admin":
      return "Admin";
    default:
      return "Public visitor";
  }
};

const getWebSearchLabel = (enabled: boolean) => (enabled ? "On" : "Off");

const adminPreviewOptions = [
  ["public_visitor", "Public visitor"],
  ["lead_unlocked", "Qualified visitor"],
  ["invite_unlocked", "Invited AI user"],
  ["admin", "Admin"],
] as const;

export function FreshFoodCopilot() {
  const [messages, setMessages] = useState<ChatMessage[]>(createInitialMessages);
  const [sessionId, setSessionId] = useState(createSessionId);
  const [briefInput, setBriefInput] = useState("");
  const [followUpInput, setFollowUpInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [researchEnabled, setResearchEnabled] = useState(false);
  const [researchModeAvailable, setResearchModeAvailable] = useState(false);
  const [chatModelOptions, setChatModelOptions] = useState<AIModelOption[]>([]);
  const [researchModelOptions, setResearchModelOptions] = useState<AIModelOption[]>(
    [],
  );
  const [selectedChatModel, setSelectedChatModel] = useState(() =>
    readStoredValue(appConfig.chatModelKey),
  );
  const [selectedResearchModel, setSelectedResearchModel] = useState(() =>
    readStoredValue(appConfig.researchModelKey),
  );
  const [accessState, setAccessState] = useState<AccessState>("public_visitor");
  const [accessLoading, setAccessLoading] = useState(true);
  const [capabilities, setCapabilities] = useState({
    canViewPublic: true,
    canViewFullProduct: false,
      canUseAI: false,
      canAccessAdmin: false,
    });
  const [adminEmail, setAdminEmail] = useState("");
  const [leadSubmission, setLeadSubmission] = useState<
    LeadSubmissionSummary | undefined
  >();
  const [inviteRedemption, setInviteRedemption] = useState<
    InviteRedemptionSummary | undefined
  >();
  const [leadName, setLeadName] = useState("");
  const [leadWorkEmail, setLeadWorkEmail] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [leadRoleTitle, setLeadRoleTitle] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [adminControlsOpen, setAdminControlsOpen] = useState(false);
  const [adminViewState, setAdminViewState] = useState<AccessState>(() => {
    const stored = readStoredValue(appConfig.adminViewKey);
    if (
      stored === "public_visitor" ||
      stored === "lead_unlocked" ||
      stored === "invite_unlocked" ||
      stored === "admin"
    ) {
      return stored;
    }

    return "admin";
  });
  const hasTouchedResearchToggleRef = useRef(false);
  const transcriptRef = useRef<HTMLDivElement | null>(null);

  const requestAccessSession = async () => {
    const response = await fetch("/api/access/session", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to load access session.");
    }

    return (await response.json()) as AccessSessionResponse;
  };

  const applyAccessSession = (payload: AccessSessionResponse) => {
    setAccessState(payload.accessState);
    setCapabilities(payload.capabilities);
    setAdminEmail(payload.adminEmail ?? "");
    setLeadSubmission(payload.leadSubmission);
    setInviteRedemption(payload.inviteRedemption);
    setChatModelOptions(payload.chatModelOptions);
    setResearchModelOptions(payload.researchModelOptions);
    setResearchModeAvailable(payload.settings.researchModeEnabled);

    if (!hasTouchedResearchToggleRef.current) {
      setResearchEnabled(payload.settings.researchModeEnabled);
    }

    const storedChatModel = readStoredValue(appConfig.chatModelKey);
    if (
      payload.chatModelOptions.length > 0 &&
      !payload.chatModelOptions.some((option) => option.value === storedChatModel)
    ) {
      setSelectedChatModel(payload.chatModelOptions[0].value);
    }

    const storedResearchModel = readStoredValue(appConfig.researchModelKey);
    if (
      payload.researchModelOptions.length > 0 &&
      !payload.researchModelOptions.some(
        (option) => option.value === storedResearchModel,
      )
    ) {
      setSelectedResearchModel(payload.researchModelOptions[0].value);
    }

    if (payload.accessState !== "admin") {
      setAdminViewState("admin");
    }
  };

  const loadAccessSession = async () => {
    setAccessLoading(true);

    try {
      applyAccessSession(await requestAccessSession());
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load access session.",
      );
    } finally {
      setAccessLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    window.sessionStorage.setItem(appConfig.storageKey, sessionId);
  }, [sessionId]);

  useEffect(() => {
    window.sessionStorage.setItem(appConfig.messagesKey, JSON.stringify(messages));
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    let isCancelled = false;

    const loadInitialAccessSession = async () => {
      setAccessLoading(true);

      try {
        const payload = await requestAccessSession();

        if (!isCancelled) {
          applyAccessSession(payload);
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Failed to load access session.",
          );
        }
      } finally {
        if (!isCancelled) {
          setAccessLoading(false);
        }
      }
    };

    void loadInitialAccessSession();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedChatModel) {
      return;
    }

    window.sessionStorage.setItem(appConfig.chatModelKey, selectedChatModel);
  }, [selectedChatModel]);

  useEffect(() => {
    if (!selectedResearchModel) {
      return;
    }

    window.sessionStorage.setItem(
      appConfig.researchModelKey,
      selectedResearchModel,
    );
  }, [selectedResearchModel]);

  useEffect(() => {
    if (accessState !== "admin") {
      return;
    }

    window.sessionStorage.setItem(appConfig.adminViewKey, adminViewState);
  }, [accessState, adminViewState]);

  const isAdmin = accessState === "admin";
  const derivedUserViewState: AccessState = capabilities.canUseAI
    ? "invite_unlocked"
    : capabilities.canViewFullProduct
      ? "lead_unlocked"
      : accessState;
  const effectiveViewState = isAdmin ? adminViewState : derivedUserViewState;
  const effectiveCanViewFullProduct = effectiveViewState !== "public_visitor";
  const effectiveCanUseAI =
    effectiveViewState === "invite_unlocked" || effectiveViewState === "admin";
  const effectiveCanAccessAdmin = effectiveViewState === "admin";
  const adminPreviewMode = isAdmin && effectiveViewState !== "admin";
  const showIntro = messages.length === 0;

  const activeModelOptions = researchEnabled
    ? researchModelOptions
    : chatModelOptions;
  const activeModel =
    (researchEnabled ? selectedResearchModel : selectedChatModel) ||
    activeModelOptions[0]?.value ||
    "";

  const canSubmit = useMemo(() => {
    if (isPending) {
      return false;
    }

    return capabilities.canUseAI;
  }, [capabilities.canUseAI, isPending]);

  const clearChat = () => {
    const nextSessionId = crypto.randomUUID();
    setMessages([]);
    setBriefInput("");
    setFollowUpInput("");
    setErrorMessage("");
    setStatusMessage("");
    setSessionId(nextSessionId);
    window.sessionStorage.setItem(appConfig.storageKey, nextSessionId);
    window.sessionStorage.removeItem(appConfig.messagesKey);
  };

  const handleStarterPrompt = (prompt: string) => {
    if (messages.length === 0) {
      setBriefInput(prompt);
      return;
    }

    setFollowUpInput(prompt);
  };

  const handleLeadUnlock = async () => {
    if (
      !leadName.trim() ||
      !leadWorkEmail.trim() ||
      !leadCompany.trim() ||
      !leadRoleTitle.trim()
    ) {
      return;
    }

    setIsPending(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const response = await fetch("/api/access/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: leadName,
          workEmail: leadWorkEmail,
          company: leadCompany,
          roleTitle: leadRoleTitle,
          sessionId,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to unlock the fuller product view.");
      }

      setStatusMessage("Thanks. The fuller product view is unlocked.");
      await loadAccessSession();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to unlock the fuller product view.",
      );
    } finally {
      setIsPending(false);
    }
  };

  const handleInviteUnlock = async () => {
    if (!inviteCode.trim()) {
      return;
    }

    setIsPending(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const response = await fetch("/api/access/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: inviteCode,
          sessionId,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to unlock AI access.");
      }

      setInviteCode("");
      setStatusMessage("Invite accepted. AI access is now unlocked.");
      await loadAccessSession();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to unlock AI access.",
      );
    } finally {
      setIsPending(false);
    }
  };

  const sendMessage = async (rawInput: string) => {
    const trimmedInput = rawInput.trim();

    if (!trimmedInput || !canSubmit || !sessionId) {
      return;
    }

    const priorMessages = [...messages];
    const userMessage = createMessage("user", trimmedInput);
    const assistantPlaceholder = createMessage("assistant", "");
    let streamedAssistantContent = "";
    let requestId: string | undefined;
    let responseId: string | undefined;

    setErrorMessage("");
    setStatusMessage("");
    setMessages((current) => [...current, userMessage, assistantPlaceholder]);
    setIsPending(true);
    removeSessionValue(appConfig.lastFailureKey);
    writeSessionJson(appConfig.activeStreamKey, {
      sessionId,
      input: trimmedInput,
      content: "",
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      researchEnabled,
    } satisfies StoredStreamSnapshot);

    if (messages.length === 0) {
      setBriefInput("");
    } else {
      setFollowUpInput("");
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          messages: priorMessages,
          input: trimmedInput,
          model: researchEnabled ? undefined : selectedChatModel || undefined,
          researchEnabled,
          researchOptions: researchEnabled
            ? {
                model: selectedResearchModel || undefined,
              }
            : undefined,
        }),
      });

      if (!response.ok || !response.body) {
        const errorBody = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        throw new Error(errorBody?.error ?? "The request failed.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const appendAssistantDelta = (delta: string) => {
        if (!delta) {
          return;
        }

        streamedAssistantContent += delta;
        const activeSnapshot =
          readSessionJson<StoredStreamSnapshot>(appConfig.activeStreamKey);

        if (activeSnapshot) {
          writeSessionJson(appConfig.activeStreamKey, {
            ...activeSnapshot,
            requestId,
            responseId,
            content: streamedAssistantContent,
            updatedAt: new Date().toISOString(),
          } satisfies StoredStreamSnapshot);
        }

        setMessages((current) =>
          current.map((message) =>
            message.id === assistantPlaceholder.id
              ? { ...message, content: message.content + delta }
              : message,
          ),
        );
      };

      const completeAssistantMessage = (
        finalContent: string,
        sources: SourceLink[] | undefined,
        researchUsedValue: boolean | undefined,
        querySummary: string | undefined,
        fetchedAt: string | undefined,
      ) => {
        streamedAssistantContent = finalContent;
        removeSessionValue(appConfig.activeStreamKey);
        removeSessionValue(appConfig.lastFailureKey);
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantPlaceholder.id
              ? {
                  ...message,
                  content: finalContent,
                  sources,
                  researchUsed: researchUsedValue,
                  querySummary,
                  fetchedAt,
                }
              : message,
          ),
        );
      };

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const parsed = parseSseChunk(buffer);
        buffer = parsed.remainder;

        for (const event of parsed.events) {
          if (event.type === "ready") {
            requestId = event.payload.requestId;

            const activeSnapshot =
              readSessionJson<StoredStreamSnapshot>(appConfig.activeStreamKey);

            if (activeSnapshot) {
              writeSessionJson(appConfig.activeStreamKey, {
                ...activeSnapshot,
                requestId,
                updatedAt: new Date().toISOString(),
              } satisfies StoredStreamSnapshot);
            }
          }

          if (event.type === "delta") {
            appendAssistantDelta(event.payload.delta ?? "");
          }

          if (event.type === "done") {
            requestId = event.payload.requestId ?? requestId;
            responseId = event.payload.responseId ?? responseId;
            completeAssistantMessage(
              event.payload.message ?? "",
              event.payload.sources,
              event.payload.researchUsed,
              event.payload.querySummary,
              event.payload.fetchedAt,
            );
          }

          if (event.type === "error") {
            requestId = event.payload.requestId ?? requestId;
            responseId = event.payload.responseId ?? responseId;

            const activeSnapshot =
              readSessionJson<StoredStreamSnapshot>(appConfig.activeStreamKey);

            if (activeSnapshot) {
              writeSessionJson(appConfig.lastFailureKey, {
                ...activeSnapshot,
                requestId,
                responseId,
                content: streamedAssistantContent,
                failedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                errorMessage: event.payload.message ?? "Streaming failed.",
                phase: event.payload.phase,
                streamedChars: event.payload.streamedChars,
              } satisfies StoredFailureSnapshot);
            }

            removeSessionValue(appConfig.activeStreamKey);
            throw new Error(
              requestId
                ? `${event.payload.message ?? "Streaming failed."} (Request ID: ${requestId})`
                : (event.payload.message ?? "Streaming failed."),
            );
          }
        }
      }
    } catch (error) {
      if (streamedAssistantContent.trim()) {
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantPlaceholder.id
              ? { ...message, content: streamedAssistantContent }
              : message,
          ),
        );
      } else {
        setMessages((current) =>
          current.filter((message) => message.id !== assistantPlaceholder.id),
        );
      }

      if (!readSessionJson<StoredFailureSnapshot>(appConfig.lastFailureKey)) {
        writeSessionJson(appConfig.lastFailureKey, {
          sessionId,
          requestId,
          responseId,
          input: trimmedInput,
          content: streamedAssistantContent,
          startedAt: userMessage.createdAt,
          updatedAt: new Date().toISOString(),
          failedAt: new Date().toISOString(),
          researchEnabled,
          errorMessage:
            error instanceof Error ? error.message : "Something went wrong.",
        } satisfies StoredFailureSnapshot);
      }

      removeSessionValue(appConfig.activeStreamKey);
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setIsPending(false);
    }
  };

  const renderPublicVisitorPanel = () => (
    <div className="mt-4 flex flex-1 flex-col rounded-[1.7rem] border border-dashed border-[rgba(95,109,71,0.24)] bg-[rgba(255,255,255,0.72)] p-5 sm:p-6">
      <div className="max-w-2xl">
        <div className="inline-flex items-center rounded-full border border-[rgba(95,109,71,0.18)] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--olive-deep)]">
          Public visitor
        </div>
        <h1 className="mt-3 text-[1.8rem] leading-tight font-semibold text-[var(--foreground)] sm:text-3xl">
          Unlock the fuller product view
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
          This public page lets you understand the concept. To move into the fuller
          product experience, submit the basic lead details below.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          value={leadName}
          onChange={(event) => setLeadName(event.target.value)}
          placeholder="Full name"
          className="rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgba(95,109,71,0.36)] focus:ring-4 focus:ring-[rgba(95,109,71,0.08)]"
        />
        <input
          type="email"
          value={leadWorkEmail}
          onChange={(event) => setLeadWorkEmail(event.target.value)}
          placeholder="Work email"
          className="rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgba(95,109,71,0.36)] focus:ring-4 focus:ring-[rgba(95,109,71,0.08)]"
        />
        <input
          type="text"
          value={leadCompany}
          onChange={(event) => setLeadCompany(event.target.value)}
          placeholder="Company"
          className="rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgba(95,109,71,0.36)] focus:ring-4 focus:ring-[rgba(95,109,71,0.08)]"
        />
        <input
          type="text"
          value={leadRoleTitle}
          onChange={(event) => setLeadRoleTitle(event.target.value)}
          placeholder="Role / title"
          className="rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgba(95,109,71,0.36)] focus:ring-4 focus:ring-[rgba(95,109,71,0.08)]"
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs leading-6 text-[var(--muted)]">
          Admins can sign in from <Link href="/admin" className="underline">the admin entrypoint</Link>.
        </div>
        <button
          type="button"
          disabled={
            adminPreviewMode ||
            isPending ||
            !leadName.trim() ||
            !leadWorkEmail.trim() ||
            !leadCompany.trim() ||
            !leadRoleTitle.trim()
          }
          onClick={handleLeadUnlock}
          className="inline-flex items-center justify-center rounded-full bg-[var(--olive-deep)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--olive)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {adminPreviewMode ? "Admin preview mode" : "Unlock Fuller Product View"}
        </button>
      </div>
    </div>
  );

  const renderLeadUnlockedPanel = () => (
    <div className="mt-4 flex flex-1 flex-col rounded-[1.7rem] border border-dashed border-[rgba(95,109,71,0.24)] bg-[rgba(255,255,255,0.72)] p-5 sm:p-6">
      <div className="max-w-2xl">
        <div className="inline-flex items-center rounded-full border border-[rgba(95,109,71,0.18)] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--olive-deep)]">
          Qualified visitor
        </div>
        <h1 className="mt-3 text-[1.8rem] leading-tight font-semibold text-[var(--foreground)] sm:text-3xl">
          AI access is invite-gated
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
          Your fuller product view is unlocked. To actually use the AI copilot, redeem
          a valid invitation code.
        </p>
        {leadSubmission ? (
          <p className="mt-3 text-xs leading-6 text-[var(--muted)]">
            Lead profile: {leadSubmission.name} • {leadSubmission.company} •{" "}
            {leadSubmission.workEmail}
          </p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-3">
        {appConfig.starterPrompts.map((prompt) => (
          <div
            key={prompt}
            className="rounded-[1.2rem] border border-[var(--line)] bg-[rgba(255,255,255,0.88)] px-4 py-3 text-left text-sm leading-7 text-[var(--foreground)]"
          >
            {prompt}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          type="text"
          value={inviteCode}
          onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
          placeholder="Invitation code"
          className="rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm tracking-[0.08em] uppercase outline-none transition focus:border-[rgba(95,109,71,0.36)] focus:ring-4 focus:ring-[rgba(95,109,71,0.08)]"
        />
        <button
          type="button"
          disabled={adminPreviewMode || isPending || !inviteCode.trim()}
          onClick={handleInviteUnlock}
          className="inline-flex items-center justify-center rounded-full bg-[var(--olive-deep)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--olive)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {adminPreviewMode ? "Admin preview mode" : "Unlock AI Access"}
        </button>
      </div>
    </div>
  );

  const renderAIWorkspace = () => (
    <>
      {messages.length === 0 ? (
        <div className="mt-4 flex flex-1 flex-col rounded-[1.7rem] border border-dashed border-[rgba(95,109,71,0.24)] bg-[rgba(255,255,255,0.72)] p-5 sm:p-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-[rgba(95,109,71,0.18)] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--olive-deep)]">
              AI workspace
            </div>
            <h1 className="mt-3 text-[1.8rem] leading-tight font-semibold text-[var(--foreground)] sm:text-3xl">
              Paste the customer brief
            </h1>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
              Include the core job to be done, target consumer, format, channel,
              cuisine cues, price signals, constraints, and explicit goals.
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            {appConfig.starterPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleStarterPrompt(prompt)}
                className="rounded-[1.2rem] border border-[var(--line)] bg-[rgba(255,255,255,0.88)] px-4 py-3 text-left text-sm leading-7 text-[var(--foreground)] transition hover:border-[rgba(95,109,71,0.26)] hover:bg-white"
              >
                {prompt}
              </button>
            ))}
          </div>

          <textarea
            value={briefInput}
            onChange={(event) => setBriefInput(event.target.value)}
            placeholder="Paste the brief here. Example: We need refrigerated lunch concepts for convenience retail, aimed at white-collar office workers, with a summer seasonal cue and strong visual appeal..."
            className="mt-6 min-h-[220px] w-full resize-y rounded-[1.35rem] border border-[var(--line)] bg-white px-4 py-4 text-[15px] leading-7 text-[var(--foreground)] outline-none transition focus:border-[rgba(95,109,71,0.36)] focus:ring-4 focus:ring-[rgba(95,109,71,0.08)] sm:min-h-[280px] sm:rounded-[1.6rem] sm:px-5"
          />

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-xs leading-6 text-[var(--muted)] sm:max-w-[320px]">
              {inviteRedemption
                ? `Invite redeemed on ${new Date(
                    inviteRedemption.redeemedAt,
                  ).toLocaleString()}.`
                : "Admin access is bypassing the invite gate for this session."}
            </p>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
              <button
                type="button"
                disabled={!briefInput.trim() || !canSubmit}
                onClick={() => sendMessage(briefInput)}
                className="inline-flex w-full items-center justify-center rounded-full bg-[var(--olive-deep)] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--olive)] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:min-w-[250px] sm:py-3"
              >
                {isPending ? "Generating concepts..." : "Generate Concept Directions"}
              </button>
              <p className="text-xs leading-6 text-[var(--muted)] sm:max-w-[250px] sm:text-right">
                You can refine, redirect, or ask for alternatives in the same thread
                after the first answer lands.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div
            ref={transcriptRef}
            className="app-shell-scroll mt-4 flex-1 space-y-4 overflow-y-auto rounded-[1.35rem] border border-white/80 bg-[rgba(255,255,255,0.74)] p-3.5 sm:rounded-[1.7rem] sm:p-5"
          >
            {messages.map((message) => (
              <article
                key={message.id}
                className={`fade-rise rounded-[1.2rem] border p-4 sm:rounded-[1.5rem] sm:p-5 ${
                  message.role === "user"
                    ? "ml-auto max-w-[96%] border-[rgba(95,109,71,0.22)] bg-[rgba(216,223,196,0.38)] sm:max-w-[92%]"
                    : "mr-auto max-w-[100%] border-[rgba(24,32,38,0.08)] bg-white sm:max-w-[96%]"
                }`}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      {message.role === "user" ? "Client brief / user" : "Copilot"}
                    </p>
                    {message.role === "assistant" &&
                    message.researchUsed !== undefined ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                          message.researchUsed
                            ? "bg-[rgba(95,109,71,0.12)] text-[var(--olive-deep)]"
                            : "bg-[rgba(24,32,38,0.08)] text-[var(--muted)]"
                        }`}
                      >
                        {message.researchUsed ? "Web Search Used" : "No Web Search"}
                      </span>
                    ) : null}
                  </div>
                  <time
                    dateTime={message.createdAt}
                    className="text-xs text-[var(--muted)]"
                  >
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>

                {message.content ? (
                  <ChatMarkdown content={message.content} />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--olive)]" />
                    {researchEnabled
                      ? "Web search is enabled for this reply. Thinking through concept directions..."
                      : "Thinking through concept directions..."}
                  </div>
                )}

                {message.researchUsed || (message.sources?.length ?? 0) > 0 ? (
                  <div className="mt-4 rounded-[1.2rem] border border-[rgba(24,32,38,0.08)] bg-[rgba(245,239,227,0.72)] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--olive-deep)]">
                      Web sources
                    </p>
                    {message.querySummary || message.fetchedAt ? (
                      <p className="mt-2 text-xs leading-6 text-[var(--muted)]">
                        {message.querySummary
                          ? `Research brief: ${message.querySummary}`
                          : "Research brief available."}
                        {message.fetchedAt
                          ? ` • Fetched ${new Date(
                              message.fetchedAt,
                            ).toLocaleString()}`
                          : ""}
                      </p>
                    ) : null}
                    {message.sources && message.sources.length > 0 ? (
                      <ul className="mt-2 space-y-2 text-sm text-[var(--muted)]">
                        {message.sources.map((source) => (
                          <li key={source.url}>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="transition hover:text-[var(--ember)]"
                            >
                              {source.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        Web search was used for this reply, but the provider did not
                        return source links.
                      </p>
                    )}
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          <div className="mt-4 rounded-[1.35rem] border border-white/80 bg-white/78 p-4 sm:rounded-[1.6rem]">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Refine or expand
                </p>
                <p className="text-xs leading-6 text-[var(--muted)]">
                  Ask for more breadth, a tighter target audience, a retailer lens, a
                  price ladder, or stronger naming.
                </p>
              </div>
              <p className="text-xs leading-6 text-[var(--muted)]">
                Follow-up refinement stays in the same thread.
              </p>
            </div>

            <textarea
              value={followUpInput}
              onChange={(event) => setFollowUpInput(event.target.value)}
              placeholder="Example: Please narrow these down for premium convenience retail in Shanghai, keep only the strongest lunch formats, and make the names more merchandisable."
              className="mt-4 min-h-[110px] w-full resize-y rounded-[1.2rem] border border-[var(--line)] bg-[var(--background-strong)] px-4 py-3 text-[15px] leading-7 text-[var(--foreground)] outline-none transition focus:border-[rgba(95,109,71,0.36)] focus:ring-4 focus:ring-[rgba(95,109,71,0.08)] sm:min-h-[120px] sm:rounded-[1.4rem]"
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <p className="text-xs leading-6 text-[var(--muted)]">
                Session memory stays active in this browser tab until you clear the chat.
              </p>
              <button
                type="button"
                disabled={!followUpInput.trim() || !canSubmit}
                onClick={() => sendMessage(followUpInput)}
                className="inline-flex w-full items-center justify-center rounded-full bg-[var(--olive-deep)] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--olive)] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:py-3"
              >
                {isPending ? "Generating..." : "Send Follow-Up"}
              </button>
            </div>
          </div>
        </>
      )}

    </>
  );

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-3 py-3 sm:px-6 sm:py-5 lg:px-8">
      <div
        className={`grid flex-1 gap-4 lg:gap-6 ${
          showIntro ? "grid-cols-1" : "lg:grid-cols-[0.95fr_1.35fr]"
        }`}
      >
        <section
          className={`grain-panel order-2 flex flex-col rounded-[1.6rem] border border-[var(--line)] bg-[var(--card)] p-4 shadow-[var(--shadow)] backdrop-blur-xl sm:rounded-[2rem] sm:p-6 ${
            showIntro ? "mx-auto w-full max-w-4xl" : "lg:order-1"
          }`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex w-fit items-center rounded-full border border-[rgba(95,109,71,0.18)] bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--olive-deep)]">
              {appConfig.badge}
            </div>
            <div className="inline-flex w-fit items-center rounded-full border border-[rgba(24,32,38,0.08)] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              {getAccessLabel(isAdmin ? adminViewState : derivedUserViewState)}
            </div>
            {adminEmail ? (
              <div className="inline-flex w-fit items-center rounded-full border border-[rgba(95,109,71,0.18)] bg-[rgba(216,223,196,0.4)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--olive-deep)]">
                {adminEmail}
              </div>
            ) : (
              <Link
                href="/admin"
                className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--olive-deep)] underline-offset-4 hover:underline"
              >
                Admin sign-in
              </Link>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Fresh food innovation copilot
            </p>
            <h2 className="max-w-2xl text-xl leading-tight font-semibold text-[var(--foreground)] sm:text-2xl">
              {showIntro ? "Quick context, then jump in." : appConfig.headline}
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              {effectiveCanViewFullProduct
                ? appConfig.subheadline
                : "This public page introduces the product. Lead capture unlocks the fuller workspace, and invite redemption unlocks the AI itself."}
            </p>
          </div>

          <details className="mt-5 rounded-[1.25rem] border border-white/80 bg-white/66 p-4 open:pb-5">
            <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--olive-deep)]">
              About this copilot
            </summary>

            <div className="mt-4 rounded-[1.2rem] border border-[rgba(199,90,50,0.15)] bg-[rgba(255,247,238,0.9)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ember)]">
                Privacy notice
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--foreground)]/84">
                This is a public-facing workspace. Do not paste confidential, proprietary,
                or client-restricted material unless you are cleared to share it here.
              </p>
            </div>

            <div className="mt-4 grid gap-3">
              {appConfig.principleCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-[1.2rem] border border-white/70 bg-white/60 p-4"
                >
                  <p className="text-sm font-semibold text-[var(--olive-deep)]">
                    {card.title}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
          </details>

          {(capabilities.canViewFullProduct || isAdmin) && !effectiveCanAccessAdmin ? (
            <div className="mt-5 space-y-3 sm:mt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Starter prompts
                </p>
                {effectiveCanUseAI ? (
                  <button
                    type="button"
                    onClick={clearChat}
                    className="rounded-full border border-[var(--line)] bg-white/80 px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition hover:border-[rgba(24,32,38,0.24)] hover:bg-white sm:w-auto"
                  >
                    Clear Chat
                  </button>
                ) : null}
              </div>
              <div className="grid gap-3">
                {appConfig.starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleStarterPrompt(prompt)}
                    disabled={!effectiveCanUseAI}
                    className="rounded-[1.2rem] border border-[var(--line)] bg-white/72 px-4 py-3.5 text-left text-sm leading-7 text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[rgba(95,109,71,0.26)] hover:bg-white disabled:cursor-default disabled:opacity-75 sm:rounded-[1.4rem] sm:py-4"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section
          className={`grain-panel order-1 flex min-h-[calc(100dvh-1.5rem)] flex-col rounded-[1.6rem] border border-[var(--line)] bg-[rgba(255,252,246,0.88)] p-3 shadow-[var(--shadow)] backdrop-blur-xl sm:min-h-[78vh] sm:rounded-[2rem] sm:p-5 ${
            showIntro ? "mx-auto w-full max-w-4xl" : "lg:order-2"
          }`}
        >
          <div className="flex flex-col gap-3 rounded-[1.25rem] border border-white/80 bg-white/70 px-4 py-3 sm:rounded-[1.5rem] lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {effectiveCanUseAI
                  ? showIntro
                    ? "Chat-first workspace"
                    : "Session workspace"
                  : effectiveCanViewFullProduct
                    ? "Qualified workspace"
                    : "Public product view"}
              </p>
              <p className="text-xs leading-6 text-[var(--muted)]">
                {effectiveCanUseAI
                  ? showIntro
                    ? "Drop in the brief, get concept directions back, then iterate in the same thread."
                    : (
                      <>
                        Current session ID:{" "}
                        <span className="font-mono text-[0.74rem]">
                          {sessionId || "..."}
                        </span>
                      </>
                    )
                  : effectiveCanViewFullProduct
                    ? "Lead details are in. Invite redemption unlocks the AI workspace."
                    : "Visitors can browse the public shell. Lead submission unlocks more."}
              </p>
            </div>

            {effectiveCanUseAI ? (
              <>
                <label className="flex w-full items-start gap-3 rounded-[1.1rem] border border-[var(--line)] bg-[var(--background-strong)] px-4 py-3 text-sm text-[var(--foreground)] sm:rounded-full sm:py-2 lg:w-auto lg:items-center">
                  <input
                    type="checkbox"
                    checked={researchEnabled}
                    disabled={!researchModeAvailable || isPending}
                    onChange={(event) => {
                      hasTouchedResearchToggleRef.current = true;
                      setResearchEnabled(event.target.checked);
                    }}
                    className="h-4 w-4 rounded border-[var(--line)] text-[var(--olive-deep)] focus:ring-[var(--olive)]"
                  />
                  <span className="font-medium">Web search</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                      researchModeAvailable && researchEnabled
                        ? "bg-[rgba(95,109,71,0.12)] text-[var(--olive-deep)]"
                        : "bg-[rgba(24,32,38,0.08)] text-[var(--muted)]"
                    }`}
                  >
                    {researchModeAvailable
                      ? getWebSearchLabel(researchEnabled)
                      : "Unavailable"}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {researchModeAvailable
                      ? researchEnabled
                        ? "The assistant may search the web for fresh or current information."
                        : "Replies stay model-only unless you turn web search on."
                      : "Web search is not enabled in this environment yet."}
                  </span>
                </label>

                {activeModelOptions.length > 0 ? (
                  <label className="flex w-full flex-col gap-2 rounded-[1.1rem] border border-[var(--line)] bg-[var(--background-strong)] px-4 py-3 text-sm text-[var(--foreground)] sm:max-w-[22rem] lg:w-auto">
                    <span className="font-medium">
                      {researchEnabled ? "Research model" : "Chat model"}
                    </span>
                    <select
                      value={activeModel}
                      disabled={isPending}
                      onChange={(event) => {
                        if (researchEnabled) {
                          setSelectedResearchModel(event.target.value);
                          return;
                        }

                        setSelectedChatModel(event.target.value);
                      }}
                      className="rounded-[0.9rem] border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[rgba(95,109,71,0.36)] focus:ring-4 focus:ring-[rgba(95,109,71,0.08)]"
                    >
                      {activeModelOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-[var(--muted)]">
                      Use Cloudflare AI Gateway model names or dynamic route aliases you
                      have enabled for this environment.
                    </span>
                  </label>
                ) : null}
              </>
            ) : null}
          </div>

          {accessLoading ? (
            <div className="mt-4 rounded-[1.35rem] border border-white/80 bg-white/78 px-4 py-6 text-sm text-[var(--muted)]">
              Loading your access state...
            </div>
          ) : !effectiveCanViewFullProduct ? (
            renderPublicVisitorPanel()
          ) : !effectiveCanUseAI ? (
            renderLeadUnlockedPanel()
          ) : (
            renderAIWorkspace()
          )}

          {statusMessage ? (
            <div className="mt-4 rounded-[1.2rem] border border-[rgba(95,109,71,0.18)] bg-[rgba(216,223,196,0.32)] px-4 py-3 text-sm text-[var(--olive-deep)]">
              {statusMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mt-4 rounded-[1.2rem] border border-[rgba(199,90,50,0.2)] bg-[rgba(255,242,237,0.96)] px-4 py-3 text-sm text-[var(--ember)]">
              {errorMessage}
            </div>
          ) : null}
        </section>
      </div>

      {isAdmin ? (
        <section className="grain-panel mt-4 rounded-[1.6rem] border border-[var(--line)] bg-[var(--card)] p-4 shadow-[var(--shadow)] backdrop-blur-xl sm:mt-6 sm:rounded-[2rem] sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--olive-deep)]">
                Admin Controls
              </p>
              <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                User-facing view first
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">
                This panel stays collapsed by default so the workspace above shows the
                public or gated experience first. Open it when you want to preview the
                other identities or change settings.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAdminControlsOpen((open) => !open)}
              className="inline-flex items-center justify-center rounded-full border border-[var(--line)] bg-white/82 px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-white"
            >
              {adminControlsOpen ? "Hide Admin Controls" : "Show Admin Controls"}
            </button>
          </div>

          {adminControlsOpen ? (
            <div className="mt-5 space-y-5">
              <div className="rounded-[1.25rem] border border-white/80 bg-white/66 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--olive-deep)]">
                  Identity Preview
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {adminPreviewOptions.map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAdminViewState(value)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                        adminViewState === value
                          ? "bg-[var(--olive-deep)] text-white"
                          : "border border-[var(--line)] bg-white/80 text-[var(--foreground)] hover:bg-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-6 text-[var(--muted)]">
                  This changes the interface preview only. Your real permissions remain
                  admin for this browser session.
                </p>
              </div>

              {adminViewState === "admin" ? (
                <AdminConsole active={isAdmin} onAccessRefresh={loadAccessSession} />
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-[rgba(95,109,71,0.24)] bg-[rgba(255,255,255,0.72)] p-5">
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    Previewing {getAccessLabel(adminViewState)}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                    The workspace above is now showing what this identity sees when
                    landing on the product. Switch back to <span className="font-semibold text-[var(--olive-deep)]">Admin</span> whenever you want the logs, invite management, and settings panel.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
