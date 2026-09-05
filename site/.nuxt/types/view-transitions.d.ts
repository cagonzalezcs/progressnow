import type { ViewTransitionPageOptions } from '../types/config'
declare module 'nuxt/app' {
  interface PageMeta {
    viewTransition?: ViewTransitionPageOptions['enabled'] | ViewTransitionPageOptions
  }
}
export {}