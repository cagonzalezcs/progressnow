// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";
import pluginVueA11y from "eslint-plugin-vuejs-accessibility";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default withNuxt(
  ...pluginVueA11y.configs["flat/recommended"],
  {
    files: ["**/*.vue"],
    rules: {
      // shadcn-vue registry components are single-word (Button, Badge, …)
      "vue/multi-word-component-names": "off",
      // The theme lints these same components with vue's `flat/essential`;
      // optional `class`/`variant` props without defaults are the registry's style.
      "vue/require-default-prop": "off",
    },
  },
  {
    // Vendored shadcn-vue registry primitives + the styleguide demos (same
    // exemptions as the theme's eslint.config.ts — see the rationale there).
    files: [
      "app/components/ui/**/*.vue",
      "app/components/site/Styleguide.vue",
      "app/components/site/styleguide/**/*.vue",
    ],
    rules: {
      "vuejs-accessibility/label-has-for": "off",
      "vuejs-accessibility/form-control-has-label": "off",
      "vuejs-accessibility/no-static-element-interactions": "off",
    },
  },
  eslintConfigPrettier,
);
