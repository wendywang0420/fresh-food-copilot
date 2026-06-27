import { NextRequest, NextResponse } from "next/server";
import { redeemInviteAccess } from "@/lib/access-control";

type InviteUnlockBody = {
  code?: string;
  sessionId?: string;
};

export async function POST(request: NextRequest) {
  let body: InviteUnlockBody;

  try {
    body = (await request.json()) as InviteUnlockBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const code = body.code?.trim();

  if (!code) {
    return NextResponse.json(
      {
        error: "An invite code is required.",
      },
      { status: 400 },
    );
  }

  try {
    return await redeemInviteAccess({
      request,
      code,
      sessionId: body.sessionId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to redeem invite code.";
    const status =
      message.includes("required") || message.includes("not found") ? 400 : 403;

    return NextResponse.json(
      {
        error: message,
      },
      { status },
    );
  }
}
