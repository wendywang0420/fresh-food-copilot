import { NextRequest, NextResponse } from "next/server";
import { getAppSettings } from "@/lib/app-settings";
import { createForbiddenResponse, requireAdminAccess } from "@/lib/access-control";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

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

  const [settings, conversationsResult, operationsResult, leadsResult, codesResult] =
    await Promise.all([
      getAppSettings(),
      supabase
        .from("conversation_messages")
        .select("id,session_id,role,content,created_at,research_used")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("ai_operations")
        .select(
          "id,session_id,route,feature,request_id,provider,model,status,error_phase,error_message,started_at,completed_at,duration_ms",
        )
        .order("started_at", { ascending: false })
        .limit(20),
      supabase
        .from("lead_submissions")
        .select("id,name,work_email,company,role_title,status,created_at")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("invite_codes")
        .select(
          "id,label,status,expires_at,max_uses,current_uses,created_by_email,created_at,updated_at",
        )
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  return NextResponse.json({
    adminEmail: accessContext.adminEmail,
    settings,
    conversations: conversationsResult.data ?? [],
    operations: operationsResult.data ?? [],
    leads: leadsResult.data ?? [],
    inviteCodes: codesResult.data ?? [],
  });
}
