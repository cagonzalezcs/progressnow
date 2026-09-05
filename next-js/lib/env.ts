import { z } from "zod";

/* Environment contract (openspec next-deployment § Environment contract and
 * startup validation). Server-side only — nothing here is exposed to the
 * browser except NEXT_PUBLIC_SITE_ORIGIN, which Next inlines by name. */

export class EnvError extends Error {
  readonly name = "EnvError";
}

const MOCK_API_BASE = "http://127.0.0.1:8787/wp-json/progressnow/v1";
const MOCK_SECRET = "dev-mock-secret-not-for-production";

const httpUrl = (name: string) =>
  z
    .string({ required_error: `${name} is required` })
    .trim()
    .url({ message: `${name} must be an absolute http(s) URL` })
    .refine(
      (u) => {
        try {
          return /^https?:$/.test(new URL(u).protocol);
        } catch {
          return false;
        }
      },
      { message: `${name} must use http or https` },
    );

const schema = z.object({
  WP_API_BASE: httpUrl("WP_API_BASE").transform((u) => u.replace(/\/+$/, "")),
  WP_ORIGIN: httpUrl("WP_ORIGIN")
    .transform((u) => new URL(u).origin)
    .optional(),
  NEXT_PUBLIC_SITE_ORIGIN: httpUrl("NEXT_PUBLIC_SITE_ORIGIN").transform((u) => new URL(u).origin),
  CHAPTER_REBUILD_SECRET: z
    .string({ required_error: "CHAPTER_REBUILD_SECRET is required" })
    .min(16, { message: "CHAPTER_REBUILD_SECRET must be at least 16 characters" }),
  WP_BUILD_STATUS_URL: httpUrl("WP_BUILD_STATUS_URL").optional(),
  IMAGE_HOSTS: z.string().optional(),
  MOCK_API: z.enum(["1", "true", "0", "false", ""]).optional(),
});

export interface Env {
  WP_API_BASE: string;
  WP_ORIGIN: string;
  NEXT_PUBLIC_SITE_ORIGIN: string;
  CHAPTER_REBUILD_SECRET: string;
  WP_BUILD_STATUS_URL?: string;
  IMAGE_HOSTS: string[];
  MOCK_API: boolean;
}

/** Pure: validate a raw environment map. Throws EnvError naming every problem. */
export function readEnv(source: Record<string, string | undefined>): Env {
  const mock = source.MOCK_API === "1" || source.MOCK_API === "true";
  const input: Record<string, string | undefined> = {
    ...source,
    WP_API_BASE: source.WP_API_BASE ?? (mock ? MOCK_API_BASE : undefined),
    CHAPTER_REBUILD_SECRET: source.CHAPTER_REBUILD_SECRET ?? (mock ? MOCK_SECRET : undefined),
    NEXT_PUBLIC_SITE_ORIGIN:
      source.NEXT_PUBLIC_SITE_ORIGIN ?? (mock ? "http://localhost:3000" : undefined),
  };
  // zod treats "" as present; the contract treats it as unset.
  for (const key of Object.keys(input)) if (input[key] === "") delete input[key];

  const result = schema.safeParse(input);
  if (!result.success) {
    const problems = result.error.issues.map((i) => `${i.path.join(".") || "env"}: ${i.message}`);
    throw new EnvError(`Invalid environment:\n  - ${problems.join("\n  - ")}`);
  }
  const parsed = result.data;
  const wpOrigin = parsed.WP_ORIGIN ?? new URL(parsed.WP_API_BASE).origin;
  const hosts = (parsed.IMAGE_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  return {
    WP_API_BASE: parsed.WP_API_BASE,
    WP_ORIGIN: wpOrigin,
    NEXT_PUBLIC_SITE_ORIGIN: parsed.NEXT_PUBLIC_SITE_ORIGIN,
    CHAPTER_REBUILD_SECRET: parsed.CHAPTER_REBUILD_SECRET,
    WP_BUILD_STATUS_URL: parsed.WP_BUILD_STATUS_URL,
    IMAGE_HOSTS: hosts.length ? hosts : [new URL(wpOrigin).hostname],
    MOCK_API: mock,
  };
}

let cached: Env | undefined;

/** Memoized process.env contract; instrumentation.ts calls it at startup so a
 * misconfigured deployment fails before serving a request. */
export function getEnv(): Env {
  if (!cached) cached = readEnv(process.env);
  return cached;
}

/** Test seam. */
export function resetEnvForTests(): void {
  cached = undefined;
}
