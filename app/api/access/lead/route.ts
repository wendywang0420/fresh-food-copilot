import { NextRequest, NextResponse } from "next/server";
import { submitLeadUnlock } from "@/lib/access-control";

type LeadUnlockBody = {
  name?: string;
  workEmail?: string;
  company?: string;
  roleTitle?: string;
  sessionId?: string;
};

export async function POST(request: NextRequest) {
  let body: LeadUnlockBody;

  try {
    body = (await request.json()) as LeadUnlockBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const name = body.name?.trim();
  const workEmail = body.workEmail?.trim();
  const company = body.company?.trim();
  const roleTitle = body.roleTitle?.trim();

  if (!name || !workEmail || !company || !roleTitle) {
    return NextResponse.json(
      {
        error: "name, workEmail, company, and roleTitle are required.",
      },
      { status: 400 },
    );
  }

  try {
    return await submitLeadUnlock({
      request,
      name,
      workEmail,
      company,
      roleTitle,
      sessionId: body.sessionId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to unlock the product view.",
      },
      { status: 500 },
    );
  }
}
