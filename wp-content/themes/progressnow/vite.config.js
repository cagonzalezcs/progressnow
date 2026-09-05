import { loadEnv } from "vite";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import * as fs from "node:fs";
import { v4wp } from "@kucrut/vite-for-wp";
import liveReload from "vite-plugin-live-reload";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      liveReload(["./**/*.php", "./**/*.twig", "./**/*.html"]),
      v4wp({
        input: resolve(import.meta.dirname, "src/ts/app.ts"),
        output: resolve(import.meta.dirname, "dist"),
      }),
      vue(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": resolve(import.meta.dirname, "src"),
      },
    },
    build: {
      // The Styleguide island is a lazy dynamic import (src/ts/islands.ts) that
      // pulls in the whole shadcn-vue demo library (~586 kB). It only loads on
      // /styleguide — never on real pages — so the default 500 kB warning is
      // cosmetic here. Raise the limit rather than split a dev-only chunk.
      chunkSizeWarningLimit: 700,
    },
    server: {
      host: env.VITE_LOCAL_DEV_HOST || "localhost",
      port: env.VITE_LOCAL_DEV_PORT || 3000,
      hmr: { host: env.VITE_LOCAL_DEV_HOST },
      cors: true,
      https: {
        cert: env.VITE_LOCAL_CERT_PATH
          ? fs.readFileSync(env.VITE_LOCAL_CERT_PATH)
          : "",
        key: env.VITE_LOCAL_CERT_KEY_PATH
          ? fs.readFileSync(env.VITE_LOCAL_CERT_KEY_PATH)
          : "",
      },
    },
  };
});
