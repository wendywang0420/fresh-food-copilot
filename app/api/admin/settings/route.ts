import { NextRequest, NextResponse } from "next/server";
import { getAppSettings, updateAppSettings } from "@/lib/app-settings";
import { createForbiddenResponse, requireAdminAccess } from "@/lib/access-control";

type SettingsBody = {
  leadGateEnabled?: boolean;
  inviteGateEnabled?: boolean;
  researchModeEnabled?: boolean;
  chatModelOptions?: string[];
  researchModelOptions?: string[];
};

export async function GET(request: NextRequest) {
  const accessContext = await requireAdminAccess(request);

  if (!accessContext) {
    return createForbiddenResponse("Admin access is required.");
  }

  return NextResponse.json(await getAppSettings());
}

export async function POST(request: NextRequest) {
  const accessContext = await requireAdminAccess(request);

  if (!accessContext) {
    return createForbiddenResponse("Admin access is required.");
  }

  let body: SettingsBody;

  try {
    body = (await request.json()) as SettingsBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  try {
    const settings = await updateAppSettings({
      settings: {
        leadGateEnabled: body.leadGateEnabled,
        inviteGateEnabled: body.inviteGateEnabled,
        researchModeEnabled: body.researchModeEnabled,
        chatModelOptions: body.chatModelOptions,
        researchModelOptions: body.researchModelOptions,
      },
      updatedByEmail: accessContext.adminEmail,
    });

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update settings.",
      },
      { status: 500 },
    );
  }
}
