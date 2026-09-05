import { u as useHead$1 } from '../virtual/entry.mjs';
import { C as ClientOnly } from './events-DJ7jaIrK.mjs';
import { defineComponent, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
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

//#region app/components/routes/RouteStyleguide.vue?vue&type=script&setup=true&lang.ts
var RouteStyleguide_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "RouteStyleguide",
	__ssrInlineRender: true,
	props: { resolved: {} },
	setup(__props) {
		useHead$1({
			title: "Styleguide",
			meta: [{
				key: "robots",
				name: "robots",
				content: "noindex, nofollow"
			}]
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(ClientOnly, _attrs, {}, _parent));
		};
	}
});
//#endregion
//#region app/components/routes/RouteStyleguide.vue
var _sfc_setup = RouteStyleguide_vue_vue_type_script_setup_true_lang_default.setup;
RouteStyleguide_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/routes/RouteStyleguide.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var RouteStyleguide_default = RouteStyleguide_vue_vue_type_script_setup_true_lang_default;

export { RouteStyleguide_default as default };
//# sourceMappingURL=RouteStyleguide-BjilFQcz.mjs.map
