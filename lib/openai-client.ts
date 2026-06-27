import { getOpenAIClientBundle } from "@/lib/ai-transport";
import type { AITaskKind } from "@/lib/types";

export const getOpenAIClient = (task: AITaskKind = "chat_generation") =>
  getOpenAIClientBundle(task).client;

export { getOpenAIClientBundle } from "@/lib/ai-transport";
