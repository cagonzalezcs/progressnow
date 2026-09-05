import "vitest";

/* jest-axe's matcher on vitest's expect (registered in test/setup.component.ts). */
declare module "vitest" {
  interface Assertion<T = unknown> {
    toHaveNoViolations(): T;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}
