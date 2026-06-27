"use client";

import { useEffect, useState } from "react";
import type { AppRuntimeSettings } from "@/lib/types";

type ConsoleSnapshot = {
  adminEmail?: string;
  settings: AppRuntimeSettings;
  conversations: Array<{
    id: number;
    session_id: string;
    role: string;
    content: string;
    created_at: string;
    research_used?: boolean;
  }>;
  operations: Array<{
    id: number;
    session_id: string;
    route: string;
    feature: string;
    request_id: string;
    provider: string;
    model: string;
    status: string;
    error_phase?: string | null;
    error_message?: string | null;
    started_at: string;
    completed_at?: string | null;
    duration_ms?: number | null;
  }>;
  leads: Array<{
    id: number;
    name: string;
    work_email: string;
    company: string;
    role_title: string;
    status: string;
    created_at: string;
  }>;
  inviteCodes: Array<{
    id: number;
    label: string;
    status: string;
    expires_at?: string | null;
    max_uses?: number | null;
    current_uses: number;
    created_by_email?: string | null;
    created_at: string;
    updated_at: string;
  }>;
};

const settingsToTextarea = (values: string[]) => values.join(", ");

const textareaToSettings = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const hasError = (value: unknown): value is { error?: string } =>
  typeof value === "object" && value !== null && "error" in value;

export function AdminConsole({
  active,
  onAccessRefresh,
}: {
  active: boolean;
  onAccessRefresh?: () => Promise<void>;
}) {
  const [snapshot, setSnapshot] = useState<ConsoleSnapshot | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [leadGateEnabled, setLeadGateEnabled] = useState(true);
  const [inviteGateEnabled, setInviteGateEnabled] = useState(true);
  const [researchModeEnabled, setResearchModeEnabled] = useState(false);
  const [chatModelOptions, setChatModelOptions] = useState("");
  const [researchModelOptions, setResearchModelOptions] = useState("");
  const [inviteLabel, setInviteLabel] = useState("");
  const [inviteMaxUses, setInviteMaxUses] = useState("");
  const [inviteExpiresAt, setInviteExpiresAt] = useState("");
  const [latestInviteCode, setLatestInviteCode] = useState("");

  const requestSnapshot = async () => {
    const response = await fetch("/api/admin/console", {
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => null)) as
      | ConsoleSnapshot
      | { error?: string }
      | null;

    if (!response.ok || !payload || hasError(payload)) {
      throw new Error(
        hasError(payload) ? payload.error : "Failed to load admin data.",
      );
    }

    return payload;
  };

  const applySnapshot = (payload: ConsoleSnapshot) => {
    setSnapshot(payload);
    setLeadGateEnabled(payload.settings.leadGateEnabled);
    setInviteGateEnabled(payload.settings.inviteGateEnabled);
    setResearchModeEnabled(payload.settings.researchModeEnabled);
    setChatModelOptions(settingsToTextarea(payload.settings.chatModelOptions));
    setResearchModelOptions(
      settingsToTextarea(payload.settings.researchModelOptions),
    );
  };

  const loadSnapshot = async () => {
    if (!active) {
      return;
    }

    setErrorMessage("");
    applySnapshot(await requestSnapshot());
  };

  useEffect(() => {
    if (!active) {
      return;
    }

    let isCancelled = false;

    const loadInitialSnapshot = async () => {
      try {
        const payload = await requestSnapshot();

        if (!isCancelled) {
          applySnapshot(payload);
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : "Failed to load admin data.",
          );
        }
      }
    };

    void loadInitialSnapshot();

    return () => {
      isCancelled = true;
    };
  }, [active]);

  const handleSaveSettings = async () => {
    setIsPending(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadGateEnabled,
          inviteGateEnabled,
          researchModeEnabled,
          chatModelOptions: textareaToSettings(chatModelOptions),
          researchModelOptions: textareaToSettings(researchModelOptions),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | AppRuntimeSettings
        | null;

      if (!response.ok || !payload || hasError(payload)) {
        throw new Error(
          hasError(payload) ? payload.error : "Failed to save settings.",
        );
      }

      setStatusMessage("Settings saved.");
      await loadSnapshot();
      await onAccessRefresh?.();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to save settings.",
      );
    } finally {
      setIsPending(false);
    }
  };

  const handleCreateInviteCode = async () => {
    if (!inviteLabel.trim()) {
      return;
    }

    setIsPending(true);
    setErrorMessage("");
    setStatusMessage("");
    setLatestInviteCode("");

    try {
      const response = await fetch("/api/admin/invite-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: inviteLabel,
          maxUses: inviteMaxUses.trim() ? Number(inviteMaxUses) : null,
          expiresAt: inviteExpiresAt.trim() || null,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; code?: string }
        | null;

      if (!response.ok || !payload || payload.error) {
        throw new Error(payload?.error ?? "Failed to create invite code.");
      }

      setLatestInviteCode(payload.code ?? "");
      setStatusMessage("Invite code created.");
      setInviteLabel("");
      setInviteMaxUses("");
      setInviteExpiresAt("");
      await loadSnapshot();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to create invite code.",
      );
    } finally {
      setIsPending(false);
    }
  };

  const handleToggleInviteCode = async ({
    id,
    status,
  }: {
    id: number;
    status: string;
  }) => {
    setIsPending(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const response = await fetch("/api/admin/invite-codes", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok || payload?.error) {
        throw new Error(payload?.error ?? "Failed to update invite code.");
      }

      setStatusMessage("Invite code updated.");
      await loadSnapshot();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update invite code.",
      );
    } finally {
      setIsPending(false);
    }
  };

  const handleSignOut = async () => {
    await fetch("/api/admin/auth/sign-out", {
      method: "POST",
    });
    window.location.reload();
  };

  if (!active) {
    return null;
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-[1.35rem] border border-white/80 bg-white/78 p-4 sm:rounded-[1.6rem]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Admin console
            </p>
            <p className="text-xs leading-6 text-[var(--muted)]">
              {snapshot?.adminEmail
                ? `Signed in as ${snapshot.adminEmail}`
                : "Signed in admin access."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-full border border-[var(--line)] bg-white/80 px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-white"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[1.35rem] border border-white/80 bg-white/78 p-4 sm:rounded-[1.6rem]">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Live AI settings
          </p>
          <div className="mt-4 grid gap-3">
            <label className="flex items-center gap-3 text-sm text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={leadGateEnabled}
                onChange={(event) => setLeadGateEnabled(event.target.checked)}
              />
              Require lead form before fuller product access
            </label>
            <label className="flex items-center gap-3 text-sm text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={inviteGateEnabled}
                onChange={(event) => setInviteGateEnabled(event.target.checked)}
              />
              Require invite code before AI access
            </label>
            <label className="flex items-center gap-3 text-sm text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={researchModeEnabled}
                onChange={(event) => setResearchModeEnabled(event.target.checked)}
              />
              Allow research mode in the product
            </label>
            <label className="block text-sm text-[var(--foreground)]">
              <span className="font-medium">Chat model allowlist</span>
              <textarea
                value={chatModelOptions}
                onChange={(event) => setChatModelOptions(event.target.value)}
                className="mt-2 min-h-[90px] w-full rounded-[1rem] border border-[var(--line)] bg-[var(--background-strong)] px-3 py-3 text-sm outline-none transition focus:border-[rgba(95,109,71,0.36)] focus:ring-4 focus:ring-[rgba(95,109,71,0.08)]"
              />
            </label>
            <label className="block text-sm text-[var(--foreground)]">
              <span className="font-medium">Research model allowlist</span>
              <textarea
                value={researchModelOptions}
                onChange={(event) => setResearchModelOptions(event.target.value)}
                className="mt-2 min-h-[90px] w-full rounded-[1rem] border border-[var(--line)] bg-[var(--background-strong)] px-3 py-3 text-sm outline-none transition focus:border-[rgba(95,109,71,0.36)] focus:ring-4 focus:ring-[rgba(95,109,71,0.08)]"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={isPending}
              className="rounded-full bg-[var(--olive-deep)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--olive)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Save Settings
            </button>
          </div>
        </section>

        <section className="rounded-[1.35rem] border border-white/80 bg-white/78 p-4 sm:rounded-[1.6rem]">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Invite code management
          </p>
          <div className="mt-4 grid gap-3">
            <input
              type="text"
              value={inviteLabel}
              onChange={(event) => setInviteLabel(event.target.value)}
              placeholder="Cohort label"
              className="rounded-[1rem] border border-[var(--line)] bg-[var(--background-strong)] px-3 py-3 text-sm outline-none transition focus:border-[rgba(95,109,71,0.36)] focus:ring-4 focus:ring-[rgba(95,109,71,0.08)]"
            />
            <input
              type="number"
              min="1"
              value={inviteMaxUses}
              onChange={(event) => setInviteMaxUses(event.target.value)}
              placeholder="Max uses"
              className="rounded-[1rem] border border-[var(--line)] bg-[var(--background-strong)] px-3 py-3 text-sm outline-none transition focus:border-[rgba(95,109,71,0.36)] focus:ring-4 focus:ring-[rgba(95,109,71,0.08)]"
            />
            <input
              type="datetime-local"
              value={inviteExpiresAt}
              onChange={(event) => setInviteExpiresAt(event.target.value)}
              className="rounded-[1rem] border border-[var(--line)] bg-[var(--background-strong)] px-3 py-3 text-sm outline-none transition focus:border-[rgba(95,109,71,0.36)] focus:ring-4 focus:ring-[rgba(95,109,71,0.08)]"
            />
            <button
              type="button"
              onClick={handleCreateInviteCode}
              disabled={!inviteLabel.trim() || isPending}
              className="rounded-full bg-[var(--olive-deep)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--olive)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Create Invite Code
            </button>
          </div>

          {latestInviteCode ? (
            <div className="mt-4 rounded-[1rem] border border-[rgba(95,109,71,0.18)] bg-[rgba(216,223,196,0.32)] px-4 py-3 text-sm text-[var(--olive-deep)]">
              Newly generated code: <span className="font-mono">{latestInviteCode}</span>
            </div>
          ) : null}

          <div className="mt-4 space-y-3">
            {snapshot?.inviteCodes.map((code) => (
              <div
                key={code.id}
                className="rounded-[1rem] border border-[var(--line)] bg-[var(--background-strong)] px-4 py-3"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {code.label}
                    </p>
                    <p className="text-xs leading-6 text-[var(--muted)]">
                      Status: {code.status} • Uses: {code.current_uses}
                      {typeof code.max_uses === "number" ? ` / ${code.max_uses}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      handleToggleInviteCode({
                        id: code.id,
                        status: code.status === "active" ? "disabled" : "active",
                      })
                    }
                    className="rounded-full border border-[var(--line)] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {code.status === "active" ? "Disable" : "Re-Enable"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="rounded-[1.35rem] border border-white/80 bg-white/78 p-4 sm:rounded-[1.6rem]">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Recent lead submissions
          </p>
          <div className="mt-4 space-y-3">
            {snapshot?.leads.map((lead) => (
              <div
                key={lead.id}
                className="rounded-[1rem] border border-[var(--line)] bg-[var(--background-strong)] px-4 py-3"
              >
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {lead.name}
                </p>
                <p className="text-xs leading-6 text-[var(--muted)]">
                  {lead.work_email} • {lead.company}
                </p>
                <p className="text-xs leading-6 text-[var(--muted)]">
                  {lead.role_title} • {new Date(lead.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.35rem] border border-white/80 bg-white/78 p-4 sm:rounded-[1.6rem]">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Recent AI operations
          </p>
          <div className="mt-4 space-y-3">
            {snapshot?.operations.map((operation) => (
              <div
                key={operation.id}
                className="rounded-[1rem] border border-[var(--line)] bg-[var(--background-strong)] px-4 py-3"
              >
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {operation.feature} • {operation.status}
                </p>
                <p className="text-xs leading-6 text-[var(--muted)]">
                  {operation.model} • {operation.route}
                </p>
                <p className="text-xs leading-6 text-[var(--muted)]">
                  {new Date(operation.started_at).toLocaleString()}
                  {typeof operation.duration_ms === "number"
                    ? ` • ${operation.duration_ms}ms`
                    : ""}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.35rem] border border-white/80 bg-white/78 p-4 sm:rounded-[1.6rem]">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Recent conversation rows
          </p>
          <div className="mt-4 space-y-3">
            {snapshot?.conversations.map((message) => (
              <div
                key={message.id}
                className="rounded-[1rem] border border-[var(--line)] bg-[var(--background-strong)] px-4 py-3"
              >
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {message.role} • {message.session_id}
                </p>
                <p className="mt-1 text-xs leading-6 text-[var(--muted)]">
                  {message.content.slice(0, 180)}
                  {message.content.length > 180 ? "..." : ""}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {statusMessage ? (
        <div className="rounded-[1rem] border border-[rgba(95,109,71,0.18)] bg-[rgba(216,223,196,0.32)] px-4 py-3 text-sm text-[var(--olive-deep)]">
          {statusMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-[1rem] border border-[rgba(199,90,50,0.2)] bg-[rgba(255,242,237,0.96)] px-4 py-3 text-sm text-[var(--ember)]">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
}
