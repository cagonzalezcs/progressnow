import { u as useHead$1, S as StarGlyph_default } from '../virtual/entry.mjs';
import { u as useResolvedRoute, a as useFreshness, b as useChapterSite, f as frontRoute, p as payloadSlug, c as useChapterApi, d as useChapterData, e as fetchSingleEvent, g as eventKey, h as provideRouteLanguages, i as useRouteSeo, j as fetchSinglePost, k as postKey, l as postsIndexRoute, m as fetchPage, n as pageKey, o as fetchPosts, q as postsKey, C as ClientOnly, r as fetchFrontPage, s as frontKey, t as useChapterRoutes, v as setCategories, w as categoryById, x as parseISODate, M as MONTH_SHORTS, y as MONTH_NAMES, z as cn, W as WEEKDAYS, E as EVENT_CATEGORIES } from './events-DJ7jaIrK.mjs';
import { defineComponent, defineAsyncComponent, computed, createVNode, resolveDynamicComponent, mergeProps, unref, withAsyncContext, withCtx, openBlock, createBlock, createCommentVNode, Fragment, renderList, createTextVNode, toDisplayString, toRef, ref, reactive, renderSlot, useSSRContext, watchSyncEffect } from 'vue';
import { ssrRenderVNode, ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderClass, ssrRenderList, ssrRenderStyle, ssrRenderSlot } from 'vue/server-renderer';
import { useForwardPropsEmits, AccordionRoot, useForwardProps, AccordionItem, AccordionHeader, AccordionTrigger, AccordionContent } from 'reka-ui';
import { ChevronDown } from '@lucide/vue';
import { reactiveOmit } from '@vueuse/core';
import 'nostics';
import 'nostics/formatters/ansi';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'unhead/server';
import 'unhead/legacy';
import 'unhead/plugins';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import 'vue-router';
import 'unhead/utils';
import 'clsx';
import 'tailwind-merge';
import 'zod';

//#region app/components/routes/ArrowGlyph.vue?vue&type=script&setup=true&lang.ts
var ArrowGlyph_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "ArrowGlyph",
	__ssrInlineRender: true,
	props: { class: { default: "h-5 w-10 flex-none fill-accent" } },
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<svg${ssrRenderAttrs(mergeProps({
				"aria-hidden": "true",
				focusable: "false",
				viewBox: "0 0 40 20",
				class: _ctx.$props.class
			}, _attrs))}><path d="M0 8.4h26v3.2H0z"></path><path d="M24 1.5 38.5 10 24 18.5Z"></path></svg>`);
		};
	}
});
//#endregion
//#region app/components/routes/ArrowGlyph.vue
var _sfc_setup$44 = ArrowGlyph_vue_vue_type_script_setup_true_lang_default.setup;
ArrowGlyph_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/routes/ArrowGlyph.vue");
	return _sfc_setup$44 ? _sfc_setup$44(props, ctx) : void 0;
};
var ArrowGlyph_default = ArrowGlyph_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/DuotoneImage.vue?vue&type=script&setup=true&lang.ts
var DuotoneImage_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "DuotoneImage",
	__ssrInlineRender: true,
	props: {
		src: {},
		alt: { default: "" },
		width: { default: void 0 },
		height: { default: void 0 },
		srcset: { default: void 0 },
		sizes: { default: void 0 },
		loading: { default: void 0 },
		fetchpriority: { default: void 0 },
		opacity: { default: .3 },
		imgClass: { default: "block h-auto w-full" }
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<span${ssrRenderAttrs(mergeProps({
				class: "duotone",
				style: `--duotone-opacity: ${__props.opacity}`
			}, _attrs))}><img${ssrRenderAttr("src", __props.src)}${ssrRenderAttr("alt", __props.alt)}${ssrRenderAttr("width", __props.width)}${ssrRenderAttr("height", __props.height)}${ssrRenderAttr("srcset", __props.srcset)}${ssrRenderAttr("sizes", __props.sizes)}${ssrRenderAttr("loading", __props.loading)}${ssrRenderAttr("fetchpriority", __props.fetchpriority)} class="${ssrRenderClass(__props.imgClass)}"></span>`);
		};
	}
});
//#endregion
//#region app/components/site/DuotoneImage.vue
var _sfc_setup$43 = DuotoneImage_vue_vue_type_script_setup_true_lang_default.setup;
DuotoneImage_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/DuotoneImage.vue");
	return _sfc_setup$43 ? _sfc_setup$43(props, ctx) : void 0;
};
var DuotoneImage_default = DuotoneImage_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/routes/RouteFront.vue?vue&type=script&setup=true&lang.ts
var h2Class = "m-0 font-display text-[1.6rem] font-normal leading-[1.15] md:text-[clamp(2rem,3.6vw,3.1rem)] md:leading-[1.1]";
var arrowLink = "flex items-center gap-3.5 text-[0.95rem] font-extrabold uppercase tracking-[0.03em] text-accent no-underline hover:underline hover:underline-offset-4 md:gap-4 md:text-[1.05rem]";
var arrowSvg = "h-[17px] w-[34px] flex-none fill-accent md:h-5 md:w-10";
var stripe = "bg-[repeating-linear-gradient(45deg,var(--color-alt)_0_14px,var(--color-control-faint)_14px_28px)]";
var card$2 = "overflow-hidden rounded-[18px] bg-white text-ink no-underline shadow-card transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-card-hover-lg md:rounded-[24px]";
var pill = "rounded-full bg-accent font-display font-normal uppercase tracking-[0.04em] text-white no-underline transition-[transform,background-color] hover:-translate-y-px hover:bg-brand-deep";
var RouteFront_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "RouteFront",
	__ssrInlineRender: true,
	props: { resolved: {} },
	async setup(__props) {
		let __temp, __restore;
		const props = __props;
		const lang = computed(() => props.resolved.lang);
		const api = useChapterApi();
		const { data: site } = ([__temp, __restore] = withAsyncContext(() => useChapterSite(lang.value)), __temp = await __temp, __restore(), __temp);
		const { data: front } = ([__temp, __restore] = withAsyncContext(() => useChapterData(frontKey(lang.value), () => fetchFrontPage(api, lang.value))), __temp = await __temp, __restore(), __temp);
		provideRouteLanguages(computed(() => front.value?.languages));
		useRouteSeo(computed(() => front.value?.seo), lang);
		const identity = computed(() => site.value?.identity);
		const chapter = computed(() => site.value?.chapter);
		const s = computed(() => site.value?.strings ?? {});
		const t = (key, fallback) => s.value[key] ?? fallback;
		const calendarUrl = computed(() => front.value?.calendarUrl ?? "/calendar/");
		const events = computed(() => (front.value?.events ?? []).slice(0, front.value?.eventCount ?? 5));
		const eventsEmptyHtml = computed(() => {
			const link = `<a href="${calendarUrl.value}" class="font-bold text-accent underline underline-offset-4 hover:text-brand-deep">${t("home_events_empty_link", "calendar")}</a>`;
			return t("home_events_empty_p", "New meetings and actions land on the %s first — subscribe there and never miss one.").replace("%s", link);
		});
		const hero = toRef(() => front.value?.hero);
		const who = toRef(() => front.value?.who);
		const cta = toRef(() => front.value?.cta);
		const blog = toRef(() => front.value?.blog);
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(front) && identity.value && chapter.value && hero.value && who.value && cta.value && blog.value) {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: "route-front contents" }, _attrs))}><section class="home-hero overflow-hidden bg-brand font-sans text-white" data-tone="blue"><div class="mx-auto flex w-full max-w-[1300px] flex-col min-[700px]:flex-row"><div class="relative h-[240px] min-w-0 min-[700px]:order-1 min-[700px]:h-auto min-[700px]:min-h-[480px] min-[700px]:w-1/2 min-[700px]:flex-none">`);
				_push(ssrRenderComponent(DuotoneImage_default, {
					src: identity.value.hero_photo.src,
					alt: identity.value.hero_photo.alt,
					width: identity.value.hero_photo.width,
					height: identity.value.hero_photo.height,
					opacity: .38,
					fetchpriority: "high",
					class: "absolute inset-0 h-full w-full",
					"img-class": "block h-full w-full object-cover"
				}, null, _parent));
				_push(`</div><div class="relative flex min-w-0 flex-col items-center justify-center px-6 pb-12 pt-14 text-center min-[700px]:w-1/2 min-[700px]:flex-none min-[700px]:justify-end min-[700px]:px-8 min-[700px]:pb-[84px] min-[700px]:pt-[88px] lg:pl-12 lg:pr-16"><div class="relative flex w-full max-w-[540px] flex-col items-center gap-6 min-[700px]:gap-[34px]">`);
				_push(ssrRenderComponent(StarGlyph_default, {
					kind: "sparkle",
					class: "absolute -top-[30px] left-0 w-[26px] -rotate-10 text-brand-light min-[700px]:-left-6 min-[700px]:-top-11 min-[700px]:w-[34px] lg:-left-12"
				}, null, _parent));
				_push(ssrRenderComponent(StarGlyph_default, {
					kind: "star-notch",
					class: "absolute -top-[38px] right-0 w-[38px] rotate-10 text-brand-light min-[700px]:-right-4 min-[700px]:-top-[52px] min-[700px]:w-[52px] lg:-right-10"
				}, null, _parent));
				_push(ssrRenderComponent(StarGlyph_default, {
					kind: "star",
					class: "absolute -bottom-4 -right-6 hidden w-[50px] text-brand-light min-[700px]:block lg:-right-12"
				}, null, _parent));
				_push(`<h1 class="hero-headline">${ssrInterpolate(identity.value.hero_headline)}</h1><p class="m-0 max-w-[32ch] text-[1.1rem] font-semibold leading-[1.45] [text-wrap:balance] min-[700px]:max-w-[34ch] min-[700px]:text-[1.35rem] min-[700px]:leading-[1.4]">${ssrInterpolate(hero.value.subhead)}</p><a${ssrRenderAttr("href", hero.value.cta_primary_url)} target="_blank" rel="noopener" class="rounded-full bg-white px-10 py-[15px] font-display text-base font-normal uppercase tracking-[0.04em] text-brand no-underline transition-[transform,background-color,color] hover:-translate-y-px hover:bg-brand-deep hover:text-white min-[700px]:px-11 min-[700px]:py-4 min-[700px]:text-[1.15rem]">${ssrInterpolate(hero.value.cta_primary_label)}</a><a${ssrRenderAttr("href", hero.value.cta_secondary_url)} class="flex items-center gap-4 rounded-[14px] border-2 border-dashed border-brand-light px-[18px] py-3.5 text-left text-white no-underline transition-colors hover:border-transparent hover:bg-brand-deep min-[700px]:gap-[22px] min-[700px]:rounded-[16px] min-[700px]:px-7 min-[700px]:py-[18px]"><span class="max-w-[22ch] text-base font-bold leading-[1.35] min-[700px]:text-[1.25rem]">${ssrInterpolate(hero.value.cta_secondary_label)}</span>`);
				_push(ssrRenderComponent(ArrowGlyph_default, { class: "h-[17px] w-[34px] flex-none fill-white min-[700px]:h-[22px] min-[700px]:w-11" }, null, _parent));
				_push(`</a></div></div></div></section><section id="about" class="who-we-are bg-white px-6 pb-12 pt-14 font-sans text-ink md:pb-[76px] md:pt-[84px]" data-tone="white"><div class="mx-auto flex max-w-[1240px] flex-col gap-5 md:grid md:items-center md:gap-14 md:[grid-template-columns:minmax(320px,1.15fr)_minmax(300px,1fr)]"><div class="relative order-3 md:order-first">`);
				_push(ssrRenderComponent(DuotoneImage_default, {
					src: identity.value.who_image.src,
					alt: identity.value.who_image.alt,
					width: identity.value.who_image.width,
					height: identity.value.who_image.height,
					opacity: .3,
					loading: "lazy",
					class: "rounded-[18px] md:rounded-[24px]",
					"img-class": "block h-auto w-full"
				}, null, _parent));
				_push(ssrRenderComponent(StarGlyph_default, {
					kind: "star",
					class: "absolute -right-4 -top-[22px] hidden w-[52px] text-brand [filter:saturate(1.4)] md:block"
				}, null, _parent));
				_push(`</div><div class="contents md:flex md:flex-col md:items-end md:gap-[22px] md:text-right"><div class="order-1 text-[0.9rem] font-extrabold uppercase tracking-[0.06em] text-accent md:text-base md:tracking-[0.04em]">${ssrInterpolate(who.value.eyebrow)}</div><h2 class="${ssrRenderClass(["order-2", h2Class])}">${who.value.heading ?? ""}</h2><p class="order-4 m-0 text-[1.05rem] font-semibold leading-[1.5] md:text-[1.22rem] md:font-bold md:leading-[1.45]">${ssrInterpolate(who.value.p1)}</p><p class="order-4 m-0 text-[1.05rem] font-semibold leading-[1.5] md:text-[1.22rem] md:font-bold md:leading-[1.45]">${ssrInterpolate(who.value.p2)}</p><p class="order-4 m-0 text-[1.05rem] font-semibold leading-[1.5] md:text-[1.22rem] md:font-bold md:leading-[1.45]">${who.value.p3 ?? ""}</p><a${ssrRenderAttr("href", who.value.link_url)} class="${ssrRenderClass(["order-5", arrowLink])}">${ssrInterpolate(who.value.link_label)} `);
				_push(ssrRenderComponent(ArrowGlyph_default, { class: arrowSvg }, null, _parent));
				_push(`</a></div></div></section><section id="events" class="upcoming-events bg-alt px-6 pb-14 pt-12 font-sans text-ink md:pb-24 md:pt-[76px]" data-tone="alt"><div class="mx-auto flex max-w-[1240px] flex-col gap-[22px] md:grid md:items-center md:gap-10 md:[grid-template-columns:1fr_auto]"><h2 class="${ssrRenderClass(h2Class)}">${ssrInterpolate(t("home_events_head", "Upcoming events"))}</h2><a${ssrRenderAttr("href", calendarUrl.value)} class="${ssrRenderClass([
					"order-last justify-center",
					arrowLink,
					"md:order-none md:col-start-2 md:row-start-1 md:justify-start"
				])}">${ssrInterpolate(t("home_events_all", "Full calendar"))} `);
				_push(ssrRenderComponent(ArrowGlyph_default, { class: arrowSvg }, null, _parent));
				_push(`</a>`);
				if (events.value.length === 0) _push(`<div class="flex flex-col items-center gap-1 rounded-[20px] border-2 border-dashed border-border-muted px-8 py-16 text-center md:col-span-2 md:row-start-2"><div class="text-[1.25rem] font-bold">${ssrInterpolate(t("home_events_empty_h", "No events on the books yet"))}</div><p class="m-0 max-w-[42ch] text-[1.25rem] font-medium leading-[1.45]">${eventsEmptyHtml.value ?? ""}</p></div>`);
				else {
					_push(`<div class="flex flex-col gap-3 md:col-span-2 md:row-start-2"><!--[-->`);
					ssrRenderList(events.value, (ev) => {
						_push(`<a${ssrRenderAttr("href", ev.url || calendarUrl.value)}${ssrRenderAttr("aria-label", `${t("home_view_event", "View event")}: ${ev.title}`)} class="group grid grid-cols-[60px_1fr] items-center gap-4 rounded-[14px] bg-white p-4 text-ink no-underline shadow-subtle transition-shadow hover:shadow-card md:[grid-template-columns:76px_1fr_auto] md:gap-6 md:rounded-[16px] md:px-[22px] md:py-[18px]"><span aria-hidden="true" class="flex flex-col rounded-[10px] bg-brand px-0.5 py-2 text-center text-white md:rounded-[12px] md:px-1 md:py-2.5"><span class="text-[1.2rem] font-extrabold leading-[1.1] md:text-[1.4rem]">${ssrInterpolate(ev.day)}</span><span class="text-[0.68rem] font-bold tracking-[0.1em] md:text-[0.75rem]">${ssrInterpolate(ev.month)}</span></span><span class="flex flex-col gap-[3px] md:gap-1"><span class="text-[1.02rem] font-bold leading-[1.3] md:text-[1.18rem]">${ssrInterpolate(ev.title)}</span><span class="text-[0.88rem] font-medium text-muted md:text-base">${ssrInterpolate(ev.when)}<span class="hidden md:inline"> · ${ssrInterpolate(ev.where)}</span></span></span><span aria-hidden="true" class="hidden whitespace-nowrap rounded-full border-2 border-accent px-5 py-[9px] font-display text-[0.88rem] font-normal uppercase tracking-[0.03em] text-accent transition-colors group-hover:bg-accent group-hover:text-white md:inline-block">${ssrInterpolate(t("home_view_event", "View event"))}</span></a>`);
					});
					_push(`<!--]--></div>`);
				}
				_push(`</div></section><section id="blog" class="from-the-blog bg-white px-6 py-14 font-sans text-ink md:pb-24 md:pt-[88px]" data-tone="white"><div class="mx-auto flex max-w-[1240px] flex-col gap-[22px] md:gap-11"><h2 class="${ssrRenderClass(h2Class)}">${ssrInterpolate(t("home_blog_head", "From the blog"))}</h2>`);
				if (blog.value.featured) {
					_push(`<div class="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-8 lg:[grid-template-columns:minmax(300px,1.15fr)_minmax(280px,1fr)]"><a${ssrRenderAttr("href", blog.value.featured.url)} class="${ssrRenderClass([
						"flex flex-col",
						card$2,
						"md:col-span-2 lg:col-span-1"
					])}"><span class="${ssrRenderClass(["relative block aspect-video overflow-hidden", blog.value.featured.image ? "" : stripe])}">`);
					if (blog.value.featured.image) _push(ssrRenderComponent(DuotoneImage_default, {
						src: blog.value.featured.image.src,
						alt: blog.value.featured.image.alt,
						opacity: .3,
						loading: "lazy",
						class: "absolute inset-0 h-full w-full",
						"img-class": "block h-full w-full object-cover"
					}, null, _parent));
					else _push(`<!---->`);
					_push(`<span class="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.06em] text-white md:left-3.5 md:top-3.5 md:px-3.5 md:py-[5px] md:text-[0.75rem]">${ssrInterpolate(blog.value.featured.cat_label)}</span></span><span class="flex flex-col gap-2 px-5 pb-[22px] pt-[18px] md:gap-2.5 md:px-7 md:pb-[30px] md:pt-[26px]"><span class="text-[0.82rem] font-semibold text-muted md:text-[0.85rem]">${ssrInterpolate(blog.value.featured.date)} · ${ssrInterpolate(blog.value.featured.read)}</span><span class="text-[1.1rem] font-extrabold leading-[1.3] [text-wrap:balance] md:text-[clamp(1.2rem,2.2vw,1.45rem)] md:leading-[1.25]">${ssrInterpolate(blog.value.featured.title)}</span><span class="hidden text-base leading-[1.55] text-muted md:block">${ssrInterpolate(blog.value.featured.excerpt)}</span><span class="mt-1 hidden items-center gap-3 text-[0.95rem] font-extrabold uppercase tracking-[0.03em] text-accent md:flex">${ssrInterpolate(t("home_blog_read", "Read the post"))} `);
					_push(ssrRenderComponent(ArrowGlyph_default, { class: "h-4 w-8 flex-none fill-accent" }, null, _parent));
					_push(`</span></span></a><div class="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2 md:gap-5 lg:col-span-1 lg:grid-cols-1"><!--[-->`);
					ssrRenderList(blog.value.rows, (row, i) => {
						_push(`<a${ssrRenderAttr("href", row.url)} class="${ssrRenderClass([
							"grid flex-1 grid-cols-[96px_1fr]",
							card$2,
							"md:[grid-template-columns:130px_1fr]"
						])}">`);
						if (row.image) _push(ssrRenderComponent(DuotoneImage_default, {
							src: row.image.src,
							alt: row.image.alt,
							opacity: 0,
							loading: "lazy",
							class: "min-h-[96px] md:min-h-[130px]",
							"img-class": "block h-full w-full object-cover"
						}, null, _parent));
						else _push(`<span aria-hidden="true" class="${ssrRenderClass(["min-h-[96px] md:min-h-[130px]", stripe])}"></span>`);
						_push(`<span class="flex flex-col justify-center gap-1.5 px-[18px] py-3.5 md:gap-[9px] md:px-6 md:py-5"><span class="${ssrRenderClass([i % 2 === 0 ? "border-brand text-brand" : "border-accent text-accent", "hidden self-start rounded-full border-2 px-3 py-[3px] text-[0.72rem] font-bold uppercase tracking-[0.06em] md:inline-block"])}">${ssrInterpolate(row.cat_label)}</span><span class="text-[0.98rem] font-bold leading-[1.35] md:text-[1.1rem]">${ssrInterpolate(row.title)}</span><span class="text-[0.82rem] font-semibold text-muted md:text-[0.85rem]">${ssrInterpolate(row.date)}</span></span></a>`);
					});
					_push(`<!--]--></div></div>`);
				} else _push(`<div class="flex flex-col items-center gap-1 rounded-[24px] border-2 border-dashed border-border-muted px-6 py-16 text-center"><span class="text-[1.25rem] font-bold">${ssrInterpolate(t("home_blog_empty_h", "Posts coming soon"))}</span><span class="max-w-[42ch] text-[1.25rem] font-medium leading-[1.45]">${ssrInterpolate(t("home_blog_empty_p", "The chapter is writing its first dispatches — check back shortly."))}</span></div>`);
				_push(`</div></section><section class="closing-cta bg-brand pt-10 font-sans min-[700px]:pt-[72px]" data-tone="blue"${ssrRenderAttr("aria-label", t("cta_join", "Join us"))}><div aria-hidden="true" class="cta-flames h-[110px] min-[700px]:h-[clamp(120px,17vw,240px)]"></div><div class="relative -mt-0.5 bg-brand-light px-5 pb-10 pt-2 min-[700px]:px-6 min-[700px]:pb-14 min-[700px]:pt-4"><div class="relative mx-auto hidden max-w-[1100px] min-[700px]:block"><img${ssrRenderAttr("src", identity.value.cta_panel.src)}${ssrRenderAttr("alt", identity.value.cta_panel.alt)}${ssrRenderAttr("aria-hidden", identity.value.cta_panel.alt === "" ? "true" : void 0)}${ssrRenderAttr("width", identity.value.cta_panel.width)}${ssrRenderAttr("height", identity.value.cta_panel.height)} class="block h-auto w-full"><div class="absolute inset-0 flex flex-col items-center justify-center gap-[clamp(12px,3vw,40px)] pl-[44%] pr-[5%] text-center"><p class="m-0 font-brush text-[clamp(1.8rem,5.4vw,4.8rem)] font-normal uppercase leading-[1.1] text-white [text-wrap:balance]">${ssrInterpolate(cta.value.line)}</p><a${ssrRenderAttr("href", chapter.value.join_url)} target="_blank" rel="noopener" class="${ssrRenderClass([pill, "px-[2.6em] py-[0.8em] text-[clamp(0.8rem,1.3vw,1.1rem)]"])}">${ssrInterpolate(t("cta_join_now", "Join Now"))}</a></div></div><div class="relative flex flex-col items-center gap-[22px] overflow-hidden rounded-[22px] bg-cta-card px-6 pb-9 pt-8 text-center min-[700px]:hidden"><span aria-hidden="true" class="absolute inset-2 rounded-[16px] border-[3px] border-dashed border-yellow opacity-85"></span><svg aria-hidden="true" focusable="false" viewBox="-210 -200 420 395" class="relative h-auto w-[120px]"><path d="M0 -196 L57.6 -60 L204 -51 L88 39 L127 188 L0 105 L-127 188 L-88 39 L-204 -51 L-57.6 -60 Z" fill="#1848D8" stroke="#1B1B22" stroke-width="12" stroke-linejoin="round"></path><path d="M0 -132 L38 -41 L136 -34 L59 26 L85 126 L0 70 L-85 126 L-59 26 L-136 -34 L-38 -41 Z" fill="#FFFFFF"></path></svg><p class="relative m-0 font-brush text-[2.1rem] font-normal uppercase leading-[1.1] text-white [text-wrap:balance]">${ssrInterpolate(cta.value.line)}</p><a${ssrRenderAttr("href", chapter.value.join_url)} target="_blank" rel="noopener" class="${ssrRenderClass([
					"relative",
					pill,
					"px-9 py-[13px] text-[0.95rem]"
				])}">${ssrInterpolate(t("cta_join_now", "Join Now"))}</a></div></div></section></div>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region app/components/routes/RouteFront.vue
var _sfc_setup$42 = RouteFront_vue_vue_type_script_setup_true_lang_default.setup;
RouteFront_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/routes/RouteFront.vue");
	return _sfc_setup$42 ? _sfc_setup$42(props, ctx) : void 0;
};
var RouteFront_default = RouteFront_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/CtaCard.vue?vue&type=script&setup=true&lang.ts
var CtaCard_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "CtaCard",
	__ssrInlineRender: true,
	props: {
		title: {},
		body: { default: "" },
		href: {},
		label: {},
		external: {
			type: Boolean,
			default: false
		},
		id: { default: void 0 }
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({
				id: __props.id,
				class: "cta-card flex flex-col gap-3 rounded-[16px] bg-brand px-[22px] pb-[26px] pt-[22px] text-white shadow-featured lg:gap-3.5 lg:rounded-[20px] lg:px-[26px] lg:pb-[30px] lg:pt-[26px]",
				"data-tone": "blue"
			}, _attrs))}><div class="font-display text-[1.05rem] font-normal lg:text-[1.15rem]">${ssrInterpolate(__props.title)}</div>`);
			if (__props.body) _push(`<p class="m-0 text-[0.95rem] leading-[1.55] [&amp;_a]:font-bold [&amp;_a]:text-white [&amp;_a]:underline lg:text-base">${__props.body ?? ""}</p>`);
			else _push(`<!---->`);
			_push(`<a${ssrRenderAttr("href", __props.href)}${ssrRenderAttr("target", __props.external ? "_blank" : void 0)}${ssrRenderAttr("rel", __props.external ? "noopener" : void 0)} class="rounded-full bg-white px-[22px] py-3 text-center font-display text-[0.88rem] font-normal tracking-[0.04em] text-brand no-underline transition-colors hover:bg-brand-deep hover:text-white lg:py-[11px] lg:text-[0.9rem]">${ssrInterpolate(__props.label)}</a></div>`);
		};
	}
});
//#endregion
//#region app/components/site/CtaCard.vue
var _sfc_setup$41 = CtaCard_vue_vue_type_script_setup_true_lang_default.setup;
CtaCard_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/CtaCard.vue");
	return _sfc_setup$41 ? _sfc_setup$41(props, ctx) : void 0;
};
var CtaCard_default = CtaCard_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/DashedNote.vue?vue&type=script&setup=true&lang.ts
var DashedNote_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "DashedNote",
	__ssrInlineRender: true,
	props: {
		heading: {},
		id: { default: void 0 }
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({
				id: __props.id,
				class: "dashed-note flex flex-col gap-1.5 rounded-[16px] border-2 border-dashed border-border-muted px-[22px] py-5 lg:gap-2 lg:rounded-[20px] lg:px-[26px] lg:py-6"
			}, _attrs))}><div class="text-[0.95rem] font-extrabold uppercase tracking-[0.04em] text-ink lg:text-base">${ssrInterpolate(__props.heading)}</div><div class="text-[0.95rem] leading-[1.55] text-text-body [&amp;_a]:font-bold [&amp;_a]:text-accent [&amp;_a]:no-underline hover:[&amp;_a]:underline hover:[&amp;_a]:underline-offset-4 [&amp;_p]:m-0 lg:text-[0.98rem]">`);
			ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
			_push(`</div></div>`);
		};
	}
});
//#endregion
//#region app/components/site/DashedNote.vue
var _sfc_setup$40 = DashedNote_vue_vue_type_script_setup_true_lang_default.setup;
DashedNote_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/DashedNote.vue");
	return _sfc_setup$40 ? _sfc_setup$40(props, ctx) : void 0;
};
var DashedNote_default = DashedNote_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/LinkListCard.vue?vue&type=script&setup=true&lang.ts
var LinkListCard_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "LinkListCard",
	__ssrInlineRender: true,
	props: {
		heading: {},
		links: { default: () => [] },
		rows: { default: () => [] },
		id: { default: void 0 },
		ariaLabel: { default: void 0 }
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			ssrRenderVNode(_push, createVNode(resolveDynamicComponent(__props.links.length ? "nav" : "div"), mergeProps({
				id: __props.id,
				"aria-label": __props.links.length ? __props.ariaLabel || __props.heading : void 0,
				class: "link-list-card flex flex-col gap-[9px] rounded-[16px] bg-white px-[22px] py-5 shadow-card lg:gap-2.5 lg:rounded-[20px] lg:px-[26px] lg:py-6"
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="mb-0.5 text-[0.95rem] font-extrabold uppercase tracking-[0.04em] text-ink lg:mb-1 lg:text-base"${_scopeId}>${ssrInterpolate(__props.heading)}</div><!--[-->`);
						ssrRenderList(__props.links, (link) => {
							_push(`<a${ssrRenderAttr("href", link.href)}${ssrRenderAttr("target", link.external ? "_blank" : void 0)}${ssrRenderAttr("rel", link.external ? "noopener" : void 0)} class="text-[0.95rem] font-bold text-accent no-underline hover:underline hover:underline-offset-4 lg:text-[0.98rem]"${_scopeId}>${ssrInterpolate(link.label)}</a>`);
						});
						_push(`<!--]--><!--[-->`);
						ssrRenderList(__props.rows, (row) => {
							_push(`<div class="flex flex-col gap-0.5"${_scopeId}><span class="row-label text-[0.78rem] font-extrabold uppercase tracking-[0.06em] text-muted"${_scopeId}>${ssrInterpolate(row.label)}</span><span class="text-[0.98rem] font-semibold text-ink"${_scopeId}>${ssrInterpolate(row.value)}</span></div>`);
						});
						_push(`<!--]-->`);
					} else return [
						createVNode("div", { class: "mb-0.5 text-[0.95rem] font-extrabold uppercase tracking-[0.04em] text-ink lg:mb-1 lg:text-base" }, toDisplayString(__props.heading), 1),
						(openBlock(true), createBlock(Fragment, null, renderList(__props.links, (link) => {
							return openBlock(), createBlock("a", {
								key: link.href + link.label,
								href: link.href,
								target: link.external ? "_blank" : void 0,
								rel: link.external ? "noopener" : void 0,
								class: "text-[0.95rem] font-bold text-accent no-underline hover:underline hover:underline-offset-4 lg:text-[0.98rem]"
							}, toDisplayString(link.label), 9, [
								"href",
								"target",
								"rel"
							]);
						}), 128)),
						(openBlock(true), createBlock(Fragment, null, renderList(__props.rows, (row) => {
							return openBlock(), createBlock("div", {
								key: row.label,
								class: "flex flex-col gap-0.5"
							}, [createVNode("span", { class: "row-label text-[0.78rem] font-extrabold uppercase tracking-[0.06em] text-muted" }, toDisplayString(row.label), 1), createVNode("span", { class: "text-[0.98rem] font-semibold text-ink" }, toDisplayString(row.value), 1)]);
						}), 128))
					];
				}),
				_: 1
			}), _parent);
		};
	}
});
//#endregion
//#region app/components/site/LinkListCard.vue
var _sfc_setup$39 = LinkListCard_vue_vue_type_script_setup_true_lang_default.setup;
LinkListCard_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/LinkListCard.vue");
	return _sfc_setup$39 ? _sfc_setup$39(props, ctx) : void 0;
};
var LinkListCard_default = LinkListCard_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/PageHeader.vue?vue&type=script&setup=true&lang.ts
var PageHeader_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "PageHeader",
	__ssrInlineRender: true,
	props: {
		title: {},
		lede: { default: "" },
		crumbs: { default: () => [{
			label: "Home",
			href: "/"
		}] },
		variant: { default: "page" },
		wide: {
			type: Boolean,
			default: false
		},
		pullUp: {
			type: Boolean,
			default: false
		}
	},
	setup(__props) {
		const props = __props;
		const isPost = computed(() => props.variant === "post");
		const bandClass = computed(() => isPost.value ? props.pullUp ? "pb-[96px] pt-8 md:pb-[150px] md:pt-12" : "pb-10 pt-8 md:pb-12 md:pt-12" : "pb-10 pt-9 md:px-10 md:pb-[52px] md:pt-11 xl:px-6 xl:pb-14 xl:pt-12");
		const columnClass = computed(() => isPost.value ? "max-w-[880px] gap-4 md:gap-5" : props.wide ? "max-w-[1200px]" : "max-w-[1140px]");
		const titleClass = computed(() => isPost.value ? "text-[1.5rem] leading-[1.25] [text-wrap:balance] md:text-[clamp(2rem,3.8vw,3rem)] md:leading-[1.12]" : "headline-shadow uppercase text-[1.9rem] leading-[1.12] md:text-[2.3rem] md:leading-[1.1] xl:text-[clamp(2.2rem,4.2vw,3.4rem)] xl:leading-[1.08]");
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<section${ssrRenderAttrs(mergeProps({
				class: ["page-header bg-brand px-6 text-white", bandClass.value],
				"data-tone": "blue"
			}, _attrs))}><div class="${ssrRenderClass([columnClass.value, "mx-auto flex flex-col items-start gap-3.5 md:gap-4 xl:gap-[18px]"])}"><nav aria-label="Breadcrumb" class="hidden md:block"><ol class="m-0 flex list-none flex-wrap items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[0.85rem] font-bold"><!--[-->`);
			ssrRenderList(__props.crumbs, (crumb) => {
				_push(`<li class="flex items-center gap-2">`);
				if (crumb.href) _push(`<a${ssrRenderAttr("href", crumb.href)} class="text-brand no-underline hover:underline hover:underline-offset-4">${ssrInterpolate(crumb.label)}</a>`);
				else _push(`<span class="text-ink">${ssrInterpolate(crumb.label)}</span>`);
				_push(`<span aria-hidden="true" class="text-muted">/</span></li>`);
			});
			_push(`<!--]--><li aria-current="page" class="text-ink">${ssrInterpolate(__props.title)}</li></ol></nav>`);
			ssrRenderSlot(_ctx.$slots, "before", {}, null, _push, _parent);
			_push(`<h1 class="${ssrRenderClass([titleClass.value, "m-0 font-display font-normal"])}">${ssrInterpolate(__props.title)}</h1>`);
			if (__props.lede) _push(`<p class="m-0 max-w-[56ch] text-[1.05rem] font-semibold leading-[1.5] md:text-[1.12rem] xl:text-[1.25rem]">${ssrInterpolate(__props.lede)}</p>`);
			else _push(`<!---->`);
			ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
			_push(`</div></section>`);
		};
	}
});
//#endregion
//#region app/components/site/PageHeader.vue
var _sfc_setup$38 = PageHeader_vue_vue_type_script_setup_true_lang_default.setup;
PageHeader_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/PageHeader.vue");
	return _sfc_setup$38 ? _sfc_setup$38(props, ctx) : void 0;
};
var PageHeader_default = PageHeader_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/SubscribeStrip.vue?vue&type=script&setup=true&lang.ts
var SubscribeStrip_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "SubscribeStrip",
	__ssrInlineRender: true,
	props: {
		href: {},
		title: {},
		lede: { default: "" },
		label: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			if (__props.href) {
				_push(`<section${ssrRenderAttrs(mergeProps({
					class: "subscribe-strip bg-ink px-6 py-10 text-white lg:py-14",
					"data-tone": "ink"
				}, _attrs))}><div class="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-6 lg:gap-8"><div class="flex max-w-[52ch] flex-col gap-2"><h2 class="m-0 font-display text-[1.2rem] font-normal lg:text-[1.4rem]">${ssrInterpolate(__props.title)}</h2>`);
				if (__props.lede) _push(`<p class="m-0 text-base leading-[1.55] text-muted-on-ink lg:text-[1.05rem]">${ssrInterpolate(__props.lede)}</p>`);
				else _push(`<!---->`);
				_push(`</div><a${ssrRenderAttr("href", __props.href)} target="_blank" rel="noopener" class="rounded-full bg-white px-8 py-3.5 font-display text-[0.95rem] font-normal tracking-[0.04em] text-ink no-underline transition-colors hover:bg-brand-deep hover:text-white lg:px-[34px] lg:text-base">${ssrInterpolate(__props.label)}</a></div></section>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region app/components/site/SubscribeStrip.vue
var _sfc_setup$37 = SubscribeStrip_vue_vue_type_script_setup_true_lang_default.setup;
SubscribeStrip_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/SubscribeStrip.vue");
	return _sfc_setup$37 ? _sfc_setup$37(props, ctx) : void 0;
};
var SubscribeStrip_default = SubscribeStrip_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/routes/RoutePage.vue?vue&type=script&setup=true&lang.ts
var h2class$2 = "m-0 scroll-mt-[calc(110px+var(--wp-admin--admin-bar--height,0px))] font-display text-[1.35rem] font-normal leading-[1.2] md:text-[1.6rem] md:leading-[1.15] xl:text-[clamp(1.6rem,2.6vw,2.2rem)] xl:leading-[1.1]";
var h2later$2 = "mt-3.5 xl:mt-[18px]";
var prose$2 = "text-[1.02rem] leading-[1.65] text-text-body md:text-[1.05rem] xl:text-[1.12rem] [&_p]:m-0 [&_p+p]:mt-4 [&_a]:font-bold [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-[3px] hover:[&_a]:text-brand-deep [&_ul]:my-0 [&_ul]:list-[square] [&_ul]:pl-5 [&_ol]:my-0 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-extrabold [&_strong]:text-ink";
var callout$1 = "m-0 flex flex-col gap-2.5 rounded-[16px] border-l-[5px] border-brand bg-alt px-[22px] py-5 md:rounded-[18px] md:px-[26px] md:py-[22px] xl:rounded-[20px] xl:border-l-[6px] xl:px-[30px] xl:py-[26px]";
var RoutePage_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "RoutePage",
	__ssrInlineRender: true,
	props: { resolved: {} },
	async setup(__props) {
		let __temp, __restore;
		const props = __props;
		const lang = computed(() => props.resolved.lang);
		const route = props.resolved.route;
		const uri = payloadSlug(route);
		const api = useChapterApi();
		const { data: site } = ([__temp, __restore] = withAsyncContext(() => useChapterSite(lang.value)), __temp = await __temp, __restore(), __temp);
		const { data: page } = ([__temp, __restore] = withAsyncContext(() => useChapterData(pageKey(lang.value, uri), () => fetchPage(api, uri, lang.value))), __temp = await __temp, __restore(), __temp);
		provideRouteLanguages(computed(() => page.value?.languages));
		useRouteSeo(computed(() => page.value?.seo), lang);
		const routes = useChapterRoutes();
		const home = computed(() => frontRoute(routes.value, lang.value)?.path ?? "/");
		const aboutPath = computed(() => routes.value.routes.find((r) => r.kind === "about" && r.lang === lang.value)?.path ?? "/about/");
		const giPath = computed(() => routes.value.routes.find((r) => r.kind === "get_involved" && r.lang === lang.value)?.path ?? "/get-involved/");
		const chapter = computed(() => site.value?.chapter);
		const s = computed(() => site.value?.strings ?? {});
		const lede = computed(() => page.value?.lede || (page.value?.content ? "" : "How our chapter governs itself — and how we take care of each other while we do the work."));
		const documentLinks = computed(() => (page.value?.documents ?? []).map((d) => ({
			label: d.title,
			href: d.url
		})));
		const relatedLinks = computed(() => [
			{
				label: s.value.about_mission ?? "Mission & History",
				href: `${aboutPath.value}#mission`
			},
			{
				label: s.value.about_committees ?? "Committees",
				href: `${giPath.value}#committees`
			},
			{
				label: s.value.about_faq ?? "FAQ",
				href: `${aboutPath.value}#faq`
			}
		]);
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(page) && chapter.value) {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: "route-page contents" }, _attrs))}>`);
				_push(ssrRenderComponent(PageHeader_default, {
					title: unref(page).title,
					lede: lede.value,
					crumbs: [{
						label: s.value.blog_crumb_home ?? "Home",
						href: home.value
					}]
				}, null, _parent));
				_push(`<section class="interior-page bg-white px-6 pb-14 pt-11 md:px-10 md:pb-[72px] md:pt-14 xl:px-6 xl:pb-24 xl:pt-16" data-tone="white"><div class="mx-auto grid max-w-[1140px] items-start gap-10 md:gap-9 md:[grid-template-columns:minmax(0,1fr)_260px] xl:gap-14 xl:[grid-template-columns:minmax(300px,1fr)_310px]"><article${ssrRenderAttr("id", `post-${unref(page).id}`)} class="post-type-page flex min-w-0 flex-col gap-5 md:gap-[22px] xl:gap-[26px]">`);
				if (unref(page).content) _push(`<div class="prose-chapter">${unref(page).content ?? ""}</div>`);
				else _push(`<!--[--><p class="${ssrRenderClass(["m-0", prose$2])}"> Our chapter is governed by its members. These documents spell out how we make decisions together, how we treat each other, and what to do when something goes wrong. Every member is encouraged to read them — and every member has the power to propose changes. </p><h2 id="conduct" class="${ssrRenderClass([h2class$2, h2later$2])}">What we expect of each other</h2><p class="${ssrRenderClass(["m-0", prose$2])}">Organizing only works when everyone can participate safely and fully. Our code of conduct applies to all chapter spaces — meetings, actions, socials, and online channels. In short:</p><ul class="m-0 flex list-[square] flex-col gap-2.5 pl-6 text-[1.02rem] leading-[1.6] text-text-body marker:text-brand md:text-[1.05rem] xl:text-[1.12rem]"><li>Treat fellow members with respect, across every difference.</li><li>Honor pronouns, access needs, and language needs.</li><li>No harassment, intimidation, or discrimination — full stop.</li><li>Disagree openly and in good faith; debate ideas, not people.</li></ul><h3 class="mx-0 mb-0 mt-2 font-display text-[1.15rem] font-normal leading-[1.2]">Amending these documents</h3><p class="${ssrRenderClass(["m-0", prose$2])}">Any member in good standing may propose an amendment. Proposals are read at a general meeting and voted on at the following one. Reach out to the steering committee if you’d like help drafting a proposal.</p><!--]-->`);
				if (unref(page).grievance.show) {
					_push(`<aside id="grievance" class="${ssrRenderClass(["callout-card mt-1.5 scroll-mt-[calc(110px+var(--wp-admin--admin-bar--height,0px))]", callout$1])}"><div class="font-display text-base font-normal text-brand md:text-[1.05rem]">${ssrInterpolate(s.value.page_grievance_h ?? "Need to report something?")}</div>`);
					if (unref(page).grievance.body) _push(`<div class="prose-chapter text-base leading-[1.65] text-text-body">${unref(page).grievance.body ?? ""}</div>`);
					else {
						_push(`<p class="m-0 text-base leading-[1.65] text-text-body"> Our grievance officers are here for you. Reports are handled confidentially, and you can always bring a support person. `);
						if (chapter.value.contact_email) _push(`<!--[--> Email <a${ssrRenderAttr("href", `mailto:${chapter.value.contact_email}`)} class="notranslate font-bold text-accent underline underline-offset-[3px] hover:text-brand-deep">${ssrInterpolate(chapter.value.contact_email)}</a> or speak to any grievance officer at a meeting. <!--]-->`);
						else _push(`<!--[--> Speak to any grievance officer at a meeting.<!--]-->`);
						_push(`</p>`);
					}
					_push(`</aside>`);
				} else _push(`<!---->`);
				_push(`</article><aside${ssrRenderAttr("aria-label", s.value.chrome_related ?? "Related")} class="flex flex-col gap-5 md:sticky md:top-[calc(120px+var(--wp-admin--admin-bar--height,0px))] xl:top-[calc(108px+var(--wp-admin--admin-bar--height,0px))] xl:gap-6">`);
				if (unref(page).newhere) _push(ssrRenderComponent(CtaCard_default, {
					id: "involved",
					title: unref(page).newhere.heading,
					body: unref(page).newhere.body,
					href: unref(page).newhere.url,
					label: unref(page).newhere.link_label,
					external: unref(page).newhere.external
				}, null, _parent));
				else _push(`<!---->`);
				if (documentLinks.value.length) _push(ssrRenderComponent(LinkListCard_default, {
					id: "documents",
					heading: s.value.interior_documents ?? "Documents",
					links: documentLinks.value
				}, null, _parent));
				else _push(`<!---->`);
				_push(ssrRenderComponent(LinkListCard_default, {
					heading: s.value.chrome_related ?? "Related",
					links: relatedLinks.value
				}, null, _parent));
				if (chapter.value.contact_email) _push(ssrRenderComponent(DashedNote_default, {
					id: "contact",
					heading: s.value.interior_contact ?? "Contact"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`<p${_scopeId}>${ssrInterpolate(s.value.interior_contact_p ?? "Questions, ideas, or press —")} <a class="notranslate"${ssrRenderAttr("href", `mailto:${chapter.value.contact_email}`)}${_scopeId}>${ssrInterpolate(chapter.value.contact_email)}</a></p>`);
						else return [createVNode("p", null, [createTextVNode(toDisplayString(s.value.interior_contact_p ?? "Questions, ideas, or press —") + " ", 1), createVNode("a", {
							class: "notranslate",
							href: `mailto:${chapter.value.contact_email}`
						}, toDisplayString(chapter.value.contact_email), 9, ["href"])])];
					}),
					_: 1
				}, _parent));
				else _push(`<!---->`);
				_push(`</aside></div></section>`);
				_push(ssrRenderComponent(SubscribeStrip_default, {
					href: chapter.value.newsletter_url,
					title: s.value.interior_subscribe_h ?? "Never miss an update",
					lede: s.value.interior_subscribe_p ?? "One email when something new lands — meetings, actions, and posts. No spam, ever.",
					label: s.value.interior_subscribe_cta ?? "Subscribe"
				}, null, _parent));
				_push(`</div>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region app/components/routes/RoutePage.vue
var _sfc_setup$36 = RoutePage_vue_vue_type_script_setup_true_lang_default.setup;
RoutePage_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/routes/RoutePage.vue");
	return _sfc_setup$36 ? _sfc_setup$36(props, ctx) : void 0;
};
var RoutePage_default = RoutePage_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/ui/accordion/Accordion.vue?vue&type=script&setup=true&lang.ts
var Accordion_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "Accordion",
	__ssrInlineRender: true,
	props: {
		collapsible: { type: Boolean },
		disabled: { type: Boolean },
		dir: {},
		orientation: {},
		unmountOnHide: { type: Boolean },
		asChild: { type: Boolean },
		as: {},
		type: {},
		modelValue: {},
		defaultValue: {}
	},
	emits: ["update:modelValue"],
	setup(__props, { emit: __emit }) {
		const forwarded = useForwardPropsEmits(__props, __emit);
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(AccordionRoot), mergeProps({ "data-slot": "accordion" }, unref(forwarded), _attrs), {
				default: withCtx((slotProps, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", slotProps, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default", slotProps)];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region app/components/ui/accordion/Accordion.vue
var _sfc_setup$35 = Accordion_vue_vue_type_script_setup_true_lang_default.setup;
Accordion_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/accordion/Accordion.vue");
	return _sfc_setup$35 ? _sfc_setup$35(props, ctx) : void 0;
};
var Accordion_default = Accordion_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/ui/accordion/AccordionContent.vue?vue&type=script&setup=true&lang.ts
var AccordionContent_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "AccordionContent",
	__ssrInlineRender: true,
	props: {
		forceMount: { type: Boolean },
		asChild: { type: Boolean },
		as: {},
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] }
	},
	setup(__props) {
		const props = __props;
		const delegatedProps = reactiveOmit(props, "class");
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(AccordionContent), mergeProps({ "data-slot": "accordion-content" }, unref(delegatedProps), { class: "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm" }, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="${ssrRenderClass(unref(cn)("pt-0 pb-4", props.class))}"${_scopeId}>`);
						ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
						_push(`</div>`);
					} else return [createVNode("div", { class: unref(cn)("pt-0 pb-4", props.class) }, [renderSlot(_ctx.$slots, "default")], 2)];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region app/components/ui/accordion/AccordionContent.vue
var _sfc_setup$34 = AccordionContent_vue_vue_type_script_setup_true_lang_default.setup;
AccordionContent_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/accordion/AccordionContent.vue");
	return _sfc_setup$34 ? _sfc_setup$34(props, ctx) : void 0;
};
var AccordionContent_default = AccordionContent_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/ui/accordion/AccordionItem.vue?vue&type=script&setup=true&lang.ts
var AccordionItem_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "AccordionItem",
	__ssrInlineRender: true,
	props: {
		disabled: { type: Boolean },
		value: {},
		unmountOnHide: { type: Boolean },
		asChild: { type: Boolean },
		as: {},
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] }
	},
	setup(__props) {
		const props = __props;
		const delegatedProps = reactiveOmit(props, "class");
		const forwardedProps = useForwardProps(delegatedProps);
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(AccordionItem), mergeProps({ "data-slot": "accordion-item" }, unref(forwardedProps), { class: unref(cn)("border-b-2 border-ink last:border-b-0", props.class) }, _attrs), {
				default: withCtx((slotProps, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", slotProps, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default", slotProps)];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region app/components/ui/accordion/AccordionItem.vue
var _sfc_setup$33 = AccordionItem_vue_vue_type_script_setup_true_lang_default.setup;
AccordionItem_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/accordion/AccordionItem.vue");
	return _sfc_setup$33 ? _sfc_setup$33(props, ctx) : void 0;
};
var AccordionItem_default = AccordionItem_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/ui/accordion/AccordionTrigger.vue?vue&type=script&setup=true&lang.ts
var AccordionTrigger_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "AccordionTrigger",
	__ssrInlineRender: true,
	props: {
		asChild: { type: Boolean },
		as: {},
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] }
	},
	setup(__props) {
		const props = __props;
		const delegatedProps = reactiveOmit(props, "class");
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(AccordionHeader), mergeProps({ class: "flex" }, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(ssrRenderComponent(unref(AccordionTrigger), mergeProps({ "data-slot": "accordion-trigger" }, unref(delegatedProps), { class: unref(cn)("focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 bg-transparent text-left text-sm font-bold transition-all outline-none hover:underline focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180", props.class) }), {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) {
								ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
								ssrRenderSlot(_ctx.$slots, "icon", {}, () => {
									_push(ssrRenderComponent(unref(ChevronDown), { class: "text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" }, null, _parent, _scopeId));
								}, _push, _parent, _scopeId);
							} else return [renderSlot(_ctx.$slots, "default"), renderSlot(_ctx.$slots, "icon", {}, () => [createVNode(unref(ChevronDown), { class: "text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" })])];
						}),
						_: 3
					}, _parent, _scopeId));
					else return [createVNode(unref(AccordionTrigger), mergeProps({ "data-slot": "accordion-trigger" }, unref(delegatedProps), { class: unref(cn)("focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 bg-transparent text-left text-sm font-bold transition-all outline-none hover:underline focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180", props.class) }), {
						default: withCtx(() => [renderSlot(_ctx.$slots, "default"), renderSlot(_ctx.$slots, "icon", {}, () => [createVNode(unref(ChevronDown), { class: "text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" })])]),
						_: 3
					}, 16, ["class"])];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region app/components/ui/accordion/AccordionTrigger.vue
var _sfc_setup$32 = AccordionTrigger_vue_vue_type_script_setup_true_lang_default.setup;
AccordionTrigger_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/accordion/AccordionTrigger.vue");
	return _sfc_setup$32 ? _sfc_setup$32(props, ctx) : void 0;
};
var AccordionTrigger_default = AccordionTrigger_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/FaqAccordion.vue?vue&type=script&setup=true&lang.ts
var FaqAccordion_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "FaqAccordion",
	__ssrInlineRender: true,
	props: { items: {} },
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(Accordion_default), mergeProps({
				class: "faq-accordion flex flex-col gap-2.5 lg:gap-3",
				type: "single",
				collapsible: ""
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<!--[-->`);
						ssrRenderList(__props.items, (item, index) => {
							_push(ssrRenderComponent(unref(AccordionItem_default), {
								key: item.question,
								value: `faq-${index}`,
								class: "overflow-hidden rounded-[12px] border border-line bg-white lg:rounded-[14px]"
							}, {
								default: withCtx((_, _push, _parent, _scopeId) => {
									if (_push) {
										_push(ssrRenderComponent(unref(AccordionTrigger_default), { class: "items-center gap-4 rounded-none bg-transparent px-4 py-3.5 text-[0.98rem] font-bold text-ink hover:bg-alt hover:no-underline lg:px-5 lg:py-4 lg:text-[1.05rem]" }, {
											icon: withCtx((_, _push, _parent, _scopeId) => {
												if (_push) _push(`<svg class="pointer-events-none size-4 shrink-0 text-accent" aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"${_scopeId}><path d="M2 8h12"${_scopeId}></path><path class="[[data-state=open]_&amp;]:hidden" d="M8 2v12"${_scopeId}></path></svg>`);
												else return [(openBlock(), createBlock("svg", {
													class: "pointer-events-none size-4 shrink-0 text-accent",
													"aria-hidden": "true",
													viewBox: "0 0 16 16",
													fill: "none",
													stroke: "currentColor",
													"stroke-width": "2.5",
													"stroke-linecap": "square"
												}, [createVNode("path", { d: "M2 8h12" }), createVNode("path", {
													class: "[[data-state=open]_&]:hidden",
													d: "M8 2v12"
												})]))];
											}),
											default: withCtx((_, _push, _parent, _scopeId) => {
												if (_push) _push(`<span${_scopeId}>${ssrInterpolate(item.question)}</span>`);
												else return [createVNode("span", null, toDisplayString(item.question), 1)];
											}),
											_: 2
										}, _parent, _scopeId));
										_push(ssrRenderComponent(unref(AccordionContent_default), { class: "px-4 pb-4 lg:px-5 lg:pb-[18px]" }, {
											default: withCtx((_, _push, _parent, _scopeId) => {
												if (_push) _push(`<p class="m-0 text-[0.95rem] leading-[1.6] text-text-body lg:text-[1.02rem]"${_scopeId}>${ssrInterpolate(item.answer)}</p>`);
												else return [createVNode("p", { class: "m-0 text-[0.95rem] leading-[1.6] text-text-body lg:text-[1.02rem]" }, toDisplayString(item.answer), 1)];
											}),
											_: 2
										}, _parent, _scopeId));
									} else return [createVNode(unref(AccordionTrigger_default), { class: "items-center gap-4 rounded-none bg-transparent px-4 py-3.5 text-[0.98rem] font-bold text-ink hover:bg-alt hover:no-underline lg:px-5 lg:py-4 lg:text-[1.05rem]" }, {
										icon: withCtx(() => [(openBlock(), createBlock("svg", {
											class: "pointer-events-none size-4 shrink-0 text-accent",
											"aria-hidden": "true",
											viewBox: "0 0 16 16",
											fill: "none",
											stroke: "currentColor",
											"stroke-width": "2.5",
											"stroke-linecap": "square"
										}, [createVNode("path", { d: "M2 8h12" }), createVNode("path", {
											class: "[[data-state=open]_&]:hidden",
											d: "M8 2v12"
										})]))]),
										default: withCtx(() => [createVNode("span", null, toDisplayString(item.question), 1)]),
										_: 2
									}, 1024), createVNode(unref(AccordionContent_default), { class: "px-4 pb-4 lg:px-5 lg:pb-[18px]" }, {
										default: withCtx(() => [createVNode("p", { class: "m-0 text-[0.95rem] leading-[1.6] text-text-body lg:text-[1.02rem]" }, toDisplayString(item.answer), 1)]),
										_: 2
									}, 1024)];
								}),
								_: 2
							}, _parent, _scopeId));
						});
						_push(`<!--]-->`);
					} else return [(openBlock(true), createBlock(Fragment, null, renderList(__props.items, (item, index) => {
						return openBlock(), createBlock(unref(AccordionItem_default), {
							key: item.question,
							value: `faq-${index}`,
							class: "overflow-hidden rounded-[12px] border border-line bg-white lg:rounded-[14px]"
						}, {
							default: withCtx(() => [createVNode(unref(AccordionTrigger_default), { class: "items-center gap-4 rounded-none bg-transparent px-4 py-3.5 text-[0.98rem] font-bold text-ink hover:bg-alt hover:no-underline lg:px-5 lg:py-4 lg:text-[1.05rem]" }, {
								icon: withCtx(() => [(openBlock(), createBlock("svg", {
									class: "pointer-events-none size-4 shrink-0 text-accent",
									"aria-hidden": "true",
									viewBox: "0 0 16 16",
									fill: "none",
									stroke: "currentColor",
									"stroke-width": "2.5",
									"stroke-linecap": "square"
								}, [createVNode("path", { d: "M2 8h12" }), createVNode("path", {
									class: "[[data-state=open]_&]:hidden",
									d: "M8 2v12"
								})]))]),
								default: withCtx(() => [createVNode("span", null, toDisplayString(item.question), 1)]),
								_: 2
							}, 1024), createVNode(unref(AccordionContent_default), { class: "px-4 pb-4 lg:px-5 lg:pb-[18px]" }, {
								default: withCtx(() => [createVNode("p", { class: "m-0 text-[0.95rem] leading-[1.6] text-text-body lg:text-[1.02rem]" }, toDisplayString(item.answer), 1)]),
								_: 2
							}, 1024)]),
							_: 2
						}, 1032, ["value"]);
					}), 128))];
				}),
				_: 1
			}, _parent));
		};
	}
});
//#endregion
//#region app/components/site/FaqAccordion.vue
var _sfc_setup$31 = FaqAccordion_vue_vue_type_script_setup_true_lang_default.setup;
FaqAccordion_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/FaqAccordion.vue");
	return _sfc_setup$31 ? _sfc_setup$31(props, ctx) : void 0;
};
var FaqAccordion_default = FaqAccordion_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/routes/RouteAbout.vue?vue&type=script&setup=true&lang.ts
var h2class$1 = "m-0 scroll-mt-[calc(110px+var(--wp-admin--admin-bar--height,0px))] font-display text-[1.35rem] font-normal leading-[1.2] md:text-[1.6rem] md:leading-[1.15] xl:text-[clamp(1.6rem,2.6vw,2.2rem)] xl:leading-[1.1]";
var h2later$1 = "mt-3.5 xl:mt-[18px]";
var prose$1 = "text-[1.02rem] leading-[1.65] text-text-body md:text-[1.05rem] xl:text-[1.12rem] [&_p]:m-0 [&_p+p]:mt-4 [&_a]:font-bold [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-[3px] hover:[&_a]:text-brand-deep [&_ul]:my-0 [&_ul]:list-[square] [&_ul]:pl-5 [&_ol]:my-0 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-extrabold [&_strong]:text-ink";
var cardGrid$1 = "grid gap-3.5 md:grid-cols-2 md:gap-4 xl:gap-5 xl:[grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]";
var card$1 = "flex flex-col gap-1.5 rounded-[16px] bg-white px-5 py-[18px] shadow-card md:gap-[7px] md:rounded-[18px] md:px-[22px] md:py-5 xl:gap-2 xl:rounded-[20px] xl:px-6 xl:py-[22px]";
var cardTitle$1 = "font-display text-[0.98rem] font-normal text-brand [text-wrap:balance] md:text-base xl:text-[1.05rem]";
var cardDesc$1 = "m-0 text-[0.95rem] leading-[1.5] text-text-body xl:text-base xl:leading-[1.55]";
var row$1 = "rounded-[12px] border border-line bg-white px-4 py-3.5 md:rounded-[14px] md:px-[18px] md:py-4";
var callout = "m-0 flex flex-col gap-2.5 rounded-[16px] border-l-[5px] border-brand bg-alt px-[22px] py-5 md:rounded-[18px] md:px-[26px] md:py-[22px] xl:rounded-[20px] xl:border-l-[6px] xl:px-[30px] xl:py-[26px]";
var pillFill = "rounded-full bg-accent px-[22px] py-[11px] font-display text-[0.88rem] font-normal tracking-[0.04em] text-white no-underline transition-colors hover:bg-brand-deep md:text-[0.9rem]";
var pillOutline$1 = "rounded-full border-2 border-accent px-5 py-[9px] font-display text-[0.88rem] font-normal tracking-[0.04em] text-accent no-underline transition-colors hover:bg-accent hover:text-white md:text-[0.9rem]";
var linkAccent$1 = "self-start text-[0.95rem] font-bold text-accent no-underline hover:underline hover:underline-offset-4 md:text-[0.98rem]";
var chip$1 = "rounded-full border border-control bg-white px-3.5 py-2 text-[0.88rem] font-bold text-ink no-underline hover:border-accent hover:text-accent";
var RouteAbout_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "RouteAbout",
	__ssrInlineRender: true,
	props: { resolved: {} },
	async setup(__props) {
		let __temp, __restore;
		const props = __props;
		const lang = computed(() => props.resolved.lang);
		const uri = payloadSlug(props.resolved.route);
		const api = useChapterApi();
		const { data: site } = ([__temp, __restore] = withAsyncContext(() => useChapterSite(lang.value)), __temp = await __temp, __restore(), __temp);
		const { data: page } = ([__temp, __restore] = withAsyncContext(() => useChapterData(pageKey(lang.value, uri), () => fetchPage(api, uri, lang.value))), __temp = await __temp, __restore(), __temp);
		provideRouteLanguages(computed(() => page.value?.languages));
		useRouteSeo(computed(() => page.value?.seo), lang);
		const routes = useChapterRoutes();
		const home = computed(() => frontRoute(routes.value, lang.value)?.path ?? "/");
		const chapter = computed(() => site.value?.chapter);
		const s = computed(() => site.value?.strings ?? {});
		const about = computed(() => page.value?.about);
		const lede = computed(() => page.value?.lede || `A member-run chapter organizing for working people across ${chapter.value?.region_label ?? "our community"}.`);
		const navLinks = computed(() => (about.value?.nav ?? []).map((i) => ({
			label: i.label,
			href: i.href
		})));
		const documentLinks = computed(() => (about.value?.governance.docs ?? []).filter((d) => d.url).map((d) => ({
			label: d.title,
			href: d.url
		})));
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(page) && about.value && chapter.value) {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: "route-about contents" }, _attrs))}>`);
				_push(ssrRenderComponent(PageHeader_default, {
					title: unref(page).title || "About the Chapter",
					lede: lede.value,
					crumbs: [{
						label: s.value.blog_crumb_home ?? "Home",
						href: home.value
					}]
				}, null, _parent));
				if (about.value.mission.visible) _push(`<section id="mission-band" class="bg-ink px-6 py-10 text-white md:px-10 md:py-12 xl:px-6 xl:py-16" data-tone="ink"><div class="mx-auto flex max-w-[1140px] flex-col gap-3 md:gap-3.5 xl:gap-[18px]"><div class="text-[0.82rem] font-extrabold uppercase tracking-[0.12em] text-brand-light md:text-[0.85rem] xl:text-[0.9rem]">${ssrInterpolate(about.value.mission.eyebrow)}</div><p class="m-0 font-display text-[1.25rem] font-normal leading-[1.3] md:max-w-[36ch] md:text-[1.6rem] md:leading-[1.25] xl:max-w-[38ch] xl:text-[clamp(1.5rem,2.8vw,2.3rem)] xl:leading-[1.2]">${ssrInterpolate(about.value.mission.body)}</p></div></section>`);
				else _push(`<!---->`);
				_push(`<section class="bg-white px-6 pb-14 pt-11 md:px-10 md:pb-[72px] md:pt-14 xl:px-6 xl:pb-24 xl:pt-16" data-tone="white"><div class="mx-auto grid max-w-[1140px] items-start gap-10 md:gap-9 md:[grid-template-columns:minmax(0,1fr)_260px] xl:gap-14 xl:[grid-template-columns:minmax(300px,1fr)_310px]">`);
				if (about.value.nav.length) {
					_push(`<nav${ssrRenderAttr("aria-label", s.value.chrome_on_this_page ?? "On this page")} class="flex flex-wrap gap-2 md:hidden"><!--[-->`);
					ssrRenderList(about.value.nav, (item) => {
						_push(`<a${ssrRenderAttr("href", item.href)} class="${ssrRenderClass(chip$1)}">${ssrInterpolate(item.label)}</a>`);
					});
					_push(`<!--]--></nav>`);
				} else _push(`<!---->`);
				_push(`<article class="flex min-w-0 flex-col gap-5 md:gap-[22px] xl:gap-[26px]">`);
				if (about.value.chapter.visible) {
					_push(`<!--[--><h2 id="chapter" class="${ssrRenderClass(h2class$1)}">${ssrInterpolate(about.value.chapter.heading)}</h2><div class="${ssrRenderClass(prose$1)}">${about.value.chapter.p1 ?? ""}</div><div class="${ssrRenderClass(prose$1)}">${about.value.chapter.p2 ?? ""}</div>`);
					if (about.value.chapter.photo) {
						_push(`<figure class="m-0 my-1.5 flex flex-col md:my-2 xl:my-3">`);
						_push(ssrRenderComponent(DuotoneImage_default, {
							src: about.value.chapter.photo.src,
							alt: about.value.chapter.photo.alt,
							opacity: .3,
							class: "rounded-[16px] md:rounded-[18px] xl:rounded-[20px]",
							"img-class": "block h-auto w-full",
							loading: "lazy"
						}, null, _parent));
						if (about.value.chapter.photo.alt) _push(`<figcaption class="mt-2.5 text-[0.85rem] text-muted md:text-[0.88rem] xl:mt-3 xl:text-[0.9rem]">${ssrInterpolate(about.value.chapter.photo.alt)}</figcaption>`);
						else _push(`<!---->`);
						_push(`</figure>`);
					} else _push(`<!---->`);
					if (about.value.chapter.ctas.length) {
						_push(`<div class="flex flex-wrap gap-3"><!--[-->`);
						ssrRenderList(about.value.chapter.ctas, (cta, i) => {
							_push(`<a${ssrRenderAttr("href", cta.url)}${ssrRenderAttr("target", cta.external ? "_blank" : void 0)}${ssrRenderAttr("rel", cta.external ? "noopener" : void 0)} class="${ssrRenderClass(i === 0 ? pillFill : pillOutline$1)}">${ssrInterpolate(cta.label)}</a>`);
						});
						_push(`<!--]--></div>`);
					} else _push(`<!---->`);
					_push(`<!--]-->`);
				} else _push(`<!---->`);
				if (about.value.history.visible) {
					_push(`<!--[--><h2 id="mission" class="${ssrRenderClass([h2class$1, h2later$1])}">${ssrInterpolate(about.value.history.heading)}</h2><div class="${ssrRenderClass(prose$1)}">${about.value.history.body ?? ""}</div>`);
					if (about.value.history.timeline.length) {
						_push(`<ol class="m-0 flex list-none flex-col gap-2.5 p-0"><!--[-->`);
						ssrRenderList(about.value.history.timeline, (item) => {
							_push(`<li class="${ssrRenderClass(["grid items-baseline gap-3.5 [grid-template-columns:72px_1fr] md:gap-[18px] md:[grid-template-columns:90px_1fr]", row$1])}"><span class="font-display text-[0.95rem] font-normal text-brand md:text-base">${ssrInterpolate(item.year)}</span><span class="text-[0.95rem] leading-[1.55] text-text-body md:text-base">${item.text ?? ""}</span></li>`);
						});
						_push(`<!--]--></ol>`);
					} else _push(`<!---->`);
					_push(`<!--]-->`);
				} else _push(`<!---->`);
				if (about.value.counties.visible) {
					_push(`<!--[--><h2 id="counties" class="${ssrRenderClass([h2class$1, h2later$1])}">${ssrInterpolate(about.value.counties.heading)}</h2><div class="${ssrRenderClass(prose$1)}">${about.value.counties.intro ?? ""}</div><div class="${ssrRenderClass(cardGrid$1)}"><!--[-->`);
					ssrRenderList(about.value.counties.cards, (c) => {
						_push(`<div class="${ssrRenderClass(card$1)}"><div class="${ssrRenderClass(["notranslate", cardTitle$1])}">${ssrInterpolate(c.name)}</div>`);
						if (c.cities) _push(`<p class="${ssrRenderClass(["notranslate", cardDesc$1])}">${ssrInterpolate(c.cities)}</p>`);
						else _push(`<!---->`);
						if (c.note) _push(`<div class="mt-0.5 text-[0.82rem] font-bold text-accent">${ssrInterpolate(c.note)}</div>`);
						else _push(`<!---->`);
						_push(`</div>`);
					});
					_push(`<!--]--></div><!--]-->`);
				} else _push(`<!---->`);
				if (about.value.committees.visible) {
					_push(`<!--[--><h2 id="committees" class="${ssrRenderClass([h2class$1, h2later$1])}">${ssrInterpolate(about.value.committees.heading)}</h2><div class="${ssrRenderClass(prose$1)}">${about.value.committees.intro ?? ""}</div><div class="${ssrRenderClass(cardGrid$1)}"><!--[-->`);
					ssrRenderList(chapter.value.committees, (committee) => {
						_push(`<div class="${ssrRenderClass(card$1)}"><div class="${ssrRenderClass(cardTitle$1)}">${ssrInterpolate(committee.name)}</div><p class="${ssrRenderClass(cardDesc$1)}">${ssrInterpolate(committee.desc)}</p></div>`);
					});
					_push(`<!--]--></div>`);
					if (about.value.committees.link.url) _push(`<a${ssrRenderAttr("href", about.value.committees.link.url)}${ssrRenderAttr("target", about.value.committees.link.external ? "_blank" : void 0)}${ssrRenderAttr("rel", about.value.committees.link.external ? "noopener" : void 0)} class="${ssrRenderClass(linkAccent$1)}">${ssrInterpolate(about.value.committees.link.label)} →</a>`);
					else _push(`<!---->`);
					_push(`<!--]-->`);
				} else _push(`<!---->`);
				if (about.value.governance.visible) {
					_push(`<!--[--><h2 id="bylaws" class="${ssrRenderClass([h2class$1, h2later$1])}">${ssrInterpolate(about.value.governance.heading)}</h2><div class="${ssrRenderClass(prose$1)}">${about.value.governance.intro ?? ""}</div><div class="flex flex-col gap-2.5"><!--[-->`);
					ssrRenderList(about.value.governance.docs, (doc) => {
						_push(`<div class="${ssrRenderClass(["flex flex-col items-start gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-5", row$1])}"><div class="flex flex-col gap-[3px]"><span class="text-[1.02rem] font-bold md:text-[1.05rem]">${ssrInterpolate(doc.title)}</span>`);
						if (doc.covers) _push(`<span class="text-[0.9rem] leading-[1.5] text-muted">${ssrInterpolate(doc.covers)}</span>`);
						else _push(`<!---->`);
						_push(`</div>`);
						if (doc.url) _push(`<a${ssrRenderAttr("href", doc.url)} class="${ssrRenderClass(["whitespace-nowrap", pillOutline$1])}">${ssrInterpolate(doc.action)}</a>`);
						else _push(`<!---->`);
						_push(`</div>`);
					});
					_push(`<!--]--></div><!--]-->`);
				} else _push(`<!---->`);
				if (about.value.faq.visible) {
					_push(`<!--[--><h2 id="faq" class="${ssrRenderClass([h2class$1, h2later$1])}">${ssrInterpolate(about.value.faq.heading)}</h2>`);
					_push(ssrRenderComponent(FaqAccordion_default, { items: about.value.faq.rows }, null, _parent));
					_push(`<!--]-->`);
				} else _push(`<!---->`);
				if (about.value.dues.visible) _push(`<aside id="dues" class="${ssrRenderClass(["mt-1.5", callout])}"><div class="font-display text-base font-normal text-brand md:text-[1.05rem]">${ssrInterpolate(about.value.dues.heading)}</div><div class="text-base leading-[1.65] text-text-body [&amp;_p]:m-0 [&amp;_p+p]:mt-3 [&amp;_a]:font-bold [&amp;_a]:text-accent [&amp;_a]:underline [&amp;_a]:underline-offset-[3px]">${about.value.dues.body ?? ""}</div><a${ssrRenderAttr("href", chapter.value.join_url)} target="_blank" rel="noopener" class="${ssrRenderClass(["mt-1 self-start", pillFill])}">${ssrInterpolate(s.value.about_dues_cta ?? "Update my dues")}</a></aside>`);
				else _push(`<!---->`);
				_push(`</article><aside${ssrRenderAttr("aria-label", s.value.chrome_related ?? "Related")} class="flex flex-col gap-5 md:sticky md:top-[calc(120px+var(--wp-admin--admin-bar--height,0px))] xl:top-[calc(108px+var(--wp-admin--admin-bar--height,0px))] xl:gap-6">`);
				if (navLinks.value.length) {
					_push(`<div class="hidden md:contents">`);
					_push(ssrRenderComponent(LinkListCard_default, {
						heading: s.value.chrome_on_this_page ?? "On this page",
						links: navLinks.value
					}, null, _parent));
					_push(`</div>`);
				} else _push(`<!---->`);
				if (unref(page).newhere) _push(ssrRenderComponent(CtaCard_default, {
					id: "involved",
					title: unref(page).newhere.heading,
					body: unref(page).newhere.body,
					href: unref(page).newhere.url,
					label: unref(page).newhere.link_label,
					external: unref(page).newhere.external
				}, null, _parent));
				else _push(`<!---->`);
				if (about.value.governance.visible && documentLinks.value.length) _push(ssrRenderComponent(LinkListCard_default, {
					id: "documents",
					heading: s.value.interior_documents ?? "Documents",
					links: documentLinks.value
				}, null, _parent));
				else _push(`<!---->`);
				if (chapter.value.contact_email) _push(ssrRenderComponent(DashedNote_default, {
					id: "contact",
					heading: s.value.interior_contact ?? "Contact"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`<p${_scopeId}>${ssrInterpolate(s.value.interior_contact_p ?? "Questions, ideas, or press —")} <a class="notranslate"${ssrRenderAttr("href", `mailto:${chapter.value.contact_email}`)}${_scopeId}>${ssrInterpolate(chapter.value.contact_email)}</a></p>`);
						else return [createVNode("p", null, [createTextVNode(toDisplayString(s.value.interior_contact_p ?? "Questions, ideas, or press —") + " ", 1), createVNode("a", {
							class: "notranslate",
							href: `mailto:${chapter.value.contact_email}`
						}, toDisplayString(chapter.value.contact_email), 9, ["href"])])];
					}),
					_: 1
				}, _parent));
				else _push(`<!---->`);
				_push(`</aside></div></section>`);
				_push(ssrRenderComponent(SubscribeStrip_default, {
					href: chapter.value.newsletter_url,
					title: s.value.interior_subscribe_h ?? "Never miss an update",
					lede: s.value.interior_subscribe_p ?? "One email when something new lands — meetings, actions, and posts. No spam, ever.",
					label: s.value.interior_subscribe_cta ?? "Subscribe"
				}, null, _parent));
				_push(`</div>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region app/components/routes/RouteAbout.vue
var _sfc_setup$30 = RouteAbout_vue_vue_type_script_setup_true_lang_default.setup;
RouteAbout_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/routes/RouteAbout.vue");
	return _sfc_setup$30 ? _sfc_setup$30(props, ctx) : void 0;
};
var RouteAbout_default = RouteAbout_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/routes/RouteGetInvolved.vue?vue&type=script&setup=true&lang.ts
var h2class = "m-0 scroll-mt-[calc(110px+var(--wp-admin--admin-bar--height,0px))] font-display text-[1.35rem] font-normal leading-[1.2] md:text-[1.6rem] md:leading-[1.15] xl:text-[clamp(1.6rem,2.6vw,2.2rem)] xl:leading-[1.1]";
var h2later = "mt-3.5 xl:mt-[18px]";
var prose = "text-[1.02rem] leading-[1.65] text-text-body md:text-[1.05rem] xl:text-[1.12rem] [&_p]:m-0 [&_p+p]:mt-4 [&_a]:font-bold [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-[3px] hover:[&_a]:text-brand-deep [&_ul]:my-0 [&_ul]:list-[square] [&_ul]:pl-5 [&_ol]:my-0 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-extrabold [&_strong]:text-ink";
var proseSm = "text-base leading-[1.65] text-text-body [&_p]:m-0 [&_p+p]:mt-3 [&_a]:font-bold [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-[3px] hover:[&_a]:text-brand-deep [&_strong]:font-extrabold [&_strong]:text-ink";
var cardGrid = "grid gap-3.5 md:grid-cols-2 md:gap-4 xl:gap-5 xl:[grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]";
var card = "flex flex-col gap-1.5 rounded-[16px] bg-white px-5 py-[18px] shadow-card md:gap-[7px] md:rounded-[18px] md:px-[22px] md:py-5 xl:gap-2 xl:rounded-[20px] xl:px-6 xl:py-[22px]";
var cardTitle = "font-display text-[0.98rem] font-normal text-brand [text-wrap:balance] md:text-base xl:text-[1.05rem]";
var cardDesc = "m-0 text-[0.95rem] leading-[1.5] text-text-body xl:text-base xl:leading-[1.55]";
var row = "rounded-[12px] border border-line bg-white px-4 py-3.5 md:rounded-[14px] md:px-[18px] md:py-4";
var pillOutline = "rounded-full border-2 border-accent px-5 py-[9px] font-display text-[0.88rem] font-normal tracking-[0.04em] text-accent no-underline transition-colors hover:bg-accent hover:text-white md:text-[0.9rem]";
var linkAccent = "self-start text-[0.95rem] font-bold text-accent no-underline hover:underline hover:underline-offset-4 md:text-[0.98rem]";
var chip = "rounded-full border border-control bg-white px-3.5 py-2 text-[0.88rem] font-bold text-ink no-underline hover:border-accent hover:text-accent";
var RouteGetInvolved_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "RouteGetInvolved",
	__ssrInlineRender: true,
	props: { resolved: {} },
	async setup(__props) {
		let __temp, __restore;
		const props = __props;
		const lang = computed(() => props.resolved.lang);
		const uri = payloadSlug(props.resolved.route);
		const api = useChapterApi();
		const { data: site } = ([__temp, __restore] = withAsyncContext(() => useChapterSite(lang.value)), __temp = await __temp, __restore(), __temp);
		const { data: page } = ([__temp, __restore] = withAsyncContext(() => useChapterData(pageKey(lang.value, uri), () => fetchPage(api, uri, lang.value))), __temp = await __temp, __restore(), __temp);
		provideRouteLanguages(computed(() => page.value?.languages));
		useRouteSeo(computed(() => page.value?.seo), lang);
		const routes = useChapterRoutes();
		const home = computed(() => frontRoute(routes.value, lang.value)?.path ?? "/");
		const chapter = computed(() => site.value?.chapter);
		const s = computed(() => site.value?.strings ?? {});
		const gi = computed(() => page.value?.gi);
		const lede = computed(() => page.value?.lede || "No experience needed, no perfect politics required. If you want a better world, there's a place for you here.");
		const navLinks = computed(() => (gi.value?.nav ?? []).map((i) => ({
			label: i.label,
			href: i.href
		})));
		const documentLinks = computed(() => (page.value?.documents ?? []).map((d) => ({
			label: d.title,
			href: d.url
		})));
		const relatedLinks = computed(() => (gi.value?.related ?? []).map((l) => ({
			label: l.label,
			href: l.url,
			external: l.external
		})));
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(page) && gi.value && chapter.value) {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: "route-get-involved contents" }, _attrs))}>`);
				_push(ssrRenderComponent(PageHeader_default, {
					title: unref(page).title || "Get involved",
					lede: lede.value,
					crumbs: [{
						label: s.value.blog_crumb_home ?? "Home",
						href: home.value
					}]
				}, null, _parent));
				_push(`<section class="bg-white px-6 pb-14 pt-11 md:px-10 md:pb-[72px] md:pt-14 xl:px-6 xl:pb-24 xl:pt-16" data-tone="white"><div class="mx-auto grid max-w-[1140px] items-start gap-10 md:gap-9 md:[grid-template-columns:minmax(0,1fr)_260px] xl:gap-14 xl:[grid-template-columns:minmax(300px,1fr)_310px]">`);
				if (gi.value.nav.length) {
					_push(`<nav${ssrRenderAttr("aria-label", s.value.chrome_on_this_page ?? "On this page")} class="flex flex-wrap gap-2 md:hidden"><!--[-->`);
					ssrRenderList(gi.value.nav, (item) => {
						_push(`<a${ssrRenderAttr("href", item.href)} class="${ssrRenderClass(chip)}">${ssrInterpolate(item.label)}</a>`);
					});
					_push(`<!--]--></nav>`);
				} else _push(`<!---->`);
				_push(`<article class="flex min-w-0 flex-col gap-5 md:gap-[22px] xl:gap-[26px]">`);
				if (gi.value.join.visible) {
					_push(`<!--[--><h2 id="join" class="${ssrRenderClass(h2class)}">${ssrInterpolate(gi.value.join.heading)}</h2><ol class="m-0 flex list-none flex-col gap-3.5 p-0"><!--[-->`);
					ssrRenderList(gi.value.join.steps, (step, i) => {
						_push(`<li class="grid grid-cols-[48px_1fr] gap-4 rounded-[16px] bg-white p-5 shadow-card md:grid-cols-[56px_1fr] md:gap-5 md:rounded-[18px] md:p-6 xl:rounded-[20px]"><div aria-hidden="true" class="flex size-12 items-center justify-center rounded-[12px] bg-brand font-display text-[1.4rem] font-normal text-white md:size-14 md:text-[1.6rem]">${ssrInterpolate(i + 1)}</div><div class="flex flex-col gap-2"><div class="text-[1.05rem] font-bold md:text-[1.1rem]">${ssrInterpolate(step.title)}</div><div class="${ssrRenderClass(proseSm)}">${step.body ?? ""}</div>`);
						if (step.link_label && step.href) _push(`<a${ssrRenderAttr("href", step.href)}${ssrRenderAttr("target", step.external ? "_blank" : void 0)}${ssrRenderAttr("rel", step.external ? "noopener" : void 0)} class="${ssrRenderClass(linkAccent)}">${ssrInterpolate(step.link_label)}</a>`);
						else _push(`<!---->`);
						_push(`</div></li>`);
					});
					_push(`<!--]--></ol><!--]-->`);
				} else _push(`<!---->`);
				if (gi.value.committees.visible) {
					_push(`<!--[--><h2 id="committees" class="${ssrRenderClass([h2class, h2later])}">${ssrInterpolate(gi.value.committees.heading)}</h2><div class="${ssrRenderClass(prose)}">${gi.value.committees.intro ?? ""}</div><div class="${ssrRenderClass(cardGrid)}"><!--[-->`);
					ssrRenderList(chapter.value.committees, (committee) => {
						_push(`<div class="${ssrRenderClass(card)}"><div class="${ssrRenderClass(cardTitle)}">${ssrInterpolate(committee.name)}</div><p class="${ssrRenderClass(cardDesc)}">${ssrInterpolate(committee.desc)}</p></div>`);
					});
					_push(`<!--]--></div><!--]-->`);
				} else _push(`<!---->`);
				if (gi.value.channels.visible) {
					_push(`<!--[--><h2 id="channels" class="${ssrRenderClass([h2class, h2later])}">${ssrInterpolate(gi.value.channels.heading)}</h2><div class="flex flex-col gap-2.5"><!--[-->`);
					ssrRenderList(gi.value.channels.items, (channel) => {
						_push(`<div class="${ssrRenderClass(["flex flex-col items-start gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-5", row])}"><div class="flex flex-col gap-[3px]"><span class="text-[1.02rem] font-bold md:text-[1.05rem]">${channel.label ?? ""}</span>`);
						if (channel.desc) _push(`<span class="text-[0.9rem] leading-[1.5] text-muted">${ssrInterpolate(channel.desc)}</span>`);
						else _push(`<!---->`);
						_push(`</div>`);
						if (channel.url && channel.link_label) _push(`<a${ssrRenderAttr("href", channel.url)}${ssrRenderAttr("target", channel.external ? "_blank" : void 0)}${ssrRenderAttr("rel", channel.external ? "noopener" : void 0)} class="${ssrRenderClass(["whitespace-nowrap", pillOutline])}">${ssrInterpolate(channel.link_label)}</a>`);
						else if (channel.badge) _push(`<span class="rounded-full border border-dashed border-border-muted px-4 py-2 text-[0.8rem] font-bold text-muted">${ssrInterpolate(channel.badge)}</span>`);
						else _push(`<!---->`);
						_push(`</div>`);
					});
					_push(`<!--]--></div><!--]-->`);
				} else _push(`<!---->`);
				if (gi.value.faq.visible) {
					_push(`<!--[--><h2 id="faq" class="${ssrRenderClass([h2class, h2later])}">${ssrInterpolate(gi.value.faq.heading)}</h2>`);
					_push(ssrRenderComponent(FaqAccordion_default, { items: gi.value.faq.items }, null, _parent));
					_push(`<!--]-->`);
				} else _push(`<!---->`);
				_push(`</article><aside${ssrRenderAttr("aria-label", s.value.chrome_related ?? "Related")} class="flex flex-col gap-5 md:sticky md:top-[calc(120px+var(--wp-admin--admin-bar--height,0px))] xl:top-[calc(108px+var(--wp-admin--admin-bar--height,0px))] xl:gap-6">`);
				if (navLinks.value.length) {
					_push(`<div class="hidden md:contents">`);
					_push(ssrRenderComponent(LinkListCard_default, {
						heading: s.value.chrome_on_this_page ?? "On this page",
						links: navLinks.value
					}, null, _parent));
					_push(`</div>`);
				} else _push(`<!---->`);
				_push(ssrRenderComponent(CtaCard_default, {
					id: "involved",
					title: gi.value.card.heading,
					body: gi.value.card.body,
					href: gi.value.card.url,
					label: gi.value.card.link_label,
					external: gi.value.card.external
				}, null, _parent));
				if (documentLinks.value.length) _push(ssrRenderComponent(LinkListCard_default, {
					id: "documents",
					heading: s.value.interior_documents ?? "Documents",
					links: documentLinks.value
				}, null, _parent));
				else _push(`<!---->`);
				if (relatedLinks.value.length) _push(ssrRenderComponent(LinkListCard_default, {
					heading: s.value.chrome_related ?? "Related",
					links: relatedLinks.value
				}, null, _parent));
				else _push(`<!---->`);
				if (chapter.value.contact_email) _push(ssrRenderComponent(DashedNote_default, {
					id: "contact",
					heading: s.value.interior_contact ?? "Contact"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`<p${_scopeId}>${ssrInterpolate(s.value.interior_contact_p ?? "Questions, ideas, or press —")} <a class="notranslate"${ssrRenderAttr("href", `mailto:${chapter.value.contact_email}`)}${_scopeId}>${ssrInterpolate(chapter.value.contact_email)}</a></p>`);
						else return [createVNode("p", null, [createTextVNode(toDisplayString(s.value.interior_contact_p ?? "Questions, ideas, or press —") + " ", 1), createVNode("a", {
							class: "notranslate",
							href: `mailto:${chapter.value.contact_email}`
						}, toDisplayString(chapter.value.contact_email), 9, ["href"])])];
					}),
					_: 1
				}, _parent));
				else _push(`<!---->`);
				_push(`</aside></div></section>`);
				_push(ssrRenderComponent(SubscribeStrip_default, {
					href: chapter.value.newsletter_url,
					title: s.value.interior_subscribe_h ?? "Never miss an update",
					lede: s.value.interior_subscribe_p ?? "One email when something new lands — meetings, actions, and posts. No spam, ever.",
					label: s.value.interior_subscribe_cta ?? "Subscribe"
				}, null, _parent));
				_push(`</div>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region app/components/routes/RouteGetInvolved.vue
var _sfc_setup$29 = RouteGetInvolved_vue_vue_type_script_setup_true_lang_default.setup;
RouteGetInvolved_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/routes/RouteGetInvolved.vue");
	return _sfc_setup$29 ? _sfc_setup$29(props, ctx) : void 0;
};
var RouteGetInvolved_default = RouteGetInvolved_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/routes/RouteCalendar.vue?vue&type=script&setup=true&lang.ts
var RouteCalendar_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "RouteCalendar",
	__ssrInlineRender: true,
	props: { resolved: {} },
	async setup(__props) {
		let __temp, __restore;
		const props = __props;
		const lang = computed(() => props.resolved.lang);
		const uri = payloadSlug(props.resolved.route);
		const api = useChapterApi();
		const { data: site } = ([__temp, __restore] = withAsyncContext(() => useChapterSite(lang.value)), __temp = await __temp, __restore(), __temp);
		const { data: page } = ([__temp, __restore] = withAsyncContext(() => useChapterData(pageKey(lang.value, uri), () => fetchPage(api, uri, lang.value))), __temp = await __temp, __restore(), __temp);
		provideRouteLanguages(computed(() => page.value?.languages));
		useRouteSeo(computed(() => page.value?.seo), lang);
		const routes = useChapterRoutes();
		const home = computed(() => frontRoute(routes.value, lang.value)?.path ?? "/");
		const str = (key, fallback) => site.value?.strings[key] || fallback;
		computed(() => ({
			subscribeTitle: str("cal_subscribe_h", "Subscribe to the calendar"),
			subscribeLede: str("cal_subscribe_p", "Add every meeting and action to your own calendar automatically."),
			googleLabel: str("cal_google", "Google Calendar"),
			icsLabel: str("cal_ics", "iCal / .ics"),
			monthLabelText: str("cal_month", "Month"),
			listLabelText: str("cal_list", "List"),
			viewLabel: str("home_view_event", "View event"),
			emptyTitle: str("cal_empty_h", "Nothing scheduled this month"),
			emptyBody: str("cal_empty_p", "Check the next month or subscribe below and never miss one.")
		}));
		const lede = computed(() => page.value?.lede || `Meetings, actions, trainings, and socials across ${site.value?.chapter.region_label ?? "our community"}. Everything is open to the public unless noted — bring a friend.`);
		return (_ctx, _push, _parent, _attrs) => {
			const _component_ClientOnly = ClientOnly;
			if (unref(page)) {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: "route-calendar contents" }, _attrs))}>`);
				_push(ssrRenderComponent(PageHeader_default, {
					title: unref(page).title || str("cal_title", "Event calendar"),
					lede: lede.value,
					crumbs: [{
						label: str("blog_crumb_home", "Home"),
						href: home.value
					}],
					wide: ""
				}, null, _parent));
				_push(ssrRenderComponent(_component_ClientOnly, null, { fallback: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<section class="bg-white px-6 py-10 md:py-14" data-tone="white" aria-busy="true"${_scopeId}><div class="mx-auto max-w-[1200px] animate-pulse rounded-[20px] bg-alt" style="${ssrRenderStyle({ "min-height": "520px" })}"${_scopeId}></div></section>`);
					else return [createVNode("section", {
						class: "bg-white px-6 py-10 md:py-14",
						"data-tone": "white",
						"aria-busy": "true"
					}, [createVNode("div", {
						class: "mx-auto max-w-[1200px] animate-pulse rounded-[20px] bg-alt",
						style: { "min-height": "520px" }
					})])];
				}) }, _parent));
				_push(`</div>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region app/components/routes/RouteCalendar.vue
var _sfc_setup$28 = RouteCalendar_vue_vue_type_script_setup_true_lang_default.setup;
RouteCalendar_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/routes/RouteCalendar.vue");
	return _sfc_setup$28 ? _sfc_setup$28(props, ctx) : void 0;
};
var RouteCalendar_default = RouteCalendar_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/blog/ImageSlot.vue?vue&type=script&setup=true&lang.ts
var ImageSlot_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "ImageSlot",
	__ssrInlineRender: true,
	props: {
		src: { default: null },
		alt: { default: "" },
		label: { default: "" },
		opacity: { default: 0 },
		loading: { default: void 0 }
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			if (__props.src) _push(ssrRenderComponent(DuotoneImage_default, mergeProps({
				src: __props.src,
				alt: __props.alt,
				opacity: __props.opacity,
				loading: __props.loading,
				class: "image-slot size-full",
				"img-class": "block size-full object-cover"
			}, _attrs), null, _parent));
			else {
				_push(`<div${ssrRenderAttrs(mergeProps({
					"aria-hidden": "true",
					class: "image-slot flex size-full items-center justify-center bg-[repeating-linear-gradient(45deg,var(--color-alt)_0_14px,var(--color-control-faint)_14px_28px)]"
				}, _attrs))}>`);
				if (__props.label) _push(`<span class="font-mono text-[0.78rem] text-muted">${ssrInterpolate(__props.label)}</span>`);
				else _push(`<!---->`);
				_push(`</div>`);
			}
		};
	}
});
//#endregion
//#region app/components/site/blog/ImageSlot.vue
var _sfc_setup$27 = ImageSlot_vue_vue_type_script_setup_true_lang_default.setup;
ImageSlot_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/blog/ImageSlot.vue");
	return _sfc_setup$27 ? _sfc_setup$27(props, ctx) : void 0;
};
var ImageSlot_default = ImageSlot_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/blog/FeaturedPostCard.vue?vue&type=script&setup=true&lang.ts
var FeaturedPostCard_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "FeaturedPostCard",
	__ssrInlineRender: true,
	props: {
		post: {},
		featuredLabel: {},
		readLabel: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<a${ssrRenderAttrs(mergeProps({
				href: __props.post.url,
				"data-blog-link": "",
				class: "featured-post-card grid overflow-hidden rounded-[18px] bg-white text-ink no-underline shadow-featured transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-card-hover-lg lg:rounded-[24px] lg:[grid-template-columns:minmax(300px,1.2fr)_minmax(280px,1fr)]"
			}, _attrs))}><span class="relative block aspect-video overflow-hidden lg:aspect-auto lg:min-h-[300px]" data-post-image>`);
			_push(ssrRenderComponent(ImageSlot_default, {
				class: "absolute inset-0",
				src: __props.post.image?.src,
				alt: __props.post.image?.alt,
				opacity: .3,
				loading: "eager"
			}, null, _parent));
			_push(`<span class="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.06em] text-white lg:left-4 lg:top-4 lg:px-3.5 lg:py-[5px] lg:text-[0.75rem]">${ssrInterpolate(__props.featuredLabel ?? "Featured")}</span></span><span class="flex flex-col justify-center gap-2 px-5 pb-[22px] pt-[18px] lg:gap-3 lg:px-10 lg:py-9"><span class="text-[0.82rem] font-semibold text-muted lg:text-[0.85rem]">${ssrInterpolate(__props.post.date)}`);
			if (__props.post.readMinutes) _push(`<!--[--> · ${ssrInterpolate(__props.post.readMinutes)} min read<!--]-->`);
			else _push(`<!---->`);
			_push(`</span><span class="font-display text-[1.15rem] leading-[1.25] [text-wrap:balance] lg:text-[clamp(1.3rem,2.4vw,1.7rem)] lg:leading-[1.2]">${ssrInterpolate(__props.post.title)}</span><span class="text-[0.95rem] leading-[1.55] text-muted lg:text-[1.05rem] lg:leading-[1.6]">${ssrInterpolate(__props.post.dek ?? __props.post.excerpt)}</span><span class="mt-1 hidden items-center gap-3 text-[0.95rem] font-extrabold uppercase tracking-[0.03em] text-accent lg:flex">${ssrInterpolate(__props.readLabel ?? "Read the post")} <svg aria-hidden="true" focusable="false" viewBox="0 0 40 20" class="h-4 w-8 flex-none fill-accent"><path d="M0 8.4h26v3.2H0z"></path><path d="M24 1.5 38.5 10 24 18.5Z"></path></svg></span></span></a>`);
		};
	}
});
//#endregion
//#region app/components/site/blog/FeaturedPostCard.vue
var _sfc_setup$26 = FeaturedPostCard_vue_vue_type_script_setup_true_lang_default.setup;
FeaturedPostCard_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/blog/FeaturedPostCard.vue");
	return _sfc_setup$26 ? _sfc_setup$26(props, ctx) : void 0;
};
var FeaturedPostCard_default = FeaturedPostCard_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/lib/posts.ts
var POST_CATEGORIES = reactive([]);
watchSyncEffect(() => {
	POST_CATEGORIES.splice(0, POST_CATEGORIES.length, ...EVENT_CATEGORIES.map((c) => c.id === "all" ? {
		...c,
		label: "All posts"
	} : c));
});
function postCategoryById(id) {
	return POST_CATEGORIES.find((c) => c.id === id) ?? POST_CATEGORIES[0];
}
//#endregion
//#region app/components/site/blog/CategoryTag.vue?vue&type=script&setup=true&lang.ts
var CategoryTag_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "CategoryTag",
	__ssrInlineRender: true,
	props: {
		catId: {},
		href: { default: "" },
		variant: { default: "solid" },
		size: { default: "md" }
	},
	setup(__props) {
		const props = __props;
		const category = computed(() => postCategoryById(props.catId));
		const variantClass = computed(() => ({
			solid: "rounded-full bg-brand text-white",
			white: "rounded-full bg-white text-brand",
			text: "text-brand"
		})[props.variant]);
		const sizeClass = computed(() => {
			if (props.variant === "text") return props.size === "sm" ? "text-[0.72rem]" : "text-[0.78rem]";
			return props.size === "sm" ? "px-3 py-1 text-[0.72rem]" : "px-3.5 py-[5px] text-[0.78rem]";
		});
		return (_ctx, _push, _parent, _attrs) => {
			ssrRenderVNode(_push, createVNode(resolveDynamicComponent(__props.href ? "a" : "span"), mergeProps({
				href: __props.href || void 0,
				class: ["category-tag inline-block self-start font-bold uppercase tracking-[0.06em] no-underline", [
					variantClass.value,
					sizeClass.value,
					__props.href ? "hover:underline hover:underline-offset-4" : ""
				]]
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(category.value.label)}`);
					else return [createTextVNode(toDisplayString(category.value.label), 1)];
				}),
				_: 1
			}), _parent);
		};
	}
});
//#endregion
//#region app/components/site/blog/CategoryTag.vue
var _sfc_setup$25 = CategoryTag_vue_vue_type_script_setup_true_lang_default.setup;
CategoryTag_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/blog/CategoryTag.vue");
	return _sfc_setup$25 ? _sfc_setup$25(props, ctx) : void 0;
};
var CategoryTag_default = CategoryTag_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/blog/PostCard.vue?vue&type=script&setup=true&lang.ts
var PostCard_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "PostCard",
	__ssrInlineRender: true,
	props: {
		post: {},
		variant: { default: "grid" },
		readTime: {
			type: Boolean,
			default: false
		}
	},
	setup(__props) {
		const props = __props;
		const isGrid = computed(() => props.variant === "grid");
		const meta = computed(() => {
			const min = props.post.readMinutes;
			return (isGrid.value || props.readTime) && min ? `${props.post.date} · ${min} min read` : props.post.date;
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<a${ssrRenderAttrs(mergeProps({
				href: __props.post.url,
				"data-blog-link": "",
				class: ["post-card grid overflow-hidden rounded-[16px] bg-white text-ink no-underline shadow-card transition-[box-shadow,transform] duration-150 [grid-template-columns:96px_1fr] hover:-translate-y-0.5 hover:shadow-card-hover-lg md:flex md:flex-1 md:flex-col", isGrid.value ? "md:rounded-[24px]" : "md:rounded-[20px]"]
			}, _attrs))}><span class="relative block min-h-[96px] overflow-hidden md:aspect-video md:min-h-0" aria-hidden="true" data-post-image>`);
			_push(ssrRenderComponent(ImageSlot_default, {
				class: "absolute inset-0",
				src: __props.post.image?.src,
				alt: __props.post.image?.alt,
				opacity: 0,
				loading: "lazy"
			}, null, _parent));
			if (isGrid.value) {
				_push(`<span class="absolute left-3 top-3 hidden md:block">`);
				_push(ssrRenderComponent(CategoryTag_default, {
					"cat-id": __props.post.cat,
					variant: "white",
					size: "sm"
				}, null, _parent));
				_push(`</span>`);
			} else _push(`<!---->`);
			_push(`</span><span class="${ssrRenderClass([isGrid.value ? "md:px-6 md:pb-[26px] md:pt-[22px]" : "md:px-[22px] md:pb-6 md:pt-5", "flex flex-col justify-center gap-[5px] px-4 py-3 md:justify-start md:gap-2"])}">`);
			_push(ssrRenderComponent(CategoryTag_default, {
				"cat-id": __props.post.cat,
				variant: "text",
				size: "sm",
				class: isGrid.value ? "md:hidden" : "md:text-[0.78rem]"
			}, null, _parent));
			_push(`<span class="${ssrRenderClass([isGrid.value ? "md:text-[1.12rem]" : "md:text-[1.05rem]", "text-[0.95rem] font-bold leading-[1.3] md:font-extrabold"])}">${ssrInterpolate(__props.post.title)}</span><span class="${ssrRenderClass([isGrid.value ? "md:order-first" : "", "text-[0.8rem] font-semibold text-muted md:text-[0.85rem]"])}"><span class="md:hidden">${ssrInterpolate(__props.readTime ? meta.value : __props.post.date)}</span><span class="hidden md:inline">${ssrInterpolate(meta.value)}</span></span>`);
			if (isGrid.value && __props.post.excerpt) _push(`<span class="hidden text-[0.98rem] leading-[1.55] text-muted md:block">${ssrInterpolate(__props.post.excerpt)}</span>`);
			else _push(`<!---->`);
			_push(`</span></a>`);
		};
	}
});
//#endregion
//#region app/components/site/blog/PostCard.vue
var _sfc_setup$24 = PostCard_vue_vue_type_script_setup_true_lang_default.setup;
PostCard_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/blog/PostCard.vue");
	return _sfc_setup$24 ? _sfc_setup$24(props, ctx) : void 0;
};
var PostCard_default = PostCard_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/routes/RoutePostsIndex.vue?vue&type=script&setup=true&lang.ts
var RoutePostsIndex_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "RoutePostsIndex",
	__ssrInlineRender: true,
	props: { resolved: {} },
	async setup(__props) {
		let __temp, __restore;
		const props = __props;
		const lang = computed(() => props.resolved.lang);
		const api = useChapterApi();
		const { data: site } = ([__temp, __restore] = withAsyncContext(() => useChapterSite(lang.value)), __temp = await __temp, __restore(), __temp);
		const route = props.resolved.route;
		const isSearch = props.resolved.kind === "search";
		const serverPage = props.resolved.page;
		const isDefaultBrowse = !isSearch && props.resolved.category === "" && serverPage === 1;
		const pageData = route && route.kind === "posts_index" ? ([__temp, __restore] = withAsyncContext(() => useChapterData(pageKey(lang.value, payloadSlug(route)), () => fetchPage(api, payloadSlug(route), lang.value))), __temp = await __temp, __restore(), __temp) : null;
		const page = computed(() => pageData?.data.value ?? null);
		const postsData = isSearch ? null : ([__temp, __restore] = withAsyncContext(() => useChapterData(postsKey(lang.value, serverPage, props.resolved.category), () => fetchPosts(api, {
			lang: lang.value,
			page: serverPage,
			category: props.resolved.category || void 0
		}))), __temp = await __temp, __restore(), __temp);
		const posts = computed(() => postsData?.data.value ?? null);
		provideRouteLanguages(computed(() => page.value?.languages ?? site.value?.languages));
		useRouteSeo(computed(() => {
			const seo = page.value?.seo;
			if (!seo) return void 0;
			return isDefaultBrowse ? seo : {
				...seo,
				robots: "noindex,follow"
			};
		}), lang);
		const routes = useChapterRoutes();
		const home = computed(() => frontRoute(routes.value, lang.value)?.path ?? "/");
		const basePath = computed(() => route?.path ?? props.resolved.path);
		const title = computed(() => {
			if (isSearch) return `Search results for ${props.resolved.search}`;
			if (props.resolved.category) return postCategoryById(props.resolved.category).label;
			return page.value?.title || "From the blog";
		});
		const lede = computed(() => isSearch || props.resolved.category ? "" : page.value?.lede || `News, analysis, and dispatches from chapter organizers across ${site.value?.chapter.region_label ?? "our community"}.`);
		const strings = computed(() => ({
			blog_crumb_home: site.value?.strings.blog_crumb_home || "Home",
			blog_featured: site.value?.strings.blog_featured || "Featured",
			home_blog_read: site.value?.strings.home_blog_read || "Read the post",
			blog_subscribe_h: site.value?.strings.blog_subscribe_h || "Never miss a post",
			blog_subscribe_p: site.value?.strings.blog_subscribe_p || "One email when we publish. No spam, no lists sold — ever.",
			blog_subscribe_cta: site.value?.strings.blog_subscribe_cta || "Subscribe"
		}));
		const fallbackFeatured = computed(() => {
			const list = posts.value?.posts ?? [];
			return list.find((p) => p.featured) ?? list[0];
		});
		const fallbackGrid = computed(() => (posts.value?.posts ?? []).filter((p) => p.id !== fallbackFeatured.value?.id));
		const pagination = computed(() => {
			const env = posts.value;
			if (!env || env.totalPages <= 1) return void 0;
			const out = {};
			if (env.page > 1) out.newerUrl = env.page === 2 ? basePath.value : `${basePath.value}page/${env.page - 1}/`;
			if (env.page < env.totalPages) out.olderUrl = `${basePath.value}page/${env.page + 1}/`;
			return out;
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_ClientOnly = ClientOnly;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "route-posts-index contents" }, _attrs))}>`);
			_push(ssrRenderComponent(PageHeader_default, {
				title: title.value,
				lede: lede.value,
				crumbs: [{
					label: strings.value.blog_crumb_home,
					href: home.value
				}],
				wide: ""
			}, null, _parent));
			_push(ssrRenderComponent(_component_ClientOnly, null, { fallback: withCtx((_, _push, _parent, _scopeId) => {
				if (_push) {
					_push(`<section class="bg-white px-6 pb-14 pt-6 md:pb-[72px] md:pt-8" data-tone="white"${_scopeId}><div class="mx-auto flex max-w-[1200px] flex-col gap-6"${_scopeId}>`);
					if (fallbackFeatured.value) _push(ssrRenderComponent(FeaturedPostCard_default, {
						post: fallbackFeatured.value,
						"featured-label": strings.value.blog_featured,
						"read-label": strings.value.home_blog_read
					}, null, _parent, _scopeId));
					else _push(`<!---->`);
					_push(`<div class="flex flex-col gap-3 md:grid md:gap-7 md:[grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]"${_scopeId}><!--[-->`);
					ssrRenderList(fallbackGrid.value, (p) => {
						_push(ssrRenderComponent(PostCard_default, {
							key: p.id,
							post: p,
							variant: "grid"
						}, null, _parent, _scopeId));
					});
					_push(`<!--]--></div>`);
					if (pagination.value) {
						_push(`<nav class="flex justify-center gap-4" aria-label="Pagination"${_scopeId}>`);
						if (pagination.value.newerUrl) _push(`<a${ssrRenderAttr("href", pagination.value.newerUrl)} class="font-extrabold text-ink no-underline hover:underline"${_scopeId}>← Prev</a>`);
						else _push(`<!---->`);
						if (pagination.value.olderUrl) _push(`<a${ssrRenderAttr("href", pagination.value.olderUrl)} class="font-extrabold text-ink no-underline hover:underline"${_scopeId}>Next →</a>`);
						else _push(`<!---->`);
						_push(`</nav>`);
					} else _push(`<!---->`);
					_push(`</div></section>`);
				} else return [createVNode("section", {
					class: "bg-white px-6 pb-14 pt-6 md:pb-[72px] md:pt-8",
					"data-tone": "white"
				}, [createVNode("div", { class: "mx-auto flex max-w-[1200px] flex-col gap-6" }, [
					fallbackFeatured.value ? (openBlock(), createBlock(FeaturedPostCard_default, {
						key: 0,
						post: fallbackFeatured.value,
						"featured-label": strings.value.blog_featured,
						"read-label": strings.value.home_blog_read
					}, null, 8, [
						"post",
						"featured-label",
						"read-label"
					])) : createCommentVNode("", true),
					createVNode("div", { class: "flex flex-col gap-3 md:grid md:gap-7 md:[grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]" }, [(openBlock(true), createBlock(Fragment, null, renderList(fallbackGrid.value, (p) => {
						return openBlock(), createBlock(PostCard_default, {
							key: p.id,
							post: p,
							variant: "grid"
						}, null, 8, ["post"]);
					}), 128))]),
					pagination.value ? (openBlock(), createBlock("nav", {
						key: 1,
						class: "flex justify-center gap-4",
						"aria-label": "Pagination"
					}, [pagination.value.newerUrl ? (openBlock(), createBlock("a", {
						key: 0,
						href: pagination.value.newerUrl,
						class: "font-extrabold text-ink no-underline hover:underline"
					}, "← Prev", 8, ["href"])) : createCommentVNode("", true), pagination.value.olderUrl ? (openBlock(), createBlock("a", {
						key: 1,
						href: pagination.value.olderUrl,
						class: "font-extrabold text-ink no-underline hover:underline"
					}, "Next →", 8, ["href"])) : createCommentVNode("", true)])) : createCommentVNode("", true)
				])])];
			}) }, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/components/routes/RoutePostsIndex.vue
var _sfc_setup$23 = RoutePostsIndex_vue_vue_type_script_setup_true_lang_default.setup;
RoutePostsIndex_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/routes/RoutePostsIndex.vue");
	return _sfc_setup$23 ? _sfc_setup$23(props, ctx) : void 0;
};
var RoutePostsIndex_default = RoutePostsIndex_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/blog/blocks/BlockActionCallout.vue?vue&type=script&setup=true&lang.ts
var BlockActionCallout_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "BlockActionCallout",
	__ssrInlineRender: true,
	props: {
		heading: {},
		body: {},
		buttons: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<aside${ssrRenderAttrs(mergeProps({
				class: "block-action-callout flex w-full flex-col gap-4 rounded-[16px] bg-ink px-6 py-7 text-white md:gap-[18px] md:rounded-[20px] md:px-10 md:py-9",
				"data-tone": "ink"
			}, _attrs))}><div class="max-w-[24ch] font-display text-[1.25rem] font-normal leading-[1.2] md:text-[clamp(1.4rem,2.4vw,1.9rem)]">${ssrInterpolate(__props.heading)}</div><p class="m-0 max-w-[56ch] text-base leading-[1.6] text-muted-on-ink md:text-[1.05rem]">${ssrInterpolate(__props.body)}</p><div class="flex flex-wrap gap-3.5"><!--[-->`);
			ssrRenderList(__props.buttons, (btn) => {
				_push(`<a${ssrRenderAttr("href", btn.url)} class="${ssrRenderClass([btn.style === "primary" ? "bg-white text-ink hover:bg-brand-deep hover:text-white" : "border-2 border-ink-hairline bg-transparent text-white hover:border-white", "rounded-full px-[26px] py-3 font-display text-[0.9rem] font-normal tracking-[0.04em] no-underline transition-colors"])}">${ssrInterpolate(btn.label)}</a>`);
			});
			_push(`<!--]--></div></aside>`);
		};
	}
});
//#endregion
//#region app/components/site/blog/blocks/BlockActionCallout.vue
var _sfc_setup$22 = BlockActionCallout_vue_vue_type_script_setup_true_lang_default.setup;
BlockActionCallout_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/blog/blocks/BlockActionCallout.vue");
	return _sfc_setup$22 ? _sfc_setup$22(props, ctx) : void 0;
};
var BlockActionCallout_default = BlockActionCallout_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/blog/blocks/BlockAudio.vue?vue&type=script&setup=true&lang.ts
var BlockAudio_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "BlockAudio",
	__ssrInlineRender: true,
	props: {
		file: {},
		title: {},
		duration: {},
		transcriptUrl: {}
	},
	setup(__props) {
		const props = __props;
		ref(null);
		const playing = ref(false);
		const currentSec = ref(0);
		const totalSec = ref(0);
		function fmt(sec) {
			const m = Math.floor(sec / 60);
			const s = Math.floor(sec % 60);
			return `${m}:${String(s).padStart(2, "0")}`;
		}
		const progressPct = computed(() => props.file ? totalSec.value ? currentSec.value / totalSec.value * 100 : 0 : 30);
		const currentLabel = computed(() => props.file ? fmt(currentSec.value) : "0:58");
		const totalLabel = computed(() => props.file && totalSec.value ? fmt(totalSec.value) : props.duration ?? "–:––");
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "block-audio flex w-full flex-col gap-3.5 rounded-[16px] bg-white px-5 py-[18px] shadow-media md:rounded-[20px] md:px-[26px] md:py-[22px]" }, _attrs))}>`);
			if (__props.file) _push(`<audio${ssrRenderAttr("src", __props.file)} preload="metadata"></audio>`);
			else _push(`<!---->`);
			_push(`<div class="flex flex-wrap items-center gap-[18px]"><button type="button"${ssrRenderAttr("aria-label", `${playing.value ? "Pause" : "Play"} audio: ${__props.title}`)} class="size-14 flex-none cursor-pointer rounded-full border-none bg-brand text-[1.1rem] text-white shadow-[0_4px_14px_rgba(27,27,34,0.25)] transition-colors duration-100 hover:bg-brand-deep">${ssrInterpolate(playing.value ? "⏸" : "▶")}</button><div class="flex flex-[1_1_260px] flex-col gap-2.5"><div class="text-[1.05rem] font-bold">${ssrInterpolate(__props.title)}</div><div aria-hidden="true" class="relative h-2.5 overflow-hidden rounded-full bg-control-faint"><div class="absolute inset-y-0 left-0 rounded-full bg-brand" style="${ssrRenderStyle({ width: `${progressPct.value}%` })}"></div></div><div class="flex justify-between font-mono text-[0.8rem] text-muted"><span>${ssrInterpolate(currentLabel.value)}</span><span>${ssrInterpolate(totalLabel.value)}</span></div></div></div><a${ssrRenderAttr("href", __props.transcriptUrl)} class="self-start text-[0.9rem] font-bold text-accent no-underline hover:underline hover:underline-offset-4">Read transcript</a></div>`);
		};
	}
});
//#endregion
//#region app/components/site/blog/blocks/BlockAudio.vue
var _sfc_setup$21 = BlockAudio_vue_vue_type_script_setup_true_lang_default.setup;
BlockAudio_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/blog/blocks/BlockAudio.vue");
	return _sfc_setup$21 ? _sfc_setup$21(props, ctx) : void 0;
};
var BlockAudio_default = BlockAudio_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/blog/blocks/BlockDocument.vue?vue&type=script&setup=true&lang.ts
var BlockDocument_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "BlockDocument",
	__ssrInlineRender: true,
	props: {
		url: {},
		title: {},
		description: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "block-document flex w-full flex-wrap items-center justify-between gap-5 rounded-[16px] bg-white px-[22px] py-[18px] shadow-card" }, _attrs))}><div class="flex items-center gap-4"><span aria-hidden="true" class="rounded-[10px] border-2 border-accent px-2.5 py-2 font-mono text-[0.8rem] font-bold text-accent">PDF</span><div class="flex flex-col gap-[3px]"><span class="text-[1.05rem] font-bold">${ssrInterpolate(__props.title)}</span>`);
			if (__props.description) _push(`<span class="text-[0.85rem] text-muted">${ssrInterpolate(__props.description)}</span>`);
			else _push(`<!---->`);
			_push(`</div></div><a${ssrRenderAttr("href", __props.url)} class="whitespace-nowrap rounded-full border-2 border-accent px-5 py-2 text-[0.9rem] font-bold text-accent no-underline transition-colors hover:bg-accent hover:text-white"> Download </a></div>`);
		};
	}
});
//#endregion
//#region app/components/site/blog/blocks/BlockDocument.vue
var _sfc_setup$20 = BlockDocument_vue_vue_type_script_setup_true_lang_default.setup;
BlockDocument_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/blog/blocks/BlockDocument.vue");
	return _sfc_setup$20 ? _sfc_setup$20(props, ctx) : void 0;
};
var BlockDocument_default = BlockDocument_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/blog/blocks/BlockEventEmbed.vue?vue&type=script&setup=true&lang.ts
var BlockEventEmbed_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "BlockEventEmbed",
	__ssrInlineRender: true,
	props: { event: {} },
	setup(__props) {
		const props = __props;
		const date = computed(() => props.event ? parseISODate(props.event.date) : null);
		const category = computed(() => props.event ? categoryById(props.event.cat) : null);
		return (_ctx, _push, _parent, _attrs) => {
			if (__props.event && date.value && category.value) _push(`<div${ssrRenderAttrs(mergeProps({ class: "block-event-embed grid w-full items-center gap-5 rounded-[16px] bg-white px-6 py-5 shadow-card [grid-template-columns:auto_1fr] md:[grid-template-columns:72px_1fr_auto]" }, _attrs))}><div aria-hidden="true" class="flex flex-col items-center rounded-[12px] bg-brand px-1 py-2 text-center text-white"><span class="text-[0.7rem] font-bold tracking-[0.1em]">${ssrInterpolate(unref(WEEKDAYS)[date.value.getDay()].toUpperCase())}</span><span class="text-[1.4rem] font-extrabold leading-[1.1]">${ssrInterpolate(date.value.getDate())}</span><span class="text-[0.7rem] font-bold tracking-[0.1em]">${ssrInterpolate(unref(MONTH_SHORTS)[date.value.getMonth()].toUpperCase())}</span></div><div class="flex min-w-0 flex-col gap-1"><span class="text-[0.75rem] font-bold uppercase tracking-[0.06em] text-brand"> Upcoming event · ${ssrInterpolate(category.value.label)}</span><span class="text-[1.1rem] font-bold">${ssrInterpolate(__props.event.title)}</span><span class="text-[0.9rem] font-medium text-muted">${ssrInterpolate(__props.event.time)} · ${ssrInterpolate(__props.event.location)}</span></div><a${ssrRenderAttr("href", __props.event.rsvpUrl ?? "/calendar/")} class="col-span-2 justify-self-start whitespace-nowrap rounded-full border-2 border-accent px-5 py-2 text-[0.9rem] font-bold text-accent no-underline transition-colors hover:bg-accent hover:text-white md:col-span-1 md:justify-self-auto"> RSVP </a></div>`);
			else _push(`<div${ssrRenderAttrs(mergeProps({ class: "block-event-embed grid w-full items-center gap-5 rounded-[16px] bg-alt px-6 py-5 [grid-template-columns:1fr_auto]" }, _attrs))}><div class="flex min-w-0 flex-col gap-1"><span class="text-[0.75rem] font-bold uppercase tracking-[0.06em] text-muted">Event</span><span class="text-[1.05rem] font-bold text-muted">This event is no longer scheduled.</span></div><a href="/calendar/" class="whitespace-nowrap rounded-full border-2 border-accent px-5 py-2 text-[0.9rem] font-bold text-accent no-underline transition-colors hover:bg-accent hover:text-white"> See the calendar </a></div>`);
		};
	}
});
//#endregion
//#region app/components/site/blog/blocks/BlockEventEmbed.vue
var _sfc_setup$19 = BlockEventEmbed_vue_vue_type_script_setup_true_lang_default.setup;
BlockEventEmbed_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/blog/blocks/BlockEventEmbed.vue");
	return _sfc_setup$19 ? _sfc_setup$19(props, ctx) : void 0;
};
var BlockEventEmbed_default = BlockEventEmbed_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/blog/blocks/BlockGallery.vue?vue&type=script&setup=true&lang.ts
var BlockGallery_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "BlockGallery",
	__ssrInlineRender: true,
	props: {
		layout: {},
		images: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "block-gallery grid w-full grid-cols-1 gap-4 sm:grid-cols-2" }, _attrs))}><!--[-->`);
			ssrRenderList(__props.images, (img, i) => {
				_push(`<figure class="${ssrRenderClass([__props.layout === "essay" && i === 0 ? "sm:col-span-2" : "", "m-0 flex flex-col overflow-hidden rounded-[20px] bg-white shadow-gallery"])}"><div class="${ssrRenderClass(__props.layout === "essay" && i === 0 ? "h-[clamp(220px,34vw,360px)]" : "h-[clamp(180px,24vw,280px)]")}">`);
				_push(ssrRenderComponent(ImageSlot_default, {
					src: img.src,
					alt: img.alt,
					opacity: .25,
					loading: "lazy",
					label: __props.layout === "essay" && i === 0 ? "Wide photo" : "Photo"
				}, null, _parent));
				_push(`</div>`);
				if (img.caption) _push(`<figcaption class="bg-white px-4 py-2.5 text-[0.85rem] text-muted">${ssrInterpolate(img.caption)}</figcaption>`);
				else _push(`<!---->`);
				_push(`</figure>`);
			});
			_push(`<!--]--></div>`);
		};
	}
});
//#endregion
//#region app/components/site/blog/blocks/BlockGallery.vue
var _sfc_setup$18 = BlockGallery_vue_vue_type_script_setup_true_lang_default.setup;
BlockGallery_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/blog/blocks/BlockGallery.vue");
	return _sfc_setup$18 ? _sfc_setup$18(props, ctx) : void 0;
};
var BlockGallery_default = BlockGallery_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/blog/blocks/BlockImage.vue?vue&type=script&setup=true&lang.ts
var BlockImage_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "BlockImage",
	__ssrInlineRender: true,
	props: {
		image: {},
		breakout: {
			type: Boolean,
			default: false
		}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<figure${ssrRenderAttrs(mergeProps({ class: ["block-image m-0 flex w-full flex-col", __props.breakout ? "lg:-mx-20 lg:w-[calc(100%+10rem)] lg:max-w-[calc(100vw-3rem)]" : ""] }, _attrs))}><div class="h-[clamp(240px,38vw,440px)] overflow-hidden rounded-[20px] bg-white">`);
			_push(ssrRenderComponent(ImageSlot_default, {
				src: __props.image.src,
				alt: __props.image.alt,
				opacity: .25,
				loading: "lazy",
				label: "Photo"
			}, null, _parent));
			_push(`</div>`);
			if (__props.image.caption || __props.image.credit) {
				_push(`<figcaption class="pt-3 text-[0.9rem] leading-[1.5] text-muted">${ssrInterpolate(__props.image.caption)} `);
				if (__props.image.credit) _push(`<span>${ssrInterpolate(__props.image.credit)}</span>`);
				else _push(`<!---->`);
				_push(`</figcaption>`);
			} else _push(`<!---->`);
			_push(`</figure>`);
		};
	}
});
//#endregion
//#region app/components/site/blog/blocks/BlockImage.vue
var _sfc_setup$17 = BlockImage_vue_vue_type_script_setup_true_lang_default.setup;
BlockImage_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/blog/blocks/BlockImage.vue");
	return _sfc_setup$17 ? _sfc_setup$17(props, ctx) : void 0;
};
var BlockImage_default = BlockImage_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/blog/blocks/BlockPersonQuote.vue?vue&type=script&setup=true&lang.ts
var BlockPersonQuote_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "BlockPersonQuote",
	__ssrInlineRender: true,
	props: {
		photo: {},
		alt: {},
		quote: {},
		translation: {},
		name: {},
		role: {},
		lang: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "block-person-quote flex w-full flex-wrap items-start gap-6 rounded-[20px] bg-alt px-6 py-6 md:px-8 md:py-7" }, _attrs))}><div class="size-24 flex-none overflow-hidden rounded-full bg-white shadow-subtle">`);
			_push(ssrRenderComponent(ImageSlot_default, {
				src: __props.photo,
				alt: __props.alt,
				opacity: 0,
				loading: "lazy"
			}, null, _parent));
			_push(`</div><div class="flex flex-[1_1_300px] flex-col gap-3"><blockquote${ssrRenderAttr("lang", __props.lang)} class="m-0 font-display text-[1.05rem] font-normal leading-[1.4] text-ink md:text-[1.25rem] md:leading-[1.35]">${ssrInterpolate(__props.quote)}</blockquote>`);
			if (__props.translation) _push(`<div class="text-base leading-[1.6] text-text-body">${ssrInterpolate(__props.translation)}</div>`);
			else _push(`<!---->`);
			_push(`<div class="text-[0.85rem] font-bold uppercase tracking-[0.06em]"><span class="text-brand">${ssrInterpolate(__props.name)}</span>`);
			if (__props.role) _push(`<span class="text-muted"> · ${ssrInterpolate(__props.role)}</span>`);
			else _push(`<!---->`);
			_push(`</div></div></div>`);
		};
	}
});
//#endregion
//#region app/components/site/blog/blocks/BlockPersonQuote.vue
var _sfc_setup$16 = BlockPersonQuote_vue_vue_type_script_setup_true_lang_default.setup;
BlockPersonQuote_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/blog/blocks/BlockPersonQuote.vue");
	return _sfc_setup$16 ? _sfc_setup$16(props, ctx) : void 0;
};
var BlockPersonQuote_default = BlockPersonQuote_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/blog/blocks/BlockProse.vue?vue&type=script&setup=true&lang.ts
var BlockProse_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "BlockProse",
	__ssrInlineRender: true,
	props: { html: {} },
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "block-prose prose-chapter prose-post w-full" }, _attrs))}>${__props.html ?? ""}</div>`);
		};
	}
});
//#endregion
//#region app/components/site/blog/blocks/BlockProse.vue
var _sfc_setup$15 = BlockProse_vue_vue_type_script_setup_true_lang_default.setup;
BlockProse_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/blog/blocks/BlockProse.vue");
	return _sfc_setup$15 ? _sfc_setup$15(props, ctx) : void 0;
};
var BlockProse_default = BlockProse_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/blog/blocks/BlockPullQuote.vue?vue&type=script&setup=true&lang.ts
var BlockPullQuote_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "BlockPullQuote",
	__ssrInlineRender: true,
	props: {
		quote: {},
		attribution: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<aside${ssrRenderAttrs(mergeProps({ class: "block-pull-quote flex w-full flex-col gap-2.5 rounded-[16px] border-l-[5px] border-brand bg-alt px-[22px] py-5 md:gap-3 md:rounded-[20px] md:border-l-[6px] md:px-[30px] md:py-[26px]" }, _attrs))}><blockquote class="m-0 font-display text-[1.05rem] font-normal leading-[1.4] text-ink md:text-[1.25rem] md:leading-[1.35]">${ssrInterpolate(__props.quote)}</blockquote>`);
			if (__props.attribution) _push(`<div class="text-[0.88rem] font-bold text-brand md:text-[0.95rem]">— ${ssrInterpolate(__props.attribution)}</div>`);
			else _push(`<!---->`);
			_push(`</aside>`);
		};
	}
});
//#endregion
//#region app/components/site/blog/blocks/BlockPullQuote.vue
var _sfc_setup$14 = BlockPullQuote_vue_vue_type_script_setup_true_lang_default.setup;
BlockPullQuote_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/blog/blocks/BlockPullQuote.vue");
	return _sfc_setup$14 ? _sfc_setup$14(props, ctx) : void 0;
};
var BlockPullQuote_default = BlockPullQuote_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/blog/blocks/BlockVideo.vue?vue&type=script&setup=true&lang.ts
var BlockVideo_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "BlockVideo",
	__ssrInlineRender: true,
	props: {
		url: {},
		poster: {},
		caption: {},
		transcriptUrl: {}
	},
	setup(__props) {
		const props = __props;
		const playing = ref(false);
		const embedUrl = computed(() => {
			const yt = props.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
			if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1`;
			const vimeo = props.url.match(/vimeo\.com\/(\d+)/);
			if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
			return null;
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<figure${ssrRenderAttrs(mergeProps({ class: "block-video m-0 flex w-full flex-col" }, _attrs))}>`);
			if (playing.value && embedUrl.value) _push(`<iframe${ssrRenderAttr("src", embedUrl.value)} title="Video" class="aspect-video w-full rounded-[20px] shadow-media" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`);
			else {
				_push(`<div class="${ssrRenderClass([__props.poster ? "" : "bg-[repeating-linear-gradient(45deg,var(--color-alt)_0_14px,var(--color-control-faint)_14px_28px)]", "relative flex aspect-video items-center justify-center overflow-hidden rounded-[20px] shadow-media"])}">`);
				if (__props.poster) _push(`<img${ssrRenderAttr("src", __props.poster)} alt="" class="absolute inset-0 size-full object-cover">`);
				else _push(`<!---->`);
				_push(`<button type="button" aria-label="Play video" class="relative flex size-[84px] cursor-pointer items-center justify-center rounded-full border-none bg-brand text-[1.8rem] text-white shadow-[0_8px_24px_rgba(27,27,34,0.3)] transition-transform duration-100 hover:scale-105 hover:bg-brand-deep"> ▶ </button><span class="absolute bottom-3.5 right-3.5 rounded-[6px] bg-white px-2 py-1 text-[0.75rem] font-bold tracking-[0.06em] text-ink">CC</span></div>`);
			}
			if (__props.caption || __props.transcriptUrl) {
				_push(`<figcaption class="flex flex-wrap justify-between gap-4 pt-3 text-[0.9rem] leading-[1.5] text-muted"><span>${ssrInterpolate(__props.caption)}</span>`);
				if (__props.transcriptUrl) _push(`<a${ssrRenderAttr("href", __props.transcriptUrl)} class="font-bold text-accent no-underline hover:underline hover:underline-offset-4">Read transcript</a>`);
				else _push(`<!---->`);
				_push(`</figcaption>`);
			} else _push(`<!---->`);
			_push(`</figure>`);
		};
	}
});
//#endregion
//#region app/components/site/blog/blocks/BlockVideo.vue
var _sfc_setup$13 = BlockVideo_vue_vue_type_script_setup_true_lang_default.setup;
BlockVideo_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/blog/blocks/BlockVideo.vue");
	return _sfc_setup$13 ? _sfc_setup$13(props, ctx) : void 0;
};
var BlockVideo_default = BlockVideo_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/blog/PostBlocks.vue?vue&type=script&setup=true&lang.ts
var PostBlocks_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "PostBlocks",
	__ssrInlineRender: true,
	props: { blocks: {} },
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<!--[-->`);
			ssrRenderList(__props.blocks, (block, i) => {
				_push(`<!--[-->`);
				if (block.type === "prose") _push(ssrRenderComponent(BlockProse_default, { html: block.html }, null, _parent));
				else if (block.type === "image") _push(ssrRenderComponent(BlockImage_default, {
					image: block.image,
					breakout: block.breakout
				}, null, _parent));
				else if (block.type === "pull_quote") _push(ssrRenderComponent(BlockPullQuote_default, {
					quote: block.quote,
					attribution: block.attribution
				}, null, _parent));
				else if (block.type === "gallery") _push(ssrRenderComponent(BlockGallery_default, {
					layout: block.layout,
					images: block.images
				}, null, _parent));
				else if (block.type === "person_quote") _push(ssrRenderComponent(BlockPersonQuote_default, {
					photo: block.photo,
					alt: block.alt,
					quote: block.quote,
					translation: block.translation,
					name: block.name,
					role: block.role,
					lang: block.lang
				}, null, _parent));
				else if (block.type === "video") _push(ssrRenderComponent(BlockVideo_default, {
					url: block.url,
					poster: block.poster,
					caption: block.caption,
					"transcript-url": block.transcriptUrl
				}, null, _parent));
				else if (block.type === "audio") _push(ssrRenderComponent(BlockAudio_default, {
					file: block.file,
					title: block.title,
					duration: block.duration,
					"transcript-url": block.transcriptUrl
				}, null, _parent));
				else if (block.type === "document") _push(ssrRenderComponent(BlockDocument_default, {
					url: block.url,
					title: block.title,
					description: block.description
				}, null, _parent));
				else if (block.type === "event_embed") _push(ssrRenderComponent(BlockEventEmbed_default, { event: block.event }, null, _parent));
				else if (block.type === "action_callout") _push(ssrRenderComponent(BlockActionCallout_default, {
					heading: block.heading,
					body: block.body,
					buttons: block.buttons
				}, null, _parent));
				else _push(`<!---->`);
				_push(`<!--]-->`);
			});
			_push(`<!--]-->`);
		};
	}
});
//#endregion
//#region app/components/site/blog/PostBlocks.vue
var _sfc_setup$12 = PostBlocks_vue_vue_type_script_setup_true_lang_default.setup;
PostBlocks_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/blog/PostBlocks.vue");
	return _sfc_setup$12 ? _sfc_setup$12(props, ctx) : void 0;
};
var PostBlocks_default = PostBlocks_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/blog/SinglePost.vue?vue&type=script&setup=true&lang.ts
var SHARE_PILL = "cursor-pointer rounded-full border-2 border-accent bg-transparent px-4 py-2 text-[0.85rem] font-bold text-accent no-underline transition-colors hover:bg-accent hover:text-white md:px-[18px] md:py-[7px] md:text-[0.9rem]";
var SinglePost_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "SinglePost",
	__ssrInlineRender: true,
	props: {
		post: {},
		posts: { default: () => [] },
		categories: { default: void 0 },
		bylineMode: { default: void 0 },
		showMetaRail: {
			type: Boolean,
			default: false
		},
		blogUrl: { default: "/blog/" },
		homeUrl: { default: "/" },
		joinUrl: { default: "" },
		joinLabel: { default: "Join Now" },
		ctaTitle: { default: "Get involved" },
		ctaBody: { default: "Meetings, actions and committees are open to everyone. Come find your place in the work." },
		crumbHome: { default: "Home" },
		crumbBlog: { default: "Blog" },
		onThisPageLabel: { default: "On this page" },
		shareLabel: { default: "Share" },
		copyLabel: { default: "Copy link" },
		emailLabel: { default: "Email it" },
		readNextLabel: { default: "Read next" },
		allPostsLabel: { default: "All posts" }
	},
	setup(__props) {
		const props = __props;
		if (props.categories && props.categories.length > 0) setCategories(props.categories);
		const mode = computed(() => props.bylineMode ?? props.post.bylineMode);
		const isNamed = computed(() => mode.value !== "committee");
		const categoryUrl = computed(() => `${props.blogUrl}?category=${props.post.cat}`);
		const authorName = computed(() => {
			const name = isNamed.value ? props.post.author : props.post.committee;
			return name ? isNamed.value ? name : `The ${name}` : "";
		});
		/** Two-letter initials for the byline avatar ("Lorem Ipsum" → "LI"). */
		const initials = computed(() => {
			return (isNamed.value ? props.post.author : props.post.committee).split(/\s+/).filter((w) => w && w !== "Committee").map((w) => w[0].toUpperCase()).slice(0, 2).join("");
		});
		const hasFeaturedImage = computed(() => Boolean(props.post.featuredImage.src));
		const H2 = /<h2(?:\s+id="([^"]*)")?[^>]*>([\s\S]*?)<\/h2>/gi;
		const anchors = computed(() => {
			const out = [];
			for (const block of props.post.blocks) {
				if (block.type !== "prose") continue;
				for (const m of block.html.matchAll(H2)) {
					const label = m[2].replace(/<[^>]+>/g, "").trim();
					const id = m[1] || label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
					if (label && id) out.push({
						label,
						href: `#${id}`
					});
				}
			}
			return out;
		});
		const readNext = computed(() => {
			const rest = props.posts.filter((p) => !p.featured);
			const sameCat = rest.filter((p) => p.cat === props.post.cat);
			const others = rest.filter((p) => p.cat !== props.post.cat);
			return [...sameCat, ...others].slice(0, 3);
		});
		const copied = ref(false);
		const copyText = computed(() => copied.value ? "Copied ✓" : props.copyLabel);
		const mailShareUrl = computed(() => `mailto:?subject=${encodeURIComponent(`${props.post.title}`)}`);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "single-post" }, _attrs))}>`);
			_push(ssrRenderComponent(PageHeader_default, {
				title: __props.post.title,
				variant: "post",
				"pull-up": hasFeaturedImage.value,
				crumbs: [{
					label: __props.crumbHome,
					href: __props.homeUrl
				}, {
					label: __props.crumbBlog,
					href: __props.blogUrl
				}]
			}, {
				before: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(ssrRenderComponent(CategoryTag_default, {
						"cat-id": __props.post.cat,
						href: categoryUrl.value,
						variant: "white"
					}, null, _parent, _scopeId));
					else return [createVNode(CategoryTag_default, {
						"cat-id": __props.post.cat,
						href: categoryUrl.value,
						variant: "white"
					}, null, 8, ["cat-id", "href"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="flex flex-wrap items-center gap-2.5 text-[0.9rem] font-semibold md:gap-3.5 md:text-base"${_scopeId}>`);
						if (initials.value) _push(`<span aria-hidden="true" class="inline-flex size-[38px] items-center justify-center rounded-full bg-brand-light text-[0.85rem] font-extrabold text-brand-deep md:size-11 md:text-base"${_scopeId}>${ssrInterpolate(initials.value)}</span>`);
						else _push(`<!---->`);
						if (authorName.value) _push(`<!--[--><span${_scopeId}>By ${ssrInterpolate(authorName.value)}</span><span aria-hidden="true"${_scopeId}>·</span><!--]-->`);
						else _push(`<!---->`);
						_push(`<span${_scopeId}>${ssrInterpolate(__props.post.date)}<span class="md:hidden"${_scopeId}> · ${ssrInterpolate(__props.post.readMinutes)} min</span></span><span aria-hidden="true" class="hidden md:inline"${_scopeId}>·</span><span class="hidden md:inline"${_scopeId}>${ssrInterpolate(__props.post.readMinutes)} min read</span></div>`);
					} else return [createVNode("div", { class: "flex flex-wrap items-center gap-2.5 text-[0.9rem] font-semibold md:gap-3.5 md:text-base" }, [
						initials.value ? (openBlock(), createBlock("span", {
							key: 0,
							"aria-hidden": "true",
							class: "inline-flex size-[38px] items-center justify-center rounded-full bg-brand-light text-[0.85rem] font-extrabold text-brand-deep md:size-11 md:text-base"
						}, toDisplayString(initials.value), 1)) : createCommentVNode("", true),
						authorName.value ? (openBlock(), createBlock(Fragment, { key: 1 }, [createVNode("span", null, "By " + toDisplayString(authorName.value), 1), createVNode("span", { "aria-hidden": "true" }, "·")], 64)) : createCommentVNode("", true),
						createVNode("span", null, [createTextVNode(toDisplayString(__props.post.date), 1), createVNode("span", { class: "md:hidden" }, " · " + toDisplayString(__props.post.readMinutes) + " min", 1)]),
						createVNode("span", {
							"aria-hidden": "true",
							class: "hidden md:inline"
						}, "·"),
						createVNode("span", { class: "hidden md:inline" }, toDisplayString(__props.post.readMinutes) + " min read", 1)
					])];
				}),
				_: 1
			}, _parent));
			_push(`<section class="bg-white px-6 pb-12 md:pb-20" data-tone="white"><div class="${ssrRenderClass([__props.showMetaRail ? "lg:[grid-template-columns:minmax(300px,1fr)_280px]" : "lg:[grid-template-columns:minmax(300px,880px)] lg:justify-center", "mx-auto grid max-w-[1140px] items-start gap-10 lg:gap-14"])}"><article class="${ssrRenderClass([hasFeaturedImage.value ? "" : "pt-8", "flex min-w-0 flex-col gap-[18px] md:gap-6"])}">`);
			if (hasFeaturedImage.value) {
				_push(`<figure class="m-0 -mt-[70px] flex flex-col md:-mt-[110px]"><div class="aspect-video overflow-hidden rounded-[16px] bg-white shadow-photo md:rounded-[24px]" data-post-hero>`);
				_push(ssrRenderComponent(ImageSlot_default, {
					src: __props.post.featuredImage.src,
					alt: __props.post.featuredImage.alt,
					opacity: .25,
					loading: "eager"
				}, null, _parent));
				_push(`</div>`);
				if (__props.post.featuredImage.caption || __props.post.featuredImage.credit) {
					_push(`<figcaption class="mt-3 text-[0.9rem] leading-[1.5] text-muted">${ssrInterpolate(__props.post.featuredImage.caption)} `);
					if (__props.post.featuredImage.credit) _push(`<span class="text-muted">${ssrInterpolate(__props.post.featuredImage.credit)}</span>`);
					else _push(`<!---->`);
					_push(`</figcaption>`);
				} else _push(`<!---->`);
				_push(`</figure>`);
			} else _push(`<!---->`);
			if (__props.post.dek) _push(`<p class="m-0 mt-1.5 text-[1.08rem] font-semibold leading-[1.6] text-ink md:mt-2 md:text-[1.22rem] md:leading-[1.65]">${ssrInterpolate(__props.post.dek)}</p>`);
			else _push(`<!---->`);
			_push(ssrRenderComponent(PostBlocks_default, { blocks: __props.post.blocks }, null, _parent));
			_push(`<div class="mt-1.5 flex flex-wrap items-center gap-2.5 border-t border-line pt-5 md:mt-2 md:gap-3.5 md:pt-6"><span class="text-[0.85rem] font-extrabold uppercase tracking-[0.06em] text-muted md:text-[0.9rem]">${ssrInterpolate(__props.shareLabel)}</span><button type="button" class="${ssrRenderClass(SHARE_PILL)}">${ssrInterpolate(copyText.value)}</button><a${ssrRenderAttr("href", mailShareUrl.value)} class="${ssrRenderClass(SHARE_PILL)}">${ssrInterpolate(__props.emailLabel)}</a></div>`);
			if (__props.joinUrl && __props.showMetaRail) _push(ssrRenderComponent(CtaCard_default, {
				class: "mt-2 lg:hidden",
				title: __props.ctaTitle,
				body: __props.ctaBody,
				href: __props.joinUrl,
				label: __props.joinLabel,
				external: ""
			}, null, _parent));
			else _push(`<!---->`);
			_push(`</article>`);
			if (__props.showMetaRail) {
				_push(`<aside aria-label="Post details" class="hidden flex-col gap-6 lg:sticky lg:top-[calc(108px+var(--wp-admin--admin-bar--height,0px))] lg:flex lg:pt-8">`);
				if (anchors.value.length) _push(ssrRenderComponent(LinkListCard_default, {
					heading: __props.onThisPageLabel,
					links: anchors.value
				}, null, _parent));
				else _push(`<!---->`);
				if (__props.joinUrl) _push(ssrRenderComponent(CtaCard_default, {
					title: __props.ctaTitle,
					body: __props.ctaBody,
					href: __props.joinUrl,
					label: __props.joinLabel,
					external: ""
				}, null, _parent));
				else _push(`<!---->`);
				_push(`</aside>`);
			} else _push(`<!---->`);
			_push(`</div></section>`);
			if (readNext.value.length > 0) {
				_push(`<section class="bg-alt px-6 pb-14 pt-11 md:pb-24 md:pt-16" data-tone="alt"><div class="mx-auto flex max-w-[1140px] flex-col gap-[18px] md:gap-7"><div class="flex flex-wrap items-baseline justify-between gap-4"><h2 class="m-0 font-display text-[1.35rem] font-normal leading-[1.2] md:text-[clamp(1.6rem,2.8vw,2.2rem)] md:leading-[1.1]">${ssrInterpolate(__props.readNextLabel)}</h2><a${ssrRenderAttr("href", __props.blogUrl)} class="hidden items-center gap-4 text-[1.05rem] font-extrabold uppercase tracking-[0.03em] text-accent no-underline hover:underline hover:underline-offset-4 md:flex">${ssrInterpolate(__props.allPostsLabel)} <svg aria-hidden="true" focusable="false" viewBox="0 0 40 20" class="h-5 w-10 flex-none fill-accent"><path d="M0 8.4h26v3.2H0z"></path><path d="M24 1.5 38.5 10 24 18.5Z"></path></svg></a></div><div class="flex flex-col gap-3 md:grid md:gap-6 md:[grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]"><!--[-->`);
				ssrRenderList(readNext.value, (p) => {
					_push(ssrRenderComponent(PostCard_default, {
						key: p.id,
						post: p,
						variant: "compact"
					}, null, _parent));
				});
				_push(`<!--]--></div><a${ssrRenderAttr("href", __props.blogUrl)} class="flex items-center justify-center gap-3.5 text-[0.95rem] font-extrabold uppercase tracking-[0.03em] text-accent no-underline hover:underline hover:underline-offset-4 md:hidden">${ssrInterpolate(__props.allPostsLabel)} <svg aria-hidden="true" focusable="false" viewBox="0 0 40 20" class="h-[17px] w-[34px] flex-none fill-accent"><path d="M0 8.4h26v3.2H0z"></path><path d="M24 1.5 38.5 10 24 18.5Z"></path></svg></a></div></section>`);
			} else _push(`<!---->`);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/components/site/blog/SinglePost.vue
var _sfc_setup$11 = SinglePost_vue_vue_type_script_setup_true_lang_default.setup;
SinglePost_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/blog/SinglePost.vue");
	return _sfc_setup$11 ? _sfc_setup$11(props, ctx) : void 0;
};
var SinglePost_default = SinglePost_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/routes/RoutePost.vue?vue&type=script&setup=true&lang.ts
var RoutePost_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "RoutePost",
	__ssrInlineRender: true,
	props: { resolved: {} },
	async setup(__props) {
		let __temp, __restore;
		const props = __props;
		const lang = computed(() => props.resolved.lang);
		const slug = payloadSlug(props.resolved.route);
		const api = useChapterApi();
		const { data: site } = ([__temp, __restore] = withAsyncContext(() => useChapterSite(lang.value)), __temp = await __temp, __restore(), __temp);
		const { data: post } = ([__temp, __restore] = withAsyncContext(() => useChapterData(postKey(lang.value, slug), () => fetchSinglePost(api, slug, lang.value))), __temp = await __temp, __restore(), __temp);
		provideRouteLanguages(computed(() => post.value?.languages));
		useRouteSeo(computed(() => post.value?.seo), lang);
		const routes = useChapterRoutes();
		const homeUrl = computed(() => frontRoute(routes.value, lang.value)?.path ?? "/");
		const blogUrl = computed(() => postsIndexRoute(routes.value, lang.value)?.path ?? "/blog/");
		const str = (key, fallback) => site.value?.strings[key] || fallback;
		const labels = computed(() => ({
			joinLabel: site.value?.header.joinLabel || str("cta_join_now", "Join Now"),
			ctaTitle: str("blog_get_involved_h", "Get involved"),
			ctaBody: str("blog_get_involved_p", "Meetings, actions and committees are open to everyone. Come find your place in the work."),
			crumbHome: str("blog_crumb_home", "Home"),
			crumbBlog: str("blog_crumb_blog", "Blog"),
			onThisPageLabel: str("chrome_on_this_page", "On this page"),
			shareLabel: str("blog_share", "Share"),
			copyLabel: str("blog_copy_link", "Copy link"),
			emailLabel: str("blog_email_it", "Email it"),
			readNextLabel: str("blog_read_next", "Read next"),
			allPostsLabel: str("home_blog_all", "All posts")
		}));
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(post)) _push(ssrRenderComponent(SinglePost_default, mergeProps({
				post: unref(post),
				posts: unref(post).readNext,
				categories: unref(site)?.categories,
				"show-meta-rail": unref(post).showMetaRail,
				"blog-url": blogUrl.value,
				"home-url": homeUrl.value,
				"join-url": unref(site)?.chapter.join_url || ""
			}, labels.value, _attrs), null, _parent));
			else _push(`<!---->`);
		};
	}
});
//#endregion
//#region app/components/routes/RoutePost.vue
var _sfc_setup$10 = RoutePost_vue_vue_type_script_setup_true_lang_default.setup;
RoutePost_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/routes/RoutePost.vue");
	return _sfc_setup$10 ? _sfc_setup$10(props, ctx) : void 0;
};
var RoutePost_default = RoutePost_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/BlockAgenda.vue?vue&type=script&setup=true&lang.ts
var BlockAgenda_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "BlockAgenda",
	__ssrInlineRender: true,
	props: {
		items: {},
		heading: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "block-agenda flex w-full flex-col gap-2.5 md:gap-3" }, _attrs))}><h2 class="m-0 mt-3 scroll-mt-[108px] font-display text-[1.25rem] font-normal leading-[1.25] md:mt-[18px] md:text-[clamp(1.4rem,2.4vw,1.9rem)] md:leading-[1.15]">${ssrInterpolate(__props.heading ?? "Agenda")}</h2><ol class="m-0 flex list-none flex-col gap-[9px] p-0 md:gap-2.5"><!--[-->`);
			ssrRenderList(__props.items, (item, i) => {
				_push(`<li class="grid items-baseline gap-3.5 rounded-[12px] border border-line px-4 py-3 [grid-template-columns:90px_1fr] md:gap-[18px] md:rounded-[14px] md:px-[18px] md:py-3.5 md:[grid-template-columns:110px_1fr]"><span class="text-[0.95rem] font-extrabold text-brand md:text-base">${ssrInterpolate(item.title)}</span><span class="text-[0.95rem] font-semibold md:text-base">${ssrInterpolate(item.desc ?? "")}</span></li>`);
			});
			_push(`<!--]--></ol></div>`);
		};
	}
});
//#endregion
//#region app/components/site/BlockAgenda.vue
var _sfc_setup$9 = BlockAgenda_vue_vue_type_script_setup_true_lang_default.setup;
BlockAgenda_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/BlockAgenda.vue");
	return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
var BlockAgenda_default = BlockAgenda_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/BlockGoodToKnow.vue?vue&type=script&setup=true&lang.ts
var BlockGoodToKnow_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "BlockGoodToKnow",
	__ssrInlineRender: true,
	props: {
		items: {},
		heading: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "block-good-to-know flex w-full flex-col gap-2.5 rounded-[16px] bg-alt px-[22px] py-5 md:gap-3 md:rounded-[20px] md:px-[30px] md:py-[26px]" }, _attrs))}><div class="text-[0.92rem] font-extrabold uppercase tracking-[0.04em] text-brand md:text-base">${ssrInterpolate(__props.heading ?? "Good to know")}</div><ul class="m-0 flex list-disc flex-col gap-[7px] pl-5 text-[0.98rem] leading-[1.55] text-text-body md:gap-2 md:pl-[22px] md:text-[1.05rem]"><!--[-->`);
			ssrRenderList(__props.items, (item, i) => {
				_push(`<li>${ssrInterpolate(item)}</li>`);
			});
			_push(`<!--]--></ul></div>`);
		};
	}
});
//#endregion
//#region app/components/site/BlockGoodToKnow.vue
var _sfc_setup$8 = BlockGoodToKnow_vue_vue_type_script_setup_true_lang_default.setup;
BlockGoodToKnow_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/BlockGoodToKnow.vue");
	return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
var BlockGoodToKnow_default = BlockGoodToKnow_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/BlockA11yNote.vue?vue&type=script&setup=true&lang.ts
var BlockA11yNote_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "BlockA11yNote",
	__ssrInlineRender: true,
	props: {
		html: {},
		heading: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<aside${ssrRenderAttrs(mergeProps({ class: "block-a11y-note flex w-full flex-col gap-2 rounded-[16px] border-l-[5px] border-brand bg-alt px-[22px] py-5 md:rounded-[20px] md:border-l-[6px] md:px-[30px] md:py-[26px]" }, _attrs))}><div class="text-[0.92rem] font-extrabold uppercase tracking-[0.04em] text-brand md:text-base">${ssrInterpolate(__props.heading ?? "Accessibility & childcare")}</div><div class="prose-chapter text-base leading-[1.65] text-text-body [&amp;&gt;*+*]:mt-3">${__props.html ?? ""}</div></aside>`);
		};
	}
});
//#endregion
//#region app/components/site/BlockA11yNote.vue
var _sfc_setup$7 = BlockA11yNote_vue_vue_type_script_setup_true_lang_default.setup;
BlockA11yNote_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/BlockA11yNote.vue");
	return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
var BlockA11yNote_default = BlockA11yNote_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/BlockMap.vue?vue&type=script&setup=true&lang.ts
var BlockMap_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "BlockMap",
	__ssrInlineRender: true,
	props: {
		address: {},
		heading: {}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "block-map flex w-full flex-col gap-2.5 md:gap-3" }, _attrs))}><h2 class="m-0 mt-3 scroll-mt-[108px] font-display text-[1.25rem] font-normal leading-[1.25] md:mt-[18px] md:text-[clamp(1.4rem,2.4vw,1.9rem)] md:leading-[1.15]">${ssrInterpolate(__props.heading ?? "Getting there")}</h2><div role="img"${ssrRenderAttr("aria-label", `Map to ${__props.address}`)} class="flex h-[clamp(220px,30vw,320px)] w-full items-center justify-center overflow-hidden rounded-[16px] bg-[repeating-linear-gradient(45deg,var(--color-alt)_0_16px,var(--color-control-faint)_16px_32px)] shadow-card md:rounded-[20px]"><span class="rounded-full bg-white px-4 py-2 font-mono text-[0.85rem] font-bold text-muted shadow-subtle">Map · ${ssrInterpolate(__props.address)}</span></div><p class="m-0 text-base leading-[1.65] text-text-body md:text-[1.05rem]">${ssrInterpolate(__props.address)}</p></div>`);
		};
	}
});
//#endregion
//#region app/components/site/BlockMap.vue
var _sfc_setup$6 = BlockMap_vue_vue_type_script_setup_true_lang_default.setup;
BlockMap_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/BlockMap.vue");
	return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
var BlockMap_default = BlockMap_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/EventBlocks.vue?vue&type=script&setup=true&lang.ts
var EventBlocks_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "EventBlocks",
	__ssrInlineRender: true,
	props: { blocks: {} },
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<!--[-->`);
			ssrRenderList(__props.blocks, (block, i) => {
				_push(`<!--[-->`);
				if (block.type === "prose") _push(ssrRenderComponent(BlockProse_default, { html: block.html }, null, _parent));
				else if (block.type === "agenda") _push(ssrRenderComponent(BlockAgenda_default, { items: block.items }, null, _parent));
				else if (block.type === "good_to_know") _push(ssrRenderComponent(BlockGoodToKnow_default, { items: block.items }, null, _parent));
				else if (block.type === "a11y_note") _push(ssrRenderComponent(BlockA11yNote_default, { html: block.html }, null, _parent));
				else if (block.type === "map") _push(ssrRenderComponent(BlockMap_default, { address: block.address }, null, _parent));
				else _push(`<!---->`);
				_push(`<!--]-->`);
			});
			_push(`<!--]-->`);
		};
	}
});
//#endregion
//#region app/components/site/EventBlocks.vue
var _sfc_setup$5 = EventBlocks_vue_vue_type_script_setup_true_lang_default.setup;
EventBlocks_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/EventBlocks.vue");
	return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
var EventBlocks_default = EventBlocks_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/EventCard.vue?vue&type=script&setup=true&lang.ts
var EventCard_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "EventCard",
	__ssrInlineRender: true,
	props: {
		event: {},
		fallbackUrl: { default: "/calendar/" },
		viewLabel: { default: "View event" },
		subtle: {
			type: Boolean,
			default: false
		}
	},
	setup(__props) {
		const props = __props;
		const WEEKDAYS_LONG = [
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday"
		];
		const date = computed(() => parseISODate(props.event.date));
		const day = computed(() => String(date.value.getDate()).padStart(2, "0"));
		const month = computed(() => MONTH_SHORTS[date.value.getMonth()].toUpperCase());
		/** "Tuesday, September 8 · 7:00–8:30 PM" */
		const when = computed(() => {
			const d = date.value;
			const base = `${WEEKDAYS_LONG[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
			return props.event.time ? `${base} · ${props.event.time}` : base;
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<a${ssrRenderAttrs(mergeProps({
				href: __props.event.url || __props.fallbackUrl,
				"aria-label": `${__props.viewLabel}: ${__props.event.title}`,
				class: ["event-card group grid grid-cols-[60px_1fr] items-center gap-4 rounded-[14px] bg-white p-4 text-ink no-underline transition-shadow hover:shadow-card md:[grid-template-columns:76px_1fr_auto] md:gap-6 md:rounded-[16px] md:px-[22px] md:py-[18px]", __props.subtle ? "shadow-subtle" : "shadow-card hover:shadow-card-hover"]
			}, _attrs))}><span aria-hidden="true" class="flex flex-col rounded-[10px] bg-brand px-0.5 py-2 text-center text-white md:rounded-[12px] md:px-1 md:py-2.5"><span class="text-[1.2rem] font-extrabold leading-[1.1] md:text-[1.4rem]">${ssrInterpolate(day.value)}</span><span class="text-[0.68rem] font-bold tracking-[0.1em] md:text-[0.75rem]">${ssrInterpolate(month.value)}</span></span><span class="flex min-w-0 flex-col gap-[3px] md:gap-1"><span class="text-[1.02rem] font-bold leading-[1.3] md:text-[1.18rem]">${ssrInterpolate(__props.event.title)}</span><span class="text-[0.88rem] font-medium text-muted md:text-base">${ssrInterpolate(when.value)}`);
			if (__props.event.location) _push(`<span class="hidden md:inline"> · ${ssrInterpolate(__props.event.location)}</span>`);
			else _push(`<!---->`);
			_push(`</span></span><span aria-hidden="true" class="hidden whitespace-nowrap rounded-full border-2 border-accent px-5 py-[9px] font-display text-[0.88rem] font-normal uppercase tracking-[0.03em] text-accent transition-colors group-hover:bg-accent group-hover:text-white md:inline-block">${ssrInterpolate(__props.viewLabel)}</span></a>`);
		};
	}
});
//#endregion
//#region app/components/site/EventCard.vue
var _sfc_setup$4 = EventCard_vue_vue_type_script_setup_true_lang_default.setup;
EventCard_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/EventCard.vue");
	return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
var EventCard_default = EventCard_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/SingleEvent.vue?vue&type=script&setup=true&lang.ts
var WHITE_PILL = "rounded-full bg-white px-7 py-[13px] font-display text-[0.9rem] font-normal tracking-[0.04em] text-brand no-underline transition-colors hover:bg-brand-deep hover:text-white md:px-9 md:py-3.5 md:text-base";
var OUTLINE_PILL = "rounded-full border-2 border-white bg-transparent px-[22px] py-[11px] font-display text-[0.9rem] font-normal tracking-[0.04em] text-white no-underline transition-colors hover:border-brand-deep hover:bg-brand-deep md:px-[34px] md:py-3 md:text-base";
var SingleEvent_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "SingleEvent",
	__ssrInlineRender: true,
	props: {
		event: {},
		categories: { default: void 0 },
		related: { default: () => [] },
		showRelated: {
			type: Boolean,
			default: true
		},
		homeUrl: { default: "/" },
		calendarUrl: { default: "/calendar/" },
		crumbHome: { default: "Home" },
		crumbCalendar: { default: "Calendar" },
		rsvpLabel: { default: "RSVP" },
		addToCalendarLabel: { default: "Add to calendar" },
		aboutLabel: { default: "About this event" },
		detailsLabel: { default: "Details" },
		dateLabel: { default: "Date" },
		timeLabel: { default: "Time" },
		locationLabel: { default: "Location" },
		saveTitle: { default: "Save your spot" },
		saveBody: { default: "RSVP and we’ll send the details straight to you." },
		saveLabel: { default: "RSVP Now" },
		contactLabel: { default: "Questions? Contact" },
		moreLabel: { default: "More upcoming events" },
		fullCalendarLabel: { default: "Full calendar" },
		viewLabel: { default: "View event" }
	},
	setup(__props) {
		const props = __props;
		if (props.categories && props.categories.length > 0) setCategories(props.categories);
		const WEEKDAYS_LONG = [
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday"
		];
		const category = computed(() => categoryById(props.event.cat));
		const date = computed(() => parseISODate(props.event.date));
		const dayNum = computed(() => String(date.value.getDate()).padStart(2, "0"));
		const monthShort = computed(() => MONTH_SHORTS[date.value.getMonth()].toUpperCase());
		/** "Tuesday, September 8, 2026" */
		const longDate = computed(() => `${WEEKDAYS_LONG[date.value.getDay()]}, ${MONTH_NAMES[date.value.getMonth()]} ${date.value.getDate()}, ${date.value.getFullYear()}`);
		const isOnline = computed(() => props.event.locationType === "online");
		const locationLine = computed(() => {
			if (isOnline.value) return "Online · link shared on RSVP";
			const place = [props.event.venue, props.event.city].filter(Boolean).join(" · ");
			if (props.event.locationType === "hybrid") return place ? `${place} · or online` : "In person or online";
			return place || "Location TBA";
		});
		/** hero lede: "<weekday, date> · <time> · <location>" */
		const whenWhere = computed(() => [
			longDate.value,
			props.event.time,
			locationLine.value
		].filter(Boolean).join(" · "));
		const detailRows = computed(() => {
			return [
				{
					label: props.dateLabel,
					value: longDate.value
				},
				...props.event.time ? [{
					label: props.timeLabel,
					value: props.event.doorsTime ? `${props.event.time} · doors ${props.event.doorsTime}` : props.event.time
				}] : [],
				{
					label: props.locationLabel,
					value: locationLine.value
				}
			];
		});
		const hasContact = computed(() => props.event.contact.name !== "" || props.event.contact.email !== "" || props.event.contact.phone !== "");
		const hasImage = computed(() => Boolean(props.event.featuredImage.src));
		const hasBody = computed(() => hasImage.value || props.event.summary !== "" || props.event.blocks.length > 0);
		const moreEvents = computed(() => props.showRelated ? props.related.slice(0, 3) : []);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "single-event" }, _attrs))}>`);
			_push(ssrRenderComponent(PageHeader_default, {
				title: __props.event.title,
				lede: whenWhere.value,
				crumbs: [{
					label: __props.crumbHome,
					href: __props.homeUrl
				}, {
					label: __props.crumbCalendar,
					href: __props.calendarUrl
				}]
			}, {
				before: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<div class="flex flex-wrap items-center gap-3.5 md:gap-[18px]"${_scopeId}><span aria-hidden="true" class="flex flex-col rounded-[12px] bg-white px-3.5 py-2.5 text-center text-brand md:rounded-[14px] md:px-[18px] md:py-3"${_scopeId}><span class="font-display text-[1.4rem] leading-[1.05] md:text-[1.7rem]"${_scopeId}>${ssrInterpolate(dayNum.value)}</span><span class="text-[0.72rem] font-extrabold tracking-[0.1em] md:text-[0.8rem]"${_scopeId}>${ssrInterpolate(monthShort.value)}</span></span><a${ssrRenderAttr("href", `${__props.calendarUrl}?category=${__props.event.cat}`)} class="rounded-full bg-ink/[.22] px-3.5 py-[5px] text-[0.72rem] font-extrabold uppercase tracking-[0.06em] text-white no-underline hover:underline hover:underline-offset-4 md:px-4 md:py-1.5 md:text-[0.8rem]"${_scopeId}>${ssrInterpolate(category.value.label)}</a></div>`);
					else return [createVNode("div", { class: "flex flex-wrap items-center gap-3.5 md:gap-[18px]" }, [createVNode("span", {
						"aria-hidden": "true",
						class: "flex flex-col rounded-[12px] bg-white px-3.5 py-2.5 text-center text-brand md:rounded-[14px] md:px-[18px] md:py-3"
					}, [createVNode("span", { class: "font-display text-[1.4rem] leading-[1.05] md:text-[1.7rem]" }, toDisplayString(dayNum.value), 1), createVNode("span", { class: "text-[0.72rem] font-extrabold tracking-[0.1em] md:text-[0.8rem]" }, toDisplayString(monthShort.value), 1)]), createVNode("a", {
						href: `${__props.calendarUrl}?category=${__props.event.cat}`,
						class: "rounded-full bg-ink/[.22] px-3.5 py-[5px] text-[0.72rem] font-extrabold uppercase tracking-[0.06em] text-white no-underline hover:underline hover:underline-offset-4 md:px-4 md:py-1.5 md:text-[0.8rem]"
					}, toDisplayString(category.value.label), 9, ["href"])])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="flex flex-wrap gap-2.5 md:gap-3.5"${_scopeId}>`);
						if (__props.event.rsvpUrl) _push(`<a${ssrRenderAttr("href", __props.event.rsvpUrl)} target="_blank" rel="noopener" class="${ssrRenderClass(WHITE_PILL)}"${_scopeId}>${ssrInterpolate(__props.rsvpLabel)}</a>`);
						else _push(`<!---->`);
						if (__props.event.icsUrl || __props.event.gcalUrl) _push(`<a${ssrRenderAttr("href", __props.event.icsUrl || __props.event.gcalUrl)} class="${ssrRenderClass(OUTLINE_PILL)}"${_scopeId}>${ssrInterpolate(__props.addToCalendarLabel)}</a>`);
						else _push(`<!---->`);
						_push(`</div>`);
					} else return [createVNode("div", { class: "flex flex-wrap gap-2.5 md:gap-3.5" }, [__props.event.rsvpUrl ? (openBlock(), createBlock("a", {
						key: 0,
						href: __props.event.rsvpUrl,
						target: "_blank",
						rel: "noopener",
						class: WHITE_PILL
					}, toDisplayString(__props.rsvpLabel), 9, ["href"])) : createCommentVNode("", true), __props.event.icsUrl || __props.event.gcalUrl ? (openBlock(), createBlock("a", {
						key: 1,
						href: __props.event.icsUrl || __props.event.gcalUrl,
						class: OUTLINE_PILL
					}, toDisplayString(__props.addToCalendarLabel), 9, ["href"])) : createCommentVNode("", true)])];
				}),
				_: 1
			}, _parent));
			_push(`<section class="bg-white px-6 pb-14 pt-10 md:pb-24 md:pt-16" data-tone="white"><div class="mx-auto grid max-w-[1140px] items-start gap-10 lg:gap-14 lg:[grid-template-columns:minmax(300px,1fr)_310px]"><article class="flex min-w-0 flex-col gap-[18px] md:gap-6">`);
			if (hasBody.value) _push(`<h2 class="m-0 font-display text-[1.35rem] font-normal leading-[1.2] md:text-[clamp(1.6rem,2.6vw,2.2rem)] md:leading-[1.1]">${ssrInterpolate(__props.aboutLabel)}</h2>`);
			else _push(`<!---->`);
			if (hasImage.value) {
				_push(`<figure class="m-0 flex flex-col"><div class="aspect-video overflow-hidden rounded-[16px] bg-white md:rounded-[20px]">`);
				_push(ssrRenderComponent(ImageSlot_default, {
					src: __props.event.featuredImage.src,
					alt: __props.event.featuredImage.alt,
					loading: "eager"
				}, null, _parent));
				_push(`</div>`);
				if (__props.event.featuredImage.caption || __props.event.featuredImage.credit) _push(`<figcaption class="mt-3 text-[0.9rem] leading-[1.5] text-muted">${ssrInterpolate(__props.event.featuredImage.caption)} ${ssrInterpolate(__props.event.featuredImage.credit)}</figcaption>`);
				else _push(`<!---->`);
				_push(`</figure>`);
			} else _push(`<!---->`);
			if (__props.event.summary) _push(`<p class="m-0 text-[1.08rem] font-semibold leading-[1.6] text-ink md:text-[1.22rem] md:leading-[1.65]">${ssrInterpolate(__props.event.summary)}</p>`);
			else _push(`<!---->`);
			_push(ssrRenderComponent(EventBlocks_default, { blocks: __props.event.blocks }, null, _parent));
			_push(`</article><aside aria-label="Event details" class="flex flex-col gap-6 lg:sticky lg:top-[calc(108px+var(--wp-admin--admin-bar--height,0px))] lg:max-h-[calc(100vh-124px)] lg:overflow-auto">`);
			_push(ssrRenderComponent(LinkListCard_default, {
				heading: __props.detailsLabel,
				rows: detailRows.value,
				class: "[&_.row-label]:text-brand"
			}, null, _parent));
			if (__props.event.rsvpUrl) _push(ssrRenderComponent(CtaCard_default, {
				id: "rsvp",
				title: __props.saveTitle,
				body: __props.saveBody,
				href: __props.event.rsvpUrl,
				label: __props.saveLabel,
				external: ""
			}, null, _parent));
			else _push(`<!---->`);
			if (hasContact.value) _push(ssrRenderComponent(DashedNote_default, { heading: __props.contactLabel }, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (__props.event.contact.name) _push(`<p class="font-bold text-ink"${_scopeId}>${ssrInterpolate(__props.event.contact.name)}</p>`);
						else _push(`<!---->`);
						if (__props.event.contact.email) _push(`<p${_scopeId}><a${ssrRenderAttr("href", `mailto:${__props.event.contact.email}`)}${_scopeId}>${ssrInterpolate(__props.event.contact.email)}</a></p>`);
						else _push(`<!---->`);
						if (__props.event.contact.phone) _push(`<p${_scopeId}><a${ssrRenderAttr("href", `tel:${__props.event.contact.phone.replace(/[^0-9+]/g, "")}`)}${_scopeId}>${ssrInterpolate(__props.event.contact.phone)}</a></p>`);
						else _push(`<!---->`);
					} else return [
						__props.event.contact.name ? (openBlock(), createBlock("p", {
							key: 0,
							class: "font-bold text-ink"
						}, toDisplayString(__props.event.contact.name), 1)) : createCommentVNode("", true),
						__props.event.contact.email ? (openBlock(), createBlock("p", { key: 1 }, [createVNode("a", { href: `mailto:${__props.event.contact.email}` }, toDisplayString(__props.event.contact.email), 9, ["href"])])) : createCommentVNode("", true),
						__props.event.contact.phone ? (openBlock(), createBlock("p", { key: 2 }, [createVNode("a", { href: `tel:${__props.event.contact.phone.replace(/[^0-9+]/g, "")}` }, toDisplayString(__props.event.contact.phone), 9, ["href"])])) : createCommentVNode("", true)
					];
				}),
				_: 1
			}, _parent));
			else _push(`<!---->`);
			_push(`</aside></div></section>`);
			if (moreEvents.value.length > 0) {
				_push(`<section class="bg-alt px-6 pb-14 pt-11 md:pb-24 md:pt-16" data-tone="alt"><div class="mx-auto flex max-w-[1140px] flex-col gap-[18px] md:gap-7"><div class="flex flex-wrap items-baseline justify-between gap-4"><h2 class="m-0 font-display text-[1.35rem] font-normal leading-[1.2] md:text-[clamp(1.6rem,2.8vw,2.2rem)] md:leading-[1.1]">${ssrInterpolate(__props.moreLabel)}</h2><a${ssrRenderAttr("href", __props.calendarUrl)} class="hidden items-center gap-4 text-[1.05rem] font-extrabold uppercase tracking-[0.03em] text-accent no-underline hover:underline hover:underline-offset-4 md:flex">${ssrInterpolate(__props.fullCalendarLabel)} <svg aria-hidden="true" focusable="false" viewBox="0 0 40 20" class="h-5 w-10 flex-none fill-accent"><path d="M0 8.4h26v3.2H0z"></path><path d="M24 1.5 38.5 10 24 18.5Z"></path></svg></a></div><div class="flex flex-col gap-3"><!--[-->`);
				ssrRenderList(moreEvents.value, (ev) => {
					_push(ssrRenderComponent(EventCard_default, {
						key: ev.id,
						event: ev,
						"fallback-url": __props.calendarUrl,
						"view-label": __props.viewLabel,
						subtle: ""
					}, null, _parent));
				});
				_push(`<!--]--></div><a${ssrRenderAttr("href", __props.calendarUrl)} class="flex items-center justify-center gap-3.5 text-[0.95rem] font-extrabold uppercase tracking-[0.03em] text-accent no-underline hover:underline hover:underline-offset-4 md:hidden">${ssrInterpolate(__props.fullCalendarLabel)} <svg aria-hidden="true" focusable="false" viewBox="0 0 40 20" class="h-[17px] w-[34px] flex-none fill-accent"><path d="M0 8.4h26v3.2H0z"></path><path d="M24 1.5 38.5 10 24 18.5Z"></path></svg></a></div></section>`);
			} else _push(`<!---->`);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/components/site/SingleEvent.vue
var _sfc_setup$3 = SingleEvent_vue_vue_type_script_setup_true_lang_default.setup;
SingleEvent_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/SingleEvent.vue");
	return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
var SingleEvent_default = SingleEvent_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/routes/RouteEvent.vue?vue&type=script&setup=true&lang.ts
var RouteEvent_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "RouteEvent",
	__ssrInlineRender: true,
	props: { resolved: {} },
	async setup(__props) {
		let __temp, __restore;
		const props = __props;
		const lang = computed(() => props.resolved.lang);
		const slug = payloadSlug(props.resolved.route);
		const api = useChapterApi();
		const { data: site } = ([__temp, __restore] = withAsyncContext(() => useChapterSite(lang.value)), __temp = await __temp, __restore(), __temp);
		const { data: event } = ([__temp, __restore] = withAsyncContext(() => useChapterData(eventKey(lang.value, slug), () => fetchSingleEvent(api, slug, lang.value))), __temp = await __temp, __restore(), __temp);
		provideRouteLanguages(computed(() => event.value?.languages));
		useRouteSeo(computed(() => event.value?.seo), lang);
		const str = (key, fallback) => site.value?.strings[key] || fallback;
		const labels = computed(() => ({
			crumbHome: str("blog_crumb_home", "Home"),
			crumbCalendar: str("cal_crumb_calendar", "Calendar"),
			rsvpLabel: str("event_rsvp", "RSVP"),
			addToCalendarLabel: str("event_add_calendar", "Add to calendar"),
			aboutLabel: str("event_about", "About this event"),
			detailsLabel: str("event_details", "Details"),
			dateLabel: str("event_date", "Date"),
			timeLabel: str("event_time", "Time"),
			locationLabel: str("event_location", "Location"),
			saveTitle: str("event_save_h", "Save your spot"),
			saveBody: str("event_save_p", "RSVP and we’ll send the details straight to you."),
			saveLabel: str("event_save_cta", "RSVP Now"),
			contactLabel: str("event_contact", "Questions? Contact"),
			moreLabel: str("event_more", "More upcoming events"),
			fullCalendarLabel: str("home_events_all", "Full calendar"),
			viewLabel: str("home_view_event", "View event")
		}));
		return (_ctx, _push, _parent, _attrs) => {
			if (unref(event)) _push(ssrRenderComponent(SingleEvent_default, mergeProps({
				event: unref(event).event,
				categories: unref(event).categories,
				related: unref(event).related,
				"show-related": unref(event).showRelated,
				"home-url": unref(event).homeUrl,
				"calendar-url": unref(event).calendarUrl
			}, labels.value, _attrs), null, _parent));
			else _push(`<!---->`);
		};
	}
});
//#endregion
//#region app/components/routes/RouteEvent.vue
var _sfc_setup$2 = RouteEvent_vue_vue_type_script_setup_true_lang_default.setup;
RouteEvent_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/routes/RouteEvent.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var RouteEvent_default = RouteEvent_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/routes/RouteNotFound.vue?vue&type=script&setup=true&lang.ts
var PILL_WHITE = "rounded-full bg-white px-7 py-[13px] font-display text-[0.9rem] font-normal tracking-[0.04em] text-brand no-underline transition-colors hover:bg-brand-deep hover:text-white md:px-9 md:py-3.5 md:text-base";
var PILL_OUTLINE = "rounded-full border-2 border-white bg-transparent px-[22px] py-[11px] font-display text-[0.9rem] font-normal tracking-[0.04em] text-white no-underline transition-colors hover:border-brand-deep hover:bg-brand-deep md:px-[34px] md:py-3 md:text-base";
var RouteNotFound_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "RouteNotFound",
	__ssrInlineRender: true,
	props: { resolved: {} },
	async setup(__props) {
		let __temp, __restore;
		const props = __props;
		const routes = useChapterRoutes();
		useFreshness();
		const lang = computed(() => props.resolved.lang);
		const { data: site } = ([__temp, __restore] = withAsyncContext(() => useChapterSite(lang.value)), __temp = await __temp, __restore(), __temp);
		const s = computed(() => site.value?.strings ?? {});
		const home = computed(() => frontRoute(routes.value, lang.value)?.path ?? "/");
		const calendar = computed(() => routes.value.routes.find((r) => r.kind === "calendar" && r.lang === lang.value)?.path ?? "/calendar/");
		useHead$1({
			title: s.value.nf_doc_title ?? "Page not found",
			meta: [{
				key: "robots",
				name: "robots",
				content: "noindex,follow"
			}]
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "route-not-found contents" }, _attrs))}><section class="not-found relative overflow-hidden bg-brand px-6 pb-24 pt-20 text-white md:px-10 md:pb-[110px] md:pt-[100px] xl:px-6 xl:pb-[120px] xl:pt-[110px]" data-tone="blue">`);
			_push(ssrRenderComponent(StarGlyph_default, {
				kind: "star",
				class: "absolute left-6 top-9 w-[38px] -rotate-12 text-brand-light md:left-[10%] md:top-[52px] md:w-[46px] xl:left-[12%] xl:top-16 xl:w-[52px]"
			}, null, _parent));
			_push(ssrRenderComponent(StarGlyph_default, {
				kind: "sparkle",
				class: "absolute bottom-[60px] left-[34px] w-7 text-brand-light md:bottom-[70px] md:left-[18%] md:w-8 xl:bottom-20 xl:left-[22%] xl:w-9"
			}, null, _parent));
			_push(ssrRenderComponent(StarGlyph_default, {
				kind: "star-notch",
				class: "absolute right-[22px] top-[52px] w-11 rotate-[14deg] text-brand-light md:right-[12%] md:top-[76px] md:w-[50px] xl:right-[14%] xl:top-[90px] xl:w-14"
			}, null, _parent));
			_push(ssrRenderComponent(StarGlyph_default, {
				kind: "star",
				class: "absolute bottom-12 right-[30px] w-[34px] rotate-[20deg] text-brand-light md:bottom-14 md:right-[8%] md:w-10 xl:bottom-[60px] xl:right-[10%] xl:w-11"
			}, null, _parent));
			_push(`<div class="relative mx-auto flex max-w-[720px] flex-col items-center gap-5 text-center md:max-w-[620px] md:gap-6 xl:max-w-[720px] xl:gap-[26px]"><div aria-hidden="true" class="headline-shadow-sm font-display text-[5.5rem] leading-none md:text-[7.5rem] xl:text-[clamp(5rem,14vw,10rem)]">404</div><h1 class="m-0 max-w-[20ch] font-display text-[1.25rem] font-normal uppercase leading-[1.25] md:max-w-none md:text-[1.6rem] md:leading-[1.2] xl:text-[clamp(1.4rem,2.8vw,2rem)]">${ssrInterpolate(s.value.nf_title ?? "This page got organized out of existence")}</h1><p class="m-0 max-w-[34ch] text-[1.02rem] font-semibold leading-[1.5] md:max-w-[42ch] md:text-[1.12rem] xl:max-w-[44ch] xl:text-[1.2rem]">${ssrInterpolate(s.value.nf_lede ?? "The page you’re looking for isn’t here — it may have moved, or the link may be broken.")}</p><div class="flex flex-wrap justify-center gap-3 md:gap-3.5"><a${ssrRenderAttr("href", home.value)} class="${ssrRenderClass(PILL_WHITE)}">${ssrInterpolate(s.value.nf_home ?? "Back home")}</a><a${ssrRenderAttr("href", calendar.value)} class="${ssrRenderClass(PILL_OUTLINE)}">${ssrInterpolate(s.value.nf_calendar ?? "See the calendar")}</a></div></div></section></div>`);
		};
	}
});
//#endregion
//#region app/components/routes/RouteNotFound.vue
var _sfc_setup$1 = RouteNotFound_vue_vue_type_script_setup_true_lang_default.setup;
RouteNotFound_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/routes/RouteNotFound.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var RouteNotFound_default = RouteNotFound_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/pages/[...slug].vue?vue&type=script&setup=true&lang.ts
var ____slug__vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "[...slug]",
	__ssrInlineRender: true,
	setup(__props) {
		const COMPONENTS = {
			front: RouteFront_default,
			page: RoutePage_default,
			about: RouteAbout_default,
			get_involved: RouteGetInvolved_default,
			calendar: RouteCalendar_default,
			posts_index: RoutePostsIndex_default,
			search: RoutePostsIndex_default,
			post: RoutePost_default,
			event: RouteEvent_default,
			styleguide: defineAsyncComponent(() => import('./RouteStyleguide-BjilFQcz.mjs')),
			not_found: RouteNotFound_default
		};
		const resolved = useResolvedRoute();
		const component = computed(() => COMPONENTS[resolved.value.kind]);
		return (_ctx, _push, _parent, _attrs) => {
			ssrRenderVNode(_push, createVNode(resolveDynamicComponent(component.value), mergeProps({
				resolved: unref(resolved),
				"data-route-kind": unref(resolved).kind
			}, _attrs), null), _parent);
		};
	}
});
//#endregion
//#region app/pages/[...slug].vue
var _sfc_setup = ____slug__vue_vue_type_script_setup_true_lang_default.setup;
____slug__vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/[...slug].vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var ____slug__default = ____slug__vue_vue_type_script_setup_true_lang_default;

export { ____slug__default as default };
//# sourceMappingURL=_...slug_-BvMl6F6Y.mjs.map
