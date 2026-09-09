import { act, render, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FocusManager } from "@/components/nav/FocusManager";

/* Focus after client navigation (openspec next-accessibility § Focus and
 * announcement on client navigation). The route's content streams behind a
 * Suspense boundary (app/[[...slug]]/page.tsx), so the pathname can commit
 * while <main> still holds the fallback and the hash target is not in the DOM;
 * these script that order, which the e2e (test/e2e/chrome.spec.ts) can only
 * meet by luck. */
let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <FocusManager />
    </>
  );
}
const Pending = () => <div aria-busy="true" data-testid="route-pending" />;
const About = () => (
  <>
    <h1>About</h1>
    <h2 id="faq">FAQ</h2>
    <button type="button">Ask</button>
  </>
);

beforeEach(() => {
  pathname = "/";
  window.location.hash = "";
  // jsdom implements neither; the manager calls both before focusing.
  Element.prototype.scrollIntoView = vi.fn();
  window.scrollTo = vi.fn();
});

describe("FocusManager", () => {
  it("focuses a hash target that is already in the DOM when the path commits", () => {
    const { rerender } = render(<Shell>Home</Shell>);
    window.location.hash = "#faq";
    pathname = "/about/";
    rerender(
      <Shell>
        <About />
      </Shell>,
    );
    const heading = document.getElementById("faq")!;
    expect(heading).toHaveFocus();
    expect(heading).toHaveAttribute("tabindex", "-1");
    expect(heading.scrollIntoView).toHaveBeenCalledWith({ block: "start", behavior: "instant" });
  });

  it("lands on <main> while the route is pending, then hands focus to the hash target once it mounts", async () => {
    const { rerender } = render(<Shell>Home</Shell>);
    window.location.hash = "#faq";
    pathname = "/about/";
    rerender(
      <Shell>
        <Pending />
      </Shell>,
    );
    expect(document.getElementById("main")).toHaveFocus();
    expect(document.getElementById("faq")).toBeNull();

    // The Suspense reveal: the fallback goes, the content lands.
    rerender(
      <Shell>
        <About />
      </Shell>,
    );
    const heading = document.getElementById("faq")!;
    await waitFor(() => expect(heading).toHaveFocus());
    expect(heading).toHaveAttribute("tabindex", "-1");
    expect(heading.scrollIntoView).toHaveBeenCalledWith({ block: "start", behavior: "instant" });
    // The lent tabindex goes back once focus moves on.
    act(() => heading.blur());
    expect(heading).not.toHaveAttribute("tabindex");
  });

  it("leaves focus alone if the visitor moved on before the hash target mounted", async () => {
    const { rerender } = render(<Shell>Home</Shell>);
    window.location.hash = "#faq";
    pathname = "/about/";
    rerender(
      <Shell>
        <Pending />
        <button type="button" data-testid="elsewhere">
          Elsewhere
        </button>
      </Shell>,
    );
    expect(document.getElementById("main")).toHaveFocus();
    const link = document.querySelector<HTMLElement>('[data-testid="elsewhere"]')!;
    act(() => link.focus());
    rerender(
      <Shell>
        <About />
        <button type="button" data-testid="elsewhere">
          Elsewhere
        </button>
      </Shell>,
    );
    // Give the observer its turn; nothing should change.
    await act(() => Promise.resolve());
    expect(link).toHaveFocus();
    expect(document.getElementById("faq")).not.toHaveAttribute("tabindex");
  });

  it("stops watching for the target after a further navigation", async () => {
    const { rerender } = render(<Shell>Home</Shell>);
    window.location.hash = "#faq";
    pathname = "/about/";
    rerender(
      <Shell>
        <Pending />
      </Shell>,
    );
    window.location.hash = "";
    pathname = "/blog/";
    rerender(
      <Shell>
        <h1>Blog</h1>
      </Shell>,
    );
    expect(document.getElementById("main")).toHaveFocus();
    // Something with the old target's id mounting later must not pull focus.
    rerender(
      <Shell>
        <h1>Blog</h1>
        <About />
      </Shell>,
    );
    await act(() => Promise.resolve());
    expect(document.getElementById("main")).toHaveFocus();
    expect(document.getElementById("faq")).not.toHaveAttribute("tabindex");
  });

  it("does not touch the server HTML on the initial load of a hash URL (hydration guard)", () => {
    window.location.hash = "#faq";
    pathname = "/about/";
    render(
      <Shell>
        <About />
      </Shell>,
    );
    expect(document.getElementById("faq")).not.toHaveAttribute("tabindex");
    expect(document.getElementById("faq")).not.toHaveFocus();
  });
});
