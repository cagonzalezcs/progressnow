/* In-memory replay guard for the rebuild receiver (openspec
 * next-revalidation-receiver § Replay rejection). A repeated
 * `(timestamp, signature)` within the validity window is rejected. Per
 * instance; across instances the revalidation is idempotent, so a replay that
 * lands elsewhere is harmless. */

export interface ReplayCache {
  /** Record `key` at `nowSeconds`; true when it was already recorded within the window. */
  seen(key: string, nowSeconds?: number): boolean;
  readonly size: number;
}

export function createReplayCache({
  windowSeconds = 300,
  max = 2000,
}: { windowSeconds?: number; max?: number } = {}): ReplayCache {
  const entries = new Map<string, number>();
  return {
    seen(key, nowSeconds = Date.now() / 1000) {
      for (const [k, at] of entries) {
        if (nowSeconds - at > windowSeconds) entries.delete(k);
        else break; // insertion-ordered: the rest are newer
      }
      const at = entries.get(key);
      if (at !== undefined && nowSeconds - at <= windowSeconds) return true;
      entries.delete(key);
      entries.set(key, nowSeconds);
      while (entries.size > max) entries.delete(entries.keys().next().value as string);
      return false;
    },
    get size() {
      return entries.size;
    },
  };
}
