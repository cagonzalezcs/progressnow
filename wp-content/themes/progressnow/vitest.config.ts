import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

/* Standalone config — vite.config.js's plugins (live-reload, vite-for-wp,
 * dev-server https) are WP-runtime concerns that have no place in unit
 * tests, and the wordpress/ WorDBless install must never be scanned. */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["tests/**/*.test.ts", "src/**/__tests__/*.spec.ts"],
  },
});
