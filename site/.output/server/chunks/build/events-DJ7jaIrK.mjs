import { a as useRoute$1, t as tryUseNuxtApp, b as useRuntimeConfig, s as stateDiagnostics, c as useNuxtApp, d as appDiagnostics, e as sanitizeTag, u as useHead$1, f as asyncDataDefaults, p as prodReporters, g as docsBase, h as createError$1 } from '../virtual/entry.mjs';
import { defineProdDiagnostics } from 'nostics';
import { computed, reactive, toRef, isRef, shallowRef, defineComponent, getCurrentInstance, provide, cloneVNode, h, createElementBlock, watch, toValue, onServerPrefetch, ref, nextTick, unref, queuePostFlushCb } from 'vue';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';

defineComponent({
	name: "ServerPlaceholder",
	render() {
		return createElementBlock("div");
	}
});
//#endregion
//#region node_modules/nuxt/dist/app/components/client-only.js
var clientOnlySymbol = Symbol.for("nuxt:client-only");
var ClientOnly = defineComponent({
	name: "ClientOnly",
	inheritAttrs: false,
	props: [
		"fallback",
		"placeholder",
		"placeholderTag",
		"fallbackTag"
	],
	setup(props, { slots, attrs }) {
		const mounted = shallowRef(false);
		const vm = getCurrentInstance();
		if (vm) vm._nuxtClientOnly = true;
		provide(clientOnlySymbol, true);
		return () => {
			if (mounted.value) {
				const vnodes = slots.default?.();
				if (vnodes && vnodes.length === 1) return [cloneVNode(vnodes[0], attrs)];
				return vnodes;
			}
			const slot = slots.fallback || slots.placeholder;
			if (slot) return h(slot);
			const fallbackStr = props.fallback || props.placeholder || "";
			const fallbackTag = sanitizeTag(props.fallbackTag || props.placeholderTag, "span");
			return createElementBlock(fallbackTag, attrs, fallbackStr);
		};
	}
});
//#endregion
//#region app/lib/languages.ts
var languageState = reactive({ list: [] });
function setLanguages(list) {
	languageState.list = list;
}
//#endregion
//#region app/lib/utils.ts
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
//#region node_modules/nuxt/dist/app/utils/debounce-tick.js
/**
* Debounce an async function so that repeated calls within the same tick are
* collapsed into a single call (plus a trailing call if arguments arrived
* while the debounced call was still pending).
*
* Adapted from https://github.com/unjs/perfect-debounce with the timeout
* replaced by Vue's post-flush callback queue.
*/
function debounceTick(fn, options = {}) {
	let leadingValue;
	let active = false;
	let resolveList = [];
	let currentPromise;
	let trailingArgs;
	const applyFn = (_this, args) => {
		const promise = _applyPromised(fn, _this, args);
		currentPromise = promise;
		promise.finally(() => {
			currentPromise = void 0;
			if (trailingArgs && !active) {
				const args = trailingArgs;
				trailingArgs = void 0;
				applyFn(_this, args);
			}
		});
		return promise;
	};
	return function(...args) {
		trailingArgs = args;
		if (currentPromise) return currentPromise;
		return new Promise((resolve) => {
			const shouldCallNow = options.leading && !active;
			if (!active) {
				active = true;
				queuePostFlushCb(() => {
					active = false;
					const flushArgs = trailingArgs ?? args;
					trailingArgs = void 0;
					const promise = options.leading ? leadingValue : applyFn(this, flushArgs);
					for (const _resolve of resolveList) _resolve(promise);
					resolveList = [];
				});
			}
			if (shouldCallNow) {
				leadingValue = applyFn(this, args);
				resolve(leadingValue);
			} else resolveList.push(resolve);
		});
	};
}
async function _applyPromised(fn, _this, args) {
	return await fn.apply(_this, args);
}
//#endregion
//#region node_modules/nuxt/dist/compiler/runtime/index.js
/**
* Define a factory for a function that should be registered for automatic key injection.
* @since 4.2.0
* @param factory
*/
function defineKeyedFunctionFactory(factory) {
	const placeholder = function() {
		throw appDiagnostics.NUXT_E1007({ name: factory.name });
	};
	return Object.defineProperty(placeholder, "__nuxt_factory", {
		enumerable: false,
		get: () => factory.factory
	});
}
//#endregion
//#region node_modules/nuxt/dist/app/diagnostics/data.js
/**
* E3xxx
* Data fetching (useFetch / useAsyncData) runtime diagnostics.
*/
var dataDiagnostics = /* #__PURE__ */ defineProdDiagnostics({
	docsBase,
	reporters: prodReporters
});
//#endregion
//#region node_modules/nuxt/dist/app/composables/asyncData.js
var createUseAsyncData = defineKeyedFunctionFactory({
	name: "createUseAsyncData",
	factory(options = {}) {
		function useAsyncData(...args) {
			const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
			if (_isAutoKeyNeeded(args[0], args[1])) args.unshift(autoKey);
			let [_key, _handler, opts = {}] = args;
			const key = isRef(_key) || typeof _key === "function" ? computed(() => toValue(_key)) : { value: _key };
			if (!key.value || typeof key.value !== "string") throw dataDiagnostics.NUXT_E3008();
			if (typeof _handler !== "function") throw dataDiagnostics.NUXT_E3009();
			const shouldFactoryOptionsOverride = typeof options === "function";
			const nuxtApp = useNuxtApp();
			const factoryOptions = shouldFactoryOptionsOverride ? options(opts) : options;
			if (!shouldFactoryOptionsOverride) for (const key in factoryOptions) {
				if (factoryOptions[key] === void 0) continue;
				if (opts[key] !== void 0) continue;
				opts[key] = factoryOptions[key];
			}
			opts.server ??= true;
			opts.default ??= getDefault;
			opts.getCachedData ??= getDefaultCachedData;
			opts.lazy ??= false;
			opts.immediate ??= true;
			opts.deep ??= asyncDataDefaults.deep;
			opts.dedupe ??= "cancel";
			opts.enabled ??= true;
			if (shouldFactoryOptionsOverride) for (const key in factoryOptions) {
				if (factoryOptions[key] === void 0) continue;
				opts[key] = factoryOptions[key];
			}
			nuxtApp._asyncData[key.value];
			function createInitialFetch() {
				const initialFetchOptions = {
					cause: "initial",
					dedupe: opts.dedupe
				};
				const existing = nuxtApp._asyncData[key.value];
				if (!existing?._init) {
					initialFetchOptions.cachedData = opts.getCachedData(key.value, nuxtApp, { cause: "initial" });
					nuxtApp._asyncData[key.value] = buildAsyncData(nuxtApp, key.value, _handler, opts, initialFetchOptions.cachedData);
					nuxtApp._asyncData[key.value]._initialCachedData = initialFetchOptions.cachedData;
				} else if (nuxtApp._asyncDataPromises[key.value]) initialFetchOptions.cachedData = existing._initialCachedData;
				return () => nuxtApp._asyncData[key.value].execute(initialFetchOptions);
			}
			const initialFetch = createInitialFetch();
			const asyncData = nuxtApp._asyncData[key.value];
			asyncData._deps++;
			if (opts.server !== false && nuxtApp.payload.serverRendered && opts.immediate) {
				const promise = initialFetch();
				if (getCurrentInstance()) onServerPrefetch(() => promise);
				else nuxtApp.hook("app:created", async () => {
					await promise;
				});
			}
			const asyncReturn = {
				data: writableComputedRef(() => nuxtApp._asyncData[key.value]?.data),
				pending: writableComputedRef(() => nuxtApp._asyncData[key.value]?.pending),
				status: writableComputedRef(() => nuxtApp._asyncData[key.value]?.status),
				error: writableComputedRef(() => nuxtApp._asyncData[key.value]?.error),
				refresh: (...args) => {
					if (!nuxtApp._asyncData[key.value]?._init) return createInitialFetch()();
					return nuxtApp._asyncData[key.value].execute(...args);
				},
				execute: (...args) => asyncReturn.refresh(...args),
				clear: () => {
					const entry = nuxtApp._asyncData[key.value];
					if (entry?._abortController) try {
						entry._abortController.abort(new DOMException("AsyncData aborted by user.", "AbortError"));
					} finally {
						entry._abortController = void 0;
					}
					clearNuxtDataByKey(nuxtApp, key.value);
				}
			};
			const asyncDataPromise = Promise.resolve(nuxtApp._asyncDataPromises[key.value]).then(() => asyncReturn);
			Object.assign(asyncDataPromise, asyncReturn);
			Object.defineProperties(asyncDataPromise, {
				then: {
					enumerable: true,
					value: asyncDataPromise.then.bind(asyncDataPromise)
				},
				catch: {
					enumerable: true,
					value: asyncDataPromise.catch.bind(asyncDataPromise)
				},
				finally: {
					enumerable: true,
					value: asyncDataPromise.finally.bind(asyncDataPromise)
				}
			});
			return asyncDataPromise;
		}
		return useAsyncData;
	}
});
var useAsyncData = createUseAsyncData.__nuxt_factory();
createUseAsyncData.__nuxt_factory({
	lazy: true,
	_functionName: "useLazyAsyncData"
});
function writableComputedRef(getter) {
	return computed({
		get() {
			return getter()?.value;
		},
		set(value) {
			const ref = getter();
			if (ref) ref.value = value;
		}
	});
}
function _isAutoKeyNeeded(keyOrFetcher, fetcher) {
	if (typeof keyOrFetcher === "string") return false;
	if (typeof keyOrFetcher === "object" && keyOrFetcher !== null) return false;
	if (typeof keyOrFetcher === "function" && typeof fetcher === "function") return false;
	return true;
}
function clearNuxtDataByKey(nuxtApp, key) {
	delete nuxtApp.payload.data[key];
	delete nuxtApp.payload._errors[key];
	if (nuxtApp._asyncData[key]) {
		nuxtApp._asyncData[key].data.value = unref(nuxtApp._asyncData[key]._default());
		nuxtApp._asyncData[key].error.value = void 0;
		nuxtApp._asyncData[key].status.value = "idle";
		nuxtApp._asyncData[key]._initialCachedData = void 0;
	}
	delete nuxtApp._asyncDataPromises[key];
}
function pick(obj, keys) {
	const newObj = {};
	for (const key of keys) newObj[key] = obj[key];
	return newObj;
}
function buildAsyncData(nuxtApp, key, _handler, options, initialCachedData) {
	nuxtApp.payload._errors[key] ??= void 0;
	const hasCustomGetCachedData = options.getCachedData !== getDefaultCachedData;
	const handler = _handler ;
	const _ref = options.deep ? ref : shallowRef;
	const hasCachedData = initialCachedData !== void 0;
	const unsubRefreshAsyncData = nuxtApp.hook("app:data:refresh", async (keys) => {
		if (!keys || keys.includes(key)) await asyncData.execute({ cause: "refresh:hook" });
	});
	const asyncData = {
		data: _ref(hasCachedData ? initialCachedData : options.default()),
		pending: computed(() => asyncData.status.value === "pending"),
		error: toRef(nuxtApp.payload._errors, key),
		status: shallowRef("idle"),
		execute: (...args) => {
			const [_opts, newValue = void 0] = args;
			const opts = _opts && newValue === void 0 && typeof _opts === "object" ? _opts : {};
			if (nuxtApp._asyncDataPromises[key]) {
				if ((opts.dedupe ?? options.dedupe) === "defer") return nuxtApp._asyncDataPromises[key];
			}
			{
				const cachedData = "cachedData" in opts ? opts.cachedData : options.getCachedData(key, nuxtApp, { cause: opts.cause ?? "refresh:manual" });
				if (cachedData !== void 0) {
					nuxtApp.payload.data[key] = asyncData.data.value = cachedData;
					asyncData.error.value = void 0;
					asyncData.status.value = "success";
					return Promise.resolve(cachedData);
				}
			}
			if (toValue(options.enabled) === false) return Promise.resolve(asyncData.data.value);
			if (asyncData._abortController) asyncData._abortController.abort(new DOMException("AsyncData request cancelled by deduplication", "AbortError"));
			asyncData._abortController = new AbortController();
			asyncData.status.value = "pending";
			const cleanupController = new AbortController();
			const promise = new Promise((resolve, reject) => {
				try {
					const timeout = opts.timeout ?? options.timeout;
					const mergedSignal = mergeAbortSignals([asyncData._abortController?.signal, opts?.signal], cleanupController.signal, timeout);
					if (mergedSignal.aborted) {
						const reason = mergedSignal.reason;
						reject(reason instanceof Error ? reason : new DOMException(String(reason ?? "Aborted"), "AbortError"));
						return;
					}
					mergedSignal.addEventListener("abort", () => {
						const reason = mergedSignal.reason;
						reject(reason instanceof Error ? reason : new DOMException(String(reason ?? "Aborted"), "AbortError"));
					}, {
						once: true,
						signal: cleanupController.signal
					});
					return Promise.resolve(handler(nuxtApp, { signal: mergedSignal })).then(resolve, reject);
				} catch (err) {
					reject(err);
				}
			}).then(async (_result) => {
				if (nuxtApp._asyncDataPromises[key] !== promise) return;
				let result = _result;
				if (options.transform) result = await options.transform(_result);
				if (options.pick) result = pick(result, options.pick);
				nuxtApp.payload.data[key] = result;
				asyncData.data.value = result;
				asyncData.error.value = void 0;
				asyncData.status.value = "success";
			}).catch((error) => {
				if (nuxtApp._asyncDataPromises[key] !== promise) return nuxtApp._asyncDataPromises[key];
				if (asyncData._abortController?.signal.aborted) return nuxtApp._asyncDataPromises[key];
				if (typeof DOMException !== "undefined" && error instanceof DOMException && error.name === "AbortError") {
					asyncData.status.value = "idle";
					return nuxtApp._asyncDataPromises[key];
				}
				asyncData.error.value = createError$1(error);
				asyncData.data.value = unref(options.default());
				asyncData.status.value = "error";
			}).finally(() => {
				cleanupController.abort();
				if (nuxtApp._asyncDataPromises[key] === promise) delete nuxtApp._asyncDataPromises[key];
			});
			nuxtApp._asyncDataPromises[key] = promise;
			return nuxtApp._asyncDataPromises[key];
		},
		_execute: debounceTick((...args) => asyncData.execute(...args)),
		_default: options.default,
		_deps: 0,
		_init: true,
		_hash: void 0,
		_off: () => {
			unsubRefreshAsyncData();
			if (nuxtApp._asyncData[key]?._init) nuxtApp._asyncData[key]._init = false;
			if (nuxtApp._asyncDataPromises[key]) {
				asyncData._abortController?.abort(new DOMException("AsyncData request cancelled by unmount", "AbortError"));
				delete nuxtApp._asyncDataPromises[key];
				if (asyncData.status.value === "pending") asyncData.status.value = "idle";
			}
			if (!hasCustomGetCachedData) nextTick(() => {
				if (!nuxtApp._asyncData[key]?._init) {
					clearNuxtDataByKey(nuxtApp, key);
					asyncData.execute = () => Promise.resolve();
				}
			});
		}
	};
	return asyncData;
}
var getDefault = () => void 0;
var getDefaultCachedData = (key, nuxtApp, ctx) => {
	if (nuxtApp.isHydrating) return nuxtApp.payload.data[key];
	if (ctx.cause !== "refresh:manual" && ctx.cause !== "refresh:hook") return nuxtApp.static.data[key];
};
function mergeAbortSignals(signals, cleanupSignal, timeout) {
	const list = signals.filter((s) => !!s);
	if (typeof timeout === "number" && timeout >= 0) {
		const timeoutSignal = AbortSignal.timeout?.(timeout);
		if (timeoutSignal) list.push(timeoutSignal);
	}
	if (AbortSignal.any) return AbortSignal.any(list);
	const controller = new AbortController();
	for (const sig of list) if (sig.aborted) {
		const reason = sig.reason ?? new DOMException("Aborted", "AbortError");
		try {
			controller.abort(reason);
		} catch {
			controller.abort();
		}
		return controller.signal;
	}
	const onAbort = () => {
		const reason = list.find((s) => s.aborted)?.reason ?? new DOMException("Aborted", "AbortError");
		try {
			controller.abort(reason);
		} catch {
			controller.abort();
		}
	};
	for (const sig of list) sig.addEventListener?.("abort", onAbort, {
		once: true,
		signal: cleanupSignal
	});
	return controller.signal;
}
//#endregion
//#region node_modules/nuxt/dist/app/composables/state.js
var useStateKeyPrefix = "$s";
function useState(...args) {
	const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
	if (typeof args[0] !== "string") args.unshift(autoKey);
	const [_key, init] = args;
	if (!_key || typeof _key !== "string") throw stateDiagnostics.NUXT_E7009({ key: _key });
	if (init !== void 0 && typeof init !== "function") throw stateDiagnostics.NUXT_E7007({ type: typeof init });
	const key = useStateKeyPrefix + _key;
	const nuxtApp = useNuxtApp();
	const state = toRef(nuxtApp.payload.state, key);
	if (init) nuxtApp._state[key] ??= { _default: init };
	if (state.value === void 0 && init) {
		const initialValue = init();
		if (isRef(initialValue)) {
			nuxtApp.payload.state[key] = initialValue;
			return initialValue;
		}
		state.value = initialValue;
	}
	return state;
}
//#endregion
//#region virtual:nuxt:node_modules%2F.cache%2Fnuxt%2F.nuxt%2Fprogressnow-routes.mjs
var virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Fprogressnow_routes_default = {
	"routes": [
		{
			"path": "/",
			"kind": "front",
			"lang": "en",
			"id": 35,
			"template": "front-page",
			"payloadKey": "front:en"
		},
		{
			"path": "/about/",
			"kind": "about",
			"lang": "en",
			"id": 50,
			"template": "page-templates/about.php",
			"payloadKey": "page:en:about"
		},
		{
			"path": "/blog/",
			"kind": "posts_index",
			"lang": "en",
			"id": 65,
			"template": "page.php",
			"payloadKey": "page:en:blog"
		},
		{
			"path": "/bylaws-code-of-conduct/",
			"kind": "page",
			"lang": "en",
			"id": 45,
			"template": "page.php",
			"payloadKey": "page:en:bylaws-code-of-conduct"
		},
		{
			"path": "/calendar/",
			"kind": "calendar",
			"lang": "en",
			"id": 47,
			"template": "page-templates/calendar.php",
			"payloadKey": "page:en:calendar"
		},
		{
			"path": "/get-involved/",
			"kind": "get_involved",
			"lang": "en",
			"id": 43,
			"template": "page-templates/get-involved.php",
			"payloadKey": "page:en:get-involved"
		},
		{
			"path": "/privacy-policy/",
			"kind": "page",
			"lang": "en",
			"id": 3,
			"template": "page.php",
			"payloadKey": "page:en:privacy-policy"
		},
		{
			"path": "/sample-page/",
			"kind": "page",
			"lang": "en",
			"id": 2,
			"template": "page.php",
			"payloadKey": "page:en:sample-page"
		},
		{
			"path": "/styleguide/",
			"kind": "styleguide",
			"lang": "en",
			"id": 41,
			"template": "page-templates/styleguide.php",
			"payloadKey": "page:en:styleguide"
		},
		{
			"path": "/poled/sed-ut-perspiciatis/",
			"kind": "post",
			"lang": "en",
			"id": 67,
			"template": "single.php",
			"payloadKey": "post:en:sed-ut-perspiciatis"
		},
		{
			"path": "/labor/nemo-enim-ipsam/",
			"kind": "post",
			"lang": "en",
			"id": 68,
			"template": "single.php",
			"payloadKey": "post:en:nemo-enim-ipsam"
		},
		{
			"path": "/mutual/lorem-ipsum-dolor/",
			"kind": "post",
			"lang": "en",
			"id": 66,
			"template": "single.php",
			"payloadKey": "post:en:lorem-ipsum-dolor"
		},
		{
			"path": "/chapter/ut-enim-ad-minima/",
			"kind": "post",
			"lang": "en",
			"id": 69,
			"template": "single.php",
			"payloadKey": "post:en:ut-enim-ad-minima"
		},
		{
			"path": "/electoral/quis-autem-vel-eum/",
			"kind": "post",
			"lang": "en",
			"id": 70,
			"template": "single.php",
			"payloadKey": "post:en:quis-autem-vel-eum"
		},
		{
			"path": "/social/neque-porro-quisquam/",
			"kind": "post",
			"lang": "en",
			"id": 71,
			"template": "single.php",
			"payloadKey": "post:en:neque-porro-quisquam"
		},
		{
			"path": "/labor/temporibus-autem/",
			"kind": "post",
			"lang": "en",
			"id": 72,
			"template": "single.php",
			"payloadKey": "post:en:temporibus-autem"
		},
		{
			"path": "/poled/nam-libero-tempore/",
			"kind": "post",
			"lang": "en",
			"id": 73,
			"template": "single.php",
			"payloadKey": "post:en:nam-libero-tempore"
		},
		{
			"path": "/mutual/at-vero-eos/",
			"kind": "post",
			"lang": "en",
			"id": 74,
			"template": "single.php",
			"payloadKey": "post:en:at-vero-eos"
		},
		{
			"path": "/events/night-school-what-is-democratic-socialism/",
			"kind": "event",
			"lang": "en",
			"id": 51,
			"template": "single-event.php",
			"payloadKey": "event:en:night-school-what-is-democratic-socialism"
		},
		{
			"path": "/events/community-fridge-restock-cleanup/",
			"kind": "event",
			"lang": "en",
			"id": 52,
			"template": "single-event.php",
			"payloadKey": "event:en:community-fridge-restock-cleanup"
		},
		{
			"path": "/events/know-your-rights-at-work/",
			"kind": "event",
			"lang": "en",
			"id": 53,
			"template": "single-event.php",
			"payloadKey": "event:en:know-your-rights-at-work"
		},
		{
			"path": "/events/july-general-meeting/",
			"kind": "event",
			"lang": "en",
			"id": 54,
			"template": "single-event.php",
			"payloadKey": "event:en:july-general-meeting"
		},
		{
			"path": "/events/rgv-dsa-101-new-member-orientation/",
			"kind": "event",
			"lang": "en",
			"id": 55,
			"template": "single-event.php",
			"payloadKey": "event:en:rgv-dsa-101-new-member-orientation"
		},
		{
			"path": "/events/brake-light-clinic/",
			"kind": "event",
			"lang": "en",
			"id": 56,
			"template": "single-event.php",
			"payloadKey": "event:en:brake-light-clinic"
		},
		{
			"path": "/events/candidate-endorsement-forum/",
			"kind": "event",
			"lang": "en",
			"id": 57,
			"template": "single-event.php",
			"payloadKey": "event:en:candidate-endorsement-forum"
		},
		{
			"path": "/events/reading-circle-a-peoples-guide-to-capitalism/",
			"kind": "event",
			"lang": "en",
			"id": 58,
			"template": "single-event.php",
			"payloadKey": "event:en:reading-circle-a-peoples-guide-to-capitalism"
		},
		{
			"path": "/events/paleta-social/",
			"kind": "event",
			"lang": "en",
			"id": 59,
			"template": "single-event.php",
			"payloadKey": "event:en:paleta-social"
		},
		{
			"path": "/events/picket-support-training/",
			"kind": "event",
			"lang": "en",
			"id": 60,
			"template": "single-event.php",
			"payloadKey": "event:en:picket-support-training"
		},
		{
			"path": "/events/august-general-meeting/",
			"kind": "event",
			"lang": "en",
			"id": 61,
			"template": "single-event.php",
			"payloadKey": "event:en:august-general-meeting"
		},
		{
			"path": "/events/school-supply-distro-prep/",
			"kind": "event",
			"lang": "en",
			"id": 62,
			"template": "single-event.php",
			"payloadKey": "event:en:school-supply-distro-prep"
		},
		{
			"path": "/events/voter-registration-drive/",
			"kind": "event",
			"lang": "en",
			"id": 63,
			"template": "single-event.php",
			"payloadKey": "event:en:voter-registration-drive"
		},
		{
			"path": "/events/night-school-socialism-the-border/",
			"kind": "event",
			"lang": "en",
			"id": 64,
			"template": "single-event.php",
			"payloadKey": "event:en:night-school-socialism-the-border"
		},
		{
			"path": "/es/inicio/",
			"kind": "front",
			"lang": "es",
			"id": 294,
			"template": "front-page",
			"payloadKey": "front:es"
		},
		{
			"path": "/es/acerca-de/",
			"kind": "about",
			"lang": "es",
			"id": 358,
			"template": "page-templates/about.php",
			"payloadKey": "page:es:acerca-de"
		},
		{
			"path": "/es/blog/",
			"kind": "posts_index",
			"lang": "es",
			"id": 357,
			"template": "page.php",
			"payloadKey": "page:es:blog"
		},
		{
			"path": "/es/calendario/",
			"kind": "calendar",
			"lang": "es",
			"id": 356,
			"template": "page-templates/calendar.php",
			"payloadKey": "page:es:calendario"
		},
		{
			"path": "/es/participa/",
			"kind": "get_involved",
			"lang": "es",
			"id": 359,
			"template": "page-templates/get-involved.php",
			"payloadKey": "page:es:participa"
		},
		{
			"path": "/es/events/reabastecimiento-y-limpieza-del-refrigerador-comunitario/",
			"kind": "event",
			"lang": "es",
			"id": 319,
			"template": "single-event.php",
			"payloadKey": "event:es:reabastecimiento-y-limpieza-del-refrigerador-comunitario"
		},
		{
			"path": "/es/events/conoce-tus-derechos-en-el-trabajo/",
			"kind": "event",
			"lang": "es",
			"id": 320,
			"template": "single-event.php",
			"payloadKey": "event:es:conoce-tus-derechos-en-el-trabajo"
		},
		{
			"path": "/es/events/reunion-general-de-julio/",
			"kind": "event",
			"lang": "es",
			"id": 321,
			"template": "single-event.php",
			"payloadKey": "event:es:reunion-general-de-julio"
		},
		{
			"path": "/es/events/rgv-dsa-101-orientacion-para-nuevos-miembros/",
			"kind": "event",
			"lang": "es",
			"id": 322,
			"template": "single-event.php",
			"payloadKey": "event:es:rgv-dsa-101-orientacion-para-nuevos-miembros"
		},
		{
			"path": "/es/events/clinica-de-luces-de-freno/",
			"kind": "event",
			"lang": "es",
			"id": 323,
			"template": "single-event.php",
			"payloadKey": "event:es:clinica-de-luces-de-freno"
		},
		{
			"path": "/es/events/foro-de-respaldo-a-candidatos/",
			"kind": "event",
			"lang": "es",
			"id": 324,
			"template": "single-event.php",
			"payloadKey": "event:es:foro-de-respaldo-a-candidatos"
		},
		{
			"path": "/es/events/circulo-de-lectura-una-guia-popular-del-capitalismo/",
			"kind": "event",
			"lang": "es",
			"id": 325,
			"template": "single-event.php",
			"payloadKey": "event:es:circulo-de-lectura-una-guia-popular-del-capitalismo"
		},
		{
			"path": "/es/events/convivio-con-paletas/",
			"kind": "event",
			"lang": "es",
			"id": 326,
			"template": "single-event.php",
			"payloadKey": "event:es:convivio-con-paletas"
		},
		{
			"path": "/es/events/capacitacion-de-apoyo-a-piquetes/",
			"kind": "event",
			"lang": "es",
			"id": 327,
			"template": "single-event.php",
			"payloadKey": "event:es:capacitacion-de-apoyo-a-piquetes"
		},
		{
			"path": "/es/events/reunion-general-de-agosto/",
			"kind": "event",
			"lang": "es",
			"id": 328,
			"template": "single-event.php",
			"payloadKey": "event:es:reunion-general-de-agosto"
		},
		{
			"path": "/es/events/preparacion-de-la-distribucion-de-utiles-escolares/",
			"kind": "event",
			"lang": "es",
			"id": 329,
			"template": "single-event.php",
			"payloadKey": "event:es:preparacion-de-la-distribucion-de-utiles-escolares"
		},
		{
			"path": "/es/events/jornada-de-registro-de-votantes/",
			"kind": "event",
			"lang": "es",
			"id": 330,
			"template": "single-event.php",
			"payloadKey": "event:es:jornada-de-registro-de-votantes"
		},
		{
			"path": "/es/events/escuela-nocturna-el-socialismo-y-la-frontera/",
			"kind": "event",
			"lang": "es",
			"id": 331,
			"template": "single-event.php",
			"payloadKey": "event:es:escuela-nocturna-el-socialismo-y-la-frontera"
		}
	],
	"contentVersion": 12,
	"generatedAt": "2026-09-05T11:43:55+00:00"
};
var postCatSchema = z.enum([
	"chapter",
	"poled",
	"mutual",
	"labor",
	"electoral",
	"social"
]);
var eventCategorySchema = z.object({
	id: z.string(),
	label: z.string(),
	/** null = the "All events" pseudo-category (no swatch) */
	color: z.string().nullable()
});
var chapterEventSchema = z.object({
	id: z.string(),
	/** ISO yyyy-mm-dd */
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	/** display string, e.g. "7:00–8:30 PM" */
	time: z.string(),
	cat: postCatSchema,
	title: z.string(),
	location: z.string(),
	desc: z.string(),
	rsvpUrl: z.string().optional(),
	/** Google Calendar render?action=TEMPLATE URL */
	gcalUrl: z.string().optional(),
	/** Single Event permalink — the modal/chip "View event" destination (04 §3d) */
	url: z.string().optional()
});
var blogPostSchema = z.object({
	id: z.string(),
	title: z.string(),
	slug: z.string(),
	cat: postCatSchema,
	/** display date, e.g. "Jun 14, 2026" */
	date: z.string(),
	excerpt: z.string(),
	dek: z.string().optional(),
	bylineMode: z.enum(["named", "committee"]),
	author: z.string().optional(),
	committee: z.string().optional(),
	featured: z.boolean().optional(),
	readMinutes: z.number().optional(),
	url: z.string(),
	/** featured/card image (null src = striped placeholder) */
	image: z.object({
		src: z.string().nullable(),
		alt: z.string()
	}).nullable().optional()
});
var postImageSchema = z.object({
	src: z.string().nullable(),
	alt: z.string(),
	caption: z.string().optional(),
	credit: z.string().optional()
});
var postBlockSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("prose"),
		html: z.string()
	}),
	z.object({
		type: z.literal("image"),
		image: postImageSchema,
		breakout: z.boolean().optional()
	}),
	z.object({
		type: z.literal("pull_quote"),
		quote: z.string(),
		attribution: z.string().optional()
	}),
	z.object({
		type: z.literal("gallery"),
		layout: z.enum(["essay", "grid"]),
		images: z.array(postImageSchema)
	}),
	z.object({
		type: z.literal("person_quote"),
		photo: z.string().nullable(),
		alt: z.string(),
		quote: z.string(),
		translation: z.string().optional(),
		name: z.string(),
		role: z.string().optional(),
		lang: z.enum(["en", "es"])
	}),
	z.object({
		type: z.literal("video"),
		url: z.string(),
		poster: z.string().nullable().optional(),
		caption: z.string().optional(),
		transcriptUrl: z.string().optional()
	}),
	z.object({
		type: z.literal("audio"),
		file: z.string().nullable(),
		title: z.string(),
		duration: z.string().optional(),
		transcriptUrl: z.string()
	}),
	z.object({
		type: z.literal("document"),
		url: z.string(),
		title: z.string(),
		description: z.string().optional()
	}),
	z.object({
		type: z.literal("event_embed"),
		event: chapterEventSchema.nullable()
	}),
	z.object({
		type: z.literal("action_callout"),
		heading: z.string(),
		body: z.string(),
		buttons: z.array(z.object({
			label: z.string(),
			url: z.string(),
			style: z.enum(["primary", "outline"])
		}))
	})
]);
var singlePostDataSchema = z.object({
	title: z.string(),
	dek: z.string(),
	cat: postCatSchema,
	date: z.string(),
	readMinutes: z.number(),
	bylineMode: z.enum(["named", "committee"]),
	author: z.string(),
	authorAvatar: z.string().nullable(),
	committee: z.string(),
	authorBio: z.string(),
	committeeBio: z.string(),
	featuredImage: postImageSchema,
	blocks: z.array(postBlockSchema),
	tags: z.array(z.string())
});
/** event_body flexible-content layouts (the event-appropriate block set). */
var eventBlockSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("prose"),
		html: z.string()
	}),
	z.object({
		type: z.literal("agenda"),
		items: z.array(z.object({
			title: z.string(),
			desc: z.string().optional()
		}))
	}),
	z.object({
		type: z.literal("good_to_know"),
		items: z.array(z.string())
	}),
	z.object({
		type: z.literal("a11y_note"),
		html: z.string()
	}),
	z.object({
		type: z.literal("map"),
		address: z.string()
	})
]);
var eventContactSchema = z.object({
	name: z.string(),
	email: z.string(),
	phone: z.string()
});
/** Related-events card (rail-free; carries its own permalink). */
var relatedEventSchema = z.object({
	id: z.string(),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	time: z.string(),
	cat: postCatSchema,
	title: z.string(),
	location: z.string(),
	url: z.string()
});
var singleEventDataSchema = z.object({
	title: z.string(),
	summary: z.string(),
	cat: postCatSchema,
	/** ISO yyyy-mm-dd — date block + full date line derive from this */
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	/** display range, e.g. "2:00–4:00 PM" */
	time: z.string(),
	/** display doors time, e.g. "1:30 PM"; "" when unset */
	doorsTime: z.string(),
	locationType: z.enum([
		"in-person",
		"online",
		"hybrid"
	]),
	venue: z.string(),
	city: z.string(),
	cost: z.string(),
	rsvpRequired: z.boolean(),
	/** "" when unset (button falls back to #rsvp) */
	rsvpUrl: z.string(),
	capacity: z.number().nullable(),
	/** maps URL from venue/city; "" when online / no location */
	directionsUrl: z.string(),
	/** Google Calendar render URL; "" when no start time */
	gcalUrl: z.string(),
	/** per-event iCal URL; "" = no endpoint exposed (button hidden) */
	icsUrl: z.string(),
	contact: eventContactSchema,
	featuredImage: postImageSchema,
	blocks: z.array(eventBlockSchema)
});
var postsEnvelopeSchema = z.object({
	posts: z.array(blogPostSchema),
	page: z.number().int(),
	perPage: z.number().int(),
	total: z.number().int(),
	totalPages: z.number().int()
});
/** Header language-switcher entry (mirrors LanguageLink in LanguageToggle.vue
* and progressnow_i18n_languages_for_post() in inc/i18n.php). Carried on the
* single-post envelope so the JSON fast-path can refresh the switcher after a
* client-side navigation. */
var languageLinkSchema = z.object({
	code: z.string(),
	label: z.string(),
	name: z.string(),
	active: z.boolean(),
	url: z.string()
});
/** The `seo` block every route payload carries (inc/seo.php
* progressnow_seo_payload()) — what the PHP shell puts in <head>, so client
* navigation can keep title/description/canonical/hreflang current. */
var seoSchema = z.object({
	title: z.string(),
	description: z.string(),
	canonical: z.string(),
	robots: z.enum(["index,follow", "noindex,follow"]),
	hreflang: z.array(z.object({
		lang: z.string(),
		href: z.string()
	}))
});
var singlePostEnvelopeSchema = singlePostDataSchema.extend({
	readNext: z.array(blogPostSchema),
	/** Per-post ACF toggle (the SinglePost `showMetaRail` prop). */
	showMetaRail: z.boolean(),
	languages: z.array(languageLinkSchema),
	seo: seoSchema
});
z.object({
	events: z.array(chapterEventSchema),
	categories: z.array(eventCategorySchema)
});
z.object({ categories: z.array(eventCategorySchema) });
/** A Chapter Settings image with its shipped-placeholder fallback (inc/identity.php). */
var identityImageSchema = z.object({
	src: z.string(),
	alt: z.string(),
	width: z.number().int(),
	height: z.number().int(),
	is_default: z.boolean()
});
var identitySchema = z.object({
	name: z.string(),
	short_name: z.string(),
	region_label: z.string(),
	hero_headline: z.string(),
	logo_header: identityImageSchema,
	logo_footer: identityImageSchema,
	logo_square: identityImageSchema,
	share_image: identityImageSchema,
	hero_photo: identityImageSchema,
	who_image: identityImageSchema,
	cta_panel: identityImageSchema
});
var navLinkSchema = z.object({
	label: z.string(),
	href: z.string()
});
var chapterSchema = z.object({
	name: z.string(),
	short_name: z.string(),
	region_label: z.string(),
	join_url: z.string(),
	newsletter_url: z.string(),
	contact_email: z.string(),
	footer_tagline: z.string(),
	instagram_url: z.string(),
	committees: z.array(z.object({
		name: z.string(),
		desc: z.string()
	})),
	socials: z.array(z.object({
		name: z.string(),
		url: z.string()
	}))
});
var siteEnvelopeSchema = z.object({
	lang: z.string(),
	homeUrl: z.string(),
	apiBase: z.string(),
	languages: z.array(languageLinkSchema),
	chapter: chapterSchema,
	identity: identitySchema,
	header: z.object({
		navItems: z.array(navLinkSchema).nullable(),
		aboutItems: z.array(navLinkSchema).nullable(),
		joinLabel: z.string(),
		/** Short CTA for the mobile bar ("Join"). */
		joinShortLabel: z.string(),
		aboutLabel: z.string(),
		joinUrl: z.string(),
		logoUrl: z.string(),
		/** True while no logo is uploaded → the chrome draws the wordmark lockup. */
		logoIsDefault: z.boolean(),
		orgName: z.string(),
		homeUrl: z.string()
	}),
	footer: z.object({
		logoUrl: z.string(),
		logoIsDefault: z.boolean(),
		orgName: z.string(),
		columns: z.array(z.object({
			title: z.string(),
			links: z.array(navLinkSchema.extend({ external: z.boolean().optional() }))
		})).nullable(),
		socials: z.array(z.object({
			name: z.string(),
			url: z.string()
		})),
		contactEmail: z.string(),
		tagline: z.string(),
		a11yLead: z.string(),
		a11yLinkLabel: z.string()
	}),
	/** Polylang-registered UI strings, translated for `lang` (inc/i18n.php slugs). */
	strings: z.record(z.string(), z.string()),
	/** Post/event categories (the `/categories` envelope) — one fetch for the whole site. */
	categories: z.array(eventCategorySchema)
});
var ROUTE_KINDS = [
	"front",
	"posts_index",
	"page",
	"about",
	"get_involved",
	"calendar",
	"styleguide",
	"post",
	"event"
];
var routeSchema = z.object({
	path: z.string(),
	kind: z.enum(ROUTE_KINDS),
	lang: z.string(),
	id: z.number().int(),
	template: z.string(),
	payloadKey: z.string()
});
z.object({
	routes: z.array(routeSchema),
	contentVersion: z.number().int(),
	generatedAt: z.string()
});
var teaserImageSchema = z.object({
	src: z.string(),
	alt: z.string()
}).nullable();
var frontPageEnvelopeSchema = z.object({
	lang: z.string(),
	id: z.number().int(),
	path: z.string(),
	hero: z.object({
		subhead: z.string(),
		lede: z.string(),
		cta_primary_label: z.string(),
		cta_primary_url: z.string(),
		cta_secondary_label: z.string(),
		cta_secondary_url: z.string()
	}),
	who: z.object({
		eyebrow: z.string(),
		heading: z.string(),
		p1: z.string(),
		p2: z.string(),
		p3: z.string(),
		link_label: z.string(),
		link_url: z.string()
	}),
	/** Closing CTA (progress-now-v4-home D1): editor-owned brush line, per language. */
	cta: z.object({ line: z.string() }),
	eventCount: z.number().int(),
	events: z.array(z.object({
		day: z.string(),
		month: z.string(),
		title: z.string(),
		when: z.string(),
		where: z.string(),
		url: z.string()
	})),
	calendarUrl: z.string(),
	blog: z.object({
		featured: z.object({
			cat: postCatSchema,
			cat_label: z.string(),
			date: z.string(),
			read: z.string(),
			title: z.string(),
			excerpt: z.string(),
			url: z.string(),
			image: teaserImageSchema
		}).nullable(),
		rows: z.array(z.object({
			cat: postCatSchema,
			cat_label: z.string(),
			title: z.string(),
			date: z.string(),
			url: z.string(),
			image: teaserImageSchema
		}))
	}),
	languages: z.array(languageLinkSchema),
	seo: seoSchema
});
var linkRowSchema = z.object({
	label: z.string(),
	url: z.string(),
	external: z.boolean()
});
var faqRowSchema = z.object({
	question: z.string(),
	answer: z.string()
});
var sectionSchema = z.object({
	visible: z.boolean(),
	heading: z.string()
});
/** About page ACF group context (inc/pages.php progressnow_about_context()). */
var aboutGroupSchema = z.object({
	mission: z.object({
		visible: z.boolean(),
		eyebrow: z.string(),
		body: z.string()
	}),
	chapter: sectionSchema.extend({
		p1: z.string(),
		p2: z.string(),
		photo: z.object({
			src: z.string(),
			alt: z.string()
		}).nullable(),
		ctas: z.array(linkRowSchema)
	}),
	history: sectionSchema.extend({
		body: z.string(),
		timeline: z.array(z.object({
			year: z.string(),
			text: z.string()
		}))
	}),
	counties: sectionSchema.extend({
		intro: z.string(),
		cards: z.array(z.object({
			name: z.string(),
			cities: z.string(),
			note: z.string()
		}))
	}),
	committees: sectionSchema.extend({
		intro: z.string(),
		link: linkRowSchema
	}),
	governance: sectionSchema.extend({
		intro: z.string(),
		docs: z.array(z.object({
			title: z.string(),
			covers: z.string(),
			action: z.string(),
			url: z.string()
		}))
	}),
	faq: sectionSchema.extend({ rows: z.array(faqRowSchema) }),
	dues: sectionSchema.extend({ body: z.string() }),
	nav: z.array(z.object({
		href: z.string(),
		label: z.string()
	}))
});
/** Get Involved page ACF group context (inc/pages.php progressnow_get_involved_context()). */
var getInvolvedGroupSchema = z.object({
	join: sectionSchema.extend({ steps: z.array(z.object({
		title: z.string(),
		body: z.string(),
		link_label: z.string(),
		href: z.string(),
		external: z.boolean()
	})) }),
	committees: sectionSchema.extend({ intro: z.string() }),
	channels: sectionSchema.extend({ items: z.array(z.object({
		label: z.string(),
		desc: z.string(),
		link_label: z.string(),
		url: z.string(),
		badge: z.string(),
		external: z.boolean()
	})) }),
	faq: sectionSchema.extend({ items: z.array(faqRowSchema) }),
	card: z.object({
		heading: z.string(),
		body: z.string(),
		link_label: z.string(),
		url: z.string(),
		external: z.boolean()
	}),
	related: z.array(linkRowSchema),
	nav: z.array(z.object({
		href: z.string(),
		label: z.string()
	}))
});
var pageEnvelopeSchema = z.object({
	lang: z.string(),
	id: z.number().int(),
	path: z.string(),
	kind: z.enum(ROUTE_KINDS),
	template: z.string(),
	title: z.string(),
	lede: z.string(),
	/** kses'd rendered post_content */
	content: z.string(),
	documents: z.array(z.object({
		title: z.string(),
		meta: z.string(),
		url: z.string()
	})),
	grievance: z.object({
		show: z.boolean(),
		body: z.string()
	}),
	newhere: z.object({
		heading: z.string(),
		body: z.string(),
		link_label: z.string(),
		url: z.string(),
		external: z.boolean()
	}).nullable(),
	about: aboutGroupSchema.nullable(),
	gi: getInvolvedGroupSchema.nullable(),
	calendar: z.object({
		apiBase: z.string(),
		icsUrl: z.string(),
		googleCalUrl: z.string()
	}).nullable(),
	languages: z.array(languageLinkSchema),
	seo: seoSchema
});
var singleEventEnvelopeSchema = z.object({
	lang: z.string(),
	id: z.number().int(),
	path: z.string(),
	event: singleEventDataSchema,
	categories: z.array(eventCategorySchema),
	related: z.array(relatedEventSchema),
	showRelated: z.boolean(),
	homeUrl: z.string(),
	calendarUrl: z.string(),
	languages: z.array(languageLinkSchema),
	seo: seoSchema
});
z.object({
	buildId: z.string(),
	builtAt: z.string(),
	contentVersion: z.number().int(),
	entry: z.string(),
	css: z.array(z.string()),
	modulepreload: z.array(z.string()),
	/** Route chunks Nuxt hints with `<link rel="prefetch">` (optional for the shell). */
	prefetch: z.array(z.string()),
	/** `imports` of the importmap the entry chunk relies on (`#entry`). */
	importmap: z.record(z.string(), z.string()),
	prerenderedRoutes: z.number().int(),
	/** Public runtime config the shell serializes as `window.__NUXT__.config`
	* so the client entry boots (createApp, no hydration) without `__NUXT_DATA__`. */
	runtimeConfig: z.object({
		public: z.record(z.string(), z.unknown()),
		app: z.object({
			baseURL: z.string(),
			buildId: z.string(),
			buildAssetsDir: z.string(),
			cdnURL: z.string()
		}).passthrough()
	})
});
z.object({
	lang: z.string(),
	routeKind: z.enum(ROUTE_KINDS).or(z.literal("search")).or(z.literal("not_found")),
	path: z.string(),
	contentVersion: z.number().int(),
	buildId: z.string(),
	data: z.record(z.string(), z.unknown())
});
//#endregion
//#region app/lib/api.ts
/** Normalized error for any failed API call (WP error envelope or network). */
var ApiError = class extends Error {
	status;
	code;
	constructor(message, status, code) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.code = code;
	}
};
/** Re-thrown untouched so callers can ignore superseded requests. */
function isAbortError(err) {
	if (err instanceof DOMException && err.name === "AbortError") return true;
	const e = err;
	return e?.name === "AbortError" || e?.cause?.name === "AbortError";
}
var DEV = Boolean(false);
function validate(schema, data) {
	if (DEV) return schema.parse(data);
	const result = schema.safeParse(data);
	if (result.success) return result.data;
	console.error("[progressnow] API response failed contract validation", result.error);
	throw new ApiError("Response failed contract validation", 500, "progressnow_contract");
}
function nuxtFetch() {
	const f = globalThis.$fetch;
	return f && typeof f.raw === "function" ? f : null;
}
async function getJson(url, signal) {
	const $fetch = nuxtFetch();
	if ($fetch) {
		let res;
		try {
			res = await $fetch.raw(url, {
				signal,
				headers: { Accept: "application/json" },
				responseType: "json",
				ignoreResponseError: true
			});
		} catch (err) {
			if (isAbortError(err)) throw err;
			throw new ApiError("Network error", 0);
		}
		if (res.status >= 400) {
			const body = res._data ?? {};
			throw new ApiError(body.message ?? `Request failed (${res.status})`, res.status, body.code);
		}
		return res._data;
	}
	let response;
	try {
		response = await fetch(url, {
			signal,
			headers: { Accept: "application/json" }
		});
	} catch (err) {
		if (isAbortError(err)) throw err;
		throw new ApiError("Network error", 0);
	}
	if (!response.ok) {
		let code;
		let message = `Request failed (${response.status})`;
		try {
			const body = await response.json();
			code = body.code;
			if (body.message) message = body.message;
		} catch {}
		throw new ApiError(message, response.status, code);
	}
	return response.json();
}
function endpoint(apiBase, path, params = new URLSearchParams()) {
	const qs = params.toString();
	return `${apiBase.replace(/\/+$/, "")}${path}${qs ? `?${qs}` : ""}`;
}
function langParams(lang) {
	const params = new URLSearchParams();
	if (lang) params.set("lang", lang);
	return params;
}
function fetchPosts(apiBase, { s, category, page, lang } = {}, signal) {
	const params = new URLSearchParams();
	if (s && s.trim() !== "") params.set("s", s.trim());
	if (category && category !== "all") params.set("category", category);
	if (page && page > 1) params.set("page", String(page));
	if (lang) params.set("lang", lang);
	return getJson(endpoint(apiBase, "/posts", params), signal).then((data) => validate(postsEnvelopeSchema, data));
}
/** Single post by slug. Throws ApiError(404, "progressnow_post_not_found")
* for an unknown/unpublished slug. */
function fetchSinglePost(apiBase, slug, lang, signal) {
	return getJson(endpoint(apiBase, `/posts/${encodeURIComponent(slug)}`, langParams(lang)), signal).then((data) => validate(singlePostEnvelopeSchema, data));
}
function fetchSite(apiBase, lang) {
	return getJson(endpoint(apiBase, "/site", langParams(lang))).then((data) => validate(siteEnvelopeSchema, data));
}
function fetchFrontPage(apiBase, lang) {
	return getJson(endpoint(apiBase, "/front-page", langParams(lang))).then((data) => validate(frontPageEnvelopeSchema, data));
}
/** Page by URI (slug hierarchy, no leading/trailing slash). */
function fetchPage(apiBase, uri, lang) {
	return getJson(endpoint(apiBase, `/pages/${uri.split("/").filter(Boolean).map(encodeURIComponent).join("/")}`, langParams(lang))).then((data) => validate(pageEnvelopeSchema, data));
}
function fetchSingleEvent(apiBase, slug, lang) {
	return getJson(endpoint(apiBase, `/events/${encodeURIComponent(slug)}`, langParams(lang))).then((data) => validate(singleEventEnvelopeSchema, data));
}
//#endregion
//#region app/lib/chapter/cache.ts
function resolveCached(key, sources) {
	const embedded = sources.payloadData[key];
	if (embedded !== void 0 && embedded !== null) return embedded;
	if (sources.bypassStatic) return void 0;
	const prerendered = sources.staticData[key];
	if (prerendered !== void 0 && prerendered !== null) return prerendered;
}
//#endregion
//#region app/lib/chapter/freshness.ts
function compareVersions(shellVersion, manifestVersion) {
	return manifestVersion >= shellVersion ? "fresh" : "stale";
}
function createFreshnessGuard(shellVersion) {
	return {
		shellVersion: shellVersion ?? 0,
		state: shellVersion === null ? "unguarded" : "unknown",
		manifest: null,
		get bypass() {
			return this.state === "unknown" || this.state === "stale";
		},
		observe(manifest) {
			if (this.state === "unguarded") return this.state;
			this.manifest = manifest;
			this.state = manifest ? compareVersions(this.shellVersion, manifest.contentVersion) : "stale";
			return this.state;
		}
	};
}
//#endregion
//#region app/lib/chapter/keys.ts
function siteKey(lang) {
	return `site:${lang}`;
}
function frontKey(lang) {
	return `front:${lang}`;
}
function pageKey(lang, path) {
	return `page:${lang}:${trimSlashes(path)}`;
}
function postKey(lang, slug) {
	return `post:${lang}:${trimSlashes(slug)}`;
}
function eventKey(lang, slug) {
	return `event:${lang}:${trimSlashes(slug)}`;
}
/** `posts:{lang}` for the first browse page; `posts:{lang}:{page}:{category}`
* for any other browse state (mirrors inc/payloads.php
* progressnow_payload_posts_key()). */
function postsKey(lang, page = 1, category = "") {
	const p = Math.max(1, page);
	if (p === 1 && category === "") return `posts:${lang}`;
	return `posts:${lang}:${p}:${category}`;
}
function trimSlashes(value) {
	return value.replace(/^\/+|\/+$/g, "");
}
//#endregion
//#region app/lib/chapter/routes.ts
function first(value) {
	if (Array.isArray(value)) return value.find((v) => typeof v === "string") ?? "";
	return value ?? "";
}
/** `/about` → `/about/`, `/` stays, `/blog/page/2` → `/blog/page/2/`. */
function normalizePath(path) {
	let out = path.trim();
	if (out === "") return "/";
	try {
		out = decodeURI(out);
	} catch {}
	out = out.replace(/\/{2,}/g, "/");
	if (!out.startsWith("/")) out = `/${out}`;
	if (!out.endsWith("/")) out = `${out}/`;
	return out;
}
/** Longest-prefix match of the front routes decides the language of any path. */
function langForPath(manifest, path) {
	const fronts = manifest.routes.filter((r) => r.kind === "front").sort((a, b) => b.path.length - a.path.length);
	const normalized = normalizePath(path);
	for (const front of fronts) if (normalized === front.path || normalized.startsWith(front.path)) return front.lang;
	return manifest.routes[0]?.lang ?? "";
}
function findRoute(manifest, path) {
	const normalized = normalizePath(path);
	return manifest.routes.find((r) => normalizePath(r.path) === normalized) ?? null;
}
function frontRoute(manifest, lang) {
	return manifest.routes.find((r) => r.kind === "front" && r.lang === lang) ?? null;
}
function postsIndexRoute(manifest, lang) {
	return manifest.routes.find((r) => r.kind === "posts_index" && r.lang === lang) ?? null;
}
var PAGED = /^(.*?\/)page\/(\d+)\/$/;
var CATEGORY = /^(\/(?:[a-z]{2}\/)?)category\/([^/]+)\/$/;
function resolveRoute(manifest, rawPath, query = {}) {
	const path = normalizePath(rawPath);
	const search = first(query.s).trim();
	const queryCategory = first(query.category).trim();
	const queryPaged = Math.max(1, Number.parseInt(first(query.paged) || "1", 10) || 1);
	const base = {
		kind: "not_found",
		route: null,
		lang: langForPath(manifest, path),
		path,
		page: queryPaged,
		category: queryCategory,
		search
	};
	const paged = path.match(PAGED);
	if (paged) {
		const parent = findRoute(manifest, paged[1]);
		if (parent && parent.kind === "posts_index") return {
			...base,
			kind: "posts_index",
			route: parent,
			lang: parent.lang,
			page: Number.parseInt(paged[2], 10)
		};
	}
	const category = path.match(CATEGORY);
	if (category) {
		const lang = langForPath(manifest, category[1]);
		const index = postsIndexRoute(manifest, lang);
		if (index) return {
			...base,
			kind: "posts_index",
			route: index,
			lang,
			category: category[2]
		};
	}
	const route = findRoute(manifest, path);
	if (search !== "") {
		const lang = route?.lang ?? base.lang;
		return {
			...base,
			kind: "search",
			route: postsIndexRoute(manifest, lang) ?? route,
			lang
		};
	}
	if (!route) return base;
	return {
		...base,
		kind: route.kind,
		route,
		lang: route.lang
	};
}
//#endregion
//#region app/lib/chapter/seo.ts
function headForSeo(seo, lang) {
	const link = [];
	if (seo.canonical) link.push({
		key: "canonical",
		rel: "canonical",
		href: seo.canonical
	});
	for (const alt of seo.hreflang) link.push({
		key: `hreflang-${alt.lang}`,
		rel: "alternate",
		hreflang: alt.lang,
		href: alt.href
	});
	return {
		htmlAttrs: { lang: lang || "en" },
		title: seo.title,
		meta: [{
			key: "description",
			name: "description",
			content: seo.description
		}, {
			key: "robots",
			name: "robots",
			content: seo.robots
		}],
		link
	};
}
//#endregion
//#region app/lib/chapter/shell.ts
function createShellStore(shell) {
	return {
		shell,
		landingPath: "",
		keys: shell ? Object.keys(shell.data) : []
	};
}
/** Landing route = the document the shell rendered (first route only). */
function isLandingPath(store, path) {
	if (!store.shell) return false;
	const norm = (p) => p.endsWith("/") ? p : `${p}/`;
	return norm(store.landingPath) === norm(path);
}
//#endregion
//#region app/composables/useChapter.ts
var NO_SHELL = createShellStore(null);
var UNGUARDED = createFreshnessGuard(null);
function useShellStore() {
	return tryUseNuxtApp()?.$chapterShell ?? NO_SHELL;
}
function useFreshness() {
	return tryUseNuxtApp()?.$chapterGuard ?? UNGUARDED;
}
function useChapterApi() {
	return String(useRuntimeConfig().public.wpApiBase);
}
/** `useAsyncData` with the shell → `_payload.json` → REST order. */
function useChapterData(key, fetcher) {
	const guard = useFreshness();
	return useAsyncData(key, fetcher, {
		dedupe: "defer",
		getCachedData: (k, nuxtApp) => resolveCached(k, {
			payloadData: nuxtApp.payload.data,
			staticData: nuxtApp.static.data,
			bypassStatic: guard.bypass
		})
	});
}
function useChapterSite(lang) {
	const api = useChapterApi();
	const l = typeof lang === "string" ? lang : lang.value;
	return useChapterData(siteKey(l), () => fetchSite(api, l));
}
var routesState = shallowRef(virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Fprogressnow_routes_default);
function useChapterRoutes() {
	return routesState;
}
function shellRoute(store) {
	const shell = store.shell;
	if (!shell || shell.routeKind === "search" || shell.routeKind === "not_found") return null;
	const kind = shell.routeKind;
	const prefix = kind === "front" ? "front:" : kind === "post" ? "post:" : kind === "event" ? "event:" : "page:";
	const payloadKey = store.keys.find((k) => k.startsWith(prefix)) ?? "";
	return {
		path: shell.path,
		kind,
		lang: shell.lang,
		id: 0,
		template: "",
		payloadKey
	};
}
function useResolvedRoute() {
	const route = useRoute$1();
	const routes = useChapterRoutes();
	const store = useShellStore();
	return computed(() => {
		const resolved = resolveRoute(routes.value, route.path, route.query);
		if (resolved.kind !== "not_found") return resolved;
		const synthetic = isLandingPath(store, route.path) ? shellRoute(store) : null;
		if (!synthetic) return resolved;
		return {
			...resolved,
			kind: synthetic.kind,
			route: synthetic,
			lang: synthetic.lang
		};
	});
}
/** `page:{lang}:{uri}` → `uri`; `post:{lang}:{slug}` → `slug`. */
function payloadSlug(route) {
	return route.payloadKey.split(":").slice(2).join(":");
}
/** Per-route translation links (drives the header switcher). */
function useChapterLanguages() {
	return useState("chapter-languages", () => []);
}
function provideRouteLanguages(languages) {
	const state = useChapterLanguages();
	watch(languages, (list) => {
		if (!list) return;
		state.value = list;
	}, { immediate: true });
}
/** Head tags from the payload's `seo` block. The landing route keeps the PHP
* head untouched (identical by contract); from the first client navigation on
* unhead owns title/description/robots/canonical/hreflang and `html[lang]`. */
function useRouteSeo(seo, lang) {
	useShellStore();
	useRoute$1();
	useState("chapter-navigated", () => false);
	useHead$1(computed(() => {
		if (!seo.value) return {};
		return headForSeo(seo.value, lang.value);
	}));
}
var EVENT_CATEGORIES = reactive([{
	id: "all",
	label: "All events",
	color: null
}, ...[
	{
		"id": "chapter",
		"label": "Chapter-Wide",
		"color": "#B01B22"
	},
	{
		"id": "poled",
		"label": "Political Education",
		"color": "#33518F"
	},
	{
		"id": "mutual",
		"label": "Mutual Aid",
		"color": "#1B6B40"
	},
	{
		"id": "labor",
		"label": "Labor",
		"color": "#8F5715"
	},
	{
		"id": "electoral",
		"label": "Electoral",
		"color": "#6E3B87"
	},
	{
		"id": "social",
		"label": "Social",
		"color": "#0A6B74"
	}
]]);
/** Replace the six real categories (the store keeps its own "all" pseudo). */
function setCategories(cats) {
	const real = cats.filter((c) => c.id !== "all");
	if (real.length === 0) return;
	EVENT_CATEGORIES.splice(1, EVENT_CATEGORIES.length - 1, ...real);
}
function categoryById(id) {
	return EVENT_CATEGORIES.find((c) => c.id === id) ?? EVENT_CATEGORIES[0];
}
/** Local-time date from ISO yyyy-mm-dd (avoids UTC shift of new Date(iso)). */
function parseISODate(iso) {
	const [y, m, d] = iso.split("-").map(Number);
	return new Date(y, m - 1, d);
}
var WEEKDAYS = [
	"Sun",
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat"
];
var MONTH_NAMES = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
];
var MONTH_SHORTS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
];

export { useChapterLanguages as A, languageState as B, ClientOnly as C, setLanguages as D, EVENT_CATEGORIES as E, MONTH_SHORTS as M, WEEKDAYS as W, useFreshness as a, useChapterSite as b, useChapterApi as c, useChapterData as d, fetchSingleEvent as e, frontRoute as f, eventKey as g, provideRouteLanguages as h, useRouteSeo as i, fetchSinglePost as j, postKey as k, postsIndexRoute as l, fetchPage as m, pageKey as n, fetchPosts as o, payloadSlug as p, postsKey as q, fetchFrontPage as r, frontKey as s, useChapterRoutes as t, useResolvedRoute as u, setCategories as v, categoryById as w, parseISODate as x, MONTH_NAMES as y, cn as z };
//# sourceMappingURL=events-DJ7jaIrK.mjs.map
