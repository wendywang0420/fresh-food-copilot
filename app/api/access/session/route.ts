import { NextRequest, NextResponse } from "next/server";
import { getAccessContext } from "@/lib/access-control";

export async function GET(request: NextRequest) {
  const context = await getAccessContext(request);

  return NextResponse.json(
    {
      accessState: context.accessState,
      capabilities: context.capabilities,
      settings: context.settings,
      chatModelOptions: context.chatModelOptions,
      researchModelOptions: context.researchModelOptions,
      adminEmail: context.adminEmail,
      leadSubmission: context.leadSubmission,
      inviteRedemption: context.inviteRedemption,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
