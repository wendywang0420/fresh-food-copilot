import { env, isProduction } from "@/lib/env";

type TurnstileResult = {
  success: boolean;
  skipped?: boolean;
  errors?: string[];
};

export const validateTurnstileToken = async (
  token: string | undefined,
  remoteIp: string,
): Promise<TurnstileResult> => {
  if (!env.enableTurnstile) {
    return {
      success: true,
      skipped: true,
    };
  }

  if (!env.turnstileSecretKey) {
    return {
      success: !isProduction,
      skipped: true,
      errors: isProduction ? ["missing-turnstile-secret"] : undefined,
    };
  }

  if (!token) {
    return {
      success: false,
      errors: ["missing-turnstile-token"],
    };
  }

  const form = new URLSearchParams();
  form.set("secret", env.turnstileSecretKey);
  form.set("response", token);

  if (remoteIp && remoteIp !== "unknown") {
    form.set("remoteip", remoteIp);
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return {
      success: false,
      errors: ["turnstile-request-failed"],
    };
  }

  const result = (await response.json()) as {
    success: boolean;
    hostname?: string;
    "error-codes"?: string[];
  };

  if (
    result.success &&
    env.turnstileExpectedHostname &&
    result.hostname &&
    result.hostname !== env.turnstileExpectedHostname
  ) {
    return {
      success: false,
      errors: ["turnstile-hostname-mismatch"],
    };
  }

  return {
    success: result.success,
    errors: result["error-codes"],
  };
};
