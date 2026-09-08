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

/** Bare host (`cdn.example.org`) or a scheme-qualified origin (`http://cms.local:8890`). */
const IMAGE_HOST_ENTRY = /^(?:https?:\/\/)?[a-z0-9.-]+(?::\d{1,5})?$/i;

const imageHosts = z
  .string()
  .optional()
  .refine((v) => splitList(v).every((h) => IMAGE_HOST_ENTRY.test(h)), {
    message:
      "IMAGE_HOSTS entries must be bare hosts (https only) or http(s)://host[:port] origins, comma-separated",
  });

function splitList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
}

export interface ImageRemotePattern {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
}

/** `next/image` remotePatterns for IMAGE_HOSTS entries (openspec
 * next-edge-trust-boundaries § Image optimization uses HTTPS upstreams in
 * production): a bare host allows https only; an entry that names its scheme
 * (`http://cms.local:8890`) is honored as written, port included. */
export function imageRemotePatterns(entries: readonly string[]): ImageRemotePattern[] {
  const out: ImageRemotePattern[] = [];
  const seen = new Set<string>();
  for (const raw of entries) {
    const entry = raw.trim();
    if (!entry) continue;
    let pattern: ImageRemotePattern;
    if (entry.includes("://")) {
      const url = new URL(entry);
      pattern = { protocol: url.protocol === "http:" ? "http" : "https", hostname: url.hostname };
      if (url.port) pattern.port = url.port;
    } else {
      pattern = { protocol: "https", hostname: entry.toLowerCase() };
    }
    const key = `${pattern.protocol}://${pattern.hostname}:${pattern.port ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(pattern);
  }
  return out;
}

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
  IMAGE_HOSTS: imageHosts,
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
    throw new EnvError(
      `Invalid environment:\n  - ${problems.join("\n  - ")}\n\n` +
        "Local development: copy next-js/.env.example to .env.local, or run `npm run dev:mock` to use the " +
        "fixture-backed mock API without WordPress.\n" +
        "The standalone server does not read .env.local — export these in the shell (or pass them through " +
        "your process manager) before `npm run start:standalone`.\n" +
        "TLS against a local MAMP PRO site: trust MAMP's CA from the shell, which Node reads at process " +
        "start, so .env.local is too late — NODE_EXTRA_CA_CERTS=/Applications/MAMP/Library/OpenSSL/certs/MAMP_PRO_Root_CA.crt. " +
        "Never NODE_TLS_REJECT_UNAUTHORIZED=0: it disables verification outright and Node warns on every fetch.",
    );
  }
  const parsed = result.data;
  const wpOrigin = parsed.WP_ORIGIN ?? new URL(parsed.WP_API_BASE).origin;
  const hosts = splitList(parsed.IMAGE_HOSTS);
  return {
    WP_API_BASE: parsed.WP_API_BASE,
    WP_ORIGIN: wpOrigin,
    NEXT_PUBLIC_SITE_ORIGIN: parsed.NEXT_PUBLIC_SITE_ORIGIN,
    CHAPTER_REBUILD_SECRET: parsed.CHAPTER_REBUILD_SECRET,
    WP_BUILD_STATUS_URL: parsed.WP_BUILD_STATUS_URL,
    // The default is the WordPress ORIGIN, scheme included: a production https WordPress is
    // https-only for the optimizer; the http fixture mock (MOCK_API) keeps its loopback http.
    IMAGE_HOSTS: hosts.length ? hosts : [wpOrigin],
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
