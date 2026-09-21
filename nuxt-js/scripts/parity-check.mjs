/* Functional-parity checklist (openspec nuxt4-static-platform 5.8, spec
 * nuxt-static-site § Functional parity with the current front end).
 *
 * Drives a local WordPress in EN + ES through the visitor-facing behaviors the
 * spec lists and prints PASS/FAIL per check. Run it once per frontend mode and
 * diff the two JSON outputs — every check must agree:
 *
 *   node scripts/parity-check.mjs islands parity-islands.json   # CHAPTER_FRONTEND unset
 *   node scripts/parity-check.mjs nuxt    parity-nuxt.json      # CHAPTER_FRONTEND=nuxt + CHAPTER_STATIC_DIR
 *
 * Playwright is borrowed from ../next-js (its e2e dependency). For a
 * self-signed MAMP certificate trust MAMP's CA through NODE_EXTRA_CA_CERTS
 * (README § Local TLS) — the browser side already sets ignoreHTTPSErrors;
 * never NODE_TLS_REJECT_UNAUTHORIZED=0. PARITY_ORIGIN overrides the
 * WordPress origin. Manual tool — not wired into CI (it needs a live
 * WordPress with seeded content). */

import { createRequire } from "node:module";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
const require = createRequire(
  fileURLToPath(new URL("../../next-js/package.json", import.meta.url)),
);
const { chromium } = require("playwright");
const O = process.env.PARITY_ORIGIN || "https://progressnow.test:8890";
const MODE = process.argv[2] || "unknown";
const OUT = process.argv[3];
const rs = await (await fetch(O + "/wp-json/progressnow/v1/routes")).json();
const routes = rs.routes ?? rs;
const pick = (lang, kind) => routes.find((r) => r.lang === lang && r.kind === kind)?.path;
const P = {};
for (const lang of ["en", "es"])
  P[lang] = {
    front: pick(lang, "front"),
    about: pick(lang, "about"),
    gi: pick(lang, "get_involved"),
    cal: pick(lang, "calendar"),
    blog: pick(lang, "posts_index"),
    post: pick(lang, "post"),
    event: pick(lang, "event"),
    page: pick(lang, "page"),
  };

const browser = await chromium.launch({ headless: true });
const results = [];
const rec = (lang, id, ok, note = "") => {
  results.push({ mode: MODE, lang, id, ok: !!ok, note: String(note).slice(0, 160) });
};
async function ctxNew(opts = {}) {
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 900 },
    ...opts,
  });
  await ctx.addInitScript(() => {
    window.__vt = 0;
    const o = document.startViewTransition?.bind(document);
    if (o)
      document.startViewTransition = (...a) => {
        window.__vt++;
        return o(...a);
      };
    window.__doc = Math.random();
  });
  return ctx;
}
async function check(lang, id, fn) {
  try {
    const r = await fn();
    rec(
      lang,
      id,
      r === undefined ? true : typeof r === "object" && r !== null ? r.ok : r,
      typeof r === "object" && r !== null ? r.note : "",
    );
  } catch (e) {
    rec(lang, id, false, "ERR " + String(e.message || e).split("\n")[0]);
  }
}
const settle = async (page) => {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(150);
};

for (const lang of ["en", "es"]) {
  const p = P[lang];
  const ctx = await ctxNew();
  const page = await ctx.newPage();
  const reqs = [];
  page.on("request", (r) => reqs.push(r.url().replace(O, "")));
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(String(e).slice(0, 120)));

  // --- header: About dropdown (desktop)
  await page.goto(O + p.front);
  await settle(page);
  await check(lang, "header.about_dropdown", async () => {
    const trig = page
      .locator('header nav[aria-label="Main"] button[aria-haspopup="menu"]:visible')
      .first();
    if (!(await trig.count())) return { ok: false, note: "no trigger" };
    await trig.click();
    await page.waitForTimeout(300);
    const exp = await trig.getAttribute("aria-expanded");
    const items = await page.locator('[role="menu"] a, [role="menuitem"]').count();
    await page.keyboard.press("Escape");
    return { ok: exp === "true" && items > 0, note: `aria-expanded=${exp} items=${items}` };
  });
  await check(lang, "front.sections", async () => {
    const n = await page.locator(".home-hero, #about, #events, #blog, .closing-cta").count();
    const tones = await page.locator("[data-tone]").count();
    return { ok: n === 5, note: `sections=${n} tones=${tones}` };
  });
  await check(lang, "footer", async () => {
    const f = page.locator("footer").first();
    const mail = await f.locator('a[href^="mailto:"]').count();
    const cols = await f.locator("nav[aria-label], [aria-label]").count();
    const txt = (await f.innerText()).length;
    return {
      ok: mail > 0 && cols > 0 && txt > 100,
      note: `mailto=${mail} labelled=${cols} chars=${txt}`,
    };
  });
  // --- a11y widget
  await check(lang, "a11y.widget", async () => {
    const ap = await ctx.newPage();
    await ap.goto(O + p.front);
    await settle(ap);
    try {
      const aa = ap.locator('header button[aria-label="Accessibility options"]:visible').first();
      if (!(await aa.count())) return { ok: false, note: "no Aa button" };
      await aa.click();
      const pop = ap.locator('[data-slot="popover-content"][data-state="open"]');
      await pop.waitFor({ timeout: 5000 });
      const toggles = pop.locator("button[aria-pressed]").filter({ hasNotText: /^\s*A\+?\+?\s*$/ });
      const names = await toggles.allInnerTexts();
      if (names.length < 2) return { ok: false, note: `toggles=${JSON.stringify(names)}` };
      await toggles.nth(0).click();
      await ap.waitForTimeout(300);
      const cls = await ap.evaluate(() =>
        document.documentElement.classList.contains("a11y-contrast"),
      );
      const ls = await ap.evaluate(() => localStorage.getItem("chapter-a11y"));
      const tones = await ap.locator("[data-tone]").count();
      await ap.reload();
      await settle(ap);
      const persisted = await ap.evaluate(() =>
        document.documentElement.classList.contains("a11y-contrast"),
      );
      await ap.evaluate(() => localStorage.removeItem("chapter-a11y"));
      return {
        ok: cls && !!ls && /highContrast["']?\s*:\s*true/.test(ls) && persisted && tones > 0,
        note: `toggles=${names.map((n) => n.split("\n")[0]).join("/")} class=${cls} persisted=${persisted} tones=${tones}`,
      };
    } finally {
      await ap.close();
    }
  });
  // --- language switcher on About
  await page.goto(O + p.about);
  await settle(page);
  await check(lang, "header.lang_switcher", async () => {
    const links = page.locator('[aria-label="Language"]:visible a');
    const n = await links.count();
    const cur = await page
      .locator('[aria-label="Language"]:visible a[aria-current]')
      .first()
      .getAttribute("href");
    const other = lang === "en" ? P.es.about : P.en.about;
    const hrefs = [];
    for (let i = 0; i < n; i++) hrefs.push(await links.nth(i).getAttribute("href"));
    const hasOther = hrefs.some((h) => h.endsWith(other));
    const native = await page.locator('[aria-label="Language"]:visible a[data-native-nav]').count();
    return {
      ok: n === 2 && cur && cur.endsWith(p.about) && hasOther && native > 0,
      note: `n=${n} cur=${cur} hrefs=${hrefs.join(",")}`,
    };
  });
  await check(lang, "about.template", async () => {
    const ids = ["#mission,#chapter", "#faq", "#documents", "#contact"];
    const counts = [];
    for (const s of ids) counts.push(await page.locator(s).count());
    const trig = page.locator('[id^="reka-accordion-trigger"]:visible').first();
    let acc = "n/a";
    if (await trig.count()) {
      const b = await trig.getAttribute("aria-expanded");
      await trig.click();
      await page.waitForTimeout(200);
      acc = `${b}->${await trig.getAttribute("aria-expanded")}`;
    }
    return {
      ok: counts.every((c) => c > 0) && /false->true/.test(acc),
      note: `sections=${counts.join(",")} faq=${acc}`,
    };
  });
  // --- get involved
  await page.goto(O + p.gi);
  await settle(page);
  await check(lang, "get_involved.template", async () => {
    const counts = [];
    for (const s of ["#join", "#channels", "#faq", "#contact"])
      counts.push(await page.locator(s).count());
    const docs = await page.locator("#documents").count();
    return {
      ok: counts.every((c) => c > 0),
      note: `join,channels,faq,contact=${counts.join(",")} documents=${docs}`,
    };
  });
  // --- interior page sidebar
  if (p.page) {
    await page.goto(O + p.page);
    await settle(page);
    await check(lang, "interior.sidebar", async () => {
      const n = await page.locator("aside").count();
      const c = await page.locator("#involved, #documents, #contact").count();
      return { ok: n > 0 && c > 0, note: `aside=${n} cards=${c}` };
    });
  }
  // --- blog archive
  await page.goto(O + p.blog);
  await settle(page);
  await check(lang, "blog.search", async () => {
    const before = reqs.length;
    const input = page.locator('input[type="search"]').first();
    await input.fill("lorem");
    await page.waitForTimeout(700);
    await settle(page);
    const url = new URL(page.url());
    const status = await page
      .locator('[role="status"]')
      .first()
      .innerText()
      .catch(() => "");
    const fetched = reqs
      .slice(before)
      .filter((u) => u.includes("/posts") && /search=lorem|s=lorem/.test(u)).length;
    return {
      ok: url.searchParams.get("s") === "lorem" && fetched > 0,
      note: `url=${url.pathname}${url.search} fetched=${fetched} status=${status.slice(0, 60)}`,
    };
  });
  await page.goto(O + p.blog);
  await settle(page);
  await check(lang, "blog.category", async () => {
    const btns = page.locator('[aria-label="Filter by category"] button');
    const n = await btns.count();
    if (n < 2) return { ok: false, note: `buttons=${n}` };
    await btns.nth(1).click();
    await page.waitForTimeout(700);
    await settle(page);
    const pressed = await btns.nth(1).getAttribute("aria-pressed");
    const u = new URL(page.url());
    return {
      ok:
        pressed === "true" && (/\/category\//.test(u.pathname) || !!u.searchParams.get("category")),
      note: `pressed=${pressed} url=${u.pathname}${u.search}`,
    };
  });
  await page.goto(O + p.blog);
  await settle(page);
  await check(lang, "blog.pagination", async () => {
    const p2 = page.locator('nav[aria-label="Pagination"] [aria-label="Page 2"]').first();
    if (!(await p2.count())) return { ok: false, note: "no page 2 (few posts?)" };
    await p2.click();
    await page.waitForTimeout(700);
    await settle(page);
    const cur = await page
      .locator('nav[aria-label="Pagination"] [aria-current="page"]')
      .first()
      .innerText()
      .catch(() => "");
    const u = new URL(page.url());
    return {
      ok:
        (/\/page\/2\/?$/.test(u.pathname) ||
          u.searchParams.get("page") === "2" ||
          u.searchParams.get("paged") === "2") &&
        cur.trim() === "2",
      note: `url=${u.pathname}${u.search} current=${cur.trim()}`,
    };
  });
  // --- single post
  await page.goto(O + p.post);
  await settle(page);
  await check(lang, "post.single", async () => {
    const h1 = await page.locator("main h1, article h1").count();
    const blocks = await page
      .locator("article p, article h2, article figure, article ul, article blockquote")
      .count();
    const share = await page
      .locator('a[href^="mailto:"]:has-text(""), main a[href*="sharer"], main a[href*="intent"]')
      .count();
    const readNext = await page.locator('main a[href*="/2026/"], main a[href*="/2025/"]').count();
    return {
      ok: h1 > 0 && blocks > 0 && share > 0 && readNext > 0,
      note: `h1=${h1} blocks=${blocks} share=${share} readNext=${readNext}`,
    };
  });
  // --- calendar
  await page.goto(O + p.cal);
  await settle(page);
  await check(lang, "calendar.views", async () => {
    const live = page.locator('[aria-live="polite"]').first();
    const m0 = (await live.innerText().catch(() => "")).trim();
    await page.locator('[aria-label="Next month"]').first().click();
    await page.waitForTimeout(400);
    const m1 = (await live.innerText().catch(() => "")).trim();
    const list = page.locator('[aria-label="View"] button').nth(1);
    await list.click();
    await page.waitForTimeout(300);
    const pressed = await list.getAttribute("aria-pressed");
    const cats = await page.locator('[role="group"] button[aria-pressed]').count();
    const ics = await page
      .locator('a[href*=".ics"], a[href*="feed/chapter-events"], a[href^="webcal:"]')
      .count();
    const gcal = await page
      .locator('a[href*="calendar.google"], a[href*="google.com/calendar"]')
      .count();
    return {
      ok: m0 && m1 && m0 !== m1 && pressed === "true" && ics > 0 && gcal > 0,
      note: `month ${m0}->${m1} list=${pressed} catBtns=${cats} ics=${ics} gcal=${gcal}`,
    };
  });
  await page.goto(O + p.cal);
  await settle(page);
  await check(lang, "calendar.event_dialog", async () => {
    const ev = page.locator("main button[title]:not([aria-label]):not([aria-pressed])").first();
    if (!(await ev.count())) return { ok: false, note: "no event button" };
    await ev.click();
    await page.waitForTimeout(400);
    const dlg = await page.locator('[role="dialog"]').count();
    const title = await page
      .locator('[role="dialog"] h2, [role="dialog"] [id*="title"]')
      .first()
      .innerText()
      .catch(() => "");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    const closed = await page.locator('[role="dialog"]').count();
    return {
      ok: dlg > 0 && closed === 0,
      note: `dialog=${dlg} title=${title.slice(0, 40)} closed=${closed === 0}`,
    };
  });
  // --- single event
  await page.goto(O + p.event);
  await settle(page);
  await check(lang, "event.single", async () => {
    const h1 = await page.locator("main h1").count();
    const ics = await page.locator('a[href*=".ics"], a[href*="google"]').count();
    return { ok: h1 > 0 && ics > 0, note: `h1=${h1} links=${ics}` };
  });
  // --- search results
  await page.goto(O + (lang === "en" ? "/" : "/es/") + "?s=lorem");
  await settle(page);
  await check(lang, "search.results", async () => {
    const t = await page.locator("main").innerText();
    const has = /lorem/i.test(t);
    const hrefs = await page
      .locator('main a[href*="/2026/"], main a[href*="/2025/"]')
      .evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    const foreign = hrefs.filter((h) =>
      lang === "es" ? !/\/es\//.test(h) : /\/es\//.test(h),
    ).length;
    const docLang = await page.evaluate(() => document.documentElement.lang);
    const rest = reqs
      .filter((u) => u.includes("/wp-json/") && u.includes("s=lorem"))
      .map((u) => (u.match(/lang=(\w+)/) || [])[1])
      .join(",");
    // ES has one seeded post, so 0 results is the right answer there; what must hold is: no foreign-language cards, document language, and a language-scoped fetch.
    return {
      ok:
        has &&
        foreign === 0 &&
        docLang.startsWith(lang) &&
        (lang === "en" ? hrefs.length > 0 : true) &&
        (rest === "" || rest.split(",").every((l) => l === lang)),
      note: `cards=${hrefs.length} foreign=${foreign} docLang=${docLang} restLang=${rest || "none"}`,
    };
  });
  // --- 404
  const resp = await page.goto(O + (lang === "en" ? "/" : "/es/") + "definitely-missing-xyz/");
  await settle(page);
  await check(lang, "notfound", async () => {
    const hdr = await page.locator("header nav").count();
    const txt = await page.locator("main").innerText();
    const docLang = await page.evaluate(() => document.documentElement.lang);
    const cur = await page
      .locator('[aria-label="Language"]:visible a[aria-current]')
      .first()
      .getAttribute("lang")
      .catch(() => "?");
    return {
      ok:
        resp.status() === 404 &&
        hdr > 0 &&
        txt.length > 20 &&
        docLang.startsWith(lang) &&
        cur === lang,
      note: `status=${resp.status()} header=${hdr} docLang=${docLang} switcherCurrent=${cur}`,
    };
  });
  // --- view transitions + prefetch
  await page.goto(O + p.front);
  await settle(page);
  await check(lang, "nav.prefetch_vt", async () => {
    const before = reqs.length;
    const link = page.locator(`header a[href$="${p.cal}"]`).last();
    await link.hover();
    await page.waitForTimeout(500);
    const pre = reqs.slice(before).filter((u) => u.includes("_payload.json") || u === p.cal);
    const doc = await page.evaluate(() => window.__doc);
    await link.evaluate((el) => el.click());
    await page.waitForFunction((pp) => location.pathname === pp, p.cal, { timeout: 10000 });
    await settle(page);
    const same = (await page.evaluate(() => window.__doc)) === doc;
    const vt = await page.evaluate(() => window.__vt);
    return {
      ok: pre.length > 0 && same && vt > 0,
      note: `prefetch=${pre.join("|").slice(0, 60)} sameDoc=${same} startViewTransition=${vt}`,
    };
  });
  // --- mobile toggle
  const mctx = await ctxNew({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
  });
  const mp = await mctx.newPage();
  await mp.goto(O + p.front);
  await settle(mp);
  await check(lang, "header.mobile_toggle", async () => {
    const btn = mp.locator('button[aria-label="Menu"]').first();
    const b = await btn.getAttribute("aria-expanded");
    const ctl = await btn.getAttribute("aria-controls");
    await btn.click();
    await mp.waitForTimeout(300);
    const a = await btn.getAttribute("aria-expanded");
    const vis = await mp
      .locator(`#${ctl} nav a`)
      .first()
      .isVisible()
      .catch(() => false);
    return {
      ok: b === "false" && a === "true" && vis,
      note: `${b}->${a} controls=${ctl} panelVisible=${vis}`,
    };
  });
  await mctx.close();
  // --- reduced motion
  const rctx = await ctxNew({ reducedMotion: "reduce" });
  const rp = await rctx.newPage();
  await rp.goto(O + p.front);
  await settle(rp);
  await check(lang, "nav.reduced_motion", async () => {
    await rp
      .locator(`header a[href$="${p.cal}"]`)
      .last()
      .evaluate((el) => el.click());
    await rp.waitForFunction((pp) => location.pathname === pp, p.cal, { timeout: 10000 });
    await settle(rp);
    const vt = await rp.evaluate(() => window.__vt);
    return { ok: vt === 0, note: `startViewTransition=${vt}` };
  });
  await rctx.close();
  rec(lang, "page_errors", pageErrors.length === 0, pageErrors.join(" | "));
  await ctx.close();
}
await browser.close();
if (OUT) fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
for (const r of results)
  console.log(`${r.ok ? "PASS" : "FAIL"} ${r.mode} ${r.lang} ${r.id.padEnd(24)} ${r.note}`);
