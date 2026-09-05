import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";

/* Nuxt 4 static rendition of the Progress Now theme.
 *
 * Handoff model (openspec design D1): WordPress serves every public URL as a
 * PHP shell (SEO head + crawlable content + `__SHELL_DATA__`); this app's
 * client entry mounts into `#__nuxt`, renders the landing route from the
 * embedded payload, and handles every later navigation from the prerendered
 * `_payload.json` files (D3) — falling back to the REST API for dynamic
 * states and while a rebuild is in flight (D4).
 *
 * Environment:
 *   NUXT_PUBLIC_WP_API_BASE  absolute `…/wp-json/progressnow/v1` of the
 *                            WordPress that generate reads from (also what
 *                            the browser calls for search/filter/calendar)
 *   NUXT_DEV_WP_ORIGIN       local WordPress origin proxied by `nuxt dev`
 *                            (default https://rgvdsa.test:8890)
 *   NUXT_MOCK_API=1          serve the fixture-backed nitro mock instead
 *   CHAPTER_CONTENT_VERSION  content version stamped into shell-manifest.json
 */
const mock = process.env.NUXT_MOCK_API === "1";
const devOrigin = process.env.NUXT_DEV_WP_ORIGIN || "https://rgvdsa.test:8890";
const apiBase =
  process.env.NUXT_PUBLIC_WP_API_BASE || (mock ? "/mock/v1" : `${devOrigin}/wp-json/progressnow/v1`);

export default defineNuxtConfig({
  compatibilityDate: "2026-01-01",
  ssr: true,

  modules: ["@nuxt/eslint", "./modules/routes-manifest", "./modules/shell-manifest"],

  app: {
    // The PHP shell renders `<div id="__nuxt">` (openspec spec php-shell-handoff).
    rootId: "__nuxt",
    // Cross-fade between routes; Nuxt skips it under prefers-reduced-motion.
    viewTransition: true,
  },

  css: ["~/assets/css/tailwind.css"],

  vite: {
    plugins: [tailwindcss()],
  },

  // Component styles stay in the CSS bundle the shell links (D5) — never
  // inlined into SSR HTML the shell doesn't use.
  features: { inlineStyles: false },

  experimental: {
    payloadExtraction: true,
    appManifest: true,
    viewTransition: true,
  },

  runtimeConfig: {
    public: {
      wpApiBase: apiBase,
      /** Absolute theme static root (fonts, brand placeholders) — the theme slug is fixed. */
      themeStatic: "/wp-content/themes/progressnow/static",
      mockApi: mock,
    },
  },

  nitro: {
    prerender: {
      // Routes come from the /routes manifest (modules/routes-manifest.ts),
      // never from link crawling — editor slugs decide what exists.
      crawlLinks: false,
      failOnError: true,
      routes: [],
    },
    // Mock mode has no WordPress behind it: serve the theme's own static
    // assets (fonts, brand art) from the checkout so previews render whole.
    publicAssets: mock
      ? [
          {
            dir: fileURLToPath(new URL("../wp-content/themes/progressnow/static", import.meta.url)),
            baseURL: "/wp-content/themes/progressnow/static",
            maxAge: 0,
          },
        ]
      : [],
    devProxy: mock
      ? {}
      : {
          "/wp-json": { target: `${devOrigin}/wp-json`, changeOrigin: true, secure: false },
          "/wp-content": { target: `${devOrigin}/wp-content`, changeOrigin: true, secure: false },
        },
  },

  // Explicit imports only (components are shared source with the theme's
  // islands and import each other by path); nothing is auto-registered.
  components: { dirs: [] },

  imports: {
    // Keep composables/libs explicit as well — every file names what it uses.
    scan: false,
  },

  typescript: {
    strict: true,
    typeCheck: false,
    tsConfig: {
      compilerOptions: {
        // The components/libs are shared source with the theme, whose
        // tsconfig does not enable this; keep one set of type rules.
        noUncheckedIndexedAccess: false,
      },
    },
  },

  eslint: {
    config: { stylistic: false },
  },
});
