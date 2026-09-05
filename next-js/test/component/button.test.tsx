import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";

/* shadcn/ui smoke (task 2.3): the registry Button renders with the semantic
 * `bg-primary` utility — which the shared stylesheet maps to `--primary`
 * (theme `:root`) — and is axe-clean. jsdom does not evaluate Tailwind, so the
 * computed color is asserted in the styleguide e2e, not here. */
describe("shadcn/ui Button", () => {
  it("renders the default variant on the semantic primary token", async () => {
    const { container } = render(<Button>Join us</Button>);
    const button = screen.getByRole("button", { name: "Join us" });
    expect(button).toHaveClass("bg-primary");
    expect(await axe(container)).toHaveNoViolations();
  });
});
