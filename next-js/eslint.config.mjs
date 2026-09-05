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
          message:
            "Use a role-named color token (brand, accent, alt, ink, …) instead of an arbitrary color value.",
        },
        {
          // The theme writes its radius scale as arbitrary values (4/8/10/12/14/16/18/20px, 999);
          // anything outside that scale is ad-hoc.
          selector:
            "Literal[value=/(?:^|[\\s\"'`])rounded(?:-[a-z]+)?-\\[(?!(?:3|4|6|8|9|10|12|14|16|18|20|22|24|999)px\\])\\d+(?:px|rem)\\]/]",
          message:
            "Use the radius scale (4/8/10/12/14/16/18/20px, 999) instead of an ad-hoc radius.",
        },
      ],
    },
  },
  {
    // shadcn/ui registry primitives are vendored as-is (same exemption as the theme).
    files: ["components/ui/**/*.tsx", "hooks/**/*.ts"],
    rules: {
      "no-restricted-syntax": "off",
      "react-hooks/set-state-in-effect": "off",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-noninteractive-element-interactions": "warn",
      "jsx-a11y/anchor-has-content": "warn",
    },
  },
  {
    // The styleguide kitchen sink is the shadcn registry's own examples, vendored verbatim so
    // they stay diff-able against upstream: placeholder hrefs and copy-paste imports are theirs.
    // a11y of the rendered sink is asserted by the axe-core gate instead of the static layer.
    files: ["components/styleguide/examples/**/*.tsx"],
    rules: {
      "no-restricted-syntax": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/set-state-in-effect": "off",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/anchor-has-content": "warn",
      "jsx-a11y/img-redundant-alt": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-noninteractive-element-interactions": "warn",
      "@next/next/no-img-element": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "test-results/**",
    "playwright-report/**",
    "lib/schemas.ts",
  ]),
  eslintConfigPrettier,
]);

export default eslintConfig;
