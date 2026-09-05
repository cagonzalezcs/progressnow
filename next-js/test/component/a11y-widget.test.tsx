import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it } from "vitest";
import { A11yProvider } from "@/components/a11y/A11yProvider";
import { A11yWidget } from "@/components/site/A11yWidget";
import { STORAGE_KEY } from "@/lib/a11y-settings";

/* openspec next-accessibility § Accessibility settings widget parity,
 * § Keyboard-complete interactions: popover opens from the keyboard, every
 * control is a pressed-state button, changes persist and are announced. */
describe("A11yWidget", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("style");
    document.documentElement.className = "";
  });

  it("opens with the keyboard, toggles settings with aria-pressed, persists and announces", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <A11yProvider>
        <A11yWidget />
      </A11yProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Accessibility options" });
    expect(await axe(container)).toHaveNoViolations();

    trigger.focus();
    await user.keyboard("{Enter}");
    const dialog = await screen.findByText("Accessibility");
    expect(dialog).toBeVisible();

    const group = screen.getByRole("group", { name: "Text size" });
    const xl = within(group).getByRole("button", { name: "A++" });
    expect(xl).toHaveAttribute("aria-pressed", "false");
    await user.click(xl);
    expect(xl).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.style.fontSize).toBe("20px");
    expect(document.documentElement.dataset.textSize).toBe("xl");

    const contrast = screen.getByRole("button", { name: /High contrast/ });
    await user.click(contrast);
    expect(contrast).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.classList.contains("a11y-contrast")).toBe(true);

    const motion = screen.getByRole("button", { name: /Reduce motion/ });
    await user.click(motion);
    expect(motion).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.dataset.motion).toBe("reduce");

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({
      textSize: "xl",
      highContrast: true,
      reduceMotion: true,
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Text size: A++. High contrast: On. Reduce motion: On.",
    );
    expect(await axe(document.body)).toHaveNoViolations();

    await user.keyboard("{Escape}");
    expect(screen.queryByText("Accessibility")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("renders translated labels", async () => {
    render(
      <A11yProvider>
        <A11yWidget
          labels={{
            trigger: "Opciones de accesibilidad",
            heading: "Accesibilidad",
            textSize: "Tamaño del texto",
          }}
        />
      </A11yProvider>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Opciones de accesibilidad" }));
    expect(await screen.findByText("Accesibilidad")).toBeVisible();
    expect(screen.getByRole("group", { name: "Tamaño del texto" })).toBeVisible();
  });
});
