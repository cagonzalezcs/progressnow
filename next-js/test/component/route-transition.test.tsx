import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { A11yProvider } from "@/components/a11y/A11yProvider";
import { RouteTransition } from "@/components/nav/RouteTransition";

/* The stable `react` used here has no ViewTransition, so the boundary is a
 * pass-through: these pin the contract that <main> and <footer> render as its
 * direct children in every motion mode (the transition itself is covered by
 * test/e2e/chrome.spec.ts). */
describe("RouteTransition", () => {
  it("renders <main> and <footer> (jsdom has no View Transitions API — instant swap)", () => {
    render(
      <A11yProvider>
        <RouteTransition>
          <main id="main">Hello</main>
          <footer>Footer</footer>
        </RouteTransition>
      </A11yProvider>,
    );
    expect(screen.getByRole("main")).toHaveTextContent("Hello");
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Footer");
  });

  it("keeps rendering its children when motion is reduced", () => {
    localStorage.setItem("chapter-a11y", JSON.stringify({ reduceMotion: true }));
    render(
      <A11yProvider>
        <RouteTransition>
          <main id="main">Still here</main>
          <footer>Footer</footer>
        </RouteTransition>
      </A11yProvider>,
    );
    expect(screen.getByRole("main")).toHaveTextContent("Still here");
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Footer");
    localStorage.clear();
  });
});
