import { NextRequest, NextResponse } from "next/server";
import {
  completeAdminMagicLink,
  completeAdminMagicLinkFromAccessToken,
  completeAdminMagicLinkFromCode,
  setAdminSession,
} from "@/lib/access-control";
import { appConfig } from "@/lib/app-config";

type CallbackBody = {
  tokenHash?: string;
  token?: string;
  type?: string;
  code?: string;
  accessToken?: string;
};

const getAdminDestination = (origin: string) =>
  new URL(`${appConfig.routePath}?view=admin`, origin);

const getErrorDestination = ({
  origin,
  code,
  reason,
}: {
  origin: string;
  code: string;
  reason?: string;
}) => {
  const destination = new URL("/admin", origin);
  destination.searchParams.set("error", code);

  if (reason) {
    destination.searchParams.set("reason", reason);
  }

  return destination;
};

const completeFromPayload = async ({
  tokenHash,
  token,
  type,
  code,
  accessToken,
}: CallbackBody) => {
  const resolvedTokenHash = tokenHash || token;

  if (resolvedTokenHash) {
    return completeAdminMagicLink({
      tokenHash: resolvedTokenHash,
      type: type?.trim() || "email",
    });
  }

  if (code) {
    return completeAdminMagicLinkFromCode({
      code,
    });
  }

  if (accessToken) {
    return completeAdminMagicLinkFromAccessToken({
      accessToken,
    });
  }

  throw new Error("The sign-in link is missing its token.");
};

const completeToRedirectResponse = async ({
  origin,
  payload,
}: {
  origin: string;
  payload: CallbackBody;
}) => {
  const email = await completeFromPayload(payload);
  const response = NextResponse.redirect(getAdminDestination(origin));

  await setAdminSession({
    response,
    adminEmail: email,
  });

  return response;
};

const completeToJsonResponse = async ({
  origin,
  payload,
}: {
  origin: string;
  payload: CallbackBody;
}) => {
  const email = await completeFromPayload(payload);
  const response = NextResponse.json({
    ok: true,
    redirectTo: getAdminDestination(origin).toString(),
  });

  await setAdminSession({
    response,
    adminEmail: email,
  });

  return response;
};

const hashBridgeHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Completing admin sign-in…</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #f4efe7;
        color: #1f2520;
        font: 16px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main {
        width: min(560px, calc(100vw - 32px));
        padding: 32px 28px;
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.92);
        box-shadow: 0 24px 60px rgba(35, 42, 29, 0.12);
      }
      h1 {
        margin: 0 0 12px;
        font-size: 28px;
      }
      p {
        margin: 0;
        color: #50604c;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Completing admin sign-in…</h1>
      <p>Please wait while we finish the secure email login.</p>
    </main>
    <script>
      (async () => {
        const search = new URLSearchParams(window.location.search);
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const payload = {
          tokenHash: search.get("token_hash") || hash.get("token_hash") || undefined,
          token: search.get("token") || hash.get("token") || undefined,
          type: search.get("type") || hash.get("type") || undefined,
          code: search.get("code") || hash.get("code") || undefined,
          accessToken:
            search.get("access_token") || hash.get("access_token") || undefined,
        };

        if (!payload.tokenHash && !payload.token && !payload.code && !payload.accessToken) {
          window.location.replace("/admin?error=missing_token");
          return;
        }

        const response = await fetch("/api/admin/auth/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json().catch(() => null);

        if (response.ok && result?.redirectTo) {
          window.location.replace(result.redirectTo);
          return;
        }

        const reason = encodeURIComponent(
          result?.error || "That admin sign-in link is invalid or expired.",
        );
        window.location.replace("/admin?error=invalid_link&reason=" + reason);
      })().catch(() => {
        window.location.replace("/admin?error=invalid_link");
      });
    </script>
  </body>
</html>`;

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash")?.trim();
  const token = request.nextUrl.searchParams.get("token")?.trim();
  const type = request.nextUrl.searchParams.get("type")?.trim() ?? undefined;
  const code = request.nextUrl.searchParams.get("code")?.trim();
  const accessToken = request.nextUrl.searchParams.get("access_token")?.trim();

  if (tokenHash || token || code || accessToken) {
    try {
      return await completeToRedirectResponse({
        origin: request.nextUrl.origin,
        payload: {
          tokenHash,
          token,
          type,
          code,
          accessToken,
        },
      });
    } catch (error) {
      const reason =
        error instanceof Error
          ? error.message
          : "That admin sign-in link is invalid or expired.";

      return NextResponse.redirect(
        getErrorDestination({
          origin: request.nextUrl.origin,
          code: "invalid_link",
          reason,
        }),
      );
    }
  }

  return new NextResponse(hashBridgeHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: NextRequest) {
  let body: CallbackBody;

  try {
    body = (await request.json()) as CallbackBody;
  } catch {
    return NextResponse.json(
      {
        error: "Invalid JSON payload.",
      },
      { status: 400 },
    );
  }

  try {
    return await completeToJsonResponse({
      origin: request.nextUrl.origin,
      payload: body,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "That admin sign-in link is invalid or expired.",
      },
      { status: 400 },
    );
  }
}
