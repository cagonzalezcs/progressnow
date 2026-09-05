import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";
import eslintConfigPrettier from "eslint-config-prettier/flat";

/* Static layer of the a11y contract (openspec next-accessibility): jsx-a11y
 * strict on every component. The axe-core gate against the build is the
 * acceptance bar; this only catches what is knowable from the source. The
 * tokens-only rule keeps role-named design tokens the single source of color
 * and radius (next-design-system § Tokens only). */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // eslint-config-next already registers the jsx-a11y plugin; only the strict rule set is added here.
  { files: ["**/*.{ts,tsx}"], rules: jsxA11y.flatConfigs.strict.rules },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          // bg-[#1848d8], text-[rgb(...)], rounded-[7px] … — use the shared tokens.
          selector:
            "Literal[value=/(?:^|[\\s\"'`])(?:bg|text|border|ring|fill|stroke|from|to|via|shadow|outline|decoration|accent|caret)-\\[(?:#|rgb|hsl|oklch|color-mix)/]",
          message: "Use a role-named color token (brand, accent, alt, ink, …) instead of an arbitrary color value.",
        },
        {
          selector: "Literal[value=/(?:^|[\\s\"'`])rounded(?:-[a-z]+)?-\\[\\d+(?:px|rem)\\]/]",
          message: "Use the radius scale (20/14/999 via the shared tokens) instead of an arbitrary radius.",
        },
      ],
    },
  },
  {
    // shadcn/ui registry primitives are vendored as-is (same exemption as the theme).
    files: ["components/ui/**/*.tsx"],
    rules: { "no-restricted-syntax": "off" },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "test-results/**", "playwright-report/**", "lib/schemas.ts"]),
  eslintConfigPrettier,
]);

export default eslintConfig;
