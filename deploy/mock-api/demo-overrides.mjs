#!/usr/bin/env node
/* Demo values for Chapter Settings fields the snapshot source leaves blank.
 *
 * The local WordPress this snapshot is taken from has no social profiles in its
 * ACF options, and both footers (`SiteFooter.tsx` / `.vue`) drop socials with an
 * empty `url` — so the icon row never renders on the Vercel preview. Filling the
 * gap here keeps the fix out of `snapshot.json` by hand: `snapshot.mjs` applies
 * it on every refresh, and running this file patches the committed snapshot.
 *
 *   node deploy/mock-api/demo-overrides.mjs
 *
 * Only blank fields are filled — once the real host sets a profile URL, its
 * value wins. Handles are placeholders, not real accounts.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

/** Keyed by the `name` WordPress emits in `chapter.socials` (StarterSite.php). */
export const DEMO_SOCIAL_URLS = {
  Facebook: "https://www.facebook.com/progressnow.demo",
  Instagram: "https://www.instagram.com/progressnow.demo",
  Twitter: "https://twitter.com/progressnowdemo",
};

/** @param {{ name: string, url: string }[] | undefined} socials */
function fillSocials(socials) {
  if (!Array.isArray(socials)) return 0;
  let filled = 0;
  for (const s of socials) {
    if (!s.url && DEMO_SOCIAL_URLS[s.name]) {
      s.url = DEMO_SOCIAL_URLS[s.name];
      filled++;
    }
  }
  return filled;
}

/**
 * Fill the blanks in every `/site` envelope, in place.
 *
 * @param {Record<string, any>} entries snapshot entries, keyed "path?query"
 * @returns {number} fields filled
 */
export function applyDemoOverrides(entries) {
  let filled = 0;
  for (const [key, envelope] of Object.entries(entries)) {
    if (!key.startsWith("/site") || !envelope || typeof envelope !== "object") continue;
    filled += fillSocials(envelope.chapter?.socials);
    filled += fillSocials(envelope.footer?.socials);
    // `chapter.instagram_url` is the same profile under its own key (JSON-LD
    // `sameAs` reads both) — keep the two in step.
    if (envelope.chapter && !envelope.chapter.instagram_url) {
      envelope.chapter.instagram_url = DEMO_SOCIAL_URLS.Instagram;
      filled++;
    }
  }
  return filled;
}

// Run directly: patch the committed snapshot.
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const file = join(HERE, "snapshot.json");
  const snapshot = JSON.parse(readFileSync(file, "utf8"));
  const filled = applyDemoOverrides(snapshot.entries);
  writeFileSync(file, JSON.stringify(snapshot));
  console.log(`${filled} field(s) filled → snapshot.json`);
}
