#!/usr/bin/env node
/* Kitchen-sink a11y burn-down (openspec next-js-site-implementation task
 * 4.10; next-accessibility § axe-core gate). The vendored shadcn registry
 * examples in components/styleguide/examples/*-example.tsx ship without
 * accessible names on icon-only buttons and on Radix controls whose role takes
 * its name from the author only (combobox, radio, checkbox, switch — a
 * <label for> does not name a <button>). This codemod adds them, idempotently,
 * and records what it did in a header comment so an upstream re-sync is:
 *
 *   npx shadcn add @shadcn/<name>-example && git mv … components/styleguide/examples/
 *   node scripts/a11y-patch-examples.mjs && node scripts/generate-kitchen-sink.mjs
 *
 * Rules (each skipped when the element already has aria-label/aria-labelledby):
 *   1. <Button|InputGroupButton|Toggle|ToggleGroupItem|TabsTrigger|PaginationLink>
 *      whose only children are *Icon elements → aria-label from the icon name.
 *   2. <SelectTrigger> → aria-label from its <SelectValue placeholder>.
 *   3. <RadioGroupItem|Checkbox|Switch id> → aria-label from the <Label|FieldLabel
 *      htmlFor={id}> text in the same file (else the humanized value/id).
 *   4. <NativeSelect> → aria-label from its first <NativeSelectOption> text.
 *   5. <Input|InputGroupInput|ComboboxInput|ComboboxChipsInput|Textarea> with no
 *      <Label htmlFor>, no placeholder → aria-label from the humanized id, else
 *      "Search" for combobox inputs and "Text input" otherwise.
 *   6. <Tabs> with triggers but no <TabsContent> → an empty panel per trigger
 *      value, so the active trigger's aria-controls resolves (aria-valid-attr-value).
 *
 * Contrast and structure fixes that are not name-related stay hand-patched in
 * the example (documented in its header by hand). */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import ts from "typescript";

const DIR = new URL("../components/styleguide/examples/", import.meta.url);
const HEADER_START = "/* a11y-patched (scripts/a11y-patch-examples.mjs):";

const ICON_BUTTONS = new Set([
  "Button",
  "InputGroupButton",
  "Toggle",
  "ToggleGroupItem",
  "TabsTrigger",
  "PaginationLink",
  "SidebarMenuButton",
  "SidebarMenuAction",
]);
const LABELLED_CONTROLS = new Set(["RadioGroupItem", "Checkbox", "Switch"]);
const TEXT_INPUTS = new Set([
  "Input",
  "InputGroupInput",
  "ComboboxInput",
  "ComboboxChipsInput",
  "Textarea",
]);

/** Icon component → what the button does; anything else is humanized. */
const ICON_LABELS = {
  X: "Close",
  Plus: "Add",
  Minus: "Remove",
  Trash: "Delete",
  Trash2: "Delete",
  ChevronLeft: "Previous",
  ChevronRight: "Next",
  ChevronDown: "Expand",
  ChevronUp: "Collapse",
  ChevronsUpDown: "Toggle",
  ArrowLeft: "Back",
  ArrowRight: "Forward",
  ArrowUp: "Up",
  ArrowDown: "Down",
  MoreHorizontal: "More options",
  MoreVertical: "More options",
  Ellipsis: "More options",
  EllipsisVertical: "More options",
  Search: "Search",
  Copy: "Copy",
  Check: "Confirm",
  Send: "Send",
  Mic: "Voice input",
  Settings: "Settings",
  Settings2: "Settings",
  Star: "Favorite",
  Heart: "Like",
  Bell: "Notifications",
  Mail: "Email",
  Calendar: "Calendar",
  Info: "Information",
  Eye: "Show",
  EyeOff: "Hide",
  Pencil: "Edit",
  Edit: "Edit",
  Download: "Download",
  Upload: "Upload",
  Share: "Share",
  RefreshCw: "Refresh",
  Play: "Play",
  Pause: "Pause",
  Volume2: "Volume",
  Bookmark: "Bookmark",
  Filter: "Filter",
  Menu: "Menu",
  PanelLeft: "Toggle sidebar",
  Loader2: "Loading",
  Loader: "Loading",
  Sparkles: "Generate",
  Bot: "Assistant",
  Paperclip: "Attach file",
  Image: "Image",
  Link: "Link",
  Bold: "Bold",
  Italic: "Italic",
  Underline: "Underline",
  AlignLeft: "Align left",
  AlignCenter: "Align center",
  AlignRight: "Align right",
  AlignJustify: "Justify",
  Sun: "Light mode",
  Moon: "Dark mode",
  Home: "Home",
  User: "Account",
  LogOut: "Log out",
  Grid: "Grid view",
  List: "List view",
  Github: "GitHub",
  Terminal: "Terminal",
  Code: "Code",
  MessageSquare: "Comment",
  ThumbsUp: "Upvote",
  ThumbsDown: "Downvote",
  ZoomIn: "Zoom in",
  ZoomOut: "Zoom out",
  Maximize: "Maximize",
  Minimize: "Minimize",
  Save: "Save",
  Printer: "Print",
  Circle: "Select",
  Square: "Stop",
  SkipBack: "Previous track",
  SkipForward: "Next track",
  Rewind: "Rewind",
  FastForward: "Fast forward",
};

const humanize = (s) =>
  s
    .replace(/Icon$/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/\B[A-Z](?=[a-z])/g, (c) => c.toLowerCase());

function iconLabel(tag) {
  const base = tag.replace(/Icon$/, "");
  return ICON_LABELS[base] ?? humanize(base);
}

function tagName(node) {
  const el = ts.isJsxElement(node) ? node.openingElement : node;
  return el.tagName.getText();
}

function attrs(el) {
  const out = {};
  for (const a of el.attributes.properties) {
    if (!ts.isJsxAttribute(a)) continue;
    const name = a.name.getText();
    let value = null;
    if (a.initializer) {
      if (ts.isStringLiteral(a.initializer)) value = a.initializer.text;
      else if (ts.isJsxExpression(a.initializer) && a.initializer.expression) {
        const e = a.initializer.expression;
        value = ts.isStringLiteralLike(e) ? e.text : `{${e.getText()}}`;
      }
    } else value = true;
    out[name] = value;
  }
  return out;
}

const hasName = (a) => "aria-label" in a || "aria-labelledby" in a;

/** Meaningful JSX children: elements and non-blank text/expressions. */
function realChildren(node) {
  if (!ts.isJsxElement(node)) return [];
  return node.children.filter(
    (c) => !(ts.isJsxText(c) && c.text.trim() === "") && !(ts.isJsxExpression(c) && !c.expression),
  );
}

function textOf(node) {
  const parts = [];
  (function walk(n) {
    if (ts.isJsxText(n)) {
      const t = n.text.replace(/\s+/g, " ").trim();
      if (t) parts.push(t);
    } else if (ts.isJsxExpression(n) && n.expression && ts.isStringLiteralLike(n.expression)) {
      parts.push(n.expression.text);
    } else ts.forEachChild(n, walk);
  })(node);
  return parts.join(" ").trim();
}

function patchFile(file) {
  const src = readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  // Labels by htmlFor, so controls can borrow their text (rule 3, 5).
  const labelsFor = new Map();
  (function collect(n) {
    if (ts.isJsxElement(n)) {
      const tag = tagName(n);
      if (tag === "Label" || tag === "FieldLabel") {
        const a = attrs(n.openingElement);
        if (typeof a.htmlFor === "string") labelsFor.set(a.htmlFor, textOf(n));
      }
    }
    ts.forEachChild(n, collect);
  })(sf);

  const edits = [];
  const counts = {};
  const add = (el, label, rule) => {
    edits.push({ pos: el.tagName.end, text: ` aria-label=${JSON.stringify(label)}` });
    counts[rule] = (counts[rule] ?? 0) + 1;
  };

  (function visit(n) {
    if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n)) {
      const el = ts.isJsxElement(n) ? n.openingElement : n;
      const tag = tagName(n);
      const a = attrs(el);
      if (!hasName(a)) {
        if (ICON_BUTTONS.has(tag) && !a.asChild && ts.isJsxElement(n)) {
          const kids = realChildren(n);
          const icons = kids.filter(
            (c) =>
              (ts.isJsxSelfClosingElement(c) || ts.isJsxElement(c)) && /Icon$/.test(tagName(c)),
          );
          const srOnly = kids.some(
            (c) => ts.isJsxElement(c) && /sr-only/.test(attrs(c.openingElement).className ?? ""),
          );
          if (kids.length > 0 && icons.length === kids.length && !srOnly)
            add(el, iconLabel(tagName(icons[0])), "icon-only buttons");
        } else if (tag === "SelectTrigger" && ts.isJsxElement(n)) {
          let placeholder = null;
          (function find(m) {
            if (placeholder) return;
            if (
              (ts.isJsxSelfClosingElement(m) || ts.isJsxElement(m)) &&
              tagName(m) === "SelectValue"
            ) {
              const p = attrs(ts.isJsxElement(m) ? m.openingElement : m).placeholder;
              if (typeof p === "string") placeholder = p;
            }
            ts.forEachChild(m, find);
          })(n);
          add(el, placeholder ?? "Select", "select triggers");
        } else if (LABELLED_CONTROLS.has(tag)) {
          const id = typeof a.id === "string" ? a.id : null;
          const fromLabel = id ? labelsFor.get(id) : null;
          const fallback = typeof a.value === "string" ? a.value : (id ?? tag);
          add(el, fromLabel || humanize(fallback), "labelled controls");
        } else if (tag === "NativeSelect" && ts.isJsxElement(n)) {
          const id = typeof a.id === "string" ? a.id : null;
          if (!(id && labelsFor.has(id))) {
            let first = null;
            (function find(m) {
              if (first) return;
              if (ts.isJsxElement(m) && tagName(m) === "NativeSelectOption") first = textOf(m);
              ts.forEachChild(m, find);
            })(n);
            add(el, first || "Select", "native selects");
          }
        } else if (TEXT_INPUTS.has(tag)) {
          const id = typeof a.id === "string" ? a.id : null;
          const labelled = id && labelsFor.has(id);
          if (!labelled && typeof a.placeholder !== "string")
            add(
              el,
              id ? humanize(id) : /^Combobox/.test(tag) ? "Search" : "Text input",
              "text inputs",
            );
        } else if (tag === "Tabs" && ts.isJsxElement(n)) {
          const values = [];
          let hasContent = false;
          (function find(m) {
            if ((ts.isJsxSelfClosingElement(m) || ts.isJsxElement(m)) && m !== n) {
              const t = tagName(m);
              if (t === "TabsContent") hasContent = true;
              if (t === "TabsTrigger") {
                const v = attrs(ts.isJsxElement(m) ? m.openingElement : m).value;
                if (typeof v === "string") values.push(v);
              }
            }
            ts.forEachChild(m, find);
          })(n);
          if (!hasContent && values.length) {
            const panels = values.map((v) => `<TabsContent value=${JSON.stringify(v)} />`).join("");
            edits.push({ pos: n.closingElement.pos, text: panels });
            counts["empty tab panels"] = (counts["empty tab panels"] ?? 0) + values.length;
          }
        }
      }
    }
    ts.forEachChild(n, visit);
  })(sf);

  if (edits.length === 0) return null;
  let out = src;
  for (const e of edits.sort((x, y) => y.pos - x.pos))
    out = out.slice(0, e.pos) + e.text + out.slice(e.pos);
  // Rule 6 may introduce <TabsContent> into a file that only imported the triggers.
  if (counts["empty tab panels"])
    out = out.replace(/import \{([^}]*)\} from "@\/components\/ui\/tabs";/, (m, names) =>
      /\bTabsContent\b/.test(names)
        ? m
        : `import {${names.trimEnd()}, TabsContent } from "@/components/ui/tabs";`,
    );

  // Header: merge counts with a previous run's.
  const prev = {};
  if (out.startsWith(HEADER_START)) {
    const end = out.indexOf("*/") + 2;
    for (const m of out.slice(0, end).matchAll(/(\d+) ([a-z -]+?)(?:,|\.|\n)/g))
      prev[m[2].trim()] = Number(m[1]);
    out = out.slice(end).replace(/^\n+/, "");
  }
  for (const [k, v] of Object.entries(counts)) prev[k] = (prev[k] ?? 0) + v;
  const summary = Object.entries(prev)
    .map(([k, v]) => `${v} ${k}`)
    .join(", ");
  const header =
    `${HEADER_START} aria-label added to ${summary}.\n` +
    ` * Upstream shadcn registry example otherwise unchanged; re-run the script after a re-sync. */\n`;
  writeFileSync(file, header + out);
  return counts;
}

const files = readdirSync(DIR).filter((f) => f.endsWith("-example.tsx"));
let total = 0;
for (const f of files) {
  const counts = patchFile(new URL(f, DIR).pathname);
  if (!counts) continue;
  const n = Object.values(counts).reduce((s, v) => s + v, 0);
  total += n;
  console.log(
    `${f}: ${Object.entries(counts)
      .map(([k, v]) => `${v} ${k}`)
      .join(", ")}`,
  );
}
console.log(`a11y-patch-examples: ${total} attribute${total === 1 ? "" : "s"} added`);
