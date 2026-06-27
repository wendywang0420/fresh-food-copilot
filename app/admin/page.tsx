"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { appConfig } from "@/lib/app-config";

function AdminPageContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const reason = searchParams.get("reason")?.trim();
  const [errorMessage, setErrorMessage] = useState(
    reason
      ? reason
      : searchParams.get("error") === "invalid_link"
        ? "That admin sign-in link is invalid or expired."
        : searchParams.get("error") === "missing_token"
          ? "The sign-in link is missing its token."
          : "",
  );
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || isPending) {
      return;
    }

    setIsPending(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const response = await fetch("/api/admin/auth/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            error?: string;
            redirectTo?: string;
          }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to start admin sign-in.");
      }

      if (payload?.redirectTo) {
        window.location.assign(payload.redirectTo);
        return;
      }

      setStatusMessage("Admin access granted. Redirecting to the workspace.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to start admin sign-in.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-10 sm:px-6">
      <div className="grain-panel rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--olive-deep)]">
          Admin Access
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
          Sign in to the admin controls
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
          Admin access uses the server-side allowlist. Once approved, you can
          open the main product page and see the public, qualified, AI-enabled,
          and admin views from the same app.
        </p>

        <div className="mt-6 rounded-[1.4rem] border border-white/80 bg-white/70 p-5">
          <label className="block text-sm font-semibold text-[var(--foreground)]">
            Work email
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@company.com"
            className="mt-3 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[rgba(95,109,71,0.36)] focus:ring-4 focus:ring-[rgba(95,109,71,0.08)]"
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!email.trim() || isPending}
              className="inline-flex items-center justify-center rounded-full bg-[var(--olive-deep)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--olive)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isPending ? "Checking access..." : "Enter Admin Workspace"}
            </button>
            <Link
              href={appConfig.routePath}
              className="text-sm font-medium text-[var(--olive-deep)] underline-offset-4 hover:underline"
            >
              Back to the product page
            </Link>
          </div>

          {statusMessage ? (
            <div className="mt-4 rounded-[1rem] border border-[rgba(95,109,71,0.18)] bg-[rgba(216,223,196,0.32)] px-4 py-3 text-sm text-[var(--olive-deep)]">
              {statusMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mt-4 rounded-[1rem] border border-[rgba(199,90,50,0.2)] bg-[rgba(255,242,237,0.96)] px-4 py-3 text-sm text-[var(--ember)]">
              {errorMessage}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminPageContent />
    </Suspense>
  );
}
