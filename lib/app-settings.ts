import { env } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import type { AppRuntimeSettings } from "@/lib/types";

const SETTINGS_KEYS = [
  "lead_gate_enabled",
  "invite_gate_enabled",
  "research_mode_enabled",
  "chat_model_options",
  "research_model_options",
] as const;

const uniqueValues = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const defaultSettings: AppRuntimeSettings = {
  leadGateEnabled: true,
  inviteGateEnabled: true,
  researchModeEnabled: env.enableResearchMode,
  chatModelOptions: uniqueValues([env.openAIModel, ...env.aiChatModelOptions]),
  researchModelOptions: uniqueValues([
    env.openAIResearchModel,
    ...env.aiResearchModelOptions,
  ]),
};

const logSettingsError = (action: string, error: unknown) => {
  console.error(`App settings failure during ${action}.`, error);
};

const normalizeStringList = (value: unknown, fallback: string[]) =>
  Array.isArray(value)
    ? uniqueValues(value.filter((item): item is string => typeof item === "string"))
    : fallback;

export const getDefaultAppSettings = () => defaultSettings;

export const getAppSettings = async (): Promise<AppRuntimeSettings> => {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return defaultSettings;
  }

  const { data, error } = await supabase
    .from("app_settings")
    .select("key,value_json")
    .in("key", [...SETTINGS_KEYS]);

  if (error) {
    logSettingsError("getAppSettings", error);
    return defaultSettings;
  }

  const settingsMap = new Map<string, unknown>(
    (data ?? []).map((row) => [String(row.key), row.value_json]),
  );

  return {
    leadGateEnabled:
      typeof settingsMap.get("lead_gate_enabled") === "boolean"
        ? Boolean(settingsMap.get("lead_gate_enabled"))
        : defaultSettings.leadGateEnabled,
    inviteGateEnabled:
      typeof settingsMap.get("invite_gate_enabled") === "boolean"
        ? Boolean(settingsMap.get("invite_gate_enabled"))
        : defaultSettings.inviteGateEnabled,
    researchModeEnabled:
      typeof settingsMap.get("research_mode_enabled") === "boolean"
        ? Boolean(settingsMap.get("research_mode_enabled"))
        : defaultSettings.researchModeEnabled,
    chatModelOptions: normalizeStringList(
      settingsMap.get("chat_model_options"),
      defaultSettings.chatModelOptions,
    ),
    researchModelOptions: normalizeStringList(
      settingsMap.get("research_model_options"),
      defaultSettings.researchModelOptions,
    ),
  };
};

export const updateAppSettings = async ({
  settings,
  updatedByEmail,
}: {
  settings: Partial<AppRuntimeSettings>;
  updatedByEmail?: string;
}) => {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase admin client is not configured.");
  }

  const rows = [
    settings.leadGateEnabled === undefined
      ? null
      : {
          key: "lead_gate_enabled",
          value_json: settings.leadGateEnabled,
          updated_by_email: updatedByEmail ?? null,
          updated_at: new Date().toISOString(),
        },
    settings.inviteGateEnabled === undefined
      ? null
      : {
          key: "invite_gate_enabled",
          value_json: settings.inviteGateEnabled,
          updated_by_email: updatedByEmail ?? null,
          updated_at: new Date().toISOString(),
        },
    settings.researchModeEnabled === undefined
      ? null
      : {
          key: "research_mode_enabled",
          value_json: settings.researchModeEnabled,
          updated_by_email: updatedByEmail ?? null,
          updated_at: new Date().toISOString(),
        },
    settings.chatModelOptions === undefined
      ? null
      : {
          key: "chat_model_options",
          value_json: uniqueValues(settings.chatModelOptions),
          updated_by_email: updatedByEmail ?? null,
          updated_at: new Date().toISOString(),
        },
    settings.researchModelOptions === undefined
      ? null
      : {
          key: "research_model_options",
          value_json: uniqueValues(settings.researchModelOptions),
          updated_by_email: updatedByEmail ?? null,
          updated_at: new Date().toISOString(),
        },
  ].filter(Boolean);

  if (rows.length === 0) {
    return getAppSettings();
  }

  const { error } = await supabase.from("app_settings").upsert(rows, {
    onConflict: "key",
    ignoreDuplicates: false,
  });

  if (error) {
    logSettingsError("updateAppSettings", error);
    throw new Error("Failed to update app settings.");
  }

  return getAppSettings();
};
