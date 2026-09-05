// @vitest-environment happy-dom
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { describe, expect, it, beforeEach } from "vitest";
import SiteHeader from "@/components/site/SiteHeader.vue";
import { menu, closeMenu } from "@/lib/menu";
import { setLocation } from "@/lib/location";
import { useA11ySettings } from "@/composables/useA11ySettings";

/* v4 mobile navigation panel (openspec progress-now-v4-foundation-chrome,
 * spec "Mobile navigation toggle"; fixed full-viewport panel per the Mobile
 * Menu artboard since progress-now-v4-interior-404): the hamburger toggles the
 * panel (aria-expanded / aria-controls), Escape and a second activation close it and
 * return focus to the toggle, a client navigation (lib/menu closeMenu) closes
 * it, and the A / A+ / A++ row drives the same text-size setting as the
 * desktop Aa widget (persisted as `chapter-a11y`). */

const LANGS = [
  { code: "en", label: "EN", name: "English", active: true, url: "https://x.test/" },
  { code: "es", label: "ES", name: "Español", active: false, url: "https://x.test/es/" },
];

function mountHeader() {
  return mount(SiteHeader, {
    attachTo: document.body,
    props: { languages: LANGS, currentPath: "/calendar/" },
  });
}

function toggle(w: ReturnType<typeof mountHeader>) {
  return w.get('button[aria-label="Menu"]');
}

describe("SiteHeader mobile panel", () => {
  beforeEach(() => {
    closeMenu();
    // The header reads the reactive location store first (it stays mounted
    // across client navigations); happy-dom seeds it with "/", so point it at
    // the page under test the way ts/navigation.ts would.
    setLocation("/calendar/");
    localStorage.clear();
    useA11ySettings().setTextSize("default");
    document.body.innerHTML = "";
  });

  it("renders the wordmark lockup by default and an <img> when a logo is uploaded", () => {
    const w = mountHeader();
    expect(w.find("img").exists()).toBe(false);
    expect(w.text()).toContain("Progress Now");
    w.unmount();

    const uploaded = mount(SiteHeader, {
      props: { logoUrl: "/logo.png", logoIsDefault: false, orgName: "Chapter" },
    });
    const img = uploaded.get("img");
    expect(img.attributes("src")).toBe("/logo.png");
    expect(img.attributes("alt")).toBe("Chapter");
    uploaded.unmount();
  });

  it("opens and closes in flow with aria-expanded/aria-controls", async () => {
    const w = mountHeader();
    const btn = toggle(w);
    const panelId = btn.attributes("aria-controls")!;
    expect(panelId).toBeTruthy();
    expect(btn.attributes("aria-expanded")).toBe("false");
    const panel = w.get(`#${panelId}`);
    expect(panel.isVisible()).toBe(false);

    await btn.trigger("click");
    expect(btn.attributes("aria-expanded")).toBe("true");
    expect(panel.isVisible()).toBe(true);
    // Flat nav + Join Now pill + EN/ES + text size live inside the panel; no drawer/overlay.
    expect(panel.findAll("nav a").map((a) => a.text())).toEqual([
      "About",
      "Calendar",
      "Blog",
      "Get Involved",
      "Join Now",
    ]);
    expect(panel.find('[role="group"][aria-label="Language"]').exists()).toBe(true);
    expect(panel.findAll('[aria-label="Text size"] button').map((b) => b.text())).toEqual([
      "A",
      "A+",
      "A++",
    ]);
    expect(document.querySelector("[data-vaul-drawer]")).toBeNull();
    // Current page is marked.
    expect(panel.get('a[aria-current="page"]').text()).toBe("Calendar");

    await btn.trigger("click");
    expect(btn.attributes("aria-expanded")).toBe("false");
    expect(panel.isVisible()).toBe(false);
    w.unmount();
  });

  it("Escape closes the panel and returns focus to the toggle", async () => {
    const w = mountHeader();
    const btn = toggle(w);
    await btn.trigger("click");
    const firstLink = w.get('#site-menu-panel nav a');
    (firstLink.element as HTMLElement).focus();
    expect(document.activeElement).toBe(firstLink.element);

    await firstLink.trigger("keydown", { key: "Escape" });
    await nextTick();
    expect(btn.attributes("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(btn.element);
    w.unmount();
  });

  it("closes when a client navigation closes the shared menu store", async () => {
    const w = mountHeader();
    await toggle(w).trigger("click");
    expect(menu.open).toBe(true);
    closeMenu(); // ts/navigation.ts does this before every commit
    await nextTick();
    expect(toggle(w).attributes("aria-expanded")).toBe("false");
    w.unmount();
  });

  it("A+ sets the root font size to 18px, persists it and stays in sync with the store", async () => {
    const w = mountHeader();
    await toggle(w).trigger("click");
    const buttons = w.findAll('[aria-label="Text size"] button');
    expect(buttons[0]!.attributes("aria-pressed")).toBe("true");

    await buttons[1]!.trigger("click");
    await nextTick();
    expect(buttons[1]!.attributes("aria-pressed")).toBe("true");
    expect(buttons[0]!.attributes("aria-pressed")).toBe("false");
    expect(document.documentElement.style.fontSize).toBe("18px");
    expect(JSON.parse(localStorage.getItem("chapter-a11y")!).textSize).toBe("large");
    // The desktop Aa widget reads the same singleton.
    expect(useA11ySettings().settings.textSize).toBe("large");
    w.unmount();
  });
});
