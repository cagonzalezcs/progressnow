import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import site from "@fixtures/site.json";
import { A11yProvider } from "@/components/a11y/A11yProvider";
import { LanguageToggle } from "@/components/site/LanguageToggle";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SkipLink } from "@/components/site/SkipLink";

/* Site chrome (openspec site-chrome, next-accessibility § Landmarks, § Keyboard-
 * complete interactions): header tiers, mobile panel keyboard contract, current
 * section marking, language toggle, footer defaults — all axe-clean. */
let pathname = "/blog/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

const WP = "https://wp.example";
const languages = [
  { code: "en", label: "EN", name: "English", active: true, url: `${WP}/blog/` },
  { code: "es", label: "ES", name: "Español", active: false, url: `${WP}/es/blog/` },
];

describe("SiteHeader", () => {
  beforeEach(() => {
    pathname = "/blog/";
    localStorage.clear();
    document.documentElement.className = "";
  });

  it("marks the current section, re-homes menu URLs, and is axe-clean", async () => {
    const { container } = render(
      <A11yProvider>
        <SiteHeader
          header={{ ...site.header, homeUrl: `${WP}/`, joinUrl: `${WP}/get-involved/#join` }}
          languages={languages}
          wpOrigin={WP}
        />
      </A11yProvider>,
    );
    const navs = screen.getAllByRole("navigation", { name: "Main", hidden: true });
    expect(navs.length).toBe(3); // mobile panel, tablet row, desktop row
    const desktop = navs[2]!;
    const blog = within(desktop).getByRole("link", { name: "Blog" });
    expect(blog).toHaveAttribute("aria-current", "page");
    expect(blog).toHaveAttribute("href", "/blog/");
    expect(within(desktop).getByRole("link", { name: "Calendar" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getAllByRole("link", { name: "Progress Now home" })[0]).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getAllByRole("link", { name: "Join us" })[0]).toHaveAttribute(
      "href",
      "/get-involved/#join",
    );
    // jsdom applies no CSS, so all three responsive tiers are "visible" here; in the browser
    // exactly one <nav aria-label="Main"> renders (the e2e/axe matrix asserts landmark-unique).
    expect(
      await axe(container, { rules: { "landmark-unique": { enabled: false } } }),
    ).toHaveNoViolations();
  });

  it("mobile panel: toggle exposes state, Escape closes and returns focus, text-size row shares the store", async () => {
    const user = userEvent.setup();
    render(
      <A11yProvider>
        <SiteHeader header={site.header} languages={languages} wpOrigin={WP} />
      </A11yProvider>,
    );
    const toggle = screen.getByRole("button", { name: "Menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    const panelId = toggle.getAttribute("aria-controls")!;
    const panel = document.getElementById(panelId)!;
    expect(panel).not.toBeVisible();

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(panel).toBeVisible();
    expect(document.documentElement.classList.contains("overflow-hidden")).toBe(true);
    expect(within(panel).getByRole("link", { name: "Blog" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    const xl = within(within(panel).getByRole("group", { name: "Text size" })).getByRole("button", {
      name: "A++",
    });
    await user.click(xl);
    expect(xl).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.style.fontSize).toBe("20px");

    await user.keyboard("{Escape}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(panel).not.toBeVisible();
    expect(toggle).toHaveFocus();
    expect(document.documentElement.classList.contains("overflow-hidden")).toBe(false);
  });

  it("About ▾ dropdown opens from the keyboard and lists the About items", async () => {
    const user = userEvent.setup();
    render(
      <A11yProvider>
        <SiteHeader header={site.header} languages={languages} wpOrigin={WP} />
      </A11yProvider>,
    );
    const triggers = screen.getAllByRole("button", { name: /About/ });
    triggers[triggers.length - 1]!.focus();
    await user.keyboard("{Enter}");
    const menu = await screen.findByRole("menu");
    expect(within(menu).getAllByRole("menuitem")).toHaveLength(6);
    expect(within(menu).getByRole("menuitem", { name: "FAQ" })).toHaveAttribute(
      "href",
      "/about/#faq",
    );
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});

describe("LanguageToggle", () => {
  it("links each language to the current page's translation with aria-current on the active one", async () => {
    const { container } = render(<LanguageToggle languages={languages} wpOrigin={WP} />);
    const group = screen.getByRole("group", { name: "Language" });
    const en = within(group).getByRole("link", { name: "EN" });
    const es = within(group).getByRole("link", { name: "ES" });
    expect(en).toHaveAttribute("aria-current", "true");
    expect(en).toHaveAttribute("href", "/blog/");
    expect(es).toHaveAttribute("href", "/es/blog/");
    expect(es).toHaveAttribute("lang", "es");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders nothing for a single language", () => {
    const { container } = render(<LanguageToggle languages={[languages[0]!]} wpOrigin={WP} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("SiteFooter", () => {
  it("uses default columns when WordPress sends none, hides unconfigured socials, and is axe-clean", async () => {
    const { container } = render(<SiteFooter footer={site.footer} wpOrigin={WP} />);
    expect(screen.getByRole("navigation", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Resources" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Facebook" })).not.toBeInTheDocument();
    expect(screen.getByText("tell us how we can do better.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Event Calendar" })).toHaveAttribute(
      "href",
      "/calendar/",
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders configured socials as named icon links and the a11y mailto", () => {
    render(
      <SiteFooter
        footer={{
          ...site.footer,
          contactEmail: "hello@example.org",
          socials: [{ name: "Instagram", url: "https://instagram.com/x" }],
        }}
        wpOrigin={WP}
      />,
    );
    expect(screen.getByRole("link", { name: "Instagram" })).toHaveAttribute("rel", "noopener");
    expect(screen.getByRole("link", { name: "tell us how we can do better." })).toHaveAttribute(
      "href",
      "mailto:hello@example.org",
    );
  });
});

describe("SkipLink", () => {
  it("targets #main", () => {
    render(<SkipLink label="Saltar al contenido" />);
    expect(screen.getByRole("link", { name: "Saltar al contenido" })).toHaveAttribute(
      "href",
      "#main",
    );
  });
});
