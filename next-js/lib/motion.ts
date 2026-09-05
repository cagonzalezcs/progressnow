/* Motion gate (openspec next-accessibility § Motion preferences). */
export function shouldReduceMotion(
  settings: { reduceMotion: boolean },
  prefersReducedMotion: boolean,
): boolean {
  return settings.reduceMotion || prefersReducedMotion;
}

export function supportsViewTransitions(
  doc: Document | undefined = typeof document === "undefined" ? undefined : document,
): boolean {
  return Boolean(
    doc &&
    typeof (doc as Document & { startViewTransition?: unknown }).startViewTransition === "function",
  );
}
