import type { ChatMessage } from "@/lib/types";

export type ConversationInputItem =
  | {
      role: "user";
      content: Array<{
        type: "input_text";
        text: string;
      }>;
    }
  | {
      role: "assistant";
      content: Array<{
        type: "output_text";
        text: string;
      }>;
    };

const isChatRole = (role: string): role is "user" | "assistant" =>
  role === "user" || role === "assistant";

export const sanitizeMessages = (
  messages: ChatMessage[] | undefined,
): ConversationInputItem[] =>
  (messages ?? [])
    .filter((message) => isChatRole(message.role) && message.content.trim())
    .slice(-12)
    .map((message) => {
      const text = message.content.trim();

      if (message.role === "assistant") {
        return {
          role: "assistant",
          content: [{ type: "output_text", text }],
        };
      }

      return {
        role: "user",
        content: [{ type: "input_text", text }],
      };
    });
