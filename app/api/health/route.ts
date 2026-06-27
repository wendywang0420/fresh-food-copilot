import { NextResponse } from "next/server";
import { resolveAITransport } from "@/lib/ai-transport";
import { env } from "@/lib/env";
import { getChatModelOptions, getResearchModelOptions } from "@/lib/model-options";

const getSupabaseProjectRef = () => {
  try {
    const hostname = new URL(env.supabaseURL).hostname;
    return hostname.split(".")[0] || null;
  } catch {
    return null;
  }
};

export async function GET() {
  const chatTransport = resolveAITransport("chat_generation");
  const researchTransport = resolveAITransport("research_generation");

  return NextResponse.json({
    ok: true,
    openAIConfigured: Boolean(env.openAIApiKey),
    openAIBaseURL: env.openAIBaseURL,
    model: env.openAIModel,
    aiGatewayEnabled: env.aiGatewayEnabled,
    aiGatewayConfigured: chatTransport.gatewayConfigured,
    aiGatewayActive: chatTransport.gatewayUsed,
    auditLoggingEnabled: env.auditLoggingEnabled,
    supabaseConfigured: Boolean(env.supabaseURL && env.supabaseServiceRoleKey),
    supabaseProjectRef: getSupabaseProjectRef(),
    chatModelOptions: getChatModelOptions(),
    researchModelOptions: getResearchModelOptions(),
    researchModeEnabled: env.enableResearchMode,
    researchModel: env.openAIResearchModel,
    researchReasoningEffort: env.openAIResearchReasoningEffort,
    researchBotProtected: Boolean(env.researchBotAPIKey),
    transports: {
      chat: chatTransport,
      research: researchTransport,
    },
  });
}
