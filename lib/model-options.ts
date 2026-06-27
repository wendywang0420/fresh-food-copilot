import { env } from "@/lib/env";
import type { AIModelOption, AppRuntimeSettings } from "@/lib/types";

const uniqueValues = (values: string[]) => Array.from(new Set(values));

const normalizeOption = (value: string): AIModelOption => ({
  value,
  label: value.startsWith("dynamic/") ? `${value} (Gateway route)` : value,
});

const getFallbackChatModels = () =>
  uniqueValues([env.openAIModel, ...env.aiChatModelOptions]);

const getFallbackResearchModels = () =>
  uniqueValues([env.openAIResearchModel, ...env.aiResearchModelOptions]);

export const getChatModelOptions = (
  settings?: Pick<AppRuntimeSettings, "chatModelOptions">,
): AIModelOption[] =>
  uniqueValues(settings?.chatModelOptions ?? getFallbackChatModels()).map(
    normalizeOption,
  );

export const getResearchModelOptions = (
  settings?: Pick<AppRuntimeSettings, "researchModelOptions">,
): AIModelOption[] =>
  uniqueValues(
    settings?.researchModelOptions ?? getFallbackResearchModels(),
  ).map(normalizeOption);

export const isAllowedChatModel = (
  value: string,
  settings?: Pick<AppRuntimeSettings, "chatModelOptions">,
) => getChatModelOptions(settings).some((option) => option.value === value);

export const isAllowedResearchModel = (
  value: string,
  settings?: Pick<AppRuntimeSettings, "researchModelOptions">,
) => getResearchModelOptions(settings).some((option) => option.value === value);
