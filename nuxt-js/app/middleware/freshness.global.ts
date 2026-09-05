import { defineNuxtRouteMiddleware, useNuxtApp } from "#imports";

/* Before any client navigation resolves, make sure the freshness guard has
 * compared the shell's content version with the live manifest (openspec
 * design D4) — `useChapterData()` reads `guard.bypass` synchronously. The
 * fetch started at boot; this only awaits it (bounded by the shell plugin's
 * own error handling), and is a no-op for the initial route. */
export default defineNuxtRouteMiddleware(async (_to, from) => {
  if (import.meta.server) return;
  if (from.matched.length === 0) return;
  const ready = useNuxtApp().$chapterGuardReady;
  if (ready) await ready;
});
