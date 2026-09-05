import { NuxtModule, ModuleDependencyMeta } from '@nuxt/schema'
declare module '@nuxt/schema' {
  interface ModuleDependencies {
    ["@nuxt/eslint"]?: ModuleDependencyMeta<typeof import("@nuxt/eslint").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["progressnow:routes-manifest"]?: ModuleDependencyMeta<typeof import("./../../modules/routes-manifest").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["progressnow:shell-manifest"]?: ModuleDependencyMeta<typeof import("./../../modules/shell-manifest").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["progressnow:routes-manifest"]?: ModuleDependencyMeta<typeof import("/Users/cesargonzalez/Sites/progressnow/site/modules/routes-manifest").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["progressnow:shell-manifest"]?: ModuleDependencyMeta<typeof import("/Users/cesargonzalez/Sites/progressnow/site/modules/shell-manifest").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxt/devtools"]?: ModuleDependencyMeta<typeof import("@nuxt/devtools").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxt/telemetry"]?: ModuleDependencyMeta<typeof import("@nuxt/telemetry").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
  }
  interface NuxtOptions {
    /**
     * Configuration for `@nuxt/eslint`
     */
    ["eslint"]: typeof import("@nuxt/eslint").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `./../../modules/routes-manifest`
     */
    ["progressnow:routes-manifest"]: typeof import("./../../modules/routes-manifest").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `./../../modules/shell-manifest`
     */
    ["progressnow:shell-manifest"]: typeof import("./../../modules/shell-manifest").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `/Users/cesargonzalez/Sites/progressnow/site/modules/routes-manifest`
     */
    ["progressnow:routes-manifest"]: typeof import("/Users/cesargonzalez/Sites/progressnow/site/modules/routes-manifest").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `/Users/cesargonzalez/Sites/progressnow/site/modules/shell-manifest`
     */
    ["progressnow:shell-manifest"]: typeof import("/Users/cesargonzalez/Sites/progressnow/site/modules/shell-manifest").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/devtools`
     */
    ["devtools"]: typeof import("@nuxt/devtools").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/telemetry`
     */
    ["telemetry"]: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
  }
  interface NuxtConfig {
    /**
     * Configuration for `@nuxt/eslint`
     */
    ["eslint"]?: typeof import("@nuxt/eslint").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `./../../modules/routes-manifest`
     */
    ["progressnow:routes-manifest"]?: typeof import("./../../modules/routes-manifest").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `./../../modules/shell-manifest`
     */
    ["progressnow:shell-manifest"]?: typeof import("./../../modules/shell-manifest").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `/Users/cesargonzalez/Sites/progressnow/site/modules/routes-manifest`
     */
    ["progressnow:routes-manifest"]?: typeof import("/Users/cesargonzalez/Sites/progressnow/site/modules/routes-manifest").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `/Users/cesargonzalez/Sites/progressnow/site/modules/shell-manifest`
     */
    ["progressnow:shell-manifest"]?: typeof import("/Users/cesargonzalez/Sites/progressnow/site/modules/shell-manifest").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/devtools`
     */
    ["devtools"]?: typeof import("@nuxt/devtools").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/telemetry`
     */
    ["telemetry"]?: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    modules?: (undefined | null | false | NuxtModule<any> | string | [NuxtModule | string, Record<string, any>] | ["@nuxt/eslint", Exclude<NuxtConfig["eslint"], boolean>] | ["./../../modules/routes-manifest", Exclude<NuxtConfig["progressnow:routes-manifest"], boolean>] | ["./../../modules/shell-manifest", Exclude<NuxtConfig["progressnow:shell-manifest"], boolean>] | ["/Users/cesargonzalez/Sites/progressnow/site/modules/routes-manifest", Exclude<NuxtConfig["progressnow:routes-manifest"], boolean>] | ["/Users/cesargonzalez/Sites/progressnow/site/modules/shell-manifest", Exclude<NuxtConfig["progressnow:shell-manifest"], boolean>] | ["@nuxt/devtools", Exclude<NuxtConfig["devtools"], boolean>] | ["@nuxt/telemetry", Exclude<NuxtConfig["telemetry"], boolean>])[],
  }
}
declare module 'nuxt/schema' {
  interface ModuleDependencies {
    ["@nuxt/eslint"]?: ModuleDependencyMeta<typeof import("@nuxt/eslint").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["progressnow:routes-manifest"]?: ModuleDependencyMeta<typeof import("./../../modules/routes-manifest").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["progressnow:shell-manifest"]?: ModuleDependencyMeta<typeof import("./../../modules/shell-manifest").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["progressnow:routes-manifest"]?: ModuleDependencyMeta<typeof import("/Users/cesargonzalez/Sites/progressnow/site/modules/routes-manifest").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["progressnow:shell-manifest"]?: ModuleDependencyMeta<typeof import("/Users/cesargonzalez/Sites/progressnow/site/modules/shell-manifest").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxt/devtools"]?: ModuleDependencyMeta<typeof import("@nuxt/devtools").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxt/telemetry"]?: ModuleDependencyMeta<typeof import("@nuxt/telemetry").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
  }
  interface NuxtOptions {
    /**
     * Configuration for `@nuxt/eslint`
     * @see https://www.npmjs.com/package/@nuxt/eslint
     */
    ["eslint"]: typeof import("@nuxt/eslint").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `./../../modules/routes-manifest`
     * @see https://www.npmjs.com/package/./../../modules/routes-manifest
     */
    ["progressnow:routes-manifest"]: typeof import("./../../modules/routes-manifest").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `./../../modules/shell-manifest`
     * @see https://www.npmjs.com/package/./../../modules/shell-manifest
     */
    ["progressnow:shell-manifest"]: typeof import("./../../modules/shell-manifest").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `/Users/cesargonzalez/Sites/progressnow/site/modules/routes-manifest`
     * @see https://www.npmjs.com/package//Users/cesargonzalez/Sites/progressnow/site/modules/routes-manifest
     */
    ["progressnow:routes-manifest"]: typeof import("/Users/cesargonzalez/Sites/progressnow/site/modules/routes-manifest").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `/Users/cesargonzalez/Sites/progressnow/site/modules/shell-manifest`
     * @see https://www.npmjs.com/package//Users/cesargonzalez/Sites/progressnow/site/modules/shell-manifest
     */
    ["progressnow:shell-manifest"]: typeof import("/Users/cesargonzalez/Sites/progressnow/site/modules/shell-manifest").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/devtools`
     * @see https://www.npmjs.com/package/@nuxt/devtools
     */
    ["devtools"]: typeof import("@nuxt/devtools").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/telemetry`
     * @see https://www.npmjs.com/package/@nuxt/telemetry
     */
    ["telemetry"]: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
  }
  interface NuxtConfig {
    /**
     * Configuration for `@nuxt/eslint`
     * @see https://www.npmjs.com/package/@nuxt/eslint
     */
    ["eslint"]?: typeof import("@nuxt/eslint").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `./../../modules/routes-manifest`
     * @see https://www.npmjs.com/package/./../../modules/routes-manifest
     */
    ["progressnow:routes-manifest"]?: typeof import("./../../modules/routes-manifest").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `./../../modules/shell-manifest`
     * @see https://www.npmjs.com/package/./../../modules/shell-manifest
     */
    ["progressnow:shell-manifest"]?: typeof import("./../../modules/shell-manifest").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `/Users/cesargonzalez/Sites/progressnow/site/modules/routes-manifest`
     * @see https://www.npmjs.com/package//Users/cesargonzalez/Sites/progressnow/site/modules/routes-manifest
     */
    ["progressnow:routes-manifest"]?: typeof import("/Users/cesargonzalez/Sites/progressnow/site/modules/routes-manifest").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `/Users/cesargonzalez/Sites/progressnow/site/modules/shell-manifest`
     * @see https://www.npmjs.com/package//Users/cesargonzalez/Sites/progressnow/site/modules/shell-manifest
     */
    ["progressnow:shell-manifest"]?: typeof import("/Users/cesargonzalez/Sites/progressnow/site/modules/shell-manifest").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/devtools`
     * @see https://www.npmjs.com/package/@nuxt/devtools
     */
    ["devtools"]?: typeof import("@nuxt/devtools").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/telemetry`
     * @see https://www.npmjs.com/package/@nuxt/telemetry
     */
    ["telemetry"]?: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    modules?: (undefined | null | false | NuxtModule<any> | string | [NuxtModule | string, Record<string, any>] | ["@nuxt/eslint", Exclude<NuxtConfig["eslint"], boolean>] | ["./../../modules/routes-manifest", Exclude<NuxtConfig["progressnow:routes-manifest"], boolean>] | ["./../../modules/shell-manifest", Exclude<NuxtConfig["progressnow:shell-manifest"], boolean>] | ["/Users/cesargonzalez/Sites/progressnow/site/modules/routes-manifest", Exclude<NuxtConfig["progressnow:routes-manifest"], boolean>] | ["/Users/cesargonzalez/Sites/progressnow/site/modules/shell-manifest", Exclude<NuxtConfig["progressnow:shell-manifest"], boolean>] | ["@nuxt/devtools", Exclude<NuxtConfig["devtools"], boolean>] | ["@nuxt/telemetry", Exclude<NuxtConfig["telemetry"], boolean>])[],
  }
}