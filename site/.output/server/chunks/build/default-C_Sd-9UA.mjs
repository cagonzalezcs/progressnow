import { u as useResolvedRoute, b as useChapterSite, v as setCategories, A as useChapterLanguages, B as languageState, D as setLanguages, z as cn } from './events-DJ7jaIrK.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, unref, ref, watch, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, Fragment, renderList, reactive, renderSlot, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderSlot, ssrRenderAttr, ssrRenderClass, ssrRenderStyle, ssrRenderList } from 'vue/server-renderer';
import { X, Menu } from 'lucide-vue-next';
import { useForwardPropsEmits, DropdownMenuRoot, useForwardProps, DropdownMenuTrigger, DropdownMenuPortal, DropdownMenuContent, DropdownMenuItem, PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent, DropdownMenuCheckboxItem, DropdownMenuItemIndicator, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, PopoverAnchor } from 'reka-ui';
import { Check, Circle, ChevronRight } from '@lucide/vue';
import { reactiveOmit } from '@vueuse/core';
import '../virtual/entry.mjs';
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

//#region app/lib/location.ts
var location = reactive({
	path: "",
	search: ""
});
//#endregion
//#region app/lib/menu.ts
var menu = reactive({ open: false });
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenu.vue?vue&type=script&setup=true&lang.ts
var DropdownMenu_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "DropdownMenu",
	__ssrInlineRender: true,
	props: {
		defaultOpen: { type: Boolean },
		open: { type: Boolean },
		dir: {},
		modal: { type: Boolean }
	},
	emits: ["update:open"],
	setup(__props, { emit: __emit }) {
		const forwarded = useForwardPropsEmits(__props, __emit);
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(DropdownMenuRoot), mergeProps({ "data-slot": "dropdown-menu" }, unref(forwarded), _attrs), {
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
//#region app/components/ui/dropdown-menu/DropdownMenu.vue
var _sfc_setup$23 = DropdownMenu_vue_vue_type_script_setup_true_lang_default.setup;
DropdownMenu_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenu.vue");
	return _sfc_setup$23 ? _sfc_setup$23(props, ctx) : void 0;
};
var DropdownMenu_default = DropdownMenu_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenuCheckboxItem.vue?vue&type=script&setup=true&lang.ts
var DropdownMenuCheckboxItem_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "DropdownMenuCheckboxItem",
	__ssrInlineRender: true,
	props: {
		modelValue: { type: [Boolean, String] },
		disabled: { type: Boolean },
		textValue: {},
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
	emits: ["select", "update:modelValue"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emits = __emit;
		const delegatedProps = reactiveOmit(props, "class");
		const forwarded = useForwardPropsEmits(delegatedProps, emits);
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(DropdownMenuCheckboxItem), mergeProps({ "data-slot": "dropdown-menu-checkbox-item" }, unref(forwarded), { class: unref(cn)("focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", props.class) }, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<span class="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center"${_scopeId}>`);
						_push(ssrRenderComponent(unref(DropdownMenuItemIndicator), null, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) ssrRenderSlot(_ctx.$slots, "indicator-icon", {}, () => {
									_push(ssrRenderComponent(unref(Check), { class: "size-4" }, null, _parent, _scopeId));
								}, _push, _parent, _scopeId);
								else return [renderSlot(_ctx.$slots, "indicator-icon", {}, () => [createVNode(unref(Check), { class: "size-4" })])];
							}),
							_: 3
						}, _parent, _scopeId));
						_push(`</span>`);
						ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
					} else return [createVNode("span", { class: "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center" }, [createVNode(unref(DropdownMenuItemIndicator), null, {
						default: withCtx(() => [renderSlot(_ctx.$slots, "indicator-icon", {}, () => [createVNode(unref(Check), { class: "size-4" })])]),
						_: 3
					})]), renderSlot(_ctx.$slots, "default")];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenuCheckboxItem.vue
var _sfc_setup$22 = DropdownMenuCheckboxItem_vue_vue_type_script_setup_true_lang_default.setup;
DropdownMenuCheckboxItem_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuCheckboxItem.vue");
	return _sfc_setup$22 ? _sfc_setup$22(props, ctx) : void 0;
};
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenuContent.vue?vue&type=script&setup=true&lang.ts
var DropdownMenuContent_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	inheritAttrs: false,
	__name: "DropdownMenuContent",
	__ssrInlineRender: true,
	props: {
		forceMount: { type: Boolean },
		loop: { type: Boolean },
		memoDependencies: {},
		side: {},
		sideOffset: { default: 4 },
		sideFlip: { type: Boolean },
		align: {},
		alignOffset: {},
		alignFlip: { type: Boolean },
		avoidCollisions: { type: Boolean },
		collisionBoundary: {},
		collisionPadding: {},
		arrowPadding: {},
		hideShiftedArrow: { type: Boolean },
		sticky: {},
		hideWhenDetached: { type: Boolean },
		positionStrategy: {},
		updatePositionStrategy: {},
		disableUpdateOnLayoutShift: { type: Boolean },
		prioritizePosition: { type: Boolean },
		reference: {},
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
	emits: [
		"escapeKeyDown",
		"pointerDownOutside",
		"focusOutside",
		"interactOutside",
		"closeAutoFocus"
	],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emits = __emit;
		const delegatedProps = reactiveOmit(props, "class");
		const forwarded = useForwardPropsEmits(delegatedProps, emits);
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(DropdownMenuPortal), _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(ssrRenderComponent(unref(DropdownMenuContent), mergeProps({ "data-slot": "dropdown-menu-content" }, {
						..._ctx.$attrs,
						...unref(forwarded)
					}, { class: unref(cn)("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--reka-dropdown-menu-content-available-height) min-w-[8rem] origin-(--reka-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border-[3px] border-ink p-1 shadow-popover", props.class) }), {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
							else return [renderSlot(_ctx.$slots, "default")];
						}),
						_: 3
					}, _parent, _scopeId));
					else return [createVNode(unref(DropdownMenuContent), mergeProps({ "data-slot": "dropdown-menu-content" }, {
						..._ctx.$attrs,
						...unref(forwarded)
					}, { class: unref(cn)("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--reka-dropdown-menu-content-available-height) min-w-[8rem] origin-(--reka-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border-[3px] border-ink p-1 shadow-popover", props.class) }), {
						default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
						_: 3
					}, 16, ["class"])];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenuContent.vue
var _sfc_setup$21 = DropdownMenuContent_vue_vue_type_script_setup_true_lang_default.setup;
DropdownMenuContent_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuContent.vue");
	return _sfc_setup$21 ? _sfc_setup$21(props, ctx) : void 0;
};
var DropdownMenuContent_default = DropdownMenuContent_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenuGroup.vue?vue&type=script&setup=true&lang.ts
var DropdownMenuGroup_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "DropdownMenuGroup",
	__ssrInlineRender: true,
	props: {
		asChild: { type: Boolean },
		as: {}
	},
	setup(__props) {
		const props = __props;
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(DropdownMenuGroup), mergeProps({ "data-slot": "dropdown-menu-group" }, props, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default")];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenuGroup.vue
var _sfc_setup$20 = DropdownMenuGroup_vue_vue_type_script_setup_true_lang_default.setup;
DropdownMenuGroup_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuGroup.vue");
	return _sfc_setup$20 ? _sfc_setup$20(props, ctx) : void 0;
};
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenuItem.vue?vue&type=script&setup=true&lang.ts
var DropdownMenuItem_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "DropdownMenuItem",
	__ssrInlineRender: true,
	props: {
		disabled: { type: Boolean },
		textValue: {},
		asChild: { type: Boolean },
		as: {},
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] },
		inset: { type: Boolean },
		variant: { default: "default" }
	},
	setup(__props) {
		const props = __props;
		const delegatedProps = reactiveOmit(props, "inset", "variant", "class");
		const forwardedProps = useForwardProps(delegatedProps);
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(DropdownMenuItem), mergeProps({
				"data-slot": "dropdown-menu-item",
				"data-inset": __props.inset ? "" : void 0,
				"data-variant": __props.variant
			}, unref(forwardedProps), { class: unref(cn)("focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", props.class) }, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default")];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenuItem.vue
var _sfc_setup$19 = DropdownMenuItem_vue_vue_type_script_setup_true_lang_default.setup;
DropdownMenuItem_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuItem.vue");
	return _sfc_setup$19 ? _sfc_setup$19(props, ctx) : void 0;
};
var DropdownMenuItem_default = DropdownMenuItem_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenuLabel.vue?vue&type=script&setup=true&lang.ts
var DropdownMenuLabel_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "DropdownMenuLabel",
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
		] },
		inset: { type: Boolean }
	},
	setup(__props) {
		const props = __props;
		const delegatedProps = reactiveOmit(props, "class", "inset");
		const forwardedProps = useForwardProps(delegatedProps);
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(DropdownMenuLabel), mergeProps({
				"data-slot": "dropdown-menu-label",
				"data-inset": __props.inset ? "" : void 0
			}, unref(forwardedProps), { class: unref(cn)("px-2 py-1.5 text-sm font-medium data-[inset]:pl-8", props.class) }, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default")];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenuLabel.vue
var _sfc_setup$18 = DropdownMenuLabel_vue_vue_type_script_setup_true_lang_default.setup;
DropdownMenuLabel_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuLabel.vue");
	return _sfc_setup$18 ? _sfc_setup$18(props, ctx) : void 0;
};
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenuRadioGroup.vue?vue&type=script&setup=true&lang.ts
var DropdownMenuRadioGroup_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "DropdownMenuRadioGroup",
	__ssrInlineRender: true,
	props: {
		modelValue: {},
		asChild: { type: Boolean },
		as: {}
	},
	emits: ["update:modelValue"],
	setup(__props, { emit: __emit }) {
		const forwarded = useForwardPropsEmits(__props, __emit);
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(DropdownMenuRadioGroup), mergeProps({ "data-slot": "dropdown-menu-radio-group" }, unref(forwarded), _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default")];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenuRadioGroup.vue
var _sfc_setup$17 = DropdownMenuRadioGroup_vue_vue_type_script_setup_true_lang_default.setup;
DropdownMenuRadioGroup_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuRadioGroup.vue");
	return _sfc_setup$17 ? _sfc_setup$17(props, ctx) : void 0;
};
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenuRadioItem.vue?vue&type=script&setup=true&lang.ts
var DropdownMenuRadioItem_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "DropdownMenuRadioItem",
	__ssrInlineRender: true,
	props: {
		value: {},
		disabled: { type: Boolean },
		textValue: {},
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
	emits: ["select"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emits = __emit;
		const delegatedProps = reactiveOmit(props, "class");
		const forwarded = useForwardPropsEmits(delegatedProps, emits);
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(DropdownMenuRadioItem), mergeProps({ "data-slot": "dropdown-menu-radio-item" }, unref(forwarded), { class: unref(cn)("focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", props.class) }, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<span class="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center"${_scopeId}>`);
						_push(ssrRenderComponent(unref(DropdownMenuItemIndicator), null, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) ssrRenderSlot(_ctx.$slots, "indicator-icon", {}, () => {
									_push(ssrRenderComponent(unref(Circle), { class: "size-2 fill-current" }, null, _parent, _scopeId));
								}, _push, _parent, _scopeId);
								else return [renderSlot(_ctx.$slots, "indicator-icon", {}, () => [createVNode(unref(Circle), { class: "size-2 fill-current" })])];
							}),
							_: 3
						}, _parent, _scopeId));
						_push(`</span>`);
						ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
					} else return [createVNode("span", { class: "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center" }, [createVNode(unref(DropdownMenuItemIndicator), null, {
						default: withCtx(() => [renderSlot(_ctx.$slots, "indicator-icon", {}, () => [createVNode(unref(Circle), { class: "size-2 fill-current" })])]),
						_: 3
					})]), renderSlot(_ctx.$slots, "default")];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenuRadioItem.vue
var _sfc_setup$16 = DropdownMenuRadioItem_vue_vue_type_script_setup_true_lang_default.setup;
DropdownMenuRadioItem_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuRadioItem.vue");
	return _sfc_setup$16 ? _sfc_setup$16(props, ctx) : void 0;
};
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenuSeparator.vue?vue&type=script&setup=true&lang.ts
var DropdownMenuSeparator_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "DropdownMenuSeparator",
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
			_push(ssrRenderComponent(unref(DropdownMenuSeparator), mergeProps({ "data-slot": "dropdown-menu-separator" }, unref(delegatedProps), { class: unref(cn)("bg-border -mx-1 my-1 h-px", props.class) }, _attrs), null, _parent));
		};
	}
});
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenuSeparator.vue
var _sfc_setup$15 = DropdownMenuSeparator_vue_vue_type_script_setup_true_lang_default.setup;
DropdownMenuSeparator_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuSeparator.vue");
	return _sfc_setup$15 ? _sfc_setup$15(props, ctx) : void 0;
};
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenuShortcut.vue?vue&type=script&setup=true&lang.ts
var DropdownMenuShortcut_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "DropdownMenuShortcut",
	__ssrInlineRender: true,
	props: { class: { type: [
		Boolean,
		null,
		String,
		Object,
		Array
	] } },
	setup(__props) {
		const props = __props;
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<span${ssrRenderAttrs(mergeProps({
				"data-slot": "dropdown-menu-shortcut",
				class: unref(cn)("text-muted-foreground ml-auto text-xs tracking-widest", props.class)
			}, _attrs))}>`);
			ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
			_push(`</span>`);
		};
	}
});
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenuShortcut.vue
var _sfc_setup$14 = DropdownMenuShortcut_vue_vue_type_script_setup_true_lang_default.setup;
DropdownMenuShortcut_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuShortcut.vue");
	return _sfc_setup$14 ? _sfc_setup$14(props, ctx) : void 0;
};
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenuSub.vue?vue&type=script&setup=true&lang.ts
var DropdownMenuSub_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "DropdownMenuSub",
	__ssrInlineRender: true,
	props: {
		defaultOpen: { type: Boolean },
		open: { type: Boolean }
	},
	emits: ["update:open"],
	setup(__props, { emit: __emit }) {
		const forwarded = useForwardPropsEmits(__props, __emit);
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(DropdownMenuSub), mergeProps({ "data-slot": "dropdown-menu-sub" }, unref(forwarded), _attrs), {
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
//#region app/components/ui/dropdown-menu/DropdownMenuSub.vue
var _sfc_setup$13 = DropdownMenuSub_vue_vue_type_script_setup_true_lang_default.setup;
DropdownMenuSub_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuSub.vue");
	return _sfc_setup$13 ? _sfc_setup$13(props, ctx) : void 0;
};
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenuSubContent.vue?vue&type=script&setup=true&lang.ts
var DropdownMenuSubContent_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "DropdownMenuSubContent",
	__ssrInlineRender: true,
	props: {
		forceMount: { type: Boolean },
		loop: { type: Boolean },
		memoDependencies: {},
		sideOffset: {},
		sideFlip: { type: Boolean },
		alignOffset: {},
		alignFlip: { type: Boolean },
		avoidCollisions: { type: Boolean },
		collisionBoundary: {},
		collisionPadding: {},
		arrowPadding: {},
		hideShiftedArrow: { type: Boolean },
		sticky: {},
		hideWhenDetached: { type: Boolean },
		positionStrategy: {},
		updatePositionStrategy: {},
		disableUpdateOnLayoutShift: { type: Boolean },
		prioritizePosition: { type: Boolean },
		reference: {},
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
	emits: [
		"escapeKeyDown",
		"pointerDownOutside",
		"focusOutside",
		"interactOutside",
		"entryFocus",
		"openAutoFocus",
		"closeAutoFocus"
	],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emits = __emit;
		const delegatedProps = reactiveOmit(props, "class");
		const forwarded = useForwardPropsEmits(delegatedProps, emits);
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(DropdownMenuSubContent), mergeProps({ "data-slot": "dropdown-menu-sub-content" }, unref(forwarded), { class: unref(cn)("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--reka-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border-[3px] border-ink p-1 shadow-popover", props.class) }, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default")];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenuSubContent.vue
var _sfc_setup$12 = DropdownMenuSubContent_vue_vue_type_script_setup_true_lang_default.setup;
DropdownMenuSubContent_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuSubContent.vue");
	return _sfc_setup$12 ? _sfc_setup$12(props, ctx) : void 0;
};
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenuSubTrigger.vue?vue&type=script&setup=true&lang.ts
var DropdownMenuSubTrigger_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "DropdownMenuSubTrigger",
	__ssrInlineRender: true,
	props: {
		disabled: { type: Boolean },
		textValue: {},
		asChild: { type: Boolean },
		as: {},
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] },
		inset: { type: Boolean }
	},
	setup(__props) {
		const props = __props;
		const delegatedProps = reactiveOmit(props, "class", "inset");
		const forwardedProps = useForwardProps(delegatedProps);
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(DropdownMenuSubTrigger), mergeProps({ "data-slot": "dropdown-menu-sub-trigger" }, unref(forwardedProps), {
				"data-inset": __props.inset ? "" : void 0,
				class: unref(cn)("focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground", props.class)
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
						_push(ssrRenderComponent(unref(ChevronRight), { class: "ml-auto size-4" }, null, _parent, _scopeId));
					} else return [renderSlot(_ctx.$slots, "default"), createVNode(unref(ChevronRight), { class: "ml-auto size-4" })];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenuSubTrigger.vue
var _sfc_setup$11 = DropdownMenuSubTrigger_vue_vue_type_script_setup_true_lang_default.setup;
DropdownMenuSubTrigger_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuSubTrigger.vue");
	return _sfc_setup$11 ? _sfc_setup$11(props, ctx) : void 0;
};
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenuTrigger.vue?vue&type=script&setup=true&lang.ts
var DropdownMenuTrigger_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "DropdownMenuTrigger",
	__ssrInlineRender: true,
	props: {
		disabled: { type: Boolean },
		asChild: { type: Boolean },
		as: {}
	},
	setup(__props) {
		const forwardedProps = useForwardProps(__props);
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(DropdownMenuTrigger), mergeProps({ "data-slot": "dropdown-menu-trigger" }, unref(forwardedProps), _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default")];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region app/components/ui/dropdown-menu/DropdownMenuTrigger.vue
var _sfc_setup$10 = DropdownMenuTrigger_vue_vue_type_script_setup_true_lang_default.setup;
DropdownMenuTrigger_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuTrigger.vue");
	return _sfc_setup$10 ? _sfc_setup$10(props, ctx) : void 0;
};
var DropdownMenuTrigger_default = DropdownMenuTrigger_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/composables/useA11ySettings.ts
var DEFAULTS = {
	textSize: "default",
	highContrast: false,
	reduceMotion: false
};
var settings;
function load() {
	return { ...DEFAULTS };
}
function useA11ySettings() {
	if (!settings) settings = reactive(load());
	return {
		settings,
		setTextSize: (size) => settings.textSize = size,
		toggleHighContrast: () => settings.highContrast = !settings.highContrast,
		toggleReduceMotion: () => settings.reduceMotion = !settings.reduceMotion
	};
}
//#endregion
//#region app/components/ui/popover/Popover.vue?vue&type=script&setup=true&lang.ts
var Popover_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "Popover",
	__ssrInlineRender: true,
	props: {
		defaultOpen: { type: Boolean },
		open: { type: Boolean },
		modal: { type: Boolean }
	},
	emits: ["update:open"],
	setup(__props, { emit: __emit }) {
		const forwarded = useForwardPropsEmits(__props, __emit);
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(PopoverRoot), mergeProps({ "data-slot": "popover" }, unref(forwarded), _attrs), {
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
//#region app/components/ui/popover/Popover.vue
var _sfc_setup$9 = Popover_vue_vue_type_script_setup_true_lang_default.setup;
Popover_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/popover/Popover.vue");
	return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
var Popover_default = Popover_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/ui/popover/PopoverAnchor.vue?vue&type=script&setup=true&lang.ts
var PopoverAnchor_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "PopoverAnchor",
	__ssrInlineRender: true,
	props: {
		reference: {},
		asChild: { type: Boolean },
		as: {}
	},
	setup(__props) {
		const props = __props;
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(PopoverAnchor), mergeProps({ "data-slot": "popover-anchor" }, props, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default")];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region app/components/ui/popover/PopoverAnchor.vue
var _sfc_setup$8 = PopoverAnchor_vue_vue_type_script_setup_true_lang_default.setup;
PopoverAnchor_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/popover/PopoverAnchor.vue");
	return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
//#endregion
//#region app/components/ui/popover/PopoverContent.vue?vue&type=script&setup=true&lang.ts
var PopoverContent_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	inheritAttrs: false,
	__name: "PopoverContent",
	__ssrInlineRender: true,
	props: {
		forceMount: { type: Boolean },
		memoDependencies: {},
		side: {},
		sideOffset: { default: 4 },
		sideFlip: { type: Boolean },
		align: { default: "center" },
		alignOffset: {},
		alignFlip: { type: Boolean },
		avoidCollisions: { type: Boolean },
		collisionBoundary: {},
		collisionPadding: {},
		arrowPadding: {},
		hideShiftedArrow: { type: Boolean },
		sticky: {},
		hideWhenDetached: { type: Boolean },
		positionStrategy: {},
		updatePositionStrategy: {},
		disableUpdateOnLayoutShift: { type: Boolean },
		prioritizePosition: { type: Boolean },
		reference: {},
		dir: {},
		asChild: { type: Boolean },
		as: {},
		disableOutsidePointerEvents: { type: Boolean },
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] }
	},
	emits: [
		"escapeKeyDown",
		"pointerDownOutside",
		"focusOutside",
		"interactOutside",
		"openAutoFocus",
		"closeAutoFocus"
	],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emits = __emit;
		const delegatedProps = reactiveOmit(props, "class");
		const forwarded = useForwardPropsEmits(delegatedProps, emits);
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(PopoverPortal), _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(ssrRenderComponent(unref(PopoverContent), mergeProps({ "data-slot": "popover-content" }, {
						..._ctx.$attrs,
						...unref(forwarded)
					}, { class: unref(cn)("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 rounded-md border-[3px] border-ink p-4 shadow-popover origin-(--reka-popover-content-transform-origin) outline-hidden", props.class) }), {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
							else return [renderSlot(_ctx.$slots, "default")];
						}),
						_: 3
					}, _parent, _scopeId));
					else return [createVNode(unref(PopoverContent), mergeProps({ "data-slot": "popover-content" }, {
						..._ctx.$attrs,
						...unref(forwarded)
					}, { class: unref(cn)("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 rounded-md border-[3px] border-ink p-4 shadow-popover origin-(--reka-popover-content-transform-origin) outline-hidden", props.class) }), {
						default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
						_: 3
					}, 16, ["class"])];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region app/components/ui/popover/PopoverContent.vue
var _sfc_setup$7 = PopoverContent_vue_vue_type_script_setup_true_lang_default.setup;
PopoverContent_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/popover/PopoverContent.vue");
	return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
var PopoverContent_default = PopoverContent_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/ui/popover/PopoverTrigger.vue?vue&type=script&setup=true&lang.ts
var PopoverTrigger_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "PopoverTrigger",
	__ssrInlineRender: true,
	props: {
		asChild: { type: Boolean },
		as: {}
	},
	setup(__props) {
		const props = __props;
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(PopoverTrigger), mergeProps({ "data-slot": "popover-trigger" }, props, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent, _scopeId);
					else return [renderSlot(_ctx.$slots, "default")];
				}),
				_: 3
			}, _parent));
		};
	}
});
//#endregion
//#region app/components/ui/popover/PopoverTrigger.vue
var _sfc_setup$6 = PopoverTrigger_vue_vue_type_script_setup_true_lang_default.setup;
PopoverTrigger_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/popover/PopoverTrigger.vue");
	return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
var PopoverTrigger_default = PopoverTrigger_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/A11yWidget.vue?vue&type=script&setup=true&lang.ts
var rowClass = "flex cursor-pointer items-center justify-between gap-3 border-0 bg-transparent p-0 text-left text-[0.9rem] font-bold text-ink";
var A11yWidget_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "A11yWidget",
	__ssrInlineRender: true,
	props: { size: { default: "desktop" } },
	setup(__props) {
		const { settings, setTextSize, toggleHighContrast, toggleReduceMotion } = useA11ySettings();
		const sizes = [
			{
				value: "default",
				label: "A"
			},
			{
				value: "large",
				label: "A+"
			},
			{
				value: "xl",
				label: "A++"
			}
		];
		const TRIGGER = {
			desktop: "h-[42px] px-[18px] text-[0.95rem]",
			tablet: "h-11 px-4 text-[0.9rem]"
		};
		function pillClass(on) {
			return ["rounded-full border px-3 py-1 text-[0.75rem] font-bold uppercase tracking-[0.06em]", on ? "border-brand bg-brand text-white" : "border-control bg-transparent text-muted"].join(" ");
		}
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(Popover_default), _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(PopoverTrigger_default), {
							class: ["a11y-widget box-border inline-flex cursor-pointer items-center rounded-full border-0 bg-white font-display font-normal text-brand transition-colors hover:bg-brand-deep hover:text-white", TRIGGER[__props.size]],
							"aria-label": "Accessibility options",
							title: "Accessibility options"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Aa `);
								else return [createTextVNode(" Aa ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(PopoverContent_default), {
							align: "end",
							class: "z-[200] w-[280px] rounded-[14px] border-0 bg-white p-[18px] font-sans text-ink shadow-popover"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<div class="flex flex-col gap-4"${_scopeId}><div class="text-base font-bold"${_scopeId}>Accessibility</div><div class="flex flex-col gap-2"${_scopeId}><div class="text-[0.9rem] font-bold"${_scopeId}>Text size</div><div class="flex gap-1.5"${_scopeId}><!--[-->`);
									ssrRenderList(sizes, (s) => {
										_push(`<button type="button" class="${ssrRenderClass([unref(settings).textSize === s.value ? "border-ink bg-ink text-white" : "border-control bg-white text-ink hover:bg-alt", "flex-1 cursor-pointer rounded-[8px] border py-2 text-[0.95rem] font-bold"])}"${ssrRenderAttr("aria-pressed", unref(settings).textSize === s.value)}${_scopeId}>${ssrInterpolate(s.label)}</button>`);
									});
									_push(`<!--]--></div></div><button type="button" class="${ssrRenderClass(rowClass)}"${ssrRenderAttr("aria-pressed", unref(settings).highContrast)}${_scopeId}><span${_scopeId}>High contrast</span><span class="${ssrRenderClass(pillClass(unref(settings).highContrast))}"${_scopeId}>${ssrInterpolate(unref(settings).highContrast ? "On" : "Off")}</span></button><button type="button" class="${ssrRenderClass(rowClass)}"${ssrRenderAttr("aria-pressed", unref(settings).reduceMotion)}${_scopeId}><span${_scopeId}>Reduce motion</span><span class="${ssrRenderClass(pillClass(unref(settings).reduceMotion))}"${_scopeId}>${ssrInterpolate(unref(settings).reduceMotion ? "On" : "Off")}</span></button></div>`);
								} else return [createVNode("div", { class: "flex flex-col gap-4" }, [
									createVNode("div", { class: "text-base font-bold" }, "Accessibility"),
									createVNode("div", { class: "flex flex-col gap-2" }, [createVNode("div", { class: "text-[0.9rem] font-bold" }, "Text size"), createVNode("div", { class: "flex gap-1.5" }, [(openBlock(), createBlock(Fragment, null, renderList(sizes, (s) => {
										return createVNode("button", {
											key: s.value,
											type: "button",
											class: ["flex-1 cursor-pointer rounded-[8px] border py-2 text-[0.95rem] font-bold", unref(settings).textSize === s.value ? "border-ink bg-ink text-white" : "border-control bg-white text-ink hover:bg-alt"],
											"aria-pressed": unref(settings).textSize === s.value,
											onClick: ($event) => unref(setTextSize)(s.value)
										}, toDisplayString(s.label), 11, ["aria-pressed", "onClick"]);
									}), 64))])]),
									createVNode("button", {
										type: "button",
										class: rowClass,
										"aria-pressed": unref(settings).highContrast,
										onClick: ($event) => unref(toggleHighContrast)()
									}, [createVNode("span", null, "High contrast"), createVNode("span", { class: pillClass(unref(settings).highContrast) }, toDisplayString(unref(settings).highContrast ? "On" : "Off"), 3)], 8, ["aria-pressed", "onClick"]),
									createVNode("button", {
										type: "button",
										class: rowClass,
										"aria-pressed": unref(settings).reduceMotion,
										onClick: ($event) => unref(toggleReduceMotion)()
									}, [createVNode("span", null, "Reduce motion"), createVNode("span", { class: pillClass(unref(settings).reduceMotion) }, toDisplayString(unref(settings).reduceMotion ? "On" : "Off"), 3)], 8, ["aria-pressed", "onClick"])
								])];
							}),
							_: 1
						}, _parent, _scopeId));
					} else return [createVNode(unref(PopoverTrigger_default), {
						class: ["a11y-widget box-border inline-flex cursor-pointer items-center rounded-full border-0 bg-white font-display font-normal text-brand transition-colors hover:bg-brand-deep hover:text-white", TRIGGER[__props.size]],
						"aria-label": "Accessibility options",
						title: "Accessibility options"
					}, {
						default: withCtx(() => [createTextVNode(" Aa ")]),
						_: 1
					}, 8, ["class"]), createVNode(unref(PopoverContent_default), {
						align: "end",
						class: "z-[200] w-[280px] rounded-[14px] border-0 bg-white p-[18px] font-sans text-ink shadow-popover"
					}, {
						default: withCtx(() => [createVNode("div", { class: "flex flex-col gap-4" }, [
							createVNode("div", { class: "text-base font-bold" }, "Accessibility"),
							createVNode("div", { class: "flex flex-col gap-2" }, [createVNode("div", { class: "text-[0.9rem] font-bold" }, "Text size"), createVNode("div", { class: "flex gap-1.5" }, [(openBlock(), createBlock(Fragment, null, renderList(sizes, (s) => {
								return createVNode("button", {
									key: s.value,
									type: "button",
									class: ["flex-1 cursor-pointer rounded-[8px] border py-2 text-[0.95rem] font-bold", unref(settings).textSize === s.value ? "border-ink bg-ink text-white" : "border-control bg-white text-ink hover:bg-alt"],
									"aria-pressed": unref(settings).textSize === s.value,
									onClick: ($event) => unref(setTextSize)(s.value)
								}, toDisplayString(s.label), 11, ["aria-pressed", "onClick"]);
							}), 64))])]),
							createVNode("button", {
								type: "button",
								class: rowClass,
								"aria-pressed": unref(settings).highContrast,
								onClick: ($event) => unref(toggleHighContrast)()
							}, [createVNode("span", null, "High contrast"), createVNode("span", { class: pillClass(unref(settings).highContrast) }, toDisplayString(unref(settings).highContrast ? "On" : "Off"), 3)], 8, ["aria-pressed", "onClick"]),
							createVNode("button", {
								type: "button",
								class: rowClass,
								"aria-pressed": unref(settings).reduceMotion,
								onClick: ($event) => unref(toggleReduceMotion)()
							}, [createVNode("span", null, "Reduce motion"), createVNode("span", { class: pillClass(unref(settings).reduceMotion) }, toDisplayString(unref(settings).reduceMotion ? "On" : "Off"), 3)], 8, ["aria-pressed", "onClick"])
						])]),
						_: 1
					})];
				}),
				_: 1
			}, _parent));
		};
	}
});
//#endregion
//#region app/components/site/A11yWidget.vue
var _sfc_setup$5 = A11yWidget_vue_vue_type_script_setup_true_lang_default.setup;
A11yWidget_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/A11yWidget.vue");
	return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
var A11yWidget_default = A11yWidget_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/WordmarkLockup.vue?vue&type=script&setup=true&lang.ts
var WordmarkLockup_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "WordmarkLockup",
	__ssrInlineRender: true,
	props: {
		name: {},
		size: { default: "header" }
	},
	setup(__props) {
		const DIAMOND = {
			header: "size-5 rounded-[4px]",
			tablet: "size-[18px] rounded-[4px]",
			footer: "size-[18px] rounded-[4px]",
			mobile: "size-4 rounded-[3px]"
		};
		const NAME = {
			header: "text-[1.35rem] tracking-[0.01em]",
			tablet: "text-[1.2rem] tracking-[0.01em]",
			footer: "text-[1.25rem]",
			mobile: "text-[clamp(0.9rem,4.5vw,1.1rem)]"
		};
		const GAP = {
			header: "gap-[13px]",
			tablet: "gap-3",
			footer: "gap-3",
			mobile: "gap-2.5"
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<span${ssrRenderAttrs(mergeProps({ class: ["inline-flex min-w-0 items-center", GAP[__props.size]] }, _attrs))}><span aria-hidden="true" class="${ssrRenderClass(["block flex-none rotate-45 bg-yellow", DIAMOND[__props.size]])}"></span><span class="${ssrRenderClass(["font-display font-normal uppercase leading-[1.05] text-white", NAME[__props.size]])}">${ssrInterpolate(__props.name)}</span></span>`);
		};
	}
});
//#endregion
//#region app/components/site/WordmarkLockup.vue
var _sfc_setup$4 = WordmarkLockup_vue_vue_type_script_setup_true_lang_default.setup;
WordmarkLockup_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/WordmarkLockup.vue");
	return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
var WordmarkLockup_default = WordmarkLockup_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/LanguageToggle.vue?vue&type=script&setup=true&lang.ts
var segmentClass = "box-border inline-flex cursor-pointer items-center self-stretch rounded-full border-[3px] px-[13px] font-display text-[0.8rem] leading-none font-normal tracking-[0.04em] no-underline hover:underline hover:underline-offset-[3px]";
var LanguageToggle_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "LanguageToggle",
	__ssrInlineRender: true,
	props: {
		languages: { default: () => [] },
		size: { default: "desktop" }
	},
	setup(__props) {
		const HEIGHT = {
			desktop: "h-[42px]",
			tablet: "h-11",
			mobile: "h-11"
		};
		return (_ctx, _push, _parent, _attrs) => {
			if (__props.languages.length > 1) {
				_push(`<div${ssrRenderAttrs(mergeProps({
					role: "group",
					"aria-label": "Language",
					class: ["notranslate box-border flex items-center gap-0.5 overflow-hidden rounded-full bg-white px-1", HEIGHT[__props.size]]
				}, _attrs))}><!--[-->`);
				ssrRenderList(__props.languages, (lang) => {
					_push(`<a${ssrRenderAttr("href", lang.url)} data-native-nav${ssrRenderAttr("lang", lang.code)}${ssrRenderAttr("title", lang.name)}${ssrRenderAttr("aria-current", lang.active ? "true" : void 0)} class="${ssrRenderClass([segmentClass, lang.active ? "border-white bg-brand text-white" : "border-transparent bg-transparent text-brand"])}">${ssrInterpolate(lang.label)}</a>`);
				});
				_push(`<!--]--></div>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region app/components/site/LanguageToggle.vue
var _sfc_setup$3 = LanguageToggle_vue_vue_type_script_setup_true_lang_default.setup;
LanguageToggle_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/LanguageToggle.vue");
	return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
var LanguageToggle_default = LanguageToggle_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/SiteHeader.vue?vue&type=script&setup=true&lang.ts
var navLinkClass = "rounded-[10px] px-3.5 py-2.5 font-display text-[1.06rem] font-normal text-white no-underline hover:bg-[rgba(27,27,34,0.22)]";
var navLinkTabletClass = "inline-flex min-h-11 items-center rounded-[10px] px-3 py-[9px] font-display text-[0.98rem] font-normal text-white no-underline hover:bg-[rgba(27,27,34,0.22)]";
var currentClass = "underline decoration-[3px] underline-offset-[6px]";
var pillClass = "box-border inline-flex items-center rounded-full bg-white font-display font-normal text-brand no-underline transition-colors hover:bg-brand-deep hover:text-white";
var aboutItemClass = "rounded-[9px] px-[15px] py-[11px] text-base font-semibold text-ink focus:bg-brand-deep focus:text-white";
var PANEL_ID = "site-menu-panel";
var SiteHeader_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "SiteHeader",
	__ssrInlineRender: true,
	props: {
		joinUrl: { default: "/get-involved/#join" },
		joinLabel: { default: "Join Now" },
		joinShortLabel: { default: "" },
		aboutLabel: { default: "About" },
		logoUrl: { default: "" },
		logoIsDefault: {
			type: Boolean,
			default: true
		},
		orgName: { default: "Progress Now" },
		homeUrl: { default: "/" },
		aboutItems: { default: () => [
			{
				label: "About the Chapter",
				href: "/about/"
			},
			{
				label: "Mission & History",
				href: "/about/#mission"
			},
			{
				label: "Where We Organize",
				href: "/about/#counties"
			},
			{
				label: "Committees",
				href: "/about/#committees"
			},
			{
				label: "Bylaws & Code of Conduct",
				href: "/about/#bylaws"
			},
			{
				label: "FAQ",
				href: "/about/#faq"
			}
		] },
		navItems: { default: () => [
			{
				label: "Calendar",
				href: "/calendar/"
			},
			{
				label: "Blog",
				href: "/blog/"
			},
			{
				label: "Get Involved",
				href: "/get-involved/"
			}
		] },
		currentPath: { default: "" },
		languages: { default: () => [] }
	},
	setup(__props) {
		const props = __props;
		const showLockup = computed(() => props.logoIsDefault || !props.logoUrl);
		const flatNav = computed(() => [{
			label: props.aboutLabel,
			href: props.aboutItems[0]?.href ?? "/about/"
		}, ...props.navItems]);
		const joinShort = computed(() => props.joinShortLabel || props.joinLabel);
		ref(null);
		const panelOpen = computed(() => menu.open);
		watch(panelOpen, (open) => {});
		const { settings} = useA11ySettings();
		const textSizes = [
			{
				value: "default",
				label: "A"
			},
			{
				value: "large",
				label: "A+"
			},
			{
				value: "xl",
				label: "A++"
			}
		];
		const currentPath = computed(() => location.path || props.currentPath);
		if (!languageState.list.length) setLanguages(props.languages);
		const currentLanguages = computed(() => languageState.list.length ? languageState.list : props.languages);
		/** Normalize to a comparable pathname: strip origin from absolute menu hrefs,
		* drop hash/query, and normalize the trailing slash. */
		function normalizePath(href) {
			let path = href;
			try {
				path = new URL(href, "http://localhost").pathname;
			} catch {}
			return path !== "/" ? path.replace(/\/$/, "") : path;
		}
		function isCurrent(href) {
			if (currentPath.value === "") return false;
			return normalizePath(href) === normalizePath(currentPath.value);
		}
		const isAboutCurrent = computed(() => props.aboutItems.some((item) => isCurrent(item.href)));
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<header${ssrRenderAttrs(mergeProps({
				class: "site-header sticky top-0 z-100 bg-brand font-sans shadow-header [.admin-bar_&]:top-[var(--wp-admin--admin-bar--height,32px)]",
				"data-tone": "blue"
			}, _attrs))}><div class="md:hidden"><div class="flex min-h-[60px] items-center justify-between gap-3 px-4 py-2"><a${ssrRenderAttr("href", __props.homeUrl)}${ssrRenderAttr("aria-label", `${__props.orgName} home`)} class="flex min-h-11 min-w-0 flex-1 items-center no-underline">`);
			if (showLockup.value) _push(ssrRenderComponent(WordmarkLockup_default, {
				name: __props.orgName,
				size: "mobile"
			}, null, _parent));
			else _push(`<img${ssrRenderAttr("src", __props.logoUrl)}${ssrRenderAttr("alt", __props.orgName)} class="block h-9 w-auto max-w-[200px]">`);
			_push(`</a><div class="flex flex-none items-center gap-2"><a${ssrRenderAttr("href", __props.joinUrl)} target="_blank" rel="noopener" class="${ssrRenderClass(`${pillClass} h-11 px-3.5 text-[0.82rem]`)}">${ssrInterpolate(joinShort.value)}</a><button type="button" class="inline-flex size-11 cursor-pointer items-center justify-center rounded-[12px] border-2 border-white/60 bg-transparent text-white hover:bg-[rgba(27,27,34,0.22)]"${ssrRenderAttr("aria-expanded", panelOpen.value)}${ssrRenderAttr("aria-controls", PANEL_ID)} aria-label="Menu">`);
			if (panelOpen.value) _push(ssrRenderComponent(unref(X), { class: "size-6" }, null, _parent));
			else _push(ssrRenderComponent(unref(Menu), { class: "size-6" }, null, _parent));
			_push(`</button></div></div><div${ssrRenderAttr("id", PANEL_ID)} class="fixed inset-x-0 bottom-0 top-[calc(60px+var(--wp-admin--admin-bar--height,0px))] z-90 flex flex-col overflow-auto border-t border-white/25 bg-brand" data-tone="blue" style="${ssrRenderStyle(panelOpen.value ? null : { display: "none" })}"><nav aria-label="Main" class="relative flex flex-1 flex-col gap-1 px-4 py-6"><svg aria-hidden="true" focusable="false" viewBox="0 0 61.68 70.82" class="absolute right-6 top-[30px] h-auto w-9 rotate-[14deg] text-brand-light"><path fill="currentColor" d="M61.62,30.6l-18.24,9.31,3.72,30.13c-.77.87-14.53-15.43-19.5-20.52l-19.92,21.3,5.64-27.87c-.42-1.74-13.32-8.86-13.32-8.86l18.75-6.92C20.92,23.99,31.04-.65,31.03.01l3.62,27.13c.31.69,28.45,2.78,26.97,3.46Z"></path></svg><svg aria-hidden="true" focusable="false" viewBox="0 0 41.72 45.56" class="absolute bottom-10 right-10 h-auto w-[26px] text-brand-light"><polygon fill="currentColor" points="25.85 16.6 41.72 23.74 27.94 27.33 22.78 45.56 15.78 30.31 0 38.44 9.45 22.37 3.27 13.79 14.39 13.86 28.2 0 25.85 16.6"></polygon></svg><!--[-->`);
			ssrRenderList(flatNav.value, (item) => {
				_push(`<a${ssrRenderAttr("href", item.href)} class="${ssrRenderClass([isCurrent(item.href) ? "bg-[rgba(27,27,34,0.22)]" : "", "relative rounded-[12px] px-3 py-4 font-display text-[1.6rem] font-normal uppercase text-white no-underline hover:bg-[rgba(27,27,34,0.22)]"])}"${ssrRenderAttr("aria-current", isCurrent(item.href) ? "page" : void 0)}>${ssrInterpolate(item.label)}</a>`);
			});
			_push(`<!--]--><a${ssrRenderAttr("href", __props.joinUrl)} target="_blank" rel="noopener" class="relative mx-3 mt-6 rounded-full bg-white px-3 py-[15px] text-center font-display text-base font-normal uppercase tracking-[0.04em] text-brand no-underline transition-colors hover:bg-brand-deep hover:text-white">${ssrInterpolate(__props.joinLabel)}</a></nav><div class="mt-auto flex items-center justify-between gap-3 border-t border-white/25 px-6 pb-7 pt-[18px]">`);
			_push(ssrRenderComponent(LanguageToggle_default, {
				languages: currentLanguages.value,
				size: "mobile"
			}, null, _parent));
			_push(`<div role="group" aria-label="Text size" class="flex items-center gap-2"><!--[-->`);
			ssrRenderList(textSizes, (s) => {
				_push(`<button type="button" class="${ssrRenderClass([unref(settings).textSize === s.value ? "border-white bg-white text-brand" : "border-white/50 bg-transparent text-white", "size-11 cursor-pointer rounded-[10px] border-2 text-[0.9rem] font-bold"])}"${ssrRenderAttr("aria-pressed", unref(settings).textSize === s.value)}>${ssrInterpolate(s.label)}</button>`);
			});
			_push(`<!--]--></div></div></div></div><div class="hidden md:block xl:hidden"><div class="flex items-center justify-between gap-4 px-6 pb-2 pt-3"><a${ssrRenderAttr("href", __props.homeUrl)}${ssrRenderAttr("aria-label", `${__props.orgName} home`)} class="flex min-h-11 min-w-0 flex-1 items-center no-underline">`);
			if (showLockup.value) _push(ssrRenderComponent(WordmarkLockup_default, {
				name: __props.orgName,
				size: "tablet"
			}, null, _parent));
			else _push(`<img${ssrRenderAttr("src", __props.logoUrl)}${ssrRenderAttr("alt", __props.orgName)} class="block h-10 w-auto max-w-[240px]">`);
			_push(`</a><div class="flex flex-none items-center gap-2.5">`);
			_push(ssrRenderComponent(LanguageToggle_default, {
				languages: currentLanguages.value,
				size: "tablet"
			}, null, _parent));
			_push(ssrRenderComponent(A11yWidget_default, { size: "tablet" }, null, _parent));
			_push(`<a${ssrRenderAttr("href", __props.joinUrl)} target="_blank" rel="noopener" class="${ssrRenderClass(`${pillClass} h-11 px-5 text-[0.9rem]`)}">${ssrInterpolate(__props.joinLabel)}</a></div></div><nav aria-label="Main" class="flex flex-wrap items-center gap-1.5 px-4 pb-2">`);
			_push(ssrRenderComponent(unref(DropdownMenu_default), null, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(DropdownMenuTrigger_default), {
							class: [`cursor-pointer border-0 bg-transparent ${navLinkTabletClass}`, isAboutCurrent.value ? currentClass : ""],
							"aria-current": isAboutCurrent.value ? "page" : void 0
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`${ssrInterpolate(__props.aboutLabel)} ▾ `);
								else return [createTextVNode(toDisplayString(__props.aboutLabel) + "\xA0▾ ", 1)];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(DropdownMenuContent_default), {
							align: "start",
							class: "z-[200] min-w-[250px] rounded-[14px] border-0 bg-white p-2 font-sans shadow-popover"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<!--[-->`);
									ssrRenderList(__props.aboutItems, (item) => {
										_push(ssrRenderComponent(unref(DropdownMenuItem_default), {
											key: item.label,
											"as-child": "",
											class: aboutItemClass
										}, {
											default: withCtx((_, _push, _parent, _scopeId) => {
												if (_push) _push(`<a${ssrRenderAttr("href", item.href)} class="block cursor-pointer text-ink no-underline hover:bg-brand-deep hover:text-white focus:text-white"${_scopeId}>${ssrInterpolate(item.label)}</a>`);
												else return [createVNode("a", {
													href: item.href,
													class: "block cursor-pointer text-ink no-underline hover:bg-brand-deep hover:text-white focus:text-white"
												}, toDisplayString(item.label), 9, ["href"])];
											}),
											_: 2
										}, _parent, _scopeId));
									});
									_push(`<!--]-->`);
								} else return [(openBlock(true), createBlock(Fragment, null, renderList(__props.aboutItems, (item) => {
									return openBlock(), createBlock(unref(DropdownMenuItem_default), {
										key: item.label,
										"as-child": "",
										class: aboutItemClass
									}, {
										default: withCtx(() => [createVNode("a", {
											href: item.href,
											class: "block cursor-pointer text-ink no-underline hover:bg-brand-deep hover:text-white focus:text-white"
										}, toDisplayString(item.label), 9, ["href"])]),
										_: 2
									}, 1024);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
					} else return [createVNode(unref(DropdownMenuTrigger_default), {
						class: [`cursor-pointer border-0 bg-transparent ${navLinkTabletClass}`, isAboutCurrent.value ? currentClass : ""],
						"aria-current": isAboutCurrent.value ? "page" : void 0
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(__props.aboutLabel) + "\xA0▾ ", 1)]),
						_: 1
					}, 8, ["class", "aria-current"]), createVNode(unref(DropdownMenuContent_default), {
						align: "start",
						class: "z-[200] min-w-[250px] rounded-[14px] border-0 bg-white p-2 font-sans shadow-popover"
					}, {
						default: withCtx(() => [(openBlock(true), createBlock(Fragment, null, renderList(__props.aboutItems, (item) => {
							return openBlock(), createBlock(unref(DropdownMenuItem_default), {
								key: item.label,
								"as-child": "",
								class: aboutItemClass
							}, {
								default: withCtx(() => [createVNode("a", {
									href: item.href,
									class: "block cursor-pointer text-ink no-underline hover:bg-brand-deep hover:text-white focus:text-white"
								}, toDisplayString(item.label), 9, ["href"])]),
								_: 2
							}, 1024);
						}), 128))]),
						_: 1
					})];
				}),
				_: 1
			}, _parent));
			_push(`<!--[-->`);
			ssrRenderList(__props.navItems, (item) => {
				_push(`<a${ssrRenderAttr("href", item.href)} class="${ssrRenderClass([navLinkTabletClass, isCurrent(item.href) ? currentClass : ""])}"${ssrRenderAttr("aria-current", isCurrent(item.href) ? "page" : void 0)}>${ssrInterpolate(item.label)}</a>`);
			});
			_push(`<!--]--></nav></div><div class="site-header-desktop mx-auto hidden min-h-[76px] max-w-[82.5rem] flex-wrap items-center justify-between gap-6 px-6 py-[14px] xl:flex"><a${ssrRenderAttr("href", __props.homeUrl)}${ssrRenderAttr("aria-label", `${__props.orgName} home`)} class="flex min-h-11 flex-none items-center no-underline">`);
			if (showLockup.value) _push(ssrRenderComponent(WordmarkLockup_default, {
				name: __props.orgName,
				size: "header"
			}, null, _parent));
			else _push(`<img${ssrRenderAttr("src", __props.logoUrl)}${ssrRenderAttr("alt", __props.orgName)} class="block h-12 w-auto max-w-[240px]">`);
			_push(`</a><nav aria-label="Main" class="flex flex-wrap items-center gap-[18px]">`);
			_push(ssrRenderComponent(unref(DropdownMenu_default), null, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(DropdownMenuTrigger_default), {
							class: [`cursor-pointer border-0 bg-transparent ${navLinkClass}`, isAboutCurrent.value ? currentClass : ""],
							"aria-current": isAboutCurrent.value ? "page" : void 0
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`${ssrInterpolate(__props.aboutLabel)} ▾ `);
								else return [createTextVNode(toDisplayString(__props.aboutLabel) + "\xA0▾ ", 1)];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(DropdownMenuContent_default), {
							align: "start",
							class: "z-[200] min-w-[256px] rounded-[14px] border-0 bg-white p-2 font-sans shadow-popover"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<!--[-->`);
									ssrRenderList(__props.aboutItems, (item) => {
										_push(ssrRenderComponent(unref(DropdownMenuItem_default), {
											key: item.label,
											"as-child": "",
											class: aboutItemClass
										}, {
											default: withCtx((_, _push, _parent, _scopeId) => {
												if (_push) _push(`<a${ssrRenderAttr("href", item.href)} class="block cursor-pointer text-ink no-underline hover:bg-brand-deep hover:text-white focus:text-white"${_scopeId}>${ssrInterpolate(item.label)}</a>`);
												else return [createVNode("a", {
													href: item.href,
													class: "block cursor-pointer text-ink no-underline hover:bg-brand-deep hover:text-white focus:text-white"
												}, toDisplayString(item.label), 9, ["href"])];
											}),
											_: 2
										}, _parent, _scopeId));
									});
									_push(`<!--]-->`);
								} else return [(openBlock(true), createBlock(Fragment, null, renderList(__props.aboutItems, (item) => {
									return openBlock(), createBlock(unref(DropdownMenuItem_default), {
										key: item.label,
										"as-child": "",
										class: aboutItemClass
									}, {
										default: withCtx(() => [createVNode("a", {
											href: item.href,
											class: "block cursor-pointer text-ink no-underline hover:bg-brand-deep hover:text-white focus:text-white"
										}, toDisplayString(item.label), 9, ["href"])]),
										_: 2
									}, 1024);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
					} else return [createVNode(unref(DropdownMenuTrigger_default), {
						class: [`cursor-pointer border-0 bg-transparent ${navLinkClass}`, isAboutCurrent.value ? currentClass : ""],
						"aria-current": isAboutCurrent.value ? "page" : void 0
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(__props.aboutLabel) + "\xA0▾ ", 1)]),
						_: 1
					}, 8, ["class", "aria-current"]), createVNode(unref(DropdownMenuContent_default), {
						align: "start",
						class: "z-[200] min-w-[256px] rounded-[14px] border-0 bg-white p-2 font-sans shadow-popover"
					}, {
						default: withCtx(() => [(openBlock(true), createBlock(Fragment, null, renderList(__props.aboutItems, (item) => {
							return openBlock(), createBlock(unref(DropdownMenuItem_default), {
								key: item.label,
								"as-child": "",
								class: aboutItemClass
							}, {
								default: withCtx(() => [createVNode("a", {
									href: item.href,
									class: "block cursor-pointer text-ink no-underline hover:bg-brand-deep hover:text-white focus:text-white"
								}, toDisplayString(item.label), 9, ["href"])]),
								_: 2
							}, 1024);
						}), 128))]),
						_: 1
					})];
				}),
				_: 1
			}, _parent));
			_push(`<!--[-->`);
			ssrRenderList(__props.navItems, (item) => {
				_push(`<a${ssrRenderAttr("href", item.href)} class="${ssrRenderClass([navLinkClass, isCurrent(item.href) ? currentClass : ""])}"${ssrRenderAttr("aria-current", isCurrent(item.href) ? "page" : void 0)}>${ssrInterpolate(item.label)}</a>`);
			});
			_push(`<!--]--></nav><div class="flex flex-wrap items-center gap-3">`);
			_push(ssrRenderComponent(LanguageToggle_default, { languages: currentLanguages.value }, null, _parent));
			_push(ssrRenderComponent(A11yWidget_default, null, null, _parent));
			_push(`<a${ssrRenderAttr("href", __props.joinUrl)} target="_blank" rel="noopener" class="${ssrRenderClass(`${pillClass} h-[42px] px-[22px] text-[0.95rem]`)}">${ssrInterpolate(__props.joinLabel)}</a></div></div></header>`);
		};
	}
});
//#endregion
//#region app/components/site/SiteHeader.vue
var _sfc_setup$2 = SiteHeader_vue_vue_type_script_setup_true_lang_default.setup;
SiteHeader_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/SiteHeader.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var SiteHeader_default = SiteHeader_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/components/site/SiteFooter.vue?vue&type=script&setup=true&lang.ts
var SiteFooter_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "SiteFooter",
	__ssrInlineRender: true,
	props: {
		logoUrl: { default: "" },
		logoIsDefault: {
			type: Boolean,
			default: true
		},
		tagline: { default: "" },
		columns: { default: () => [
			{
				title: "About",
				links: [
					{
						label: "About the Chapter",
						href: "/about/"
					},
					{
						label: "Mission & History",
						href: "/about/#mission"
					},
					{
						label: "Where We Organize",
						href: "/about/#counties"
					},
					{
						label: "Bylaws & Code of Conduct",
						href: "/about/#bylaws"
					},
					{
						label: "FAQ",
						href: "/about/#faq"
					}
				]
			},
			{
				title: "Get involved",
				links: [
					{
						label: "Join Now",
						href: "/get-involved/#join",
						external: true
					},
					{
						label: "Event Calendar",
						href: "/calendar/"
					},
					{
						label: "Committees",
						href: "/get-involved/#committees"
					},
					{
						label: "Communication Channels",
						href: "/get-involved/#channels"
					}
				]
			},
			{
				title: "Resources",
				links: [
					{
						label: "Blog",
						href: "/blog/"
					},
					{
						label: "Documents & Minutes",
						href: "/bylaws-code-of-conduct/#documents"
					},
					{
						label: "Education Library",
						href: "/bylaws-code-of-conduct/"
					},
					{
						label: "Grievance Contact",
						href: "/bylaws-code-of-conduct/#grievance"
					}
				]
			}
		] },
		orgName: { default: "Progress Now" },
		contactEmail: { default: "" },
		socials: { default: () => [] },
		a11yLead: { default: "Built to be accessible —" },
		a11yLinkLabel: { default: "tell us how we can do better." }
	},
	setup(__props) {
		const props = __props;
		const showLockup = computed(() => props.logoIsDefault || !props.logoUrl);
		/** Accessibility-feedback mailto — falls back to plain text when no email is set. */
		const a11yContactHref = computed(() => props.contactEmail ? `mailto:${props.contactEmail}` : "");
		const ICONS = {
			twitter: {
				viewBox: "0 0 26.51 21.75",
				paths: ["M25.94.46c.29.24-1.53,2.44-1.97,2.68l2.54-.28c-.26.92-2.33,2.07-2.49,2.59-.35,1.2-.24,3.46-.65,4.99-2.72,10.21-14.47,14.13-23.38,9.19l4.45-.76c.52-.15,3.13-1.26,3.15-1.64.01-.21-2.8-.95-3.66-1.97-.18-.21-1.22-2.05-1.12-2.12.27-.2,1.84.37,1.97-.28-1.44-.03-2.75-1.53-3.32-2.74-1.82-3.89.74-1.61,1.35-2.06.11-.08-1.23-1.69-1.47-2.34-.32-.89-.63-4.7.48-4.71.27,0,3,2.89,4.08,3.53,1,.59,6.35,2.8,7.06,2.11.08-.08-.05-1.87.02-2.37.5-3.41,4.71-5.16,7.75-3.85.71.31,1.17,1.08,1.97,1.14.89.06,3-1.3,3.23-1.12Z"]
			},
			instagram: {
				viewBox: "0 0 26.29 26.28",
				paths: [
					"M6.59.24c2.73-.37,12.84-.38,15.12.53,2.6,1.04,4.06,3.31,4.38,6.06.31,2.67.34,12.45-.48,14.69-.99,2.69-3.34,4.24-6.15,4.57-2.67.31-12.45.34-14.69-.48C1.97,24.57.47,22.11.18,19.2-.1,16.39-.15,6.88.78,4.57,1.78,2.06,3.93.6,6.59.24ZM7.73,2.5c-2.39.27-4.19,1.11-4.89,3.57-.67,2.32-.72,11.89-.05,14.18.33,1.12,1.38,2.42,2.46,2.9,2.22.99,12.91,1.05,15.24.28.99-.33,2.25-1.43,2.68-2.4.99-2.22,1.05-12.91.28-15.24-.3-.91-1.35-2.15-2.2-2.59-2.19-1.12-10.83-1.01-13.51-.71Z",
					"M12.23,6.44c7.97-1.07,10.74,10.45,3.16,13.03-9.44,3.21-12.71-11.75-3.16-13.03ZM11.94,8.97c-4.02.83-4.24,7.76.52,8.37,6.8.86,6.45-9.81-.52-8.37Z",
					"M18.86,5.03c1.66-1.65,4.16,1.21,2.06,2.49-1.86,1.13-3.06-1.5-2.06-2.49Z"
				]
			},
			facebook: {
				viewBox: "0 0 14.67 28.26",
				paths: ["M14.67,4.85h-4.09c-.12,0-.99,1.12-.99,1.27v4.37h4.79c-.04.53-.31,5.08-.56,5.08h-4.23v12.69h-5.36v-12.69H0v-5.08h4.23v-5.22c0-.49,1.03-2.63,1.41-3.1C6.69.86,8.64.19,10.28.05c.65-.06,4.38-.17,4.38.43v4.37Z"]
			}
		};
		const socialLinks = computed(() => props.socials.filter((s) => s.url).map((s) => ({
			...s,
			icon: ICONS[s.name.toLowerCase()]
		})));
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<footer${ssrRenderAttrs(mergeProps({
				class: "site-footer bg-ink font-sans text-white",
				"data-tone": "ink"
			}, _attrs))}><div class="mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-8 px-6 pb-9 pt-10 md:grid-cols-2 md:gap-9 md:pb-10 md:pt-12 lg:gap-11 lg:pb-11 lg:pt-[52px] lg:[grid-template-columns:minmax(220px,1.1fr)_repeat(3,minmax(170px,auto))]"><div class="flex flex-col gap-4 md:col-span-2 lg:col-span-1">`);
			if (showLockup.value) _push(ssrRenderComponent(WordmarkLockup_default, {
				name: __props.orgName,
				size: "footer"
			}, null, _parent));
			else _push(`<img${ssrRenderAttr("src", __props.logoUrl)}${ssrRenderAttr("alt", __props.orgName)} class="block h-12 w-auto max-w-[240px]">`);
			if (__props.tagline) _push(`<p class="m-0 max-w-[30ch] text-base leading-[1.55] text-muted-on-ink">${ssrInterpolate(__props.tagline)}</p>`);
			else _push(`<!---->`);
			if (socialLinks.value.length) {
				_push(`<div class="flex items-center gap-[18px]"><!--[-->`);
				ssrRenderList(socialLinks.value, (s) => {
					_push(`<a${ssrRenderAttr("href", s.url)} target="_blank" rel="noopener"${ssrRenderAttr("aria-label", s.name)} class="flex min-h-11 min-w-11 items-center justify-center text-white transition-colors hover:text-brand-light">`);
					if (s.icon) {
						_push(`<svg aria-hidden="true" focusable="false"${ssrRenderAttr("viewBox", s.icon.viewBox)} class="block h-[26px] w-auto fill-current"><!--[-->`);
						ssrRenderList(s.icon.paths, (d, i) => {
							_push(`<path${ssrRenderAttr("d", d)}></path>`);
						});
						_push(`<!--]--></svg>`);
					} else _push(`<span class="text-[0.95rem] font-bold">${ssrInterpolate(s.name)}</span>`);
					_push(`</a>`);
				});
				_push(`<!--]--></div>`);
			} else _push(`<!---->`);
			_push(`</div><!--[-->`);
			ssrRenderList(__props.columns, (col) => {
				_push(`<nav${ssrRenderAttr("aria-label", col.title)} class="flex flex-col gap-[9px]"><div class="mb-1 text-[1.15rem] font-bold">${ssrInterpolate(col.title)}</div><!--[-->`);
				ssrRenderList(col.links, (link) => {
					_push(`<a${ssrRenderAttr("href", link.href)}${ssrRenderAttr("target", link.external ? "_blank" : void 0)}${ssrRenderAttr("rel", link.external ? "noopener" : void 0)} class="text-[1.06rem] font-medium text-white no-underline hover:text-brand-light hover:underline hover:underline-offset-[3px]">${ssrInterpolate(link.label)}</a>`);
				});
				_push(`<!--]--></nav>`);
			});
			_push(`<!--]--></div><div data-tone="blue" class="bg-brand px-6 py-3.5 text-white"><div class="mx-auto flex max-w-[1320px] flex-col gap-1.5 text-[0.92rem] md:flex-row md:flex-wrap md:justify-between md:gap-4 md:text-[1.02rem]"><span>${ssrInterpolate(__props.orgName)}</span><span>${ssrInterpolate(__props.a11yLead)} `);
			if (a11yContactHref.value) _push(`<a${ssrRenderAttr("href", a11yContactHref.value)} class="font-bold text-white hover:text-brand-light">${ssrInterpolate(__props.a11yLinkLabel)}</a>`);
			else _push(`<span class="font-bold">${ssrInterpolate(__props.a11yLinkLabel)}</span>`);
			_push(`</span></div></div></footer>`);
		};
	}
});
//#endregion
//#region app/components/site/SiteFooter.vue
var _sfc_setup$1 = SiteFooter_vue_vue_type_script_setup_true_lang_default.setup;
SiteFooter_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/site/SiteFooter.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var SiteFooter_default = SiteFooter_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region app/layouts/default.vue?vue&type=script&setup=true&lang.ts
var default_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "default",
	__ssrInlineRender: true,
	async setup(__props) {
		let __temp, __restore;
		const resolved = useResolvedRoute();
		const lang = computed(() => resolved.value.lang);
		const { data: site } = ([__temp, __restore] = withAsyncContext(() => useChapterSite(lang.value)), __temp = await __temp, __restore(), __temp);
		if (site.value && site.value.categories.length > 0) setCategories(site.value.categories);
		const routeLanguages = useChapterLanguages();
		const languages = computed(() => routeLanguages.value.length ? routeLanguages.value : site.value?.languages ?? []);
		const strings = computed(() => site.value?.strings ?? {});
		const header = computed(() => site.value?.header);
		const footer = computed(() => site.value?.footer);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "site-app contents" }, _attrs))}><a class="skip-link absolute -left-[9999px] top-3 z-200 rounded-[8px] bg-ink px-[18px] py-2.5 font-sans text-[0.95rem] font-bold text-white no-underline focus:left-4" href="#main">${ssrInterpolate(strings.value.skip_link ?? "Skip to main content")}</a><div class="contents">`);
			if (header.value) _push(ssrRenderComponent(SiteHeader_default, {
				key: `header-${lang.value}`,
				"join-url": header.value.joinUrl,
				"join-label": header.value.joinLabel,
				"join-short-label": header.value.joinShortLabel,
				"about-label": header.value.aboutLabel,
				"logo-url": header.value.logoUrl,
				"logo-is-default": header.value.logoIsDefault,
				"org-name": header.value.orgName,
				"home-url": header.value.homeUrl,
				"nav-items": header.value.navItems ?? void 0,
				"about-items": header.value.aboutItems ?? void 0,
				languages: languages.value,
				"current-path": unref(resolved).path
			}, null, _parent));
			else _push(`<!---->`);
			_push(`</div><main id="main" class="site-main">`);
			ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
			_push(`</main>`);
			if (footer.value) _push(ssrRenderComponent(SiteFooter_default, {
				key: `footer-${lang.value}`,
				"logo-url": footer.value.logoUrl,
				"logo-is-default": footer.value.logoIsDefault,
				"org-name": footer.value.orgName,
				columns: footer.value.columns ?? void 0,
				socials: footer.value.socials,
				"contact-email": footer.value.contactEmail || void 0,
				tagline: footer.value.tagline || void 0,
				"a11y-lead": footer.value.a11yLead,
				"a11y-link-label": footer.value.a11yLinkLabel
			}, null, _parent));
			else _push(`<!---->`);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/layouts/default.vue
var _sfc_setup = default_vue_vue_type_script_setup_true_lang_default.setup;
default_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var default_default = default_vue_vue_type_script_setup_true_lang_default;

export { default_default as default };
//# sourceMappingURL=default-C_Sd-9UA.mjs.map
