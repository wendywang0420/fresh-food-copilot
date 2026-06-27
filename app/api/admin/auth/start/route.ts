import { NextRequest, NextResponse } from "next/server";
import { createAdminAccessResponse } from "@/lib/access-control";
import { appConfig } from "@/lib/app-config";

type AdminStartBody = {
  email?: string;
};

export async function POST(request: NextRequest) {
  let body: AdminStartBody;

  try {
    body = (await request.json()) as AdminStartBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const email = body.email?.trim();

  if (!email) {
    return NextResponse.json(
      {
        error: "An email address is required.",
      },
      { status: 400 },
    );
  }

  try {
    return await createAdminAccessResponse({
      email,
      redirectTo: new URL(
        `${appConfig.routePath}?view=admin`,
        request.nextUrl.origin,
      ).toString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to start admin sign-in.",
      },
      { status: 400 },
    );
  }
}
