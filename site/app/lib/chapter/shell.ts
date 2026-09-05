import { shellDataSchema, type ShellData } from "@/lib/schemas";

/* The PHP shell's embedded route payload (openspec spec php-shell-handoff
 * § Embedded route payload). Parsed once at boot by plugins/shell.client.ts;
 * everything here is DOM-light and Nuxt-free so it unit-tests in happy-dom. */

export const SHELL_DATA_ID = "__SHELL_DATA__";

export interface ShellStore {
  /** Present only when the document was served by the PHP shell. */
  shell: ShellData | null;
  /** Route path the shell was rendered for (normalized `/about/`). */
  landingPath: string;
  /** Keys the shell embedded — the landing route's data set. */
  keys: string[];
}

export function readShellData(doc: Pick<Document, "getElementById">): ShellData | null {
  const el = doc.getElementById(SHELL_DATA_ID);
  if (!el || !el.textContent) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(el.textContent);
  } catch (err) {
    console.error("[progressnow] __SHELL_DATA__ is not valid JSON", err);
    return null;
  }
  const result = shellDataSchema.safeParse(parsed);
  if (!result.success) {
    console.error("[progressnow] __SHELL_DATA__ failed contract validation", result.error);
    return null;
  }
  return result.data;
}

export function createShellStore(shell: ShellData | null): ShellStore {
  return {
    shell,
    landingPath: shell ? shell.path : "",
    keys: shell ? Object.keys(shell.data) : [],
  };
}

/** Landing route = the document the shell rendered (first route only). */
export function isLandingPath(store: ShellStore, path: string): boolean {
  if (!store.shell) return false;
  const norm = (p: string) => (p.endsWith("/") ? p : `${p}/`);
  return norm(store.landingPath) === norm(path);
}
