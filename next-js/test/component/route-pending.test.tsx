import { render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RoutePending } from "@/components/nav/RoutePending";

/* The footer's hold during a route commit. React owns when a Suspense fallback
 * mounts and unmounts; what this component owes is the flag app/route-loading.css
 * keys off — raised while a fallback stands in for content, lowered only once the
 * last one has gone. That the flag actually hides the footer in the shipped
 * bundle is asserted in test/e2e/chrome.spec.ts. */

const flag = () => document.documentElement.hasAttribute("data-route-loading");

afterEach(() => document.documentElement.removeAttribute("data-route-loading"));

describe("RoutePending", () => {
  it("flags <html> while it is mounted and clears it when the content replaces it", () => {
    const { unmount } = render(<RoutePending />);
    expect(flag()).toBe(true);
    unmount();
    expect(flag()).toBe(false);
  });

  it("stands in with an aria-busy region when the boundary has no skeleton", () => {
    const { container } = render(<RoutePending />);
    expect(container.querySelector("[aria-busy='true']")).not.toBeNull();
  });

  it("renders the fragment's own skeleton when the boundary supplies one", () => {
    const { container } = render(
      <RoutePending>
        <div data-testid="skeleton" />
      </RoutePending>,
    );
    expect(container.querySelector("[data-testid='skeleton']")).not.toBeNull();
    expect(container.querySelector("[aria-busy='true']")).toBeNull();
    expect(flag()).toBe(true);
  });

  it("keeps the flag until the last overlapping fallback has gone", () => {
    // A route shell resolving into a fragment that is itself still pending:
    // the two fallbacks overlap, and the first to leave must not clear the flag.
    const route = render(<RoutePending />);
    const fragment = render(<RoutePending />);
    expect(flag()).toBe(true);

    route.unmount();
    expect(flag()).toBe(true);

    fragment.unmount();
    expect(flag()).toBe(false);
  });
});
