import type {
  RetrievedContext,
  RetrievalSessionContext,
} from "@/lib/types";

export const retrieveContext = async (
  query: string,
  sessionContext: RetrievalSessionContext,
): Promise<RetrievedContext[]> => {
  void query;
  void sessionContext;
  return [];
};

export const appendRetrievedContextToInstructions = ({
  baseInstructions,
  retrievedContext,
}: {
  baseInstructions?: string;
  retrievedContext: RetrievedContext[];
}) => {
  const normalizedBase = baseInstructions?.trim() ?? "";

  if (retrievedContext.length === 0) {
    return normalizedBase;
  }

  const contextBlock = retrievedContext
    .map((item, index) => {
      const score =
        typeof item.score === "number" ? ` (score: ${item.score.toFixed(3)})` : "";

      return [
        `[Context ${index + 1}] ${item.title}${score}`,
        item.content,
      ].join("\n");
    })
    .join("\n\n");

  return [
    normalizedBase,
    "Additional internal context is available below. Use it only when relevant and do not overstate certainty.",
    contextBlock,
  ]
    .filter(Boolean)
    .join("\n\n");
};
