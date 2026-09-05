import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { A11yProvider } from "@/components/a11y/A11yProvider";
import { RouteTransition } from "@/components/nav/RouteTransition";

describe("RouteTransition", () => {
  it("renders its children (jsdom has no View Transitions API — instant swap)", () => {
    render(
      <A11yProvider>
        <RouteTransition>
          <main id="main">Hello</main>
        </RouteTransition>
      </A11yProvider>,
    );
    expect(screen.getByRole("main")).toHaveTextContent("Hello");
  });

  it("renders bare children when motion is reduced", () => {
    localStorage.setItem("chapter-a11y", JSON.stringify({ reduceMotion: true }));
    render(
      <A11yProvider>
        <RouteTransition>
          <main id="main">Still here</main>
        </RouteTransition>
      </A11yProvider>,
    );
    expect(screen.getByRole("main")).toHaveTextContent("Still here");
    localStorage.clear();
  });
});
