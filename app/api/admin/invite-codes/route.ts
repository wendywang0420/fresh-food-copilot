import { NextRequest, NextResponse } from "next/server";
import {
  createForbiddenResponse,
  createInviteCodeRecord,
  requireAdminAccess,
} from "@/lib/access-control";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

type CreateInviteCodeBody = {
  label?: string;
  maxUses?: number | null;
  expiresAt?: string | null;
};

type UpdateInviteCodeBody = {
  id?: number;
  status?: string;
};

export async function GET(request: NextRequest) {
  const accessContext = await requireAdminAccess(request);

  if (!accessContext) {
    return createForbiddenResponse("Admin access is required.");
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase admin client is not configured." },
      { status: 500 },
    );
  }

  const { data, error } = await supabase
    .from("invite_codes")
    .select(
      "id,label,status,expires_at,max_uses,current_uses,created_by_email,created_at,updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json(
      { error: "Failed to load invite codes." },
      { status: 500 },
    );
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const accessContext = await requireAdminAccess(request);

  if (!accessContext) {
    return createForbiddenResponse("Admin access is required.");
  }

  let body: CreateInviteCodeBody;

  try {
    body = (await request.json()) as CreateInviteCodeBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const label = body.label?.trim();

  if (!label) {
    return NextResponse.json(
      { error: "A label is required." },
      { status: 400 },
    );
  }

  try {
    const result = await createInviteCodeRecord({
      label,
      maxUses: body.maxUses ?? null,
      expiresAt: body.expiresAt ?? null,
      createdByEmail: accessContext.adminEmail,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create invite code.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const accessContext = await requireAdminAccess(request);

  if (!accessContext) {
    return createForbiddenResponse("Admin access is required.");
  }

  let body: UpdateInviteCodeBody;

  try {
    body = (await request.json()) as UpdateInviteCodeBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  if (!body.id || !body.status) {
    return NextResponse.json(
      { error: "id and status are required." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase admin client is not configured." },
      { status: 500 },
    );
  }

  const { error } = await supabase
    .from("invite_codes")
    .update({
      status: body.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to update invite code." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
  });
}
