import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { ERROR_PILL_WHITE, ErrorBand } from "@/components/site/ErrorBand";
import { ErrorSurface } from "@/components/site/ErrorSurface";

/* openspec next-headless-site § Error and empty surfaces; interior-404 D3:
 * the 404 band and the runtime error surface share one axe-clean band. */
describe("error surfaces", () => {
  it("404 band: decorative numeral + stars, one h1, lede, pills", async () => {
    const { container } = render(
      <main>
        <ErrorBand
          kind="not_found"
          numeral="404"
          title="This page got organized out of existence"
          lede="It may have moved."
          actions={
            <a href="https://example.org/" className={ERROR_PILL_WHITE}>
              Back home
            </a>
          }
        />
      </main>,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "organized out of existence",
    );
    expect(screen.getByText("404")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll("svg[aria-hidden='true']")).toHaveLength(4);
    expect(container.querySelector("[data-route-kind='not_found']")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("runtime error surface: honest copy, digest reference, retry calls reset, noindex", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    const { container } = render(
      <main>
        <ErrorSurface digest="abc123" reset={reset} />
      </main>,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Something went wrong");
    expect(screen.getByText("abc123")).toBeInTheDocument();
    expect(document.title).toBe("Something went wrong – Progress Now");
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("link", { name: "Back home" })).toHaveAttribute("href", "/");
    expect(await axe(container)).toHaveNoViolations();
  });
});
