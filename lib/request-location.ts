import type { ResearchUserLocation } from "@/lib/types";

const cleanHeaderValue = (value: string | null) => {
  const normalized = value?.trim();

  if (!normalized || normalized.toLowerCase() === "unknown") {
    return undefined;
  }

  return normalized;
};

export const deriveApproximateUserLocation = (
  headers: Headers,
): ResearchUserLocation | undefined => {
  const city = cleanHeaderValue(
    headers.get("x-vercel-ip-city") ?? headers.get("cf-ipcity"),
  );
  const region = cleanHeaderValue(
    headers.get("x-vercel-ip-country-region") ?? headers.get("cf-region"),
  );
  const country = cleanHeaderValue(
    headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry"),
  );
  const timezone = cleanHeaderValue(
    headers.get("x-vercel-ip-timezone") ?? headers.get("cf-timezone"),
  );

  if (!city && !region && !country && !timezone) {
    return undefined;
  }

  return {
    type: "approximate",
    city,
    region,
    country,
    timezone,
  };
};
