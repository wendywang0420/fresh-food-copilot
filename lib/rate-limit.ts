const WINDOW_MS = 60_000;
const MAX_REQUESTS = 8;

type Entry = {
  hits: number[];
};

declare global {
  var __freshFoodRateLimitStore: Map<string, Entry> | undefined;
}

const store = globalThis.__freshFoodRateLimitStore ?? new Map<string, Entry>();

if (!globalThis.__freshFoodRateLimitStore) {
  globalThis.__freshFoodRateLimitStore = store;
}

export const checkRateLimit = (key: string) => {
  const now = Date.now();
  const entry = store.get(key) ?? { hits: [] };
  const recentHits = entry.hits.filter((hit) => now - hit < WINDOW_MS);

  if (recentHits.length >= MAX_REQUESTS) {
    const retryAfter = Math.max(
      1,
      Math.ceil((WINDOW_MS - (now - recentHits[0])) / 1000),
    );

    store.set(key, { hits: recentHits });

    return {
      allowed: false,
      retryAfter,
    };
  }

  recentHits.push(now);
  store.set(key, { hits: recentHits });

  return {
    allowed: true,
    retryAfter: 0,
  };
};
