import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import pluginVueA11y from "eslint-plugin-vuejs-accessibility";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig([
  { ignores: ["dist/", "vendor/", "node_modules/", "wordpress/"] },
  {
    files: ["vite.config.js"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  pluginVue.configs["flat/essential"],
  ...pluginVueA11y.configs["flat/recommended"],
  {
    files: ["**/*.vue"],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
    rules: {
      // shadcn-vue registry components are single-word (Button, Badge, …)
      "vue/multi-word-component-names": "off",
    },
  },
  {
    // Vendored shadcn-vue registry primitives + the dev-only styleguide demos.
    // The label/form-control rules assume a label sits next to its control in
    // the same file; reusable <Label>/<Textarea>/<NativeSelect> primitives get
    // their association from the consumer, so these fire as false positives.
    // The styleguide page is route-gated to /styleguide (never on real pages).
    files: [
      "src/components/ui/**/*.vue",
      "src/components/site/Styleguide.vue",
      "src/components/site/styleguide/**/*.vue",
    ],
    rules: {
      "vuejs-accessibility/label-has-for": "off",
      "vuejs-accessibility/form-control-has-label": "off",
      "vuejs-accessibility/no-static-element-interactions": "off",
    },
  },
  eslintConfigPrettier,
]);
