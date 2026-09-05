import { fileURLToPath } from "node:url";
import { defineVitestConfig } from "@nuxt/test-utils/config";

/* Unit specs run in plain node/happy-dom against the Nuxt-free data layer
 * (app/lib/chapter/*) and the shared contracts; the single boot smoke under
 * test/nuxt/ opts into the `nuxt` environment per file. */
export default defineVitestConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./app", import.meta.url)),
      "~": fileURLToPath(new URL("./app", import.meta.url)),
      // The theme owns the fixtures (dual-sided contracts, PHPUnit writes them).
      "@fixtures": fileURLToPath(
        new URL("../wp-content/themes/progressnow/tests/fixtures", import.meta.url),
      ),
    },
  },
  test: {
    include: ["test/**/*.spec.ts", "test/**/*.test.ts"],
    environmentOptions: {
      nuxt: {
        domEnvironment: "happy-dom",
        overrides: {
          runtimeConfig: { public: { wpApiBase: "/mock/v1", mockApi: true } },
        },
      },
    },
  },
});
