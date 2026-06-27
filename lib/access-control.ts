import { NextRequest, NextResponse } from "next/server";
import { hashAuditValue } from "@/lib/chat-log";
import { env, isProduction } from "@/lib/env";
import { getChatModelOptions, getResearchModelOptions } from "@/lib/model-options";
import { getAppSettings } from "@/lib/app-settings";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import type {
  AccessCapabilities,
  AccessSessionPayload,
  AccessSessionResponse,
  AccessState,
  AppRuntimeSettings,
  InviteRedemptionSummary,
  LeadSubmissionSummary,
} from "@/lib/types";

const ACCESS_COOKIE_NAME = "fresh_food_access";
const ACCESS_COOKIE_TTL_SECONDS = 60 * 60 * 24 * 7;

const ACCESS_PRECEDENCE: AccessState[] = [
  "public_visitor",
  "lead_unlocked",
  "invite_unlocked",
  "admin",
];

const ACCESS_TOKEN_VERSION = 1;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const toBase64Url = (value: string) =>
  btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const fromBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );

  return atob(padded);
};

const getCookieSecret = () =>
  env.appSessionSecret || env.supabaseServiceRoleKey || "fresh-food-access-secret";

const signString = async (value: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(getCookieSecret()),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(value),
  );

  return toBase64Url(String.fromCharCode(...new Uint8Array(signature)));
};

const createSignedAccessToken = async (payload: AccessSessionPayload) => {
  const serialized = JSON.stringify({
    v: ACCESS_TOKEN_VERSION,
    ...payload,
  });
  const encodedPayload = toBase64Url(serialized);
  const signature = await signString(encodedPayload);
  return `${encodedPayload}.${signature}`;
};

const parseSignedAccessToken = async (
  token: string | undefined,
): Promise<AccessSessionPayload | null> => {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [encodedPayload, providedSignature] = token.split(".");

  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = await signString(encodedPayload);

  if (expectedSignature !== providedSignature) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      textDecoder.decode(
        Uint8Array.from(fromBase64Url(encodedPayload), (char) =>
          char.charCodeAt(0),
        ),
      ),
    ) as AccessSessionPayload & { v?: number };

    if (parsed.v !== ACCESS_TOKEN_VERSION || !parsed.accessState) {
      return null;
    }

    return {
      accessState: parsed.accessState,
      issuedAt: parsed.issuedAt,
      leadSubmissionId: parsed.leadSubmissionId,
      inviteRedemptionId: parsed.inviteRedemptionId,
      adminEmail: parsed.adminEmail,
    };
  } catch {
    return null;
  }
};

const setAccessCookie = async ({
  response,
  payload,
}: {
  response: NextResponse;
  payload: AccessSessionPayload;
}) => {
  const token = await createSignedAccessToken(payload);

  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: ACCESS_COOKIE_TTL_SECONDS,
  });
};

export const clearAccessCookie = (response: NextResponse) => {
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: 0,
  });
};

const isAccessAtLeast = (state: AccessState, minimum: AccessState) =>
  ACCESS_PRECEDENCE.indexOf(state) >= ACCESS_PRECEDENCE.indexOf(minimum);

const computeCapabilities = ({
  accessState,
  settings,
}: {
  accessState: AccessState;
  settings: AppRuntimeSettings;
}): AccessCapabilities => {
  const canViewFullProduct =
    accessState === "admin" ||
    isAccessAtLeast(accessState, "lead_unlocked") ||
    !settings.leadGateEnabled;
  const canUseAI =
    accessState === "admin" ||
    isAccessAtLeast(accessState, "invite_unlocked") ||
    (!settings.inviteGateEnabled && canViewFullProduct);

  return {
    canViewPublic: true,
    canViewFullProduct,
    canUseAI,
    canAccessAdmin: accessState === "admin",
  };
};

const getSessionFromRequest = async (request: NextRequest) =>
  parseSignedAccessToken(request.cookies.get(ACCESS_COOKIE_NAME)?.value);

const getLeadSubmissionSummary = async (
  id: number | undefined,
): Promise<LeadSubmissionSummary | undefined> => {
  if (!id) {
    return undefined;
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return undefined;
  }

  const { data } = await supabase
    .from("lead_submissions")
    .select("id,name,work_email,company,role_title,session_id,created_at")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    return undefined;
  }

  return {
    id: data.id,
    name: data.name,
    workEmail: data.work_email,
    company: data.company,
    roleTitle: data.role_title,
    sessionId: data.session_id ?? undefined,
    createdAt: data.created_at,
  };
};

const getInviteRedemptionSummary = async (
  id: number | undefined,
): Promise<InviteRedemptionSummary | undefined> => {
  if (!id) {
    return undefined;
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return undefined;
  }

  const { data } = await supabase
    .from("invite_redemptions")
    .select("id,invite_code_id,session_id,redeemed_at")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    return undefined;
  }

  return {
    id: data.id,
    inviteCodeId: data.invite_code_id,
    sessionId: data.session_id ?? undefined,
    redeemedAt: data.redeemed_at,
  };
};

export const isAdminEmailAllowlisted = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (env.adminAccessEmails.includes(normalizedEmail)) {
    return true;
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return false;
  }

  const { data } = await supabase
    .from("admin_allowlist")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  return Boolean(data?.id);
};

export const getAccessContext = async (
  request: NextRequest,
): Promise<AccessSessionResponse & { session: AccessSessionPayload | null }> => {
  const settings = await getAppSettings();
  const session = await getSessionFromRequest(request);
  let accessState: AccessState = session?.accessState ?? "public_visitor";
  let adminEmail = session?.adminEmail?.trim().toLowerCase() || undefined;

  if (accessState === "admin") {
    if (!adminEmail || !(await isAdminEmailAllowlisted(adminEmail))) {
      accessState = "public_visitor";
      adminEmail = undefined;
    }
  }

  const capabilities = computeCapabilities({
    accessState,
    settings,
  });

  const leadSubmission = await getLeadSubmissionSummary(session?.leadSubmissionId);
  const inviteRedemption = await getInviteRedemptionSummary(
    session?.inviteRedemptionId,
  );

  return {
    accessState,
    capabilities,
    settings,
    session,
    adminEmail,
    leadSubmission,
    inviteRedemption,
    chatModelOptions: getChatModelOptions(settings),
    researchModelOptions: getResearchModelOptions(settings),
  };
};

export const setLeadUnlockedSession = async ({
  response,
  leadSubmissionId,
}: {
  response: NextResponse;
  leadSubmissionId: number;
}) =>
  setAccessCookie({
    response,
    payload: {
      accessState: "lead_unlocked",
      issuedAt: new Date().toISOString(),
      leadSubmissionId,
    },
  });

export const setInviteUnlockedSession = async ({
  response,
  leadSubmissionId,
  inviteRedemptionId,
}: {
  response: NextResponse;
  leadSubmissionId?: number;
  inviteRedemptionId: number;
}) =>
  setAccessCookie({
    response,
    payload: {
      accessState: "invite_unlocked",
      issuedAt: new Date().toISOString(),
      leadSubmissionId,
      inviteRedemptionId,
    },
  });

export const setAdminSession = async ({
  response,
  adminEmail,
}: {
  response: NextResponse;
  adminEmail: string;
}) =>
  setAccessCookie({
    response,
    payload: {
      accessState: "admin",
      issuedAt: new Date().toISOString(),
      adminEmail: adminEmail.trim().toLowerCase(),
    },
  });

export const requireInviteAccess = async (request: NextRequest) => {
  const context = await getAccessContext(request);

  if (!context.capabilities.canUseAI) {
    return null;
  }

  return context;
};

export const requireAdminAccess = async (request: NextRequest) => {
  const context = await getAccessContext(request);

  if (!context.capabilities.canAccessAdmin) {
    return null;
  }

  return context;
};

export const createForbiddenResponse = (message: string) =>
  NextResponse.json(
    {
      error: message,
    },
    { status: 403 },
  );

export const submitLeadUnlock = async ({
  request,
  name,
  workEmail,
  company,
  roleTitle,
  sessionId,
}: {
  request: NextRequest;
  name: string;
  workEmail: string;
  company: string;
  roleTitle: string;
  sessionId?: string;
}) => {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase admin client is not configured.");
  }

  const ipHeader =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for") ??
    "unknown";
  const remoteIp = ipHeader.split(",")[0]?.trim() || "unknown";
  const ipHash = await hashAuditValue(remoteIp);

  const { data, error } = await supabase
    .from("lead_submissions")
    .insert({
      name: name.trim(),
      work_email: workEmail.trim().toLowerCase(),
      company: company.trim(),
      role_title: roleTitle.trim(),
      session_id: sessionId?.trim() || null,
      ip_hash: ipHash || null,
      status: "active",
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    console.error("Lead submission failed.", error);
    throw new Error("Failed to save lead details.");
  }

  const response = NextResponse.json({
    ok: true,
    leadSubmissionId: data.id,
  });

  await setLeadUnlockedSession({
    response,
    leadSubmissionId: data.id,
  });

  return response;
};

const generateInviteCode = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  let code = "FFC-";

  for (const byte of bytes) {
    code += alphabet[byte % alphabet.length];
  }

  return code;
};

const hashInviteCode = async (code: string) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    textEncoder.encode(code.trim().toUpperCase()),
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export const createInviteCodeRecord = async ({
  label,
  maxUses,
  expiresAt,
  createdByEmail,
}: {
  label: string;
  maxUses?: number | null;
  expiresAt?: string | null;
  createdByEmail?: string;
}) => {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase admin client is not configured.");
  }

  const code = generateInviteCode();
  const codeHash = await hashInviteCode(code);
  const timestamp = new Date().toISOString();
  const { data, error } = await supabase
    .from("invite_codes")
    .insert({
      code_hash: codeHash,
      label: label.trim(),
      status: "active",
      expires_at: expiresAt || null,
      max_uses: maxUses ?? null,
      current_uses: 0,
      created_by_email: createdByEmail?.trim().toLowerCase() ?? null,
      created_at: timestamp,
      updated_at: timestamp,
    })
    .select("id,label,status,expires_at,max_uses,current_uses,created_by_email,created_at,updated_at")
    .single();

  if (error || !data) {
    console.error("Invite code creation failed.", error);
    throw new Error("Failed to create invite code.");
  }

  return {
    code,
    record: data,
  };
};

export const redeemInviteAccess = async ({
  request,
  code,
  sessionId,
}: {
  request: NextRequest;
  code: string;
  sessionId?: string;
}) => {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase admin client is not configured.");
  }

  const accessContext = await getAccessContext(request);

  if (accessContext.accessState === "admin") {
    const response = NextResponse.json({
      ok: true,
      accessState: "admin",
    });
    return response;
  }

  if (
    accessContext.settings.leadGateEnabled &&
    !accessContext.leadSubmission?.id
  ) {
    throw new Error("Lead details are required before invite redemption.");
  }

  const codeHash = await hashInviteCode(code);
  const { data: inviteCode, error: inviteError } = await supabase
    .from("invite_codes")
    .select("id,status,expires_at,max_uses,current_uses")
    .eq("code_hash", codeHash)
    .maybeSingle();

  if (inviteError || !inviteCode) {
    console.error("Invite code lookup failed.", inviteError);
    throw new Error("Invite code not found.");
  }

  if (inviteCode.status !== "active") {
    throw new Error("This invite code is not active.");
  }

  if (inviteCode.expires_at && new Date(inviteCode.expires_at).getTime() < Date.now()) {
    throw new Error("This invite code has expired.");
  }

  if (
    typeof inviteCode.max_uses === "number" &&
    inviteCode.current_uses >= inviteCode.max_uses
  ) {
    throw new Error("This invite code has reached its usage limit.");
  }

  const ipHeader =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for") ??
    "unknown";
  const remoteIp = ipHeader.split(",")[0]?.trim() || "unknown";
  const ipHash = await hashAuditValue(remoteIp);

  const { data: redemption, error: redemptionError } = await supabase
    .from("invite_redemptions")
    .insert({
      invite_code_id: inviteCode.id,
      lead_submission_id: accessContext.leadSubmission?.id ?? null,
      session_id: sessionId?.trim() || accessContext.leadSubmission?.sessionId || null,
      ip_hash: ipHash || null,
      redeemed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (redemptionError || !redemption?.id) {
    console.error("Invite redemption failed.", redemptionError);
    throw new Error("Failed to redeem invite code.");
  }

  const { error: updateError } = await supabase
    .from("invite_codes")
    .update({
      current_uses: inviteCode.current_uses + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", inviteCode.id);

  if (updateError) {
    console.error("Invite usage update failed.", updateError);
  }

  const response = NextResponse.json({
    ok: true,
    inviteRedemptionId: redemption.id,
  });

  await setInviteUnlockedSession({
    response,
    leadSubmissionId: accessContext.leadSubmission?.id,
    inviteRedemptionId: redemption.id,
  });

  return response;
};

export const startAdminMagicLink = async ({
  email,
  origin,
}: {
  email: string;
  origin: string;
}) => {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase admin client is not configured.");
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!(await isAdminEmailAllowlisted(normalizedEmail))) {
    throw new Error("This email is not approved for admin access.");
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${origin}/api/admin/auth/callback`,
    },
  });

  if (error) {
    console.error("Admin sign-in start failed.", error);
    throw new Error(
      error.message || "Failed to send the admin sign-in email.",
    );
  }
};

export const completeAdminMagicLink = async ({
  tokenHash,
  type,
}: {
  tokenHash: string;
  type: string;
}) => {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase admin client is not configured.");
  }

  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as "email",
  });

  if (error || !data.user?.email) {
    console.error("Admin OTP verification failed.", error);
    throw new Error(
      error?.message || "Failed to verify the admin sign-in link.",
    );
  }

  const normalizedEmail = data.user.email.trim().toLowerCase();

  if (!(await isAdminEmailAllowlisted(normalizedEmail))) {
    throw new Error("This email is not approved for admin access.");
  }

  return normalizedEmail;
};

export const createAdminAccessResponse = async ({
  email,
  redirectTo,
}: {
  email: string;
  redirectTo: string;
}) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!(await isAdminEmailAllowlisted(normalizedEmail))) {
    throw new Error("This email is not approved for admin access.");
  }

  const response = NextResponse.json({
    ok: true,
    redirectTo,
  });

  await setAdminSession({
    response,
    adminEmail: normalizedEmail,
  });

  return response;
};

export const completeAdminMagicLinkFromAccessToken = async ({
  accessToken,
}: {
  accessToken: string;
}) => {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase admin client is not configured.");
  }

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user?.email) {
    console.error("Admin access-token verification failed.", error);
    throw new Error(
      error?.message || "Failed to verify the admin sign-in link.",
    );
  }

  const normalizedEmail = data.user.email.trim().toLowerCase();

  if (!(await isAdminEmailAllowlisted(normalizedEmail))) {
    throw new Error("This email is not approved for admin access.");
  }

  return normalizedEmail;
};

export const completeAdminMagicLinkFromCode = async ({
  code,
}: {
  code: string;
}) => {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase admin client is not configured.");
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  const email =
    data.user?.email?.trim().toLowerCase() ??
    data.session?.user?.email?.trim().toLowerCase();

  if (error || !email) {
    console.error("Admin auth-code exchange failed.", error);
    throw new Error(
      error?.message || "Failed to verify the admin sign-in link.",
    );
  }

  if (!(await isAdminEmailAllowlisted(email))) {
    throw new Error("This email is not approved for admin access.");
  }

  return email;
};
