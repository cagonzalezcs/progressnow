<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import DuotoneImage from "@/components/site/DuotoneImage.vue";
import WordmarkLockup from "@/components/site/WordmarkLockup.vue";
import OverlaySections from "@/components/site/styleguide/OverlaySections.vue";
import DataSections from "@/components/site/styleguide/DataSections.vue";

/* Progress Now v4 kit (openspec progress-now-v4-foundation-chrome). The
 * brand sections document the role-named tokens, faces, pills, chips, cards,
 * tones, the CSS duotone and the radius scale; the shadcn/ui demos below them
 * show the library on the v4 variables. */

const palette = [
  { name: "brand", hex: "#1848D8", role: "Bands, pills, chips, duotone multiply", class: "bg-brand", dark: true },
  { name: "brand-deep", hex: "#0F2E9C", role: "Hover / invert fill, headline offset", class: "bg-brand-deep", dark: true },
  { name: "accent", hex: "#0E62E6", role: "Links, eyebrows, arrow links, filled buttons", class: "bg-accent", dark: true },
  { name: "brand-light", hex: "#A9C7FF", role: "Light band, dashed borders, stars — never text on it", class: "bg-brand-light", dark: false },
  { name: "alt", hex: "#F2F5FB", role: "Alternate band", class: "bg-alt", dark: false },
  { name: "ink", hex: "#1B1B22", role: "Body text, dark bands", class: "bg-ink", dark: true },
  { name: "yellow", hex: "#FFC800", role: "Wordmark diamond, panel border, strip stars", class: "bg-yellow", dark: false },
  { name: "muted", hex: "#4A5568", role: "Muted text on white / alt (7.5:1)", class: "bg-muted", dark: true },
  { name: "muted-on-ink", hex: "#C3CBE2", role: "Muted text on ink (10.6:1)", class: "bg-muted-on-ink", dark: false },
  { name: "text-body", hex: "#3A3F4E", role: "Long-form prose", class: "bg-text-body", dark: true },
  { name: "line", hex: "#D9E1F2", role: "1px hairlines on white / alt", class: "bg-line", dark: false },
  { name: "control", hex: "#C6CFE4", role: "Inputs, inactive chips, popover borders", class: "bg-control", dark: false },
  { name: "control-faint", hex: "#E3E8F4", role: "Inner dividers, striped placeholders", class: "bg-control-faint", dark: false },
  { name: "border-muted", hex: "#9DA9C4", role: "Dashed empty-state / note borders", class: "bg-border-muted", dark: false },
  { name: "cta-card", hex: "#3E4480", role: "CTA panel card fill", class: "bg-cta-card", dark: true },
  { name: "ink-hairline", hex: "#33333E", role: "1px hairline on ink bands", class: "bg-ink-hairline", dark: true },
];

const categoryColors = [
  { name: "chapter — Chapter-Wide", class: "bg-cat-chapter" },
  { name: "poled — Political Education", class: "bg-cat-poled" },
  { name: "mutual — Mutual Aid", class: "bg-cat-mutual" },
  { name: "labor — Labor", class: "bg-cat-labor" },
  { name: "electoral — Electoral", class: "bg-cat-electoral" },
  { name: "social — Social", class: "bg-cat-social" },
];

const radii = [
  { name: "radius-sm (shadcn)", px: "4px", class: "rounded-sm" },
  { name: "radius-md (shadcn)", px: "6px", class: "rounded-md" },
  { name: "radius-lg (shadcn)", px: "8px", class: "rounded-lg" },
  { name: "radius-xl (shadcn)", px: "12px", class: "rounded-xl" },
  { name: "popover", px: "14px", class: "rounded-[14px]" },
  { name: "card", px: "18px", class: "rounded-[18px]" },
  { name: "photo", px: "24px", class: "rounded-[24px]" },
  { name: "pill", px: "999px", class: "rounded-full" },
];

const shadows = [
  { name: "shadow-card", class: "shadow-card" },
  { name: "shadow-card-hover", class: "shadow-card-hover" },
  { name: "shadow-header", class: "shadow-header" },
  { name: "shadow-popover", class: "shadow-popover" },
  { name: "shadow-featured", class: "shadow-featured" },
  { name: "shadow-photo", class: "shadow-photo" },
];

const duotoneSlots = [
  { name: "Hero", opacity: 0.38, src: "/wp-content/themes/progressnow/static/images/brand/hero-photo.jpg" },
  { name: "Who we are / cards", opacity: 0.3, src: "/wp-content/themes/progressnow/static/images/brand/who-photo.jpg" },
  { name: "Figures / post image", opacity: 0.25, src: "/wp-content/themes/progressnow/static/images/brand/about-photo.jpg" },
  { name: "Thumbnails (grayscale only)", opacity: 0, src: "/wp-content/themes/progressnow/static/images/brand/hero-photo.jpg" },
];

const sampleEvents = [
  { event: "Brake Light Clinic", date: "Jul 12", location: "Downtown" },
  { event: "ABCs of Organizing", date: "Jul 19", location: "Central Library" },
  { event: "General Meeting", date: "Jul 26", location: "Union Hall" },
];

const h2Class =
  "mb-6 border-b-2 border-line pb-2 font-display text-2xl font-normal uppercase text-ink";
</script>

<template>
  <div class="styleguide mx-auto max-w-[1100px] px-6 py-16 font-sans text-foreground">
    <header class="mb-12">
      <p class="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">
        Progress Now Design System · v4
      </p>
      <h1 class="font-display text-5xl font-normal uppercase leading-[1.08] text-ink">
        Styleguide
      </h1>
      <p class="mt-4 max-w-[62ch] text-lg leading-relaxed text-text-body">
        Role-named tokens on a white ground: blue bands, Public Sans body, Bowlby One
        display, CSS duotone photos. Every value below is a Tailwind utility off
        <code class="rounded-sm bg-alt px-1.5 py-0.5 text-[0.9em]">src/css/tailwind.css</code>.
      </p>
    </header>

    <!-- Tokens: colors -->
    <section :id="'sg-colors'" class="mb-16">
      <h2 :class="h2Class">Palette</h2>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <div v-for="c in palette" :key="c.name" class="overflow-hidden rounded-[14px] border border-line">
          <div :class="[c.class, 'flex h-16 items-end px-2 pb-1.5 font-mono text-xs', c.dark ? 'text-white' : 'text-ink']">
            {{ c.hex }}
          </div>
          <div class="bg-white px-2 py-1.5">
            <p class="text-xs font-bold">{{ c.name }}</p>
            <p class="text-[0.7rem] leading-snug text-muted">{{ c.role }}</p>
          </div>
        </div>
      </div>
      <h3 class="mb-4 mt-8 font-display text-lg font-normal uppercase">Event categories</h3>
      <div class="flex flex-wrap gap-3">
        <div
          v-for="c in categoryColors"
          :key="c.name"
          class="flex items-center gap-2 rounded-[8px] border border-control bg-white px-3 py-1.5"
        >
          <span :class="[c.class, 'inline-block size-3 rounded-sm']" />
          <span class="text-xs font-bold uppercase">{{ c.name }}</span>
        </div>
      </div>
    </section>

    <!-- Tokens: type scale -->
    <section :id="'sg-type'" class="mb-16">
      <h2 :class="h2Class">Type</h2>
      <div class="space-y-6">
        <div data-tone="blue" class="rounded-[18px] bg-brand px-6 py-8 text-white">
          <p class="hero-headline">A better tomorrow is possible!</p>
          <p class="mt-2 text-center text-xs font-extrabold uppercase tracking-[0.12em] text-white">
            Hero H1 — Bowlby One, 0.09em deep-blue offset
          </p>
        </div>
        <p class="font-display text-[clamp(2rem,3.6vw,3.1rem)] font-normal leading-[1.1] text-ink">
          Section H2 — Bowlby One
        </p>
        <p class="font-display text-[1.5rem] font-normal leading-[1.2] text-ink">
          Card / in-content title — Bowlby One
        </p>
        <p class="text-base font-extrabold uppercase tracking-[0.04em] text-accent">
          Eyebrow — Public Sans 800, tracked
        </p>
        <p class="max-w-[34ch] text-[1.35rem] font-semibold leading-[1.4]">
          Lede — Public Sans 600. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
        <p class="max-w-[60ch] text-lg leading-relaxed text-text-body">
          Body — Public Sans 500. Our community deserves an economy and a government that
          put working people first. <strong class="font-bold text-ink">Emphasis is 700.</strong>
        </p>
        <p class="font-display text-[1.06rem] font-normal">Nav link — Bowlby One 1.06rem</p>
        <p class="font-sans text-[1.7rem] font-extrabold text-accent">01 · 02 · 03 — numerals 800</p>
        <p class="font-brush text-[clamp(1.8rem,5.4vw,4.8rem)] uppercase leading-[1.1] text-brand">
          Progress now, not someday!
        </p>
      </div>
    </section>

    <!-- Wordmark -->
    <section :id="'sg-wordmark'" class="mb-16">
      <h2 :class="h2Class">Wordmark lockup</h2>
      <div class="flex flex-wrap items-center gap-8 rounded-[18px] bg-brand px-6 py-6" data-tone="blue">
        <WordmarkLockup name="Progress Now" size="header" />
        <WordmarkLockup name="Progress Now" size="tablet" />
        <WordmarkLockup name="Progress Now" size="mobile" />
      </div>
      <p class="mt-3 text-sm text-muted">
        Default header/footer logo while none is uploaded (yellow diamond + chapter name);
        an uploaded logo replaces it at the same height, max 240px wide.
      </p>
    </section>

    <!-- Pills -->
    <section :id="'sg-pills'" class="mb-16">
      <h2 :class="h2Class">Pills</h2>
      <div class="flex flex-wrap items-center gap-4 rounded-[18px] bg-brand p-6" data-tone="blue">
        <a href="#sg-pills" class="box-border inline-flex h-[42px] items-center rounded-full bg-white px-[22px] font-display text-[0.95rem] font-normal text-brand no-underline transition-colors hover:bg-brand-deep hover:text-white">Join Now</a>
        <a href="#sg-pills" class="box-border inline-flex h-11 items-center rounded-full bg-white px-4 font-display text-[0.82rem] font-normal text-brand no-underline transition-colors hover:bg-brand-deep hover:text-white">Join</a>
        <a href="#sg-pills" class="inline-flex items-center rounded-full bg-white px-11 py-4 font-display text-[1.15rem] font-normal tracking-[0.04em] text-brand no-underline transition-colors hover:bg-brand-deep hover:text-white">JOIN NOW</a>
        <a href="#sg-pills" class="inline-flex items-center gap-[22px] rounded-[16px] border-2 border-dashed border-brand-light px-7 py-[18px] text-[1.25rem] font-bold leading-[1.35] text-white no-underline hover:bg-[rgba(169,199,255,0.14)]">Dashed CTA link</a>
      </div>
      <div class="mt-4 flex flex-wrap items-center gap-4 rounded-[18px] bg-alt p-6" data-tone="alt">
        <a href="#sg-pills" class="inline-flex items-center rounded-full bg-accent px-7 py-3 font-display text-[0.95rem] font-normal tracking-[0.04em] text-white no-underline transition-colors hover:bg-brand-deep">Accent fill</a>
        <a href="#sg-pills" class="inline-flex items-center rounded-full border-2 border-brand bg-transparent px-7 py-[10px] font-display text-[0.95rem] font-normal text-brand no-underline transition-colors hover:bg-brand hover:text-white">Outline</a>
        <a href="#sg-pills" class="inline-flex items-center gap-4 text-[1.05rem] font-extrabold uppercase tracking-[0.03em] text-accent no-underline hover:underline hover:underline-offset-4">Arrow link
          <svg aria-hidden="true" viewBox="0 0 40 20" class="h-5 w-10 flex-none fill-accent"><path d="M0 8.4 h26 v3.2 h-26 z" /><path d="M24 1.5 L38.5 10 L24 18.5 Z" /></svg>
        </a>
      </div>
      <div class="mt-4 flex flex-wrap items-center gap-4 rounded-[18px] bg-ink p-6" data-tone="ink">
        <a href="#sg-pills" class="inline-flex items-center rounded-full bg-white px-[22px] py-2.5 text-[0.95rem] font-bold text-ink no-underline transition-colors hover:bg-brand-deep hover:text-white">White on ink</a>
        <a href="#sg-pills" class="inline-flex items-center rounded-full border-2 border-muted px-[21px] py-[9px] text-[0.95rem] font-bold text-white no-underline transition-colors hover:border-white">Outline on ink</a>
        <a href="#sg-pills" class="text-[0.95rem] font-bold text-white underline underline-offset-4 hover:text-brand-light">Ink link →</a>
      </div>
    </section>

    <!-- Chips -->
    <section :id="'sg-chips'" class="mb-16">
      <h2 :class="h2Class">Chips</h2>
      <div class="flex flex-wrap items-center gap-3">
        <span class="rounded-[8px] bg-brand px-2.5 py-1 text-[0.72rem] font-bold leading-[1.25] text-white">Category</span>
        <span class="rounded-full bg-brand px-3 py-1 text-[0.75rem] font-bold uppercase tracking-[0.06em] text-white">On</span>
        <span class="rounded-full border border-control px-3 py-1 text-[0.75rem] font-bold uppercase tracking-[0.06em] text-muted">Off</span>
        <span class="inline-flex flex-col items-center rounded-[12px] bg-brand px-3.5 py-2.5 text-white">
          <span class="text-[1.3rem] font-extrabold leading-[1.1]">12</span>
          <span class="text-[0.72rem] font-bold tracking-[0.1em]">SEP</span>
        </span>
        <span class="rounded-full border border-control bg-white px-3.5 py-1.5 text-[0.85rem] font-bold text-ink">Filter chip</span>
        <span class="rounded-full border border-ink bg-ink px-3.5 py-1.5 text-[0.85rem] font-bold text-white">Filter chip · active</span>
      </div>
    </section>

    <!-- Cards -->
    <section :id="'sg-cards'" class="mb-16">
      <h2 :class="h2Class">Cards</h2>
      <div class="grid gap-6 md:grid-cols-3">
        <div class="flex flex-col gap-3 rounded-[18px] bg-white p-6 shadow-card">
          <p class="text-[0.85rem] font-extrabold uppercase tracking-[0.08em] text-accent">Eyebrow</p>
          <p class="font-display text-[1.25rem] leading-[1.25] text-ink">White card</p>
          <p class="text-[0.98rem] leading-[1.6] text-text-body">Radius 18, soft ink shadow. Hover lifts to shadow-card-hover.</p>
        </div>
        <div class="flex flex-col gap-3 rounded-[18px] bg-[#26262F] p-6 text-white" data-tone="ink">
          <p class="font-display text-[1.7rem] text-brand-light">01</p>
          <p class="text-[1.18rem] font-extrabold">Ink card</p>
          <p class="text-base leading-[1.65] text-muted-on-ink">Steps on the ink band; numerals in brand-light.</p>
        </div>
        <div class="flex flex-col gap-3 rounded-[16px] border-2 border-dashed border-border-muted bg-alt p-6" data-tone="alt">
          <p class="text-[1.05rem] font-extrabold text-ink">Dashed note</p>
          <p class="text-[0.98rem] leading-[1.6] text-text-body">Empty states and side notes on the alt band.</p>
        </div>
      </div>
    </section>

    <!-- Tones -->
    <section :id="'sg-tones'" class="mb-16">
      <h2 :class="h2Class">Tone bands</h2>
      <div class="overflow-hidden rounded-[18px] border border-line">
        <div data-tone="blue" class="bg-brand px-6 py-8 text-white">
          <p class="font-display uppercase">data-tone="blue"</p>
          <p class="text-sm text-white">High contrast → #0F2E9C; focus ring white</p>
        </div>
        <div data-tone="white" class="bg-white px-6 py-8 text-ink">
          <p class="font-display uppercase">data-tone="white"</p>
          <p class="text-sm text-muted">High contrast → white / black; focus ring ink</p>
        </div>
        <div data-tone="alt" class="bg-alt px-6 py-8 text-ink">
          <p class="font-display uppercase">data-tone="alt"</p>
          <p class="text-sm text-muted">High contrast → white / black; focus ring ink</p>
        </div>
        <div data-tone="ink" class="bg-ink px-6 py-8 text-white">
          <p class="font-display uppercase">data-tone="ink"</p>
          <p class="text-sm text-muted-on-ink">High contrast → black / white; focus ring white</p>
        </div>
      </div>
      <p class="mt-3 max-w-[70ch] text-sm text-muted">
        The Aa widget (desktop and tablet) toggles text size, high contrast and reduce
        motion. The mobile menu exposes text size only — visitors zoom or use OS-level
        contrast / motion settings, which the site honors (<code>prefers-reduced-motion</code>).
      </p>
    </section>

    <!-- Duotone -->
    <section :id="'sg-duotone'" class="mb-16">
      <h2 :class="h2Class">Photo treatment</h2>
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <figure v-for="slot in duotoneSlots" :key="slot.name" class="m-0">
          <DuotoneImage
            :src="slot.src"
            alt=""
            :opacity="slot.opacity"
            class="rounded-[14px]"
            img-class="block aspect-[4/3] w-full object-cover"
          />
          <figcaption class="mt-2 text-xs font-bold">
            {{ slot.name }} <span class="font-mono font-normal text-muted">· {{ slot.opacity }}</span>
          </figcaption>
        </figure>
      </div>
      <p class="mt-3 max-w-[70ch] text-sm text-muted">
        <code>DuotoneImage.vue</code> / <code>partials/duotone.twig</code>: full-color photo
        slot that clips to the card radius (the duotone treatment was retired 2026-09-05).
      </p>
    </section>

    <!-- Radius + shadows -->
    <section :id="'sg-radius'" class="mb-16">
      <h2 :class="h2Class">Radius scale</h2>
      <div class="flex flex-wrap gap-4">
        <div v-for="r in radii" :key="r.name" :class="[r.class, 'flex h-16 min-w-32 flex-col items-center justify-center border-2 border-brand bg-alt px-4 text-center']">
          <span class="text-xs font-bold">{{ r.name }}</span>
          <span class="font-mono text-xs text-muted">{{ r.px }}</span>
        </div>
      </div>
      <h3 class="mb-4 mt-8 font-display text-lg font-normal uppercase">Shadows</h3>
      <div class="flex flex-wrap gap-8">
        <div v-for="s in shadows" :key="s.name" :class="[s.class, 'rounded-[14px] bg-white px-6 py-4 text-sm font-bold']">
          {{ s.name }}
        </div>
      </div>
    </section>

    <!-- shadcn/ui on the v4 variables -->
    <section :id="'sg-button'" class="mb-16">
      <h2 :class="h2Class">Button</h2>
      <div class="flex flex-wrap items-center gap-6">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
      <div class="mt-6 flex flex-wrap items-center gap-6">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button disabled>Disabled</Button>
      </div>
    </section>

    <section :id="'sg-badge'" class="mb-16">
      <h2 :class="h2Class">Badge</h2>
      <div class="flex flex-wrap items-center gap-4">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>
    </section>

    <section :id="'sg-card'" class="mb-16">
      <h2 :class="h2Class">Card (shadcn)</h2>
      <div class="grid gap-10 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle class="font-display font-normal uppercase">Plain card</CardTitle>
            <CardDescription>White fill, control border, radius from --radius.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Default card body content.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline">Action</Button>
          </CardFooter>
        </Card>
        <Card class="shadow-featured">
          <CardHeader>
            <CardTitle class="font-display font-normal uppercase">Featured card</CardTitle>
            <CardDescription>shadow-featured for callouts.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Used for grievance callout, photo frames, and featured content.</p>
          </CardContent>
        </Card>
      </div>
    </section>

    <section :id="'sg-form'" class="mb-16">
      <h2 :class="h2Class">Label + Input</h2>
      <div class="max-w-sm space-y-3">
        <Label for="sg-email" class="font-bold">Email</Label>
        <Input id="sg-email" type="email" placeholder="you@example.org" />
      </div>
    </section>

    <section :id="'sg-separator'" class="mb-16">
      <h2 :class="h2Class">Separator</h2>
      <p class="text-sm">Above</p>
      <Separator class="my-4" />
      <p class="text-sm">Below</p>
    </section>

    <section :id="'sg-alert'" class="mb-16">
      <h2 :class="h2Class">Alert</h2>
      <div class="max-w-xl space-y-6">
        <Alert>
          <AlertTitle>General meeting moved</AlertTitle>
          <AlertDescription>
            July's general meeting is now at the Downtown public library, room B.
          </AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertTitle>Action cancelled</AlertTitle>
          <AlertDescription>
            Saturday's brake light clinic is cancelled due to weather.
          </AlertDescription>
        </Alert>
      </div>
    </section>

    <section :id="'sg-aspect-ratio'" class="mb-16">
      <h2 :class="h2Class">Aspect ratio</h2>
      <div class="max-w-md">
        <AspectRatio
          :ratio="16 / 9"
          class="flex items-center justify-center rounded-[14px] border border-line bg-[repeating-linear-gradient(45deg,var(--color-alt),var(--color-alt)_12px,var(--color-control-faint)_12px,var(--color-control-faint)_24px)]"
        >
          <span class="font-display text-sm uppercase">16 : 9</span>
        </AspectRatio>
      </div>
    </section>

    <section :id="'sg-avatar'" class="mb-16">
      <h2 :class="h2Class">Avatar</h2>
      <div class="flex items-center gap-6">
        <Avatar class="size-12">
          <AvatarImage src="https://github.com/shadcn.png" alt="Member avatar" />
          <AvatarFallback>RG</AvatarFallback>
        </Avatar>
        <Avatar class="size-12">
          <AvatarFallback>VD</AvatarFallback>
        </Avatar>
      </div>
    </section>

    <section :id="'sg-breadcrumb'" class="mb-16">
      <h2 :class="h2Class">Breadcrumb</h2>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Events</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Brake Light Clinic</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </section>

    <section :id="'sg-checkbox'" class="mb-16">
      <h2 :class="h2Class">Checkbox</h2>
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <Checkbox id="sg-check-1" />
          <Label for="sg-check-1">Get chapter emails</Label>
        </div>
        <div class="flex items-center gap-3">
          <Checkbox id="sg-check-2" :default-value="true" />
          <Label for="sg-check-2">Agreed to code of conduct</Label>
        </div>
        <div class="flex items-center gap-3">
          <Checkbox id="sg-check-3" disabled />
          <Label for="sg-check-3" class="opacity-50">Dues autopay (coming soon)</Label>
        </div>
      </div>
    </section>

    <section :id="'sg-kbd'" class="mb-16">
      <h2 :class="h2Class">Kbd</h2>
      <div class="flex items-center gap-8">
        <Kbd>Esc</Kbd>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </div>
    </section>

    <section :id="'sg-pagination'" class="mb-16">
      <h2 :class="h2Class">Pagination</h2>
      <Pagination v-slot="{ page }" :items-per-page="10" :total="50" :default-page="2">
        <PaginationContent v-slot="{ items }">
          <PaginationPrevious />
          <template v-for="(item, index) in items" :key="index">
            <PaginationItem
              v-if="item.type === 'page'"
              :value="item.value"
              :is-active="item.value === page"
            >
              {{ item.value }}
            </PaginationItem>
            <PaginationEllipsis v-else :index="index" />
          </template>
          <PaginationNext />
        </PaginationContent>
      </Pagination>
    </section>

    <section :id="'sg-progress'" class="mb-16">
      <h2 :class="h2Class">Progress</h2>
      <div class="max-w-md space-y-2">
        <p class="text-xs font-extrabold uppercase tracking-[0.12em]">Dues drive — 40%</p>
        <Progress :model-value="40" />
      </div>
    </section>

    <section :id="'sg-radio-group'" class="mb-16">
      <h2 :class="h2Class">Radio group</h2>
      <RadioGroup default-value="downtown">
        <div class="flex items-center gap-3">
          <RadioGroupItem id="sg-radio-1" value="downtown" />
          <Label for="sg-radio-1">Downtown</Label>
        </div>
        <div class="flex items-center gap-3">
          <RadioGroupItem id="sg-radio-2" value="northside" />
          <Label for="sg-radio-2">Northside</Label>
        </div>
        <div class="flex items-center gap-3">
          <RadioGroupItem id="sg-radio-3" value="southside" />
          <Label for="sg-radio-3">Southside</Label>
        </div>
      </RadioGroup>
    </section>

    <section :id="'sg-skeleton'" class="mb-16">
      <h2 :class="h2Class">Skeleton</h2>
      <div class="flex max-w-sm items-start gap-4">
        <Skeleton class="size-12 shrink-0" />
        <div class="w-full space-y-3">
          <Skeleton class="h-4 w-3/4" />
          <Skeleton class="h-24 w-full" />
        </div>
      </div>
    </section>

    <section :id="'sg-slider'" class="mb-16">
      <h2 :class="h2Class">Slider</h2>
      <div class="max-w-md">
        <Slider :default-value="[40]" :max="100" :step="5" aria-label="Pledge amount" />
      </div>
    </section>

    <section :id="'sg-switch'" class="mb-16">
      <h2 :class="h2Class">Switch</h2>
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <Switch id="sg-switch-1" />
          <Label for="sg-switch-1">Event reminders</Label>
        </div>
        <div class="flex items-center gap-3">
          <Switch id="sg-switch-2" :default-value="true" />
          <Label for="sg-switch-2">Newsletter</Label>
        </div>
      </div>
    </section>

    <section :id="'sg-table'" class="mb-16">
      <h2 :class="h2Class">Table</h2>
      <Table class="rounded-[14px] border border-line bg-white">
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Location</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="row in sampleEvents" :key="row.event">
            <TableCell class="font-medium">{{ row.event }}</TableCell>
            <TableCell>{{ row.date }}</TableCell>
            <TableCell>{{ row.location }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </section>

    <section :id="'sg-textarea'" class="mb-16">
      <h2 :class="h2Class">Textarea</h2>
      <div class="max-w-sm space-y-3">
        <Label for="sg-message" class="font-bold">Message</Label>
        <Textarea id="sg-message" placeholder="Tell us about your workplace…" />
      </div>
    </section>

    <section :id="'sg-toggle'" class="mb-16">
      <h2 :class="h2Class">Toggle</h2>
      <div class="flex items-center gap-6">
        <Toggle aria-label="Toggle off example">Off</Toggle>
        <Toggle :default-value="true" aria-label="Toggle pressed example">Pressed</Toggle>
      </div>
    </section>

    <section :id="'sg-toggle-group'" class="mb-16">
      <h2 :class="h2Class">Toggle group</h2>
      <ToggleGroup type="single" default-value="month" variant="outline">
        <ToggleGroupItem value="month">Month</ToggleGroupItem>
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
        <ToggleGroupItem value="list">List</ToggleGroupItem>
      </ToggleGroup>
    </section>

    <!-- Batch B: overlays & nav -->
    <OverlaySections />

    <!-- Batch C: data & complex -->
    <DataSections />
  </div>
</template>
