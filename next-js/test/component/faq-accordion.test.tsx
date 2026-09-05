import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { FaqAccordion } from "@/components/site/FaqAccordion";

/* openspec next-accessibility § Keyboard-complete interactions: disclosure
 * pattern — Enter/Space toggle, arrows move between headers, one open at a time. */
const items = [
  { question: "Do I have to be a member?", answer: "No." },
  { question: "Is childcare available?", answer: "Yes, at most events." },
  { question: "How do I join a committee?", answer: "Come to a meeting." },
];

describe("FaqAccordion", () => {
  it("is keyboard operable and exposes aria-expanded", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <main>
        <h1>About</h1>
        {/* Radix renders each trigger inside an <h3>; on the page the FAQ sits under a section h2. */}
        <h2>FAQ</h2>
        <FaqAccordion items={items} />
      </main>,
    );
    const triggers = screen.getAllByRole("button");
    expect(triggers).toHaveLength(3);
    for (const t of triggers) expect(t).toHaveAttribute("aria-expanded", "false");
    expect(await axe(container)).toHaveNoViolations();

    triggers[0]!.focus();
    await user.keyboard("{Enter}");
    expect(triggers[0]).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("No.")).toBeVisible();

    await user.keyboard("{ArrowDown}");
    expect(triggers[1]).toHaveFocus();
    await user.keyboard(" ");
    expect(triggers[1]).toHaveAttribute("aria-expanded", "true");
    expect(triggers[0]).toHaveAttribute("aria-expanded", "false"); // single

    await user.keyboard("{End}");
    expect(triggers[2]).toHaveFocus();
    await user.keyboard("{Home}");
    expect(triggers[0]).toHaveFocus();
    expect(await axe(container)).toHaveNoViolations();
  });
});
