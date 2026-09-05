import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/* Two projects (openspec next-test-harness): `unit` runs the framework-free
 * libraries and the contract/drift tests in node; `component` runs React
 * Testing Library + jest-axe in jsdom. Inline projects extend this root config
 * (plugins, aliases). The theme owns the contract fixtures (PHPUnit writes
 * them), reached through the `@fixtures` alias. */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      "@fixtures": fileURLToPath(
        new URL("../wp-content/themes/progressnow/tests/fixtures", import.meta.url),
      ),
      // `server-only` throws when imported outside React Server Components; lib
      // modules that carry the marker are unit-tested in plain node.
      "server-only": fileURLToPath(new URL("./test/stubs/server-only.ts", import.meta.url)),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["test/unit/**/*.{spec,test}.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "component",
          environment: "jsdom",
          include: ["test/component/**/*.{spec,test}.tsx"],
          setupFiles: ["./test/setup.component.ts"],
        },
      },
    ],
  },
});
