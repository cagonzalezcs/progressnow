import process from 'node:process';globalThis._importMeta_={url:import.meta.url,env:process.env};import { tmpdir } from 'node:os';
import { defineEventHandler, handleCacheHeaders, splitCookiesString, createEvent, fetchWithEvent, isEvent, eventHandler, setHeaders, createError, sendRedirect, proxyRequest, getRequestHeader, setResponseHeaders, setResponseStatus, send, getRequestHeaders, setResponseHeader, appendResponseHeader, getRequestURL, getResponseHeader, removeResponseHeader, getQuery as getQuery$1, getRequestWebStream, createApp, createRouter as createRouter$1, toNodeListener, lazyEventHandler, getResponseStatus, getRouterParam, readBody, getResponseStatusText } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/h3/dist/index.mjs';
import { Server } from 'node:http';
import { resolve, dirname, join } from 'node:path';
import nodeCrypto from 'node:crypto';
import { parentPort, threadId } from 'node:worker_threads';
import { escapeHtml } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/@vue/shared/dist/shared.cjs.js';
import viteNodeEntry_mjs from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/@nuxt/vite-builder/dist/vite-node-entry.mjs';
import { viteNodeFetch } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/@nuxt/vite-builder/dist/vite-node.mjs';
import { parseURL, withoutBase, joinURL, getQuery, withQuery, withTrailingSlash, decodePath, withLeadingSlash, withoutTrailingSlash, encodePath, joinRelativeURL } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/ufo/dist/index.mjs';
import destr, { destr as destr$1 } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/destr/dist/index.mjs';
import { createHooks } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/nitropack/node_modules/hookable/dist/index.mjs';
import { createFetch, Headers as Headers$1 } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/ofetch/dist/node.mjs';
import { fetchNodeRequestHandler, callNodeRequestHandler } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/node-mock-http/dist/index.mjs';
import { createStorage, prefixStorage } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/unstorage/dist/index.mjs';
import unstorage_47drivers_47fs from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/unstorage/drivers/fs.mjs';
import { digest, hash as hash$1 } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/ohash/dist/index.mjs';
import { klona } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/klona/dist/index.mjs';
import defu, { defuFn } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/defu/dist/defu.mjs';
import { snakeCase } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/scule/dist/index.mjs';
import { getContext } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/nitropack/node_modules/unctx/dist/index.mjs';
import { toRouteMatcher, createRouter } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/radix3/dist/index.mjs';
import { readFile } from 'node:fs/promises';
import consola, { consola as consola$1 } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/consola/dist/index.mjs';
import { ErrorParser } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/youch-core/build/index.js';
import { Youch } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/youch/build/index.js';
import { SourceMapConsumer } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/source-map/source-map.js';
import { defineDiagnostics, createConsoleReporter } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/nostics/dist/index.mjs';
import { ansiFormatter } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/nostics/dist/formatters/ansi.mjs';
import { AsyncLocalStorage } from 'node:async_hooks';
import { stringify, uneval } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/devalue/index.js';
import { getContext as getContext$1 } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/unctx/dist/index.mjs';
import { captureRawStackTrace, parseRawStackTrace } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/errx/dist/index.mjs';
import { isVNode, isRef, toValue } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/vue/index.mjs';
import _wH6JrtIxmaSoA8lCPWFnE9z4lQeXW6H5z3l5aymEQw from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/@nuxt/vite-builder/dist/fix-stacktrace.mjs';
import { promises } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname as dirname$1, resolve as resolve$1 } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/pathe/dist/index.mjs';
import { createRenderer, getRequestDependencies, getPreloadLinks, getPrefetchLinks } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/vue-bundle-renderer/dist/runtime.mjs';
import { renderToString } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/vue/server-renderer/index.mjs';
import { createHead as createHead$1, propsToString, renderSSRHead } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/unhead/dist/server.mjs';
import { walkResolver } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/unhead/dist/utils.mjs';
import { DeprecationsPlugin } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/unhead/dist/legacy.mjs';
import { PromisesPlugin, TemplateParamsPlugin, AliasSortingPlugin } from 'file:///Users/cesargonzalez/Sites/progressnow/site/node_modules/unhead/dist/plugins.mjs';

const serverAssets = [{"baseName":"server","dir":"/Users/cesargonzalez/Sites/progressnow/site/server/assets"}];

const assets$1 = createStorage();

for (const asset of serverAssets) {
  assets$1.mount(asset.baseName, unstorage_47drivers_47fs({ base: asset.dir, ignore: (asset?.ignore || []) }));
}

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('root', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"/Users/cesargonzalez/Sites/progressnow/site","watchOptions":{"ignored":[null]}}));
storage.mount('src', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"/Users/cesargonzalez/Sites/progressnow/site/server","watchOptions":{"ignored":[null]}}));
storage.mount('build', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"/Users/cesargonzalez/Sites/progressnow/site/.nuxt"}));
storage.mount('cache', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"/Users/cesargonzalez/Sites/progressnow/site/.nuxt/cache"}));
storage.mount('data', unstorage_47drivers_47fs({"driver":"fs","base":"/Users/cesargonzalez/Sites/progressnow/site/.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

const inlineAppConfig = {};



const appConfig = defuFn(inlineAppConfig);

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildId": "dev",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      },
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
      }
    }
  },
  "public": {
    "wpApiBase": "https://progressnow.test:8890/wp-json/progressnow/v1",
    "themeStatic": "/wp-content/themes/progressnow/static",
    "mockApi": false
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

getContext("nitro-app", {
  asyncContext: false,
  AsyncLocalStorage: void 0
});

function isPathInScope(pathname, base) {
  let canonical;
  try {
    const pre = pathname.replace(/%2f/gi, "/").replace(/%5c/gi, "\\");
    canonical = new URL(pre, "http://_").pathname;
  } catch {
    return false;
  }
  return !base || canonical === base || canonical.startsWith(base + "/");
}

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

//#region src/runtime/utils/error.ts
/**
* Nitro internal functions extracted from https://github.com/nitrojs/nitro/blob/v2/src/runtime/internal/utils.ts
*/
function isJsonRequest(event) {
	if (hasReqHeader(event, "accept", "text/html")) return false;
	return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function hasReqHeader(event, name, includes) {
	const value = getRequestHeader(event, name);
	return !!(value && typeof value === "string" && value.toLowerCase().includes(includes));
}

//#region src/runtime/utils/dev.ts
const iframeStorageBridge = (nonce) => `
(function () {
  const NONCE = ${JSON.stringify(nonce)};
  const memoryStore = Object.create(null);

  const post = (type, payload) => {
    window.parent.postMessage({ type, nonce: NONCE, ...payload }, '*');
  };

  const isValid = (data) => data && data.nonce === NONCE;

  const mockStorage = {
    getItem(key) {
      return Object.hasOwn(memoryStore, key)
        ? memoryStore[key]
        : null;
    },
    setItem(key, value) {
      const v = String(value);
      memoryStore[key] = v;
      post('storage-set', { key, value: v });
    },
    removeItem(key) {
      delete memoryStore[key];
      post('storage-remove', { key });
    },
    clear() {
      for (const key of Object.keys(memoryStore))
        delete memoryStore[key];
      post('storage-clear', {});
    },
    key(index) {
      const keys = Object.keys(memoryStore);
      return keys[index] ?? null;
    },
    get length() {
      return Object.keys(memoryStore).length;
    }
  };

  const defineLocalStorage = () => {
    try {
      Object.defineProperty(window, 'localStorage', {
        value: mockStorage,
        writable: false,
        configurable: true
      });
    } catch {
      window.localStorage = mockStorage;
    }
  };

  defineLocalStorage();

  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!isValid(data) || data.type !== 'storage-sync-data') return;

    const incoming = data.data || {};
    for (const key of Object.keys(incoming))
      memoryStore[key] = incoming[key];

    if (typeof window.initTheme === 'function')
      window.initTheme();
    window.dispatchEvent(new Event('storage-ready'));
  });

  // Clipboard API is unavailable in data: URL iframe, so we use postMessage
  document.addEventListener('DOMContentLoaded', function() {
    window.copyErrorMessage = function(button) {
      post('clipboard-copy', { text: button.dataset.errorText });
      button.classList.add('copied');
      setTimeout(function() { button.classList.remove('copied'); }, 2000);
    };
  });

  post('storage-sync-request', {});
})();
`;
const parentStorageBridge = (nonce) => `
(function () {
  const host = document.querySelector('nuxt-error-overlay');
  if (!host) return;

  const NONCE = ${JSON.stringify(nonce)};
  const isValid = (data) => data && data.nonce === NONCE;

  // Handle clipboard copy from iframe
  window.addEventListener('message', function(e) {
    if (isValid(e.data) && e.data.type === 'clipboard-copy') {
      navigator.clipboard.writeText(e.data.text).catch(function() {});
    }
  });

  const collectLocalStorage = () => {
    const all = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k != null) all[k] = localStorage.getItem(k);
    }
    return all;
  };

  const attachWhenReady = () => {
    const root = host.shadowRoot;
    if (!root)
      return false;
    const iframe = root.getElementById('frame');
    if (!iframe || !iframe.contentWindow)
      return false;

    const handlers = {
      'storage-set': (d) => localStorage.setItem(d.key, d.value),
      'storage-remove': (d) => localStorage.removeItem(d.key),
      'storage-clear': () => localStorage.clear(),
      'storage-sync-request': () => {
        iframe.contentWindow.postMessage({
          type: 'storage-sync-data',
          data: collectLocalStorage(),
          nonce: NONCE
        }, '*');
      }
    };

    window.addEventListener('message', (event) => {
      const data = event.data;
      if (!isValid(data)) return;
      const fn = handlers[data.type];
      if (fn) fn(data);
    });

    return true;
  };

  if (attachWhenReady())
    return;

  const obs = new MutationObserver(() => {
    if (attachWhenReady())
      obs.disconnect();
  });

  obs.observe(host, { childList: true, subtree: true });
})();
`;
const errorCSS = `
:host {
  --preview-width: 240px;
  --preview-height: 180px;
  --base-width: 1200px;
  --base-height: 900px;
  --z-base: 999999998;
  --error-pip-left: auto;
  --error-pip-top: auto;
  --error-pip-right: 5px;
  --error-pip-bottom: 5px;
  --error-pip-origin: bottom right;
  --app-preview-left: auto;
  --app-preview-top: auto;
  --app-preview-right: 5px;
  --app-preview-bottom: 5px;
  all: initial;
  display: contents;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
#frame {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  border: none;
  z-index: var(--z-base);
}
#frame[inert] {
  left: var(--error-pip-left);
  top: var(--error-pip-top);
  right: var(--error-pip-right);
  bottom: var(--error-pip-bottom);
  width: var(--base-width);
  height: var(--base-height);
  transform: scale(calc(240 / 1200));
  transform-origin: var(--error-pip-origin);
  overflow: hidden;
  border-radius: calc(1200 * 8px / 240);
}
#preview {
  position: fixed;
  left: var(--app-preview-left);
  top: var(--app-preview-top);
  right: var(--app-preview-right);
  bottom: var(--app-preview-bottom);
  width: var(--preview-width);
  height: var(--preview-height);
  overflow: hidden;
  border-radius: 6px;
  pointer-events: none;
  z-index: var(--z-base);
  background: white;
  display: none;
}
#preview iframe {
  transform-origin: var(--error-pip-origin);
}
#frame:not([inert]) + #preview {
  display: block;
}
#toggle {
  position: fixed;
  left: var(--app-preview-left);
  top: var(--app-preview-top);
  right: calc(var(--app-preview-right) - 3px);
  bottom: calc(var(--app-preview-bottom) - 3px);
  width: var(--preview-width);
  height: var(--preview-height);
  background: none;
  border: 3px solid #00DC82;
  border-radius: 8px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s, box-shadow 0.2s;
  z-index: calc(var(--z-base) + 1);
  display: flex;
  align-items: center;
  justify-content: center;
}
#toggle:hover,
#toggle:focus {
  opacity: 1;
  box-shadow: 0 0 20px rgba(0, 220, 130, 0.6);
}
#toggle:focus-visible {
  outline: 3px solid #00DC82;
  outline-offset: 0;
  box-shadow: 0 0 24px rgba(0, 220, 130, 0.8);
}
#frame[inert] ~ #toggle {
  left: var(--error-pip-left);
  top: var(--error-pip-top);
  right: calc(var(--error-pip-right) - 3px);
  bottom: calc(var(--error-pip-bottom) - 3px);
  cursor: grab;
}
:host(.dragging) #frame[inert] ~ #toggle {
  cursor: grabbing;
}
#frame:not([inert]) ~ #toggle,
#frame:not([inert]) + #preview {
  cursor: grab;
}
:host(.dragging-preview) #frame:not([inert]) ~ #toggle,
:host(.dragging-preview) #frame:not([inert]) + #preview {
  cursor: grabbing;
}

#pip-close {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 16px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
}
#pip-close:focus-visible {
  outline: 2px solid #00DC82;
  outline-offset: 2px;
}

#pip-restore {
  position: fixed;
  right: 16px;
  bottom: 16px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 2px solid #00DC82;
  background: #111;
  color: #fff;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  z-index: calc(var(--z-base) + 2);
  cursor: grab;
}
#pip-restore:focus-visible {
  outline: 2px solid #00DC82;
  outline-offset: 2px;
}
:host(.dragging-restore) #pip-restore {
  cursor: grabbing;
}

#frame[hidden],
#toggle[hidden],
#preview[hidden],
#pip-restore[hidden],
#pip-close[hidden] {
  display: none !important;
}

@media (prefers-reduced-motion: reduce) {
  #toggle {
    transition: none;
  }
}
`;
function webComponentScript(base64HTML, startMinimized) {
	return `
(function () {
  try {
    // =========================
    // Host + Shadow
    // =========================
    const host = document.querySelector('nuxt-error-overlay');
    if (!host)
      return;
    const shadow = host.attachShadow({ mode: 'open' });

    // =========================
    // DOM helpers
    // =========================
    const el = (tag) => document.createElement(tag);
    const on = (node, type, fn, opts) => node.addEventListener(type, fn, opts);
    const hide = (node, v) => node.toggleAttribute('hidden', !!v);
    const setVar = (name, value) => host.style.setProperty(name, value);
    const unsetVar = (name) => host.style.removeProperty(name);

    // =========================
    // Create DOM
    // =========================
    const style = el('style');
    style.textContent = ${JSON.stringify(errorCSS)};

    const iframe = el('iframe');
    iframe.id = 'frame';
    iframe.src = 'data:text/html;base64,${base64HTML}';
    iframe.title = 'Detailed error stack trace';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-top-navigation-by-user-activation');

    const preview = el('div');
    preview.id = 'preview';

    const toggle = el('div');
    toggle.id = 'toggle';
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('tabindex', '0');
    toggle.innerHTML = '<span class="sr-only">Toggle detailed error view</span>';

    const liveRegion = el('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.className = 'sr-only';

    const pipCloseButton = el('button');
    pipCloseButton.id = 'pip-close';
    pipCloseButton.setAttribute('type', 'button');
    pipCloseButton.setAttribute('aria-label', 'Hide error preview overlay');
    pipCloseButton.innerHTML = '&times;';
    pipCloseButton.hidden = true;
    toggle.appendChild(pipCloseButton);

    const pipRestoreButton = el('button');
    pipRestoreButton.id = 'pip-restore';
    pipRestoreButton.setAttribute('type', 'button');
    pipRestoreButton.setAttribute('aria-label', 'Show error overlay');
    pipRestoreButton.innerHTML = '<span aria-hidden="true">⟲</span><span>Show error overlay</span>';
    pipRestoreButton.hidden = true;

    // Order matters: #frame + #preview adjacency
    shadow.appendChild(style);
    shadow.appendChild(liveRegion);
    shadow.appendChild(iframe);
    shadow.appendChild(preview);
    shadow.appendChild(toggle);
    shadow.appendChild(pipRestoreButton);

    // =========================
    // Constants / keys
    // =========================
    const POS_KEYS = {
      position: 'nuxt-error-overlay:position',
      hiddenPretty: 'nuxt-error-overlay:error-pip:hidden',
      hiddenPreview: 'nuxt-error-overlay:app-preview:hidden'
    };

    const CSS_VARS = {
      pip: {
        left: '--error-pip-left',
        top: '--error-pip-top',
        right: '--error-pip-right',
        bottom: '--error-pip-bottom'
      },
      preview: {
        left: '--app-preview-left',
        top: '--app-preview-top',
        right: '--app-preview-right',
        bottom: '--app-preview-bottom'
      }
    };

    const MIN_GAP = 5;
    const DRAG_THRESHOLD = 2;

    // =========================
    // Local storage safe access + state
    // =========================
    let storageReady = true;
    let isPrettyHidden = false;
    let isPreviewHidden = false;

    const safeGet = (k) => {
      try {
        return localStorage.getItem(k);
      } catch {
        return null;
      }
    };

    const safeSet = (k, v) => {
      if (!storageReady) 
        return;
      try {
        localStorage.setItem(k, v);
      } catch {}
    };

    // =========================
    // Sizing helpers
    // =========================
    const vvSize = () => {
      const v = window.visualViewport;
      return v ? { w: v.width, h: v.height } : { w: window.innerWidth, h: window.innerHeight };
    };

    const previewSize = () => {
      const styles = getComputedStyle(host);
      const w = parseFloat(styles.getPropertyValue('--preview-width')) || 240;
      const h = parseFloat(styles.getPropertyValue('--preview-height')) || 180;
      return { w, h };
    };

    const sizeForTarget = (target) => {
      if (!target)
        return previewSize();
      const rect = target.getBoundingClientRect();
      if (rect.width && rect.height)
        return { w: rect.width, h: rect.height };
      return previewSize();
    };

    // =========================
    // Dock model + offset/alignment calculations
    // =========================
    const dock = { edge: null, offset: null, align: null, gap: null };

    const maxOffsetFor = (edge, size) => {
      const vv = vvSize();
      if (edge === 'left' || edge === 'right')
        return Math.max(MIN_GAP, vv.h - size.h - MIN_GAP);
      return Math.max(MIN_GAP, vv.w - size.w - MIN_GAP);
    };

    const clampOffset = (edge, value, size) => {
      const max = maxOffsetFor(edge, size);
      return Math.min(Math.max(value, MIN_GAP), max);
    };

    const updateDockAlignment = (size) => {
      if (!dock.edge || dock.offset == null)
        return;
      const max = maxOffsetFor(dock.edge, size);
      if (dock.offset <= max / 2) {
        dock.align = 'start';
        dock.gap = dock.offset;
      } else {
        dock.align = 'end';
        dock.gap = Math.max(0, max - dock.offset);
      }
    };

    const appliedOffsetFor = (size) => {
      if (!dock.edge || dock.offset == null)
        return null;
      const max = maxOffsetFor(dock.edge, size);

      if (dock.align === 'end' && typeof dock.gap === 'number') {
        return clampOffset(dock.edge, max - dock.gap, size);
      }
      if (dock.align === 'start' && typeof dock.gap === 'number') {
        return clampOffset(dock.edge, dock.gap, size);
      }
      return clampOffset(dock.edge, dock.offset, size);
    };

    const nearestEdgeAt = (x, y) => {
      const { w, h } = vvSize();
      const d = { left: x, right: w - x, top: y, bottom: h - y };
      return Object.keys(d).reduce((a, b) => (d[a] < d[b] ? a : b));
    };

    const cornerDefaultDock = () => {
      const vv = vvSize();
      const size = previewSize();
      const offset = Math.max(MIN_GAP, vv.w - size.w - MIN_GAP);
      return { edge: 'bottom', offset };
    };

    const currentTransformOrigin = () => {
      if (!dock.edge) return null;
      if (dock.edge === 'left' || dock.edge === 'top')
        return 'top left';
      if (dock.edge === 'right')
        return 'top right';
      return 'bottom left';
    };

    // =========================
    // Persist / load dock
    // =========================
    const loadDock = () => {
      const raw = safeGet(POS_KEYS.position);
      if (!raw)
        return;
      try {
        const parsed = JSON.parse(raw);
        const { edge, offset, align, gap } = parsed || {};
        if (!['left', 'right', 'top', 'bottom'].includes(edge))
          return;
        if (typeof offset !== 'number')
          return;

        dock.edge = edge;
        dock.offset = clampOffset(edge, offset, previewSize());
        dock.align = align === 'start' || align === 'end' ? align : null;
        dock.gap = typeof gap === 'number' ? gap : null;

        if (!dock.align || dock.gap == null)
          updateDockAlignment(previewSize());
      } catch {}
    };

    const persistDock = () => {
      if (!dock.edge || dock.offset == null)
        return; 
      safeSet(POS_KEYS.position, JSON.stringify({
        edge: dock.edge,
        offset: dock.offset,
        align: dock.align,
        gap: dock.gap
      }));
    };

    // =========================
    // Apply dock
    // =========================
    const dockToVars = (vars) => ({
      set: (side, v) => host.style.setProperty(vars[side], v),
      clear: (side) => host.style.removeProperty(vars[side])
    });

    const dockToEl = (node) => ({
      set: (side, v) => { node.style[side] = v; },
      clear: (side) => { node.style[side] = ''; }
    });

    const applyDock = (target, size, opts) => {
      if (!dock.edge || dock.offset == null) {
        target.clear('left');
        target.clear('top');
        target.clear('right');
        target.clear('bottom');
        return;
      }

      target.set('left', 'auto');
      target.set('top', 'auto');
      target.set('right', 'auto');
      target.set('bottom', 'auto');

      const applied = appliedOffsetFor(size);

      if (dock.edge === 'left') {
        target.set('left', MIN_GAP + 'px');
        target.set('top', applied + 'px');
      } else if (dock.edge === 'right') {
        target.set('right', MIN_GAP + 'px');
        target.set('top', applied + 'px');
      } else if (dock.edge === 'top') {
        target.set('top', MIN_GAP + 'px');
        target.set('left', applied + 'px');
      } else {
        target.set('bottom', MIN_GAP + 'px');
        target.set('left', applied + 'px');
      }

      if (!opts || opts.persist !== false)
        persistDock();
    };

    const applyDockAll = (opts) => {
      applyDock(dockToVars(CSS_VARS.pip), previewSize(), opts);
      applyDock(dockToVars(CSS_VARS.preview), previewSize(), opts);
      applyDock(dockToEl(pipRestoreButton), sizeForTarget(pipRestoreButton), opts);
    };

    const repaintToDock = () => {
      if (!dock.edge || dock.offset == null)
        return;
      const origin = currentTransformOrigin();
      if (origin)
        setVar('--error-pip-origin', origin);
      else 
        unsetVar('--error-pip-origin');
      applyDockAll({ persist: false });
    };

    // =========================
    // Hidden state + UI
    // =========================
    const loadHidden = () => {
      const rawPretty = safeGet(POS_KEYS.hiddenPretty);
      if (rawPretty != null)
        isPrettyHidden = rawPretty === '1' || rawPretty === 'true';
      const rawPreview = safeGet(POS_KEYS.hiddenPreview);
      if (rawPreview != null)
        isPreviewHidden = rawPreview === '1' || rawPreview === 'true';
    };

    const setPrettyHidden = (v) => {
      isPrettyHidden = !!v;
      safeSet(POS_KEYS.hiddenPretty, isPrettyHidden ? '1' : '0');
      updateUI();
    };

    const setPreviewHidden = (v) => {
      isPreviewHidden = !!v;
      safeSet(POS_KEYS.hiddenPreview, isPreviewHidden ? '1' : '0');
      updateUI();
    };

    const isMinimized = () => iframe.hasAttribute('inert');

    const setMinimized = (v) => {
      if (v) {
        iframe.setAttribute('inert', '');
        toggle.setAttribute('aria-expanded', 'false');
      } else {
        iframe.removeAttribute('inert');
        toggle.setAttribute('aria-expanded', 'true');
      }
    };

    const setRestoreLabel = (kind) => {
      if (kind === 'pretty') {
        pipRestoreButton.innerHTML = '<span aria-hidden="true">⟲</span><span>Show error overlay</span>';
        pipRestoreButton.setAttribute('aria-label', 'Show error overlay');
      } else {
        pipRestoreButton.innerHTML = '<span aria-hidden="true">⟲</span><span>Show error page</span>';
        pipRestoreButton.setAttribute('aria-label', 'Show error page');
      }
    };

    const updateUI = () => {
      const minimized = isMinimized();
      const showPiP = minimized && !isPrettyHidden;
      const showPreview = !minimized && !isPreviewHidden;
      const pipHiddenByUser = minimized && isPrettyHidden;
      const previewHiddenByUser = !minimized && isPreviewHidden;
      const showToggle = minimized ? showPiP : showPreview;
      const showRestore = pipHiddenByUser || previewHiddenByUser;

      hide(iframe, pipHiddenByUser);
      hide(preview, !showPreview);
      hide(toggle, !showToggle);
      hide(pipCloseButton, !showToggle);
      hide(pipRestoreButton, !showRestore);

      pipCloseButton.setAttribute('aria-label', minimized ? 'Hide error overlay' : 'Hide error page preview');

      if (pipHiddenByUser)
        setRestoreLabel('pretty');
      else if (previewHiddenByUser)
        setRestoreLabel('preview');

      host.classList.toggle('pip-hidden', isPrettyHidden);
      host.classList.toggle('preview-hidden', isPreviewHidden);
    };

    // =========================
    // Preview snapshot
    // =========================
    const updatePreview = () => {
      try {
        let previewIframe = preview.querySelector('iframe');
        if (!previewIframe) {
          previewIframe = el('iframe');
          previewIframe.style.cssText = 'width: 1200px; height: 900px; transform: scale(0.2); transform-origin: top left; border: none;';
          previewIframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
          preview.appendChild(previewIframe);
        }

        const doctype = document.doctype ? '<!DOCTYPE ' + document.doctype.name + '>' : '';
        const cleanedHTML = document.documentElement.outerHTML
          .replace(/<nuxt-error-overlay[^>]*>.*?<\\/nuxt-error-overlay>/gs, '')
          .replace(/<script[^>]*>.*?<\\/script>/gs, '');

        const iframeDoc = previewIframe.contentDocument || previewIframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(doctype + cleanedHTML);
        iframeDoc.close();
      } catch (err) {
        console.error('Failed to update preview:', err);
      }
    };

    // =========================
    // View toggling
    // =========================
    const toggleView = () => {
      if (isMinimized()) {
        updatePreview();
        setMinimized(false);
        liveRegion.textContent = 'Showing detailed error view';
        setTimeout(() => { 
          try { 
            iframe.contentWindow.focus();
          } catch {}
        }, 100);
      } else {
        setMinimized(true);
        liveRegion.textContent = 'Showing error page';
        repaintToDock();
        void iframe.offsetWidth;
      }
      updateUI();
    };

    // =========================
    // Dragging (unified, rAF throttled)
    // =========================
    let drag = null;
    let rafId = null;
    let suppressToggleClick = false;
    let suppressRestoreClick = false;

    const beginDrag = (e) => {
      if (drag) 
        return;

      if (!dock.edge || dock.offset == null) {
        const def = cornerDefaultDock();
        dock.edge = def.edge;
        dock.offset = def.offset;
        updateDockAlignment(previewSize());
      }

      const isRestoreTarget = e.currentTarget === pipRestoreButton;

      drag = {
        kind: isRestoreTarget ? 'restore' : (isMinimized() ? 'pip' : 'preview'),
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        lastY: e.clientY,
        moved: false,
        target: e.currentTarget
      };

      drag.target.setPointerCapture(e.pointerId);

      if (drag.kind === 'restore')
        host.classList.add('dragging-restore');
      else 
        host.classList.add(drag.kind === 'pip' ? 'dragging' : 'dragging-preview');

      e.preventDefault();
    };

    const moveDrag = (e) => {
      if (!drag || drag.pointerId !== e.pointerId)
        return;

      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
      
      const dx = drag.lastX - drag.startX;
      const dy = drag.lastY - drag.startY;

      if (!drag.moved && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
        drag.moved = true;
      }

      if (!drag.moved)
        return;
      if (rafId)
        return;

      rafId = requestAnimationFrame(() => {
        rafId = null;

        const edge = nearestEdgeAt(drag.lastX, drag.lastY);
        const size = sizeForTarget(drag.target);

        let offset;
        if (edge === 'left' || edge === 'right') {
          const top = drag.lastY - (size.h / 2);
          offset = clampOffset(edge, Math.round(top), size);
        } else {
          const left = drag.lastX - (size.w / 2);
          offset = clampOffset(edge, Math.round(left), size);
        }

        dock.edge = edge;
        dock.offset = offset;
        updateDockAlignment(size);

        const origin = currentTransformOrigin();
        setVar('--error-pip-origin', origin || 'bottom right');

        applyDockAll({ persist: false });
      });
    };

    const endDrag = (e) => {
      if (!drag || drag.pointerId !== e.pointerId)
        return;

      const endedKind = drag.kind;
      drag.target.releasePointerCapture(e.pointerId);

      if (endedKind === 'restore')
        host.classList.remove('dragging-restore');
      else 
        host.classList.remove(endedKind === 'pip' ? 'dragging' : 'dragging-preview');

      const didMove = drag.moved;
      drag = null;

      if (didMove) {
        persistDock();
        if (endedKind === 'restore')
          suppressRestoreClick = true;
        else 
          suppressToggleClick = true;
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const bindDragTarget = (node) => {
      on(node, 'pointerdown', beginDrag);
      on(node, 'pointermove', moveDrag);
      on(node, 'pointerup', endDrag);
      on(node, 'pointercancel', endDrag);
    };

    bindDragTarget(toggle);
    bindDragTarget(pipRestoreButton);

    // =========================
    // Events (toggle / close / restore)
    // =========================
    on(toggle, 'click', (e) => {
      if (suppressToggleClick) {
        e.preventDefault();
        suppressToggleClick = false;
        return;
      }
      toggleView();
    });

    on(toggle, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleView();
      }
    });

    on(pipCloseButton, 'click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isMinimized())
        setPrettyHidden(true);
      else
        setPreviewHidden(true);
    });

    on(pipCloseButton, 'pointerdown', (e) => {
      e.stopPropagation();
    });

    on(pipRestoreButton, 'click', (e) => {
      if (suppressRestoreClick) {
        e.preventDefault();
        suppressRestoreClick = false;
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      if (isMinimized()) 
        setPrettyHidden(false);
      else 
        setPreviewHidden(false);
    });

    // =========================
    // Lifecycle: load / sync / repaint
    // =========================
    const loadState = () => {
      loadDock();
      loadHidden();

      if (isPrettyHidden && !isMinimized())
        setMinimized(true);

      updateUI();
      repaintToDock();
    };

    loadState();

    on(window, 'storage-ready', () => {
      storageReady = true;
      loadState();
    });

    const onViewportChange = () => repaintToDock();

    on(window, 'resize', onViewportChange);

    if (window.visualViewport) {
      on(window.visualViewport, 'resize', onViewportChange);
      on(window.visualViewport, 'scroll', onViewportChange);
    }

    // initial preview
    setTimeout(updatePreview, 100);

    // initial minimized option
    if (${startMinimized}) {
      setMinimized(true);
      repaintToDock();
      void iframe.offsetWidth;
      updateUI();
    }
  } catch (err) {
    console.error('Failed to initialize Nuxt error overlay:', err);
  }
})();
`;
}
function generateErrorOverlayHTML(html, options) {
	const nonce = Array.from(crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
	const errorPage = html.replace("<head>", `<head><script>${iframeStorageBridge(nonce)}<\/script>`);
	const base64HTML = Buffer.from(errorPage, "utf8").toString("base64");
	return `
    <script>${parentStorageBridge(nonce)}<\/script>
    <nuxt-error-overlay></nuxt-error-overlay>
    <script>${webComponentScript(base64HTML, options?.startMinimized ?? false)}<\/script>
  `;
}

//#region src/runtime/handlers/error.ts
var error_default = async function errorhandler(error, event, { defaultHandler }) {
	if (event.handled || isJsonRequest(event)) return;
	const defaultRes = await defaultHandler(error, event, { json: true });
	const status = error.status || error.statusCode || 500;
	if (status === 404 && defaultRes.status === 302) {
		setResponseHeaders(event, defaultRes.headers);
		setResponseStatus(event, defaultRes.status, defaultRes.statusText);
		return send(event, JSON.stringify(defaultRes.body, null, 2));
	}
	if (typeof defaultRes.body !== "string" && Array.isArray(defaultRes.body.stack)) defaultRes.body.stack = defaultRes.body.stack.join("\n");
	const errorObject = defaultRes.body;
	const url = new URL(errorObject.url);
	errorObject.url = withoutBase(url.pathname, useRuntimeConfig(event).app.baseURL) + url.search + url.hash;
	errorObject.message = error.unhandled ? errorObject.message || "Server Error" : error.message || errorObject.message || "Server Error";
	errorObject.data ||= error.data;
	errorObject.statusText ||= error.statusText || error.statusMessage;
	delete defaultRes.headers["content-type"];
	delete defaultRes.headers["content-security-policy"];
	setResponseHeaders(event, defaultRes.headers);
	const reqHeaders = getRequestHeaders(event);
	const res = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"] ? null : await useNitroApp().localFetch(withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject), {
		headers: {
			...reqHeaders,
			"x-nuxt-error": "true"
		},
		redirect: "manual"
	}).catch(() => null);
	if (event.handled) return;
	if (!res) {
		const { template } = await Promise.resolve().then(function () { return error500; });
		errorObject.description = errorObject.message;
		setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
		return send(event, template(errorObject));
	}
	const html = await res.text();
	for (const [header, value] of res.headers.entries()) {
		if (header === "set-cookie") {
			appendResponseHeader(event, header, value);
			continue;
		}
		setResponseHeader(event, header, value);
	}
	setResponseStatus(event, res.status && res.status !== 200 ? res.status : defaultRes.status, res.statusText || defaultRes.statusText);
	if (typeof html === "string") {
		const prettyResponse = await defaultHandler(error, event, { json: false });
		if (typeof prettyResponse.body === "string") return send(event, html.replace("</body>", `${generateErrorOverlayHTML(prettyResponse.body, { startMinimized: 300 <= status && status < 500 })}</body>`));
	}
	return send(event, html);
};

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$1 = defineNitroErrorHandler(
  async function defaultNitroErrorHandler(error, event) {
    const res = await defaultHandler(error, event);
    if (!event.node?.res.headersSent) {
      setResponseHeaders(event, res.headers);
    }
    setResponseStatus(event, res.status, res.statusText);
    return send(
      event,
      typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2)
    );
  }
);
async function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  await loadStackTrace(error).catch(consola.error);
  const youch = new Youch();
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    const ansiError = await (await youch.toANSI(error)).replaceAll(process.cwd(), ".");
    consola.error(
      `[request error] ${tags} [${event.method}] ${url}

`,
      ansiError
    );
  }
  const useJSON = opts?.json ?? !getRequestHeader(event, "accept")?.includes("text/html");
  const headers = {
    "content-type": useJSON ? "application/json" : "text/html",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self';"
  };
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = useJSON ? {
    error: true,
    url,
    statusCode,
    statusMessage,
    message: error.message,
    data: error.data,
    stack: error.stack?.split("\n").map((line) => line.trim())
  } : await youch.toHTML(error, {
    request: {
      url: url.href,
      method: event.method,
      headers: getRequestHeaders(event)
    }
  });
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}
async function loadStackTrace(error) {
  if (!(error instanceof Error)) {
    return;
  }
  const parsed = await new ErrorParser().defineSourceLoader(sourceLoader).parse(error);
  const stack = error.message + "\n" + parsed.frames.map((frame) => fmtFrame(frame)).join("\n");
  Object.defineProperty(error, "stack", { value: stack });
  if (error.cause) {
    await loadStackTrace(error.cause).catch(consola.error);
  }
}
async function sourceLoader(frame) {
  if (!frame.fileName || frame.fileType !== "fs" || frame.type === "native") {
    return;
  }
  if (frame.type === "app") {
    const rawSourceMap = await readFile(`${frame.fileName}.map`, "utf8").catch(() => {
    });
    if (rawSourceMap) {
      const consumer = await new SourceMapConsumer(rawSourceMap);
      const originalPosition = consumer.originalPositionFor({ line: frame.lineNumber, column: frame.columnNumber });
      if (originalPosition.source && originalPosition.line) {
        frame.fileName = resolve(dirname(frame.fileName), originalPosition.source);
        frame.lineNumber = originalPosition.line;
        frame.columnNumber = originalPosition.column || 0;
      }
    }
  }
  const contents = await readFile(frame.fileName, "utf8").catch(() => {
  });
  return contents ? { contents } : void 0;
}
function fmtFrame(frame) {
  if (frame.type === "native") {
    return frame.raw;
  }
  const src = `${frame.fileName || ""}:${frame.lineNumber}:${frame.columnNumber})`;
  return frame.functionName ? `at ${frame.functionName} (${src}` : `at ${src}`;
}

const errorHandlers = [error_default, errorHandler$1];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const script = `
if (!window.__NUXT_DEVTOOLS_TIME_METRIC__) {
  Object.defineProperty(window, '__NUXT_DEVTOOLS_TIME_METRIC__', {
    value: {},
    enumerable: false,
    configurable: true,
  })
}
window.__NUXT_DEVTOOLS_TIME_METRIC__.appInit = Date.now()
`;

const _pYDrnhg6LRCcfK6J044SKzzuMUgdyBPZHMNHIULjLU = (function(nitro) {
  nitro.hooks.hook("render:html", (htmlContext) => {
    htmlContext.head.push(`<script>${script}<\/script>`);
  });
});

//#region src/runtime/diagnostics.ts
const ansi = (open, close) => (s) => `\x1B[${open}m${s}\x1B[${close}m`;
const colors = {
	red: ansi(31, 39),
	yellow: ansi(33, 39),
	cyan: ansi(36, 39),
	gray: ansi(90, 39),
	bold: ansi(1, 22),
	dim: ansi(2, 22)
};
/**
* E8xxx
* Nitro server runtime (SSR rendering / dev server) diagnostics.
*/
const docsBase = (code) => `https://nuxt.com/docs/4.x/errors/${code.replace("NUXT_", "").toLowerCase()}`;
const serverDiagnostics = /* #__PURE__ */ defineDiagnostics({
	docsBase,
	reporters: [/* @__PURE__ */ createConsoleReporter({ formatter: ansiFormatter(colors) } )],
	codes: {
		NUXT_E8001: {
			why: (p) => `\`render:html\` mutated \`body\`/\`bodyAppend\` while streaming (\`${p.path}\`). These fields are silently dropped because the body is about to stream.`,
			fix: "Use the `render:html:close` hook instead.",
			docs: false
		},
		NUXT_E8002: {
			why: (p) => `SSR streaming committed the response before render completed (\`${p.path}\`). The following mutations did not reach the client and were dropped:\n  - ${p.mutations}`,
			fix: (p) => `Move the mutation into a plugin (which runs before the shell is flushed), or opt this route out of streaming with \`routeRules: { '${p.path}': { streaming: false } }\` or the \`render:route\` hook.`,
			docs: false
		},
		NUXT_E8003: {
			why: (p) => `Failed to stringify dev server logs.${p.error ? ` Received \`${p.error}\`.` : ""}`,
			fix: "You can define your own reducer/reviver for rich types following the instructions in `https://nuxt.com/docs/4.x/api/composables/use-nuxt-app#payload`.",
			docs: false
		},
		NUXT_E8004: {
			why: "The server bundle is not available.",
			fix: "Ensure the Nuxt build completed successfully and the server entry was emitted by your builder.",
			docs: false
		},
		NUXT_E8005: {
			why: "Island props cannot contain a `template` key, which the Vue runtime compiler would compile and execute.",
			fix: "Rename the prop (e.g. `templateName`), or disable `vue.runtimeCompiler` if you do not need runtime template compilation.",
			docs: false
		}
	}
});

const appHead = {"meta":[{"name":"viewport","content":"width=device-width, initial-scale=1"},{"charset":"utf-8"}],"link":[],"style":[],"script":[],"noscript":[]};

const appRootTag = "div";

const appRootAttrs = {"id":"__nuxt"};

const appTeleportTag = "div";

const appTeleportAttrs = {"id":"teleports"};

const appSpaLoaderTag = "div";

const appSpaLoaderAttrs = {"id":"__nuxt-loader"};

const appId = "nuxt-app";

const rootDir = "/Users/cesargonzalez/Sites/progressnow/site";

//#region src/runtime/plugins/dev-server-logs.ts
const devReducers = {
	VNode: (data) => isVNode(data) ? {
		type: data.type,
		props: data.props
	} : void 0,
	URL: (data) => data instanceof URL ? data.toString() : void 0,
	Symbol: (data) => typeof data === "symbol" ? data.description ?? "" : void 0
};
const asyncContext = getContext$1("nuxt-dev", {
	asyncContext: true,
	AsyncLocalStorage
});
var dev_server_logs_default = (nitroApp) => {
	const handler = nitroApp.h3App.handler;
	nitroApp.h3App.handler = (event) => {
		return asyncContext.callAsync({
			logs: [],
			event
		}, () => handler(event));
	};
	onConsoleLog((_log) => {
		const ctx = asyncContext.tryUse();
		if (!ctx) return;
		const rawStack = captureRawStackTrace();
		if (!rawStack || rawStack.includes("runtime/vite-node.mjs")) return;
		const trace = [];
		let filename = "";
		for (const entry of parseRawStackTrace(rawStack)) {
			if (entry.source === globalThis._importMeta_.url) continue;
			if (EXCLUDE_TRACE_RE.test(entry.source)) continue;
			filename ||= entry.source.replace(withTrailingSlash(rootDir), "");
			trace.push({
				...entry,
				source: entry.source.startsWith("file://") ? entry.source.replace("file://", "") : entry.source
			});
		}
		const log = {
			..._log,
			filename,
			stack: trace
		};
		ctx.logs.push(log);
	});
	nitroApp.hooks.hook("afterResponse", () => {
		const ctx = asyncContext.tryUse();
		if (!ctx) return;
		return nitroApp.hooks.callHook("dev:ssr-logs", {
			logs: ctx.logs,
			path: ctx.event.path
		});
	});
	nitroApp.hooks.hook("render:html", (htmlContext) => {
		const ctx = asyncContext.tryUse();
		if (!ctx) return;
		try {
			const reducers = Object.assign(Object.create(null), devReducers, ctx.event.context["~payloadReducers"]);
			htmlContext.bodyAppend.unshift(`<script type="application/json" data-nuxt-logs="${appId}">${stringify(ctx.logs, reducers)}<\/script>`);
		} catch (e) {
			serverDiagnostics.NUXT_E8003({
				error: e instanceof Error ? e.toString() : void 0,
				cause: e
			});
		}
	});
};
const EXCLUDE_TRACE_RE = /\/node_modules\/(?:.*\/)?(?:nuxt|nuxt-nightly|nuxt-edge|nuxt3|consola|@vue)\/|core\/runtime\/nitro/;
function onConsoleLog(callback) {
	consola$1.addReporter({ log(logObj) {
		callback(logObj);
	} });
	consola$1.wrapConsole();
}

const plugins = [
  _pYDrnhg6LRCcfK6J044SKzzuMUgdyBPZHMNHIULjLU,
dev_server_logs_default,
_wH6JrtIxmaSoA8lCPWFnE9z4lQeXW6H5z3l5aymEQw
];

const assets = {};

function readAsset (id) {
  const serverDir = dirname$1(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve$1(serverDir, assets[id].path))
}

const publicAssetBases = {"/_nuxt/builds/meta/":{"maxAge":31536000},"/_nuxt/builds/":{"maxAge":1}};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _KlzY_g = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError({ statusCode: 404 });
    }
    return;
  }
  if (asset.encoding !== void 0) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

//#region ../nuxt/src/app/island-hash.ts
/**
* Strip Vue scoped-style attributes (`data-v-*`) from island props before hashing
* or rendering. Scoped-id markers leak in from parent components and are not part
* of the logical island input.
*
* Used before island props are serialized and sent to the island handler.
*
* @internal
*/
function filterIslandProps(props) {
	if (!props) return {};
	const out = {};
	for (const key in props) if (!key.startsWith("data-v-")) out[key] = props[key];
	return out;
}
/**
* Compute the `hashId` segment embedded in an island URL (`/__nuxt_island/<Name>_<hashId>.json`).
*
* The hash binds the response to the requested `(name, props, context, source)` tuple, so the
* server can reject requests whose URL hash does not match the supplied query/body. Use this
* from island clients if you need to ensure a hash stays in step with Nuxt's implementation.
*
* `props` may be passed either as the raw props object or as the JSON string that will be sent
* over the wire; the two produce the same hash when the round-trip is identity.
*
* @since 4.5.0
*/
function getIslandHash(input) {
	const props = typeof input.props === "string" ? parseSerializedProps(input.props) : input.props ?? {};
	return hash$1([
		input.name,
		props,
		input.context ?? {},
		input.source
	]).replace(/[-_]/g, "");
}
function parseSerializedProps(serializedProps) {
	try {
		return JSON.parse(serializedProps);
	} catch {
		return serializedProps;
	}
}

//#region src/runtime/utils/island-props.ts
/** @internal */
const MAX_ISLAND_BODY_BYTES = 65536;
/**
* Whether the bracket nesting of a JSON-ish string exceeds `maxDepth`, in a single linear
* pass. Brackets inside string values are ignored.
*
* @internal
*/
function exceedsMaxDepth(raw, maxDepth = 64) {
	let depth = 0;
	let inString = false;
	let escaped = false;
	for (let i = 0; i < raw.length; i++) {
		const ch = raw[i];
		if (inString) {
			if (escaped) escaped = false;
			else if (ch === "\\") escaped = true;
			else if (ch === "\"") inString = false;
			continue;
		}
		if (ch === "\"") inString = true;
		else if (ch === "{" || ch === "[") {
			if (++depth > maxDepth) return true;
		} else if (ch === "}" || ch === "]") {
			if (depth > 0) depth--;
		}
	}
	return false;
}
/** @internal */
function exceedsMaxBytes(raw, maxBytes = MAX_ISLAND_BODY_BYTES) {
	return Buffer.byteLength(raw, "utf8") > maxBytes;
}

const NUXT_RUNTIME_PAYLOAD_EXTRACTION = false;
const NUXT_SSR_STREAMING = false;

const headSymbol = "usehead";
// @__NO_SIDE_EFFECTS__
function vueInstall(head) {
  const plugin = {
    install(app) {
      app.config.globalProperties.$unhead = head;
      app.config.globalProperties.$head = head;
      app.provide(headSymbol, head);
    }
  };
  return plugin.install;
}

const VueResolver = /* @__PURE__ */ Object.assign(
  (_, value) => isRef(value) ? toValue(value) : value,
  // identity for plain non-reactive values, so the SSR default init entry
  // keeps its precomputed fast path (see unhead/server createHead)
  { _static: true }
);

// @__NO_SIDE_EFFECTS__
function createHead(options = {}) {
  const head = createHead$1({
    ...options,
    propResolvers: [VueResolver]
  });
  head.install = vueInstall(head);
  return head;
}

const legacyPlugins = [DeprecationsPlugin, PromisesPlugin, TemplateParamsPlugin, AliasSortingPlugin];

const unheadOptions = {
  disableDefaults: true,
  plugins: legacyPlugins,
};

function encodeEventPath(path) {
	const queryIndex = path.indexOf("?");
	if (queryIndex === -1) return encodePath(path);
	return encodePath(path.slice(0, queryIndex)) + path.slice(queryIndex);
}
function createSSRContext(event) {
	const url = encodeEventPath(event.path);
	const ssrContext = {
		url,
		event,
		runtimeConfig: useRuntimeConfig(event),
		noSSR: event.context.nuxt?.noSSR || (false),
		head: createHead(unheadOptions),
		error: false,
		nuxt: void 0,
		payload: {},
		["~payloadReducers"]: Object.create(null),
		modules: /* @__PURE__ */ new Set()
	};
	return ssrContext;
}
function setSSRError(ssrContext, error) {
	ssrContext.error = true;
	ssrContext.payload = { error };
	ssrContext.url = error.url;
}

function buildAssetsDir() {
	return useRuntimeConfig().app.buildAssetsDir;
}
function buildAssetsURL(...path) {
	return joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path);
}
function publicAssetsURL(...path) {
	const app = useRuntimeConfig().app;
	const publicBase = app.cdnURL || app.baseURL;
	return path.length ? joinRelativeURL(publicBase, ...path) : publicBase;
}

//#region src/runtime/utils/renderer/cache.ts
function lazyCachedFunction(fn) {
	let res = null;
	return () => {
		if (res === null) res = fn().catch((err) => {
			res = null;
			throw err;
		});
		return res;
	};
}

//#region src/runtime/utils/renderer/build-files.ts
globalThis.__buildAssetsURL = buildAssetsURL;
globalThis.__publicAssetsURL = publicAssetsURL;
const APP_ROOT_OPEN_TAG = `<${appRootTag}${propsToString(appRootAttrs)}>`;
const APP_ROOT_CLOSE_TAG = `</${appRootTag}>`;
const getServerEntry = () => Promise.resolve().then(function () { return entry; }).then((r) => r.default || r);
const getClientManifest = () => Promise.resolve().then(function () { return manifest$1; }).then((r) => r.default || r).then((r) => typeof r === "function" ? r() : r);
const getSSRRenderer = lazyCachedFunction(async () => {
	const createSSRApp = await getServerEntry();
	if (!createSSRApp) throw serverDiagnostics.NUXT_E8004();
	const precomputed = void 0 ;
	const renderer = createRenderer(createSSRApp, {
		precomputed,
		manifest: await getClientManifest() ,
		renderToString: renderToString$1,
		buildAssetsURL
	});
	async function renderToString$1(input, context) {
		const html = await renderToString(input, context);
		if (process.env.NUXT_VITE_NODE_OPTIONS) renderer.rendererContext.updateManifest(await getClientManifest());
		return APP_ROOT_OPEN_TAG + html + APP_ROOT_CLOSE_TAG;
	}
	return renderer;
});
const getSPARenderer = lazyCachedFunction(async () => {
	const precomputed = void 0 ;
	const spaTemplate = await Promise.resolve().then(function () { return _virtual__spaTemplate; }).then((r) => r.template).catch(() => "").then((r) => {
		{
			const APP_SPA_LOADER_OPEN_TAG = `<${appSpaLoaderTag}${propsToString(appSpaLoaderAttrs)}>`;
			const APP_SPA_LOADER_CLOSE_TAG = `</${appSpaLoaderTag}>`;
			return APP_ROOT_OPEN_TAG + APP_ROOT_CLOSE_TAG + (r ? APP_SPA_LOADER_OPEN_TAG + r + APP_SPA_LOADER_CLOSE_TAG : "");
		}
	});
	const renderer = createRenderer(() => () => {}, {
		precomputed,
		manifest: await getClientManifest() ,
		renderToString: () => spaTemplate,
		buildAssetsURL
	});
	const result = await renderer.renderToString({});
	const renderToString = (ssrContext) => {
		const config = useRuntimeConfig(ssrContext.event);
		ssrContext.modules ||= /* @__PURE__ */ new Set();
		ssrContext.payload.serverRendered = false;
		ssrContext.config = {
			public: config.public,
			app: config.app
		};
		return Promise.resolve(result);
	};
	return {
		rendererContext: renderer.rendererContext,
		renderToString
	};
});
function getRenderer(ssrContext) {
	return ssrContext.noSSR ? getSPARenderer() : getSSRRenderer();
}
const getSSRStyles = lazyCachedFunction(() => Promise.resolve().then(function () { return styles$1; }).then((r) => r.default || r));

//#region src/runtime/utils/renderer/inline-styles.ts
async function renderInlineStyles(usedModules) {
	const styleMap = await getSSRStyles();
	const inlinedStyles = /* @__PURE__ */ new Set();
	const promises = [];
	for (const mod of usedModules) if (mod in styleMap && styleMap[mod]) promises.push(styleMap[mod]());
	for (const styles of await Promise.all(promises)) for (const style of styles) inlinedStyles.add(style);
	return Array.from(inlinedStyles).map((style) => ({ innerHTML: style }));
}

//#region src/runtime/utils/renderer/islands.ts
const ROOT_NODE_REGEX = new RegExp(`^<${appRootTag}[^>]*>([\\s\\S]*)<\\/${appRootTag}>$`);
/**
* remove the root node from the html body
*/
function getServerComponentHTML(body) {
	return body.match(ROOT_NODE_REGEX)?.[1] || body;
}
const SSR_SLOT_TELEPORT_MARKER = /^uid=([^;]*);slot=(.*)$/;
const SSR_CLIENT_TELEPORT_MARKER = /^uid=([^;]*);client=(.*)$/;
const SSR_CLIENT_SLOT_MARKER = /^island-slot=([^;]*);(.*)$/;
function getSlotIslandResponse(ssrContext) {
	if (!ssrContext.islandContext || !Object.keys(ssrContext.islandContext.slots).length) return;
	const response = {};
	for (const [name, slot] of Object.entries(ssrContext.islandContext.slots)) response[name] = {
		...slot,
		fallback: ssrContext.teleports?.[`island-fallback=${name}`]
	};
	return response;
}
function getClientIslandResponse(ssrContext) {
	if (!ssrContext.islandContext || !Object.keys(ssrContext.islandContext.components).length) return;
	const response = {};
	for (const [clientUid, component] of Object.entries(ssrContext.islandContext.components)) {
		let html = ssrContext.teleports?.[clientUid]?.replaceAll("<!--teleport start anchor-->", "") || "";
		if (!html && ssrContext.teleports) for (const [key, value] of Object.entries(ssrContext.teleports)) {
			const [, , componentUid] = key.match(SSR_CLIENT_TELEPORT_MARKER) ?? [];
			if (componentUid === clientUid) {
				html = value.replaceAll("<!--teleport start anchor-->", "");
				break;
			}
		}
		response[clientUid] = {
			...component,
			html,
			slots: getComponentSlotTeleport(clientUid, ssrContext.teleports ?? {})
		};
	}
	return response;
}
function getComponentSlotTeleport(clientUid, teleports) {
	const entries = Object.entries(teleports);
	const slots = {};
	for (const [key, value] of entries) {
		const match = key.match(SSR_CLIENT_SLOT_MARKER);
		if (match) {
			const [, id, slot] = match;
			if (!slot || clientUid !== id) continue;
			slots[slot] = value;
		}
	}
	return slots;
}
const ISLAND_TELEPORT_ANCHOR_RE = / data-island-uid="([^"]*)" data-island-(component|slot)="([^"]*)"[^>]*>/g;
function replaceIslandTeleports(ssrContext, html) {
	const { teleports, islandContext } = ssrContext;
	if (islandContext || !teleports) return html;
	const contentsByAnchor = /* @__PURE__ */ new Map();
	const uids = /* @__PURE__ */ new Set();
	for (const key in teleports) {
		const matchClientComp = key.match(SSR_CLIENT_TELEPORT_MARKER);
		if (matchClientComp) {
			const [, uid, clientId] = matchClientComp;
			if (!uid || !clientId) continue;
			contentsByAnchor.set(`${uid};component;${clientId}`, teleports[key]);
			uids.add(uid);
			continue;
		}
		const matchSlot = key.match(SSR_SLOT_TELEPORT_MARKER);
		if (matchSlot) {
			const [, uid, slot] = matchSlot;
			if (!uid || !slot) continue;
			contentsByAnchor.set(`${uid};slot;${slot}`, teleports[key]);
			uids.add(uid);
		}
	}
	if (!contentsByAnchor.size) return html;
	const stitch = (html) => {
		const anchorRE = new RegExp(ISLAND_TELEPORT_ANCHOR_RE);
		let out = "";
		let cursor = 0;
		let m;
		while (contentsByAnchor.size && (m = anchorRE.exec(html))) {
			if (!uids.has(m[1])) continue;
			const anchor = `${m[1]};${m[2]};${m[3]}`;
			const content = contentsByAnchor.get(anchor);
			if (content === void 0) continue;
			contentsByAnchor.delete(anchor);
			const end = m.index + m[0].length;
			out += html.slice(cursor, end) + stitch(content);
			cursor = end;
		}
		return cursor ? out + html.slice(cursor) : html;
	};
	return stitch(html);
}

//#region src/runtime/handlers/island.ts
const ISLAND_SUFFIX_RE = /\.json(?:\?.*)?$/;
const handler$1 = defineEventHandler(async (event) => {
	setResponseHeaders(event, {
		"content-type": "application/json;charset=utf-8",
		"x-powered-by": "Nuxt"
	});
	return toResponse(event, await renderIsland(event));
});
function toResponse(event, result) {
	return "raw" in result ? returnIslandResponse(event, result.raw) : result;
}
async function renderIsland(event) {
	const nitroApp = useNitroApp();
	const islandContext = await getIslandContext(event);
	const ssrContext = {
		...createSSRContext(event),
		islandContext,
		noSSR: false,
		url: islandContext.url
	};
	const renderer = await getSSRRenderer();
	const renderResult = await (renderer.renderToString(ssrContext)).catch(async (err) => {
		if (ssrContext["~renderResponse"] && err?.message === "skipping render") return {};
		await ssrContext.nuxt?.hooks.callHook("app:error", err);
		throw err;
	});
	await ssrContext.nuxt?.hooks.callHook("app:rendered", {
		ssrContext,
		renderResult
	});
	if (ssrContext["~renderResponse"]) {
		const response = ssrContext["~renderResponse"];
		if (response.statusCode && response.statusCode >= 400) throw createError({
			statusCode: response.statusCode,
			statusMessage: response.statusMessage
		});
		return { raw: response };
	}
	if (ssrContext.payload?.error) throw ssrContext.payload.error;
	const inlinedStyles = await renderInlineStyles(ssrContext.modules ?? []);
	if (inlinedStyles.length) ssrContext.head.push({ style: inlinedStyles });
	{
		const { styles } = getRequestDependencies(ssrContext, renderer.rendererContext);
		const link = [];
		for (const resource of Object.values(styles)) {
			if ("inline" in getQuery(resource.file)) continue;
			if (resource.file.includes("scoped") && !resource.file.includes("pages/")) link.push({
				rel: "stylesheet",
				href: renderer.rendererContext.buildAssetsURL(resource.file),
				crossorigin: ""
			});
		}
		if (link.length) ssrContext.head.push({ link });
	}
	const islandHead = {};
	for (const entry of ssrContext.head.entries.values()) for (const [key, value] of Object.entries(walkResolver(entry.input, VueResolver))) {
		const currentValue = islandHead[key];
		if (Array.isArray(currentValue)) currentValue.push(...value);
		else islandHead[key] = value;
	}
	const islandResponse = {
		id: islandContext.id,
		head: islandHead,
		html: getServerComponentHTML(renderResult.html),
		components: getClientIslandResponse(ssrContext),
		slots: getSlotIslandResponse(ssrContext)
	};
	await nitroApp.hooks.callHook("render:island", islandResponse, {
		event,
		islandContext
	});
	return islandResponse;
}
function returnIslandResponse(event, response) {
	for (const header in response.headers || {}) setResponseHeader(event, header, response.headers[header]);
	if (response.statusCode) setResponseStatus(event, response.statusCode, response.statusMessage);
	return response.body;
}
const ISLAND_PATH_PREFIX = "/__nuxt_island/";
const VALID_COMPONENT_NAME_RE = /^[a-z][\w.-]*$/i;
async function readGuardedIslandBody(event) {
	if (Number(getRequestHeader(event, "content-length")) > 65536) throw createError({
		statusCode: 413,
		statusMessage: "Island request body too large"
	});
	let received = 0;
	let raw = "";
	let overflowed = false;
	const stream = getRequestWebStream(event);
	if (stream) {
		const decoder = new TextDecoder();
		const reader = stream.getReader();
		try {
			for (;;) {
				const { done, value } = await reader.read();
				if (done) break;
				received += value.byteLength;
				if (received > 65536) {
					overflowed = true;
					continue;
				}
				raw += decoder.decode(value, { stream: true });
			}
		} finally {
			reader.releaseLock();
		}
		raw += decoder.decode();
	}
	if (overflowed) throw createError({
		statusCode: 413,
		statusMessage: "Island request body too large"
	});
	if (!raw) return {};
	if (exceedsMaxDepth(raw)) throw createError({
		statusCode: 400,
		statusMessage: "Island request body too deeply nested"
	});
	return destr$1(raw) || {};
}
async function getIslandContext(event) {
	let url = event.path || "";
	url.replace(/\?.*$/, "");
	if (!url.startsWith(ISLAND_PATH_PREFIX)) throw createError({
		statusCode: 400,
		statusMessage: "Invalid island request path"
	});
	const componentParts = url.substring(15).replace(ISLAND_SUFFIX_RE, "").split("_");
	const hashId = componentParts.length > 1 ? componentParts.pop() : void 0;
	const componentName = componentParts.join("_");
	if (!componentName || !VALID_COMPONENT_NAME_RE.test(componentName)) throw createError({
		statusCode: 400,
		statusMessage: "Invalid island component name"
	});
	const rawContext = event.method === "GET" ? getQuery$1(event) : await readGuardedIslandBody(event);
	const serializedProps = typeof rawContext?.props === "string" ? rawContext.props : "{}";
	if (exceedsMaxBytes(serializedProps)) throw createError({
		statusCode: 413,
		statusMessage: "Island request props too large"
	});
	if (exceedsMaxDepth(serializedProps)) throw createError({
		statusCode: 400,
		statusMessage: "Island request props too deeply nested"
	});
	const clientContext = {};
	if (rawContext && typeof rawContext === "object") {
		for (const key in rawContext) if (key !== "props") clientContext[key] = rawContext[key];
	}
	const parsed = destr$1(serializedProps);
	if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) throw createError({
		statusCode: 400,
		statusMessage: "Invalid island request props"
	});
	const parsedProps = filterIslandProps(parsed);
	const expectedHash = getIslandHash({
		name: componentName,
		props: parsedProps,
		context: clientContext
	});
	if (!hashId || hashId !== expectedHash) throw createError({
		statusCode: 400,
		statusMessage: "Invalid island request hash"
	});
	return {
		url: typeof rawContext?.url === "string" ? rawContext.url : "/",
		id: hashId,
		name: componentName,
		props: parsedProps,
		slots: {},
		components: {}
	};
}

const _lazy_rO_trz = () => Promise.resolve().then(function () { return ____path__get$1; });
const _lazy_3UVOqz = () => Promise.resolve().then(function () { return renderer; });

const handlers = [
  { route: '', handler: _KlzY_g, lazy: false, middleware: true, method: undefined },
  { route: '/mock/v1/**:path', handler: _lazy_rO_trz, lazy: true, middleware: false, method: "get" },
  { route: '/__nuxt_error', handler: _lazy_3UVOqz, lazy: true, middleware: false, method: undefined },
  { route: '/__nuxt_island/**', handler: handler$1, lazy: false, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_3UVOqz, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(true),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter$1({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => callNodeRequestHandler(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return fetchNodeRequestHandler(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

function defineRenderHandler(render) {
  const runtimeConfig = useRuntimeConfig();
  return eventHandler(async (event) => {
    const nitroApp = useNitroApp();
    const ctx = { event, render, response: void 0 };
    await nitroApp.hooks.callHook("render:before", ctx);
    if (!ctx.response) {
      if (event.path === `${runtimeConfig.app.baseURL}favicon.ico`) {
        setResponseHeader(event, "Content-Type", "image/x-icon");
        return send(
          event,
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
      ctx.response = await ctx.render(event);
      if (!ctx.response) {
        const _currentStatus = getResponseStatus(event);
        setResponseStatus(event, _currentStatus === 200 ? 500 : _currentStatus);
        return send(
          event,
          "No response returned from render handler: " + event.path
        );
      }
    }
    await nitroApp.hooks.callHook("render:response", ctx.response, ctx);
    if (ctx.response.headers) {
      setResponseHeaders(event, ctx.response.headers);
    }
    if (ctx.response.statusCode || ctx.response.statusMessage) {
      setResponseStatus(
        event,
        ctx.response.statusCode,
        ctx.response.statusMessage
      );
    }
    return ctx.response.body;
  });
}

const scheduledTasks = false;

const tasks = {
  
};

const __runningTasks__ = {};
async function runTask(name, {
  payload = {},
  context = {}
} = {}) {
  if (__runningTasks__[name]) {
    return __runningTasks__[name];
  }
  if (!(name in tasks)) {
    throw createError({
      message: `Task \`${name}\` is not available!`,
      statusCode: 404
    });
  }
  if (!tasks[name].resolve) {
    throw createError({
      message: `Task \`${name}\` is not implemented!`,
      statusCode: 501
    });
  }
  const handler = await tasks[name].resolve();
  const taskEvent = { name, payload, context };
  __runningTasks__[name] = handler.run(taskEvent);
  try {
    const res = await __runningTasks__[name];
    return res;
  } finally {
    delete __runningTasks__[name];
  }
}

if (!globalThis.crypto) {
  globalThis.crypto = nodeCrypto.webcrypto;
}
const { NITRO_NO_UNIX_SOCKET, NITRO_DEV_WORKER_ID } = process.env;
trapUnhandledNodeErrors();
parentPort?.on("message", (msg) => {
  if (msg && msg.event === "shutdown") {
    shutdown();
  }
});
const nitroApp = useNitroApp();
const server = new Server(toNodeListener(nitroApp.h3App));
let listener;
listen().catch(() => listen(
  true
  /* use random port */
)).catch((error) => {
  console.error("Dev worker failed to listen:", error);
  return shutdown();
});
nitroApp.router.get(
  "/_nitro/tasks",
  defineEventHandler(async (event) => {
    const _tasks = await Promise.all(
      Object.entries(tasks).map(async ([name, task]) => {
        const _task = await task.resolve?.();
        return [name, { description: _task?.meta?.description }];
      })
    );
    return {
      tasks: Object.fromEntries(_tasks),
      scheduledTasks
    };
  })
);
nitroApp.router.use(
  "/_nitro/tasks/:name",
  defineEventHandler(async (event) => {
    const name = getRouterParam(event, "name");
    const payload = {
      ...getQuery$1(event),
      ...await readBody(event).then((r) => r?.payload).catch(() => ({}))
    };
    return await runTask(name, { payload });
  })
);
function listen(useRandomPort = Boolean(
  NITRO_NO_UNIX_SOCKET || process.versions.webcontainer || "Bun" in globalThis && process.platform === "win32"
)) {
  return new Promise((resolve, reject) => {
    try {
      listener = server.listen(useRandomPort ? 0 : getSocketAddress(), () => {
        const address = server.address();
        parentPort?.postMessage({
          event: "listen",
          address: typeof address === "string" ? { socketPath: address } : { host: "localhost", port: address?.port }
        });
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}
function getSocketAddress() {
  const socketName = `nitro-worker-${process.pid}-${threadId}-${NITRO_DEV_WORKER_ID}-${Math.round(Math.random() * 1e4)}.sock`;
  if (process.platform === "win32") {
    return join(String.raw`\\.\pipe`, socketName);
  }
  if (process.platform === "linux") {
    const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10);
    if (nodeMajor >= 20) {
      return `\0${socketName}`;
    }
  }
  return join(tmpdir(), socketName);
}
async function shutdown() {
  server.closeAllConnections?.();
  await Promise.all([
    new Promise((resolve) => listener?.close(resolve)),
    nitroApp.hooks.callHook("close").catch(console.error)
  ]);
  parentPort?.postMessage({ event: "exit" });
}

//#region src/runtime/templates/error-500.ts
const _messages = {
	"appName": "Nuxt",
	"status": 500,
	"statusText": "Internal server error",
	"description": "This page is temporarily unavailable.",
	"refresh": "Refresh this page"
};
const template$4 = (messages) => {
	messages = {
		..._messages,
		...messages
	};
	return "<!DOCTYPE html><html lang=\"en\"><head><title>" + escapeHtml(messages.status) + " - " + escapeHtml(messages.statusText) + " | " + escapeHtml(messages.appName) + "</title><meta charset=\"utf-8\"><meta content=\"width=device-width,initial-scale=1,minimum-scale=1\" name=\"viewport\"><script>!function(){let e=document.createElement(\"link\").relList;if(!(e&&e.supports&&e.supports(\"modulepreload\"))){for(let e of document.querySelectorAll('link[rel=\"modulepreload\"]'))r(e);new MutationObserver(e=>{for(let t of e)if(\"childList\"===t.type)for(let e of t.addedNodes)\"LINK\"===e.tagName&&\"modulepreload\"===e.rel&&r(e)}).observe(document,{childList:!0,subtree:!0})}function r(e){if(e.ep)return;e.ep=!0;let r=function(e){let r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),r.credentials=\"use-credentials\"===e.crossOrigin?\"include\":\"anonymous\"===e.crossOrigin?\"omit\":\"same-origin\",r}(e);fetch(e.href,r)}}();<\/script><style>*,:after,:before{box-sizing:border-box;border-style:solid;border-width:0;border-color:var(--un-default-border-color,#e5e7eb)}:after,:before{--un-content:\"\"}html{-webkit-text-size-adjust:100%;tab-size:4;font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent;font-family:ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;line-height:1.5}body{line-height:inherit;margin:0}h1,h2{font-size:inherit;font-weight:inherit}h1,h2,p{margin:0}*,:after,:before{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 #0000;--un-ring-shadow:0 0 #0000;--un-shadow-inset: ;--un-shadow:0 0 #0000;--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:#93c5fd80;--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }.grid{display:grid}.mb-2{margin-bottom:.5rem}.mb-4{margin-bottom:1rem}.max-w-520px{max-width:520px}.min-h-screen{min-height:100vh}.place-content-center{place-content:center}.overflow-hidden{overflow:hidden}.bg-white{--un-bg-opacity:1;background-color:rgb(255 255 255/var(--un-bg-opacity))}.px-2{padding-left:.5rem;padding-right:.5rem}.text-center{text-align:center}.text-\\[80px\\]{font-size:80px}.text-2xl{font-size:1.5rem;line-height:2rem}.text-\\[\\#020420\\]{--un-text-opacity:1;color:rgb(2 4 32/var(--un-text-opacity))}.text-\\[\\#64748B\\]{--un-text-opacity:1;color:rgb(100 116 139/var(--un-text-opacity))}.font-semibold{font-weight:600}.leading-none{line-height:1}.tracking-wide{letter-spacing:.025em}.font-sans{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji}.tabular-nums{--un-numeric-spacing:tabular-nums;font-variant-numeric:var(--un-ordinal) var(--un-slashed-zero) var(--un-numeric-figure) var(--un-numeric-spacing) var(--un-numeric-fraction)}.antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}@media (prefers-color-scheme:dark){.dark\\:bg-\\[\\#020420\\]{--un-bg-opacity:1;background-color:rgb(2 4 32/var(--un-bg-opacity))}.dark\\:text-white{--un-text-opacity:1;color:rgb(255 255 255/var(--un-text-opacity))}}@media (width>=640px){.sm\\:text-\\[110px\\]{font-size:110px}.sm\\:text-3xl{font-size:1.875rem;line-height:2.25rem}}</style></head><body class=\"antialiased bg-white dark:bg-[#020420] dark:text-white font-sans grid min-h-screen overflow-hidden place-content-center text-[#020420] tracking-wide\"><div class=\"max-w-520px text-center\"><h1 class=\"font-semibold leading-none mb-4 sm:text-[110px] tabular-nums text-[80px]\">" + escapeHtml(messages.status) + "</h1><h2 class=\"font-semibold mb-2 sm:text-3xl text-2xl\">" + escapeHtml(messages.statusText) + "</h2><p class=\"mb-4 px-2 text-[#64748B] text-md\">" + escapeHtml(messages.description) + "</p></div></body></html>";
};

const error500 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  template: template$4
}, Symbol.toStringTag, { value: 'Module' }));

const entry = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: viteNodeEntry_mjs
}, Symbol.toStringTag, { value: 'Module' }));

const manifest = () => viteNodeFetch.getManifest();

const manifest$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: manifest
}, Symbol.toStringTag, { value: 'Module' }));

const template$3 = "";

const _virtual__spaTemplate = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  template: template$3
}, Symbol.toStringTag, { value: 'Module' }));

const styles = {};

const styles$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: styles
}, Symbol.toStringTag, { value: 'Module' }));

var lang$5 = "";
var homeUrl$1 = "http://example.org/";
var apiBase = "http://example.org/index.php?rest_route=/progressnow/v1";
var languages$7 = [
];
var chapter = {
	name: "Progress Now",
	short_name: "Progress Now",
	region_label: "our community",
	join_url: "/get-involved/#join",
	newsletter_url: "",
	contact_email: "",
	footer_tagline: "",
	instagram_url: "",
	committees: [
		{
			name: "Political Education",
			desc: "Reading groups, night school, and workshops that build our shared analysis."
		},
		{
			name: "Mutual Aid",
			desc: "Meeting our neighbors' immediate needs while organizing for lasting change."
		},
		{
			name: "Labor",
			desc: "Supporting workers organizing on the job across our community."
		},
		{
			name: "Communications",
			desc: "Social media, design, and this website — telling the chapter's story."
		},
		{
			name: "Electoral",
			desc: "Backing candidates and ballot measures that fight for working people."
		},
		{
			name: "Membership & Onboarding",
			desc: "Welcoming new members and making sure no one falls through the cracks."
		}
	],
	socials: [
		{
			name: "Facebook",
			url: ""
		},
		{
			name: "Instagram",
			url: ""
		},
		{
			name: "Twitter",
			url: ""
		}
	]
};
var identity = {
	name: "Progress Now",
	short_name: "Progress Now",
	region_label: "our community",
	hero_headline: "A better world is possible!",
	logo_header: {
		src: "",
		alt: "Progress Now",
		width: 0,
		height: 0,
		is_default: true
	},
	logo_footer: {
		src: "",
		alt: "Progress Now",
		width: 0,
		height: 0,
		is_default: true
	},
	logo_square: {
		src: "/wp-content/themes/progressnow/static/images/brand/logo-square.png",
		alt: "Progress Now",
		width: 512,
		height: 512,
		is_default: true
	},
	share_image: {
		src: "/wp-content/themes/progressnow/static/images/brand/share-default.jpg",
		alt: "Progress Now",
		width: 1200,
		height: 630,
		is_default: true
	},
	hero_photo: {
		src: "/wp-content/themes/progressnow/static/images/brand/hero-photo.jpg",
		alt: "Chapter members gathered at a community action",
		width: 951,
		height: 716,
		is_default: true
	},
	who_image: {
		src: "/wp-content/themes/progressnow/static/images/brand/who-photo.jpg",
		alt: "Volunteers working together at a community event",
		width: 920,
		height: 700,
		is_default: true
	},
	cta_panel: {
		src: "/wp-content/themes/progressnow/static/images/brand/cta-panel.svg",
		alt: "",
		width: 1281,
		height: 563,
		is_default: true
	}
};
var header = {
	navItems: [
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
	],
	aboutItems: [
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
	],
	joinLabel: "Join us",
	joinShortLabel: "Join",
	aboutLabel: "About",
	joinUrl: "/get-involved/#join",
	logoUrl: "",
	logoIsDefault: true,
	orgName: "Progress Now",
	homeUrl: "/"
};
var footer = {
	logoUrl: "",
	logoIsDefault: true,
	orgName: "Progress Now",
	columns: null,
	socials: [
		{
			name: "Facebook",
			url: ""
		},
		{
			name: "Instagram",
			url: ""
		},
		{
			name: "Twitter",
			url: ""
		}
	],
	contactEmail: "",
	tagline: "",
	a11yLead: "Built to be accessible —",
	a11yLinkLabel: "tell us how we can do better."
};
var strings = {
	nav_about: "About",
	nav_calendar: "Calendar",
	nav_blog: "Blog",
	nav_get_involved: "Get Involved",
	cta_join: "Join us",
	cta_join_short: "Join",
	about_chapter: "About the Chapter",
	about_mission: "Mission & History",
	about_counties: "Where We Organize",
	about_committees: "Committees",
	about_bylaws: "Bylaws & Code of Conduct",
	about_faq: "FAQ",
	skip_link: "Skip to main content",
	footer_a11y_lead: "Built to be accessible —",
	footer_a11y_link: "tell us how we can do better.",
	home_hero_headline: "A better world is possible!",
	home_hero_photo_alt: "Chapter members gathered at a community action",
	home_who_photo_alt: "Volunteers working together at a community event",
	home_cta_line: "Progress now, not someday!",
	cta_join_now: "Join Now",
	home_events_head: "Upcoming events",
	home_events_all: "Full calendar",
	home_events_empty_h: "No events on the books yet",
	home_events_empty_p: "New meetings and actions land on the %s first — subscribe there and never miss one.",
	home_events_empty_link: "calendar",
	home_view_event: "View event",
	home_blog_head: "From the blog",
	home_blog_all: "All posts",
	home_blog_read: "Read the post",
	home_blog_empty_h: "Posts coming soon",
	home_blog_empty_p: "The chapter is writing its first dispatches — check back shortly.",
	blog_crumb_home: "Home",
	blog_crumb_blog: "Blog",
	blog_featured: "Featured",
	blog_search: "Search posts…",
	blog_empty_h: "No posts yet",
	blog_empty_p: "The chapter blog is warming up. Check back soon.",
	blog_subscribe_h: "Never miss a post",
	blog_subscribe_p: "One email when we publish. No spam, no lists sold — ever.",
	blog_subscribe_cta: "Subscribe",
	blog_share: "Share",
	blog_copy_link: "Copy link",
	blog_email_it: "Email it",
	blog_read_next: "Read next",
	blog_get_involved_h: "Get involved",
	blog_get_involved_p: "Meetings, actions and committees are open to everyone. Come find your place in the work.",
	cal_title: "Event calendar",
	cal_crumb_calendar: "Calendar",
	cal_month: "Month",
	cal_list: "List",
	cal_empty_h: "Nothing scheduled this month",
	cal_empty_p: "Check the next month or subscribe below and never miss one.",
	cal_subscribe_h: "Subscribe to the calendar",
	cal_subscribe_p: "Add every meeting and action to your own calendar automatically.",
	cal_google: "Google Calendar",
	cal_ics: "iCal / .ics",
	event_rsvp: "RSVP",
	event_add_calendar: "Add to calendar",
	event_about: "About this event",
	event_details: "Details",
	event_date: "Date",
	event_time: "Time",
	event_location: "Location",
	event_save_h: "Save your spot",
	event_save_p: "RSVP and we’ll send the details straight to you.",
	event_save_cta: "RSVP Now",
	event_contact: "Questions? Contact",
	event_more: "More upcoming events",
	chrome_on_this_page: "On this page",
	chrome_related: "Related",
	chrome_document: "Document",
	chrome_what_covers: "What it covers",
	chrome_action: "Action",
	interior_documents: "Documents",
	interior_contact: "Contact",
	interior_contact_p: "Questions, ideas, or press —",
	interior_subscribe_h: "Never miss an update",
	interior_subscribe_p: "One email when something new lands — meetings, actions, and posts. No spam, ever.",
	interior_subscribe_cta: "Subscribe",
	about_dues_cta: "Update my dues",
	page_grievance_h: "Need to report something?",
	nf_doc_title: "Page not found",
	nf_title: "This page got organized out of existence",
	nf_lede: "The page you’re looking for isn’t here — it may have moved, or the link may be broken.",
	nf_home: "Back home",
	nf_calendar: "See the calendar"
};
var categories$2 = [
	{
		id: "chapter",
		label: "Chapter-Wide",
		color: "#B01B22"
	},
	{
		id: "poled",
		label: "Political Education",
		color: "#33518F"
	},
	{
		id: "mutual",
		label: "Mutual Aid",
		color: "#1B6B40"
	},
	{
		id: "labor",
		label: "Labor",
		color: "#8F5715"
	},
	{
		id: "electoral",
		label: "Electoral",
		color: "#6E3B87"
	},
	{
		id: "social",
		label: "Social",
		color: "#0A6B74"
	}
];
const siteFixture = {
	lang: lang$5,
	homeUrl: homeUrl$1,
	apiBase: apiBase,
	languages: languages$7,
	chapter: chapter,
	identity: identity,
	header: header,
	footer: footer,
	strings: strings,
	categories: categories$2
};

var lang$4 = "";
var id$5 = 0;
var path$4 = "/";
var hero = {
	subhead: "We’re fighting for the future our community deserves.",
	lede: "We’re a member-run organization building working-class power in our community.",
	cta_primary_label: "Join us",
	cta_primary_url: "/get-involved/#join",
	cta_secondary_label: "New member? Start with Progress Now 101. Sign up here",
	cta_secondary_url: "/get-involved/"
};
var who = {
	eyebrow: "Who we are",
	heading: "We are <span class=\"notranslate\">Progress Now</span>",
	p1: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, quis nostrud exercitation ullamco laboris.",
	p2: "Ut enim ad minim veniam, quis nostrud.",
	p3: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis.<br>Lorem ipsum dolor sit amet.",
	link_label: "More about our chapter",
	link_url: "/about/"
};
var cta = {
	line: "Progress now, not someday!"
};
var eventCount = 5;
var events = [
	{
		day: "04",
		month: "JUL",
		title: "Contract Test Event",
		when: "Thursday, July 4 · 6:00 PM",
		where: "Downtown",
		url: "http://example.org/?event=contract-test-event"
	}
];
var calendarUrl$1 = "http://example.org/";
var blog = {
	featured: {
		cat: "chapter",
		cat_label: "Chapter-Wide",
		date: "June 1, 2026",
		read: "1 min read",
		title: "Contract Test Post",
		excerpt: "A deterministic excerpt.",
		url: "http://example.org/?p=0",
		image: null
	},
	rows: [
	]
};
var languages$6 = [
];
var seo$6 = {
	title: "Progress Now – Organizing our community.",
	description: "We’re a member-run organization building working-class power in our community.",
	canonical: "http://example.org/",
	robots: "index,follow",
	hreflang: [
	]
};
const frontFixture = {
	lang: lang$4,
	id: id$5,
	path: path$4,
	hero: hero,
	who: who,
	cta: cta,
	eventCount: eventCount,
	events: events,
	calendarUrl: calendarUrl$1,
	blog: blog,
	languages: languages$6,
	seo: seo$6
};

var lang$3 = "";
var id$4 = 0;
var path$3 = "/?page_id=0";
var kind$2 = "about";
var template$2 = "page-templates/about.php";
var title$4 = "About the Chapter";
var lede$2 = "";
var content$2 = "<p>About body.</p>\n";
var documents$2 = [
];
var grievance$2 = {
	show: true,
	body: ""
};
var newhere$2 = {
	heading: "Get involved",
	body: "Meetings, actions and committees are open to everyone. Come find your place in the work.",
	link_label: "Join Now",
	url: "/get-involved/#join",
	external: false
};
var about$2 = {
	mission: {
		visible: true,
		eyebrow: "What we believe",
		body: "We believe our economy should be built democratically, by and for working people — not by billionaires for profit."
	},
	chapter: {
		visible: true,
		heading: "About the Chapter",
		p1: "We are a member-run, member-funded organizing group. Our grassroots work focuses on labor organizing, mutual aid, and political education across our community.",
		p2: "Everything we do is member-led, member-funded, and open to anyone who wants to build a community that works for working people. We regularly host community meetings to share updates, plan campaigns, and hold political education lectures. If you’re a student, ask us about our campus branch.",
		photo: null,
		ctas: [
			{
				label: "Come to a meeting",
				url: "/calendar/",
				external: false
			},
			{
				label: "Get involved",
				url: "/get-involved/",
				external: false
			},
			{
				label: "Students",
				url: "/get-involved/",
				external: false
			}
		]
	},
	history: {
		visible: true,
		heading: "Mission & History",
		body: "We fight for a future where housing, healthcare, and a dignified living are guaranteed — and we believe the people who live and work in our community should be the ones deciding it. Our work centers on three pillars: labor organizing, mutual aid, and political education.",
		timeline: [
			{
				year: "1982",
				text: "Progress Now is founded as a member-run organizing project."
			},
			{
				year: "20XX",
				text: "Local organizers form an organizing committee and begin meeting. <em class=\"text-muted\">(Year and details to be filled in by the chapter.)</em>"
			},
			{
				year: "20XX",
				text: "The chapter is chartered as an official local chapter. <em class=\"text-muted\">(Year and details to be filled in by the chapter.)</em>"
			}
		]
	},
	counties: {
		visible: true,
		heading: "Where We Organize",
		intro: "One chapter, many communities. Wherever you are in our community, you’re covered — and if you can help us organize deeper in your neighborhood, we want to hear from you.",
		cards: [
			{
				name: "Central",
				cities: "Downtown · Midtown",
				note: "Home base — most meetings held here"
			},
			{
				name: "North",
				cities: "Northside · Uptown",
				note: ""
			},
			{
				name: "South",
				cities: "Southside · Riverside",
				note: ""
			},
			{
				name: "Campus",
				cities: "Student branch",
				note: ""
			}
		]
	},
	committees: {
		visible: true,
		heading: "Committees",
		intro: "Committees are where the work happens. Each one meets regularly and welcomes new members.",
		link: {
			label: "Join a committee",
			url: "/get-involved/#committees",
			external: false
		}
	},
	governance: {
		visible: true,
		heading: "Bylaws & Code of Conduct",
		intro: "The chapter is governed by its members through documents we debate and vote on together. Everything is public.",
		docs: [
			{
				title: "Chapter Bylaws",
				covers: "How the chapter runs: officers, elections, quorum, committees, and how decisions get made.",
				action: "Read",
				url: "/bylaws-code-of-conduct/#documents"
			},
			{
				title: "Code of Conduct",
				covers: "What we expect of each other in every chapter space — meetings, actions, and online.",
				action: "Read",
				url: "/bylaws-code-of-conduct/#documents"
			},
			{
				title: "Grievance Policy",
				covers: "How to report harm and how the chapter handles conflict, confidentially and fairly.",
				action: "Read",
				url: "/bylaws-code-of-conduct/#grievance"
			},
			{
				title: "Meeting Minutes",
				covers: "Records and resolutions from general meetings, available to all members.",
				action: "Browse",
				url: "/bylaws-code-of-conduct/#documents"
			}
		]
	},
	faq: {
		visible: true,
		heading: "FAQ",
		rows: [
			{
				question: "Do I have to be a member to come to events?",
				answer: "Nope — most of our events are open to everyone. Come to a 101 or a social, meet folks, and see if it's for you."
			},
			{
				question: "How much are dues?",
				answer: "Dues are sliding-scale — most folks pay a few dollars a month. No one is turned away for inability to pay."
			},
			{
				question: "How do I change my dues rate?",
				answer: "Enter the email associated with your membership in the dues form with your new dues amount, and your current dues will be canceled and updated."
			},
			{
				question: "I've never done anything political before. Is that okay?",
				answer: "More than okay — it's the norm. Most members joined without any organizing experience. Progress Now 101 exists exactly for this."
			},
			{
				question: "Can I participate without being publicly visible?",
				answer: "Yes. There are plenty of ways to contribute behind the scenes, and we take members' privacy and safety seriously."
			},
			{
				question: "How much time does membership take?",
				answer: "As much or as little as you have. Some members show up to one event a month; others help lead committees."
			}
		]
	},
	dues: {
		visible: true,
		heading: "Switching your dues rate?",
		body: "Already a member and changing your dues rate? Enter the email associated with your membership in the dues form with your new dues amount, and your current dues will be canceled and updated."
	},
	nav: [
		{
			href: "#chapter",
			label: "About the Chapter"
		},
		{
			href: "#mission",
			label: "Mission & History"
		},
		{
			href: "#counties",
			label: "Where We Organize"
		},
		{
			href: "#committees",
			label: "Committees"
		},
		{
			href: "#bylaws",
			label: "Bylaws & Code of Conduct"
		},
		{
			href: "#faq",
			label: "FAQ"
		}
	]
};
var gi$2 = null;
var calendar$2 = null;
var languages$5 = [
];
var seo$5 = {
	title: "About the Chapter – Progress Now",
	description: "Organizing our community.",
	canonical: "http://example.org/?page_id=0",
	robots: "index,follow",
	hreflang: [
	]
};
const aboutFixture = {
	lang: lang$3,
	id: id$4,
	path: path$3,
	kind: kind$2,
	template: template$2,
	title: title$4,
	lede: lede$2,
	content: content$2,
	documents: documents$2,
	grievance: grievance$2,
	newhere: newhere$2,
	about: about$2,
	gi: gi$2,
	calendar: calendar$2,
	languages: languages$5,
	seo: seo$5
};

var lang$2 = "";
var id$3 = 0;
var path$2 = "/?page_id=0";
var kind$1 = "get_involved";
var template$1 = "page-templates/get-involved.php";
var title$3 = "Get involved";
var lede$1 = "";
var content$1 = "";
var documents$1 = [
];
var grievance$1 = {
	show: true,
	body: ""
};
var newhere$1 = {
	heading: "Get involved",
	body: "Meetings, actions and committees are open to everyone. Come find your place in the work.",
	link_label: "Join Now",
	url: "/get-involved/#join",
	external: false
};
var about$1 = null;
var gi$1 = {
	join: {
		visible: true,
		heading: "How to join",
		steps: [
			{
				title: "Become a member",
				body: "Sign up in a few minutes. Dues are sliding-scale — pay what you can, and <strong>no one is turned away for lack of funds</strong>.",
				link_label: "Join now →",
				href: "/get-involved/#join",
				external: true
			},
			{
				title: "Come to Progress Now 101",
				body: "Our intro session for new and curious folks — what we stand for, what our chapter is working on, and how to plug in. Offered virtually and in person, multiple times a month. You don't have to be a member yet to attend.",
				link_label: "Find a session →",
				href: "/calendar/",
				external: false
			},
			{
				title: "Get onboarded & plug in",
				body: "After 101, we'll add you to our WhatsApp and match you with a committee that fits your interests and capacity — whether that's an hour a month or a night a week.",
				link_label: "Browse committees ↓",
				href: "#committees",
				external: false
			}
		]
	},
	committees: {
		visible: true,
		heading: "Committees",
		intro: "Committees are where the work happens. Each one meets regularly and welcomes new members — reach out through the WhatsApp or at any general meeting."
	},
	channels: {
		visible: true,
		heading: "Communication channels",
		items: [
			{
				label: "WhatsApp",
				desc: "Our main channel — members receive an invite during onboarding",
				link_label: "",
				url: "",
				badge: "Members only",
				external: false
			},
			{
				label: "Email",
				desc: "Questions, press, and anything else",
				link_label: "Write us",
				url: "mailto:",
				badge: "",
				external: false
			}
		]
	},
	faq: {
		visible: true,
		heading: "Common questions",
		items: [
			{
				question: "Do I have to be a member to come to events?",
				answer: "Nope — most of our events are open to everyone. Come to a 101 or a social, meet folks, and see if it's for you. No pressure."
			},
			{
				question: "How much are dues?",
				answer: "Dues are sliding-scale — most folks pay a few dollars a month. If dues are a barrier, talk to us: no one is turned away for lack of funds."
			},
			{
				question: "I've never done anything political before. Is that okay?",
				answer: "More than okay — it's the norm. Most members joined without any organizing experience. Progress Now 101 exists exactly for this, and committees will teach you everything as you go."
			},
			{
				question: "Can I participate without being publicly visible?",
				answer: "Yes. There are plenty of ways to contribute behind the scenes, and we take members' privacy and safety seriously. Talk to us about what you're comfortable with."
			},
			{
				question: "How much time does membership take?",
				answer: "As much or as little as you have. Some members show up to one event a month; others help lead committees. Capacity changes — that's fine. The work is a marathon, not a sprint."
			}
		]
	},
	card: {
		heading: "Ready right now?",
		body: "Membership takes five minutes, and dues are pay-what-you-can.",
		link_label: "Join us",
		url: "/get-involved/#join",
		external: false
	},
	related: [
		{
			label: "Event Calendar",
			url: "/calendar/",
			external: false
		},
		{
			label: "Bylaws & Code of Conduct",
			url: "/bylaws-code-of-conduct/",
			external: false
		},
		{
			label: "Mission & History",
			url: "/about/#mission",
			external: false
		}
	],
	nav: [
		{
			href: "#join",
			label: "How to join"
		},
		{
			href: "#committees",
			label: "Committees"
		},
		{
			href: "#channels",
			label: "Communication channels"
		},
		{
			href: "#faq",
			label: "Common questions"
		}
	]
};
var calendar$1 = null;
var languages$4 = [
];
var seo$4 = {
	title: "Get involved – Progress Now",
	description: "Organizing our community.",
	canonical: "http://example.org/?page_id=0",
	robots: "index,follow",
	hreflang: [
	]
};
const getInvolvedFixture = {
	lang: lang$2,
	id: id$3,
	path: path$2,
	kind: kind$1,
	template: template$1,
	title: title$3,
	lede: lede$1,
	content: content$1,
	documents: documents$1,
	grievance: grievance$1,
	newhere: newhere$1,
	about: about$1,
	gi: gi$1,
	calendar: calendar$1,
	languages: languages$4,
	seo: seo$4
};

var lang$1 = "";
var id$2 = 0;
var path$1 = "/?page_id=0";
var kind = "calendar";
var template = "page-templates/calendar.php";
var title$2 = "Event Calendar";
var lede = "";
var content = "";
var documents = [
];
var grievance = {
	show: true,
	body: ""
};
var newhere = {
	heading: "Get involved",
	body: "Meetings, actions and committees are open to everyone. Come find your place in the work.",
	link_label: "Join Now",
	url: "/get-involved/#join",
	external: false
};
var about = null;
var gi = null;
var calendar = {
	apiBase: "http://example.org/index.php?rest_route=/progressnow/v1",
	icsUrl: "http://example.org/?feed=chapter-events",
	googleCalUrl: "https://calendar.google.com/calendar/r?cid=webcal%3A%2F%2Fexample.org%2F%3Ffeed%3Dchapter-events"
};
var languages$3 = [
];
var seo$3 = {
	title: "Event Calendar – Progress Now",
	description: "Organizing our community.",
	canonical: "http://example.org/?page_id=0",
	robots: "index,follow",
	hreflang: [
	]
};
const calendarFixture = {
	lang: lang$1,
	id: id$2,
	path: path$1,
	kind: kind,
	template: template,
	title: title$2,
	lede: lede,
	content: content,
	documents: documents,
	grievance: grievance,
	newhere: newhere,
	about: about,
	gi: gi,
	calendar: calendar,
	languages: languages$3,
	seo: seo$3
};

var posts = [
	{
		id: "17",
		title: "Contract Test Post",
		slug: "contract-test-post",
		cat: "chapter",
		date: "Jun 1, 2026",
		excerpt: "A deterministic excerpt.",
		bylineMode: "named",
		author: "",
		featured: false,
		readMinutes: 1,
		url: "http://example.org/?p=17",
		image: null
	}
];
var page = 1;
var perPage = 24;
var total = 1;
var totalPages = 1;
const postsFixture = {
	posts: posts,
	page: page,
	perPage: perPage,
	total: total,
	totalPages: totalPages
};

var title$1 = "Contract Test Post";
var dek = "";
var cat$1 = "chapter";
var date$1 = "June 1, 2026";
var readMinutes = 1;
var bylineMode = "named";
var author = "";
var authorAvatar = "https://secure.gravatar.com/avatar/?s=96&d=mm";
var committee = "";
var authorBio = "";
var committeeBio = "";
var featuredImage = {
	src: null,
	alt: "Contract Test Post"
};
var blocks = [
	{
		type: "prose",
		html: "<p>Deterministic body prose for the contract test.</p>"
	},
	{
		type: "pull_quote",
		quote: "Fixed quote.",
		attribution: "Fixture"
	}
];
var tags = [
];
var readNext = [
];
var showMetaRail = false;
var languages$2 = [
];
var seo$2 = {
	title: "Contract Test Post",
	description: "A deterministic excerpt.",
	canonical: "http://example.org/?p=14",
	robots: "index,follow",
	hreflang: [
	]
};
const singlePostFixture = {
	title: title$1,
	dek: dek,
	cat: cat$1,
	date: date$1,
	readMinutes: readMinutes,
	bylineMode: bylineMode,
	author: author,
	authorAvatar: authorAvatar,
	committee: committee,
	authorBio: authorBio,
	committeeBio: committeeBio,
	featuredImage: featuredImage,
	blocks: blocks,
	tags: tags,
	readNext: readNext,
	showMetaRail: showMetaRail,
	languages: languages$2,
	seo: seo$2
};

var lang = "";
var id$1 = 0;
var path = "/?event=contract-test-event";
var event = {
	title: "Contract Test Event",
	summary: "",
	cat: "chapter",
	date: "2030-07-04",
	time: "6:00–8:00 PM",
	doorsTime: "",
	locationType: "in-person",
	venue: "Union Hall",
	city: "Downtown",
	cost: "",
	rsvpRequired: false,
	rsvpUrl: "",
	capacity: null,
	directionsUrl: "https://maps.google.com/?q=Union%20Hall%2C%20Downtown",
	gcalUrl: "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Contract%20Test%20Event&dates=20300704T180000%2F20300704T200000&details=March%20at%20dawn.&location=Downtown%20%E2%80%94%20Union%20Hall&ctz=America%2FChicago",
	icsUrl: "",
	contact: {
		name: "",
		email: "",
		phone: ""
	},
	featuredImage: {
		src: null,
		alt: "Contract Test Event"
	},
	blocks: [
	]
};
var categories$1 = [
	{
		id: "chapter",
		label: "Chapter-Wide",
		color: "#B01B22"
	},
	{
		id: "poled",
		label: "Political Education",
		color: "#33518F"
	},
	{
		id: "mutual",
		label: "Mutual Aid",
		color: "#1B6B40"
	},
	{
		id: "labor",
		label: "Labor",
		color: "#8F5715"
	},
	{
		id: "electoral",
		label: "Electoral",
		color: "#6E3B87"
	},
	{
		id: "social",
		label: "Social",
		color: "#0A6B74"
	}
];
var related = [
];
var showRelated = true;
var homeUrl = "http://example.org/";
var calendarUrl = "http://example.org/";
var languages$1 = [
];
var seo$1 = {
	title: "Contract Test Event – Progress Now",
	description: "March at dawn.",
	canonical: "http://example.org/?event=contract-test-event",
	robots: "index,follow",
	hreflang: [
	]
};
const singleEventFixture = {
	lang: lang,
	id: id$1,
	path: path,
	event: event,
	categories: categories$1,
	related: related,
	showRelated: showRelated,
	homeUrl: homeUrl,
	calendarUrl: calendarUrl,
	languages: languages$1,
	seo: seo$1
};

var id = "20";
var date = "2026-07-04";
var time = "6:00–8:00 PM";
var cat = "chapter";
var title = "Contract Test Event";
var location = "Downtown — Union Hall";
var desc = "March at dawn.";
var url = "http://example.org/?p=20";
var gcalUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Contract%20Test%20Event&dates=20260704T180000%2F20260704T200000&details=March%20at%20dawn.&location=Downtown%20%E2%80%94%20Union%20Hall&ctz=America%2FChicago";
const chapterEventFixture = {
	id: id,
	date: date,
	time: time,
	cat: cat,
	title: title,
	location: location,
	desc: desc,
	url: url,
	gcalUrl: gcalUrl
};

var categories = [
	{
		id: "chapter",
		label: "Chapter-Wide",
		color: "#B01B22"
	},
	{
		id: "poled",
		label: "Political Education",
		color: "#33518F"
	},
	{
		id: "mutual",
		label: "Mutual Aid",
		color: "#1B6B40"
	},
	{
		id: "labor",
		label: "Labor",
		color: "#8F5715"
	},
	{
		id: "electoral",
		label: "Electoral",
		color: "#6E3B87"
	},
	{
		id: "social",
		label: "Social",
		color: "#0A6B74"
	}
];
const categoriesFixture = {
	categories: categories
};

const MOCK_ORIGIN = "https://mock.example";
const MOCK_CONTENT_VERSION = 7;
const HOME = { en: "/", es: "/es/" };
const PAGES = [
  { lang: "en", path: "/blog/", slug: "blog", kind: "posts_index", template: "page.php", title: "Chapter Blog" },
  { lang: "en", path: "/about/", slug: "about", kind: "about", template: "page-templates/about.php", title: "About the Chapter" },
  { lang: "en", path: "/get-involved/", slug: "get-involved", kind: "get_involved", template: "page-templates/get-involved.php", title: "Get involved" },
  { lang: "en", path: "/calendar/", slug: "calendar", kind: "calendar", template: "page-templates/calendar.php", title: "Event Calendar" },
  { lang: "en", path: "/bylaws/", slug: "bylaws", kind: "page", template: "page.php", title: "Bylaws & Code of Conduct" },
  { lang: "es", path: "/es/blog/", slug: "blog", kind: "posts_index", template: "page.php", title: "Blog del cap\xEDtulo" },
  { lang: "es", path: "/es/acerca/", slug: "acerca", kind: "about", template: "page-templates/about.php", title: "Sobre el cap\xEDtulo" },
  { lang: "es", path: "/es/participa/", slug: "participa", kind: "get_involved", template: "page-templates/get-involved.php", title: "Participa" },
  { lang: "es", path: "/es/calendario/", slug: "calendario", kind: "calendar", template: "page-templates/calendar.php", title: "Calendario de eventos" }
];
const POST_SLUG = "contract-test-post";
const EVENT_SLUG = "contract-test-event";
function langOf(value) {
  return value === "es" ? "es" : "en";
}
function abs(path) {
  return `${MOCK_ORIGIN}${path}`;
}
function translationOf(lang, kind) {
  var _a, _b;
  if (kind === "front") return HOME[lang];
  if (kind === "post") return `${HOME[lang]}blog/${POST_SLUG}/`;
  if (kind === "event") return `${HOME[lang]}events/${EVENT_SLUG}/`;
  return (_b = (_a = PAGES.find((p) => p.lang === lang && p.kind === kind)) == null ? void 0 : _a.path) != null ? _b : HOME[lang];
}
function languages(lang, kind) {
  return ["en", "es"].map((code) => ({
    code,
    label: code.toUpperCase(),
    name: code === "en" ? "English" : "Espa\xF1ol",
    active: code === lang,
    url: abs(translationOf(code, kind))
  }));
}
function seo(base, lang, kind, path) {
  var _a;
  return {
    title: base.title,
    description: base.description,
    canonical: abs(path),
    robots: (_a = base.robots) != null ? _a : "index,follow",
    hreflang: ["en", "es"].map((code) => ({ lang: code, href: abs(translationOf(code, kind)) }))
  };
}
function mockRoutesManifest() {
  const routes = [];
  let id = 1;
  for (const lang of ["en", "es"]) {
    routes.push({ path: HOME[lang], kind: "front", lang, id: id++, template: "front-page", payloadKey: `front:${lang}` });
    for (const page of PAGES.filter((p) => p.lang === lang)) {
      routes.push({ path: page.path, kind: page.kind, lang, id: id++, template: page.template, payloadKey: `page:${lang}:${page.slug}` });
    }
    routes.push({ path: translationOf(lang, "post"), kind: "post", lang, id: id++, template: "single.php", payloadKey: `post:${lang}:${POST_SLUG}` });
    routes.push({ path: translationOf(lang, "event"), kind: "event", lang, id: id++, template: "single-event.php", payloadKey: `event:${lang}:${EVENT_SLUG}` });
  }
  return { routes, contentVersion: MOCK_CONTENT_VERSION, generatedAt: "2026-01-01T00:00:00+00:00" };
}
function mockSite(langValue) {
  const lang = langOf(langValue);
  const home = abs(HOME[lang]);
  return {
    ...siteFixture,
    lang,
    homeUrl: home,
    apiBase: `${MOCK_ORIGIN}/mock/v1`,
    languages: languages(lang, "front"),
    header: {
      ...siteFixture.header,
      homeUrl: home,
      navItems: [
        { label: lang === "es" ? "Calendario" : "Calendar", href: translationOf(lang, "calendar") },
        { label: "Blog", href: translationOf(lang, "posts_index") },
        { label: lang === "es" ? "Participa" : "Get Involved", href: translationOf(lang, "get_involved") }
      ],
      aboutItems: [
        { label: lang === "es" ? "Sobre el cap\xEDtulo" : "About the Chapter", href: translationOf(lang, "about") },
        { label: lang === "es" ? "Misi\xF3n e historia" : "Mission & History", href: `${translationOf(lang, "about")}#mission` },
        { label: "FAQ", href: `${translationOf(lang, "about")}#faq` }
      ]
    },
    categories: categoriesFixture.categories
  };
}
function mockFrontPage(langValue) {
  const lang = langOf(langValue);
  return {
    ...frontFixture,
    lang,
    path: HOME[lang],
    calendarUrl: abs(translationOf(lang, "calendar")),
    events: frontFixture.events.map((e) => ({ ...e, url: abs(translationOf(lang, "event")) })),
    blog: {
      ...frontFixture.blog,
      featured: frontFixture.blog.featured ? { ...frontFixture.blog.featured, url: abs(translationOf(lang, "post")) } : null,
      rows: [
        { cat: "labor", cat_label: "Labor", title: "Know your rights on the job", date: "May 12, 2026", url: abs(translationOf(lang, "post")), image: null },
        { cat: "mutual", cat_label: "Mutual Aid", title: "Community fridge: spring report", date: "April 30, 2026", url: abs(translationOf(lang, "post")), image: null }
      ]
    },
    languages: languages(lang, "front"),
    seo: seo(frontFixture.seo, lang, "front", HOME[lang])
  };
}
function mockPage(pathValue, langValue) {
  const lang = langOf(langValue);
  const slug = pathValue.replace(/^\/+|\/+$/g, "");
  const page = PAGES.find((p) => p.lang === lang && p.slug === slug);
  if (!page) return null;
  const base = page.kind === "about" ? aboutFixture : page.kind === "get_involved" ? getInvolvedFixture : page.kind === "calendar" ? calendarFixture : { ...calendarFixture, calendar: null, about: null, gi: null };
  const content = page.kind === "page" ? "<p>Our chapter is governed by its members. These documents spell out how we make decisions together, how we treat each other, and what to do when something goes wrong.</p>" : page.kind === "posts_index" ? "" : base.content;
  return {
    ...base,
    lang,
    id: 100 + PAGES.indexOf(page),
    path: page.path,
    kind: page.kind,
    template: page.template,
    title: page.title,
    content,
    documents: page.kind === "page" ? [{ title: "Chapter Bylaws", meta: "PDF \xB7 12 pages", url: `${MOCK_ORIGIN}/wp-content/uploads/bylaws.pdf` }] : [],
    calendar: page.kind === "calendar" ? { apiBase: `${MOCK_ORIGIN}/mock/v1`, icsUrl: `${MOCK_ORIGIN}/feed/chapter-events/`, googleCalUrl: "https://calendar.google.com/calendar/r?cid=webcal%3A%2F%2Fmock.example%2Ffeed%2Fchapter-events%2F" } : null,
    languages: languages(lang, page.kind),
    seo: seo({ title: `${page.title} \u2013 Progress Now`, description: base.seo.description }, lang, page.kind, page.path)
  };
}
function mockPosts(query) {
  const lang = langOf(query.lang);
  const s = typeof query.s === "string" ? query.s.trim().toLowerCase() : "";
  const category = typeof query.category === "string" ? query.category : "";
  let posts = postsFixture.posts.map((p) => ({ ...p, url: abs(translationOf(lang, "post")) }));
  if (s) posts = posts.filter((p) => p.title.toLowerCase().includes(s));
  if (category && category !== "all") posts = posts.filter((p) => p.cat === category);
  return { ...postsFixture, posts, total: posts.length, totalPages: posts.length ? 1 : 0 };
}
function mockSinglePost(slug, langValue) {
  if (slug !== POST_SLUG) return null;
  const lang = langOf(langValue);
  const path = translationOf(lang, "post");
  return {
    ...singlePostFixture,
    languages: languages(lang, "post"),
    seo: seo(singlePostFixture.seo, lang, "post", path)
  };
}
function mockEvents(query) {
  const lang = langOf(query.lang);
  return {
    events: [{ ...chapterEventFixture, url: abs(translationOf(lang, "event")) }],
    categories: categoriesFixture.categories
  };
}
function mockSingleEvent(slug, langValue) {
  if (slug !== EVENT_SLUG) return null;
  const lang = langOf(langValue);
  const path = translationOf(lang, "event");
  return {
    ...singleEventFixture,
    lang,
    path,
    homeUrl: abs(HOME[lang]),
    calendarUrl: abs(translationOf(lang, "calendar")),
    languages: languages(lang, "event"),
    seo: seo(singleEventFixture.seo, lang, "event", path)
  };
}
function mockCategories() {
  return categoriesFixture;
}
function mockDispatch(path, query) {
  const segments = path.replace(/^\/+|\/+$/g, "").split("/");
  const [head, ...rest] = segments;
  switch (head) {
    case "site":
      return mockSite(query.lang);
    case "routes":
      return mockRoutesManifest();
    case "front-page":
      return mockFrontPage(query.lang);
    case "pages":
      return mockPage(rest.join("/"), query.lang);
    case "posts":
      return rest.length ? mockSinglePost(rest[0], query.lang) : mockPosts(query);
    case "events":
      return rest.length ? mockSingleEvent(rest[0], query.lang) : mockEvents(query);
    case "categories":
      return mockCategories();
    default:
      return null;
  }
}

const ____path__get = defineEventHandler((event) => {
  var _a;
  if (!useRuntimeConfig(event).public.mockApi) {
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }
  const path = (_a = getRouterParam(event, "path")) != null ? _a : "";
  const body = mockDispatch(path, getQuery$1(event));
  if (body === null) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      data: { code: "progressnow_not_found", message: `No fixture for /${path}` }
    });
  }
  setResponseHeader(event, "Cache-Control", "no-store");
  return body;
});

const ____path__get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: ____path__get
}, Symbol.toStringTag, { value: 'Module' }));

//#region src/runtime/utils/renderer/payload.ts
function renderPayloadResponse(ssrContext) {
	return {
		body: encodeForwardSlashes(stringify(splitPayload(ssrContext).payload, ssrContext["~payloadReducers"])) ,
		statusCode: getResponseStatus(ssrContext.event),
		statusMessage: getResponseStatusText(ssrContext.event),
		headers: {
			"content-type": "application/json;charset=utf-8" ,
			"x-powered-by": "Nuxt"
		}
	};
}
function renderPayloadJsonScript(opts) {
	const payload = {
		"type": "application/json",
		"innerHTML": opts.data ? encodeForwardSlashes(stringify(opts.data, opts.ssrContext["~payloadReducers"])) : "",
		"data-nuxt-data": appId,
		"data-ssr": !(opts.ssrContext.noSSR)
	};
	payload.id = "__NUXT_DATA__";
	if (opts.src) payload["data-src"] = opts.src;
	const config = uneval(opts.ssrContext.config);
	return [payload, { innerHTML: `window.__NUXT__={};window.__NUXT__.config=${config}` }];
}
/**
* Encode forward slashes as unicode escape sequences to prevent
* Google from treating them as internal links and trying to crawl them.
* @see https://github.com/nuxt/nuxt/issues/24175
*/
function encodeForwardSlashes(str) {
	return str.replaceAll("/", "\\u002F");
}
function splitPayload(ssrContext) {
	const { data, prerenderedAt, prefetchLinks, ...initial } = ssrContext.payload;
	const payload = {
		data,
		prerenderedAt
	};
	if (prefetchLinks?.length) payload.prefetchLinks = prefetchLinks;
	return {
		initial: {
			...initial,
			prerenderedAt
		},
		payload
	};
}

const renderSSRHeadOptions = {"omitLineBreaks":true};

//#region src/runtime/handlers/renderer.ts
globalThis.__buildAssetsURL = buildAssetsURL;
globalThis.__publicAssetsURL = publicAssetsURL;
const HAS_APP_TELEPORTS = !!(appTeleportAttrs.id);
const APP_TELEPORT_OPEN_TAG = HAS_APP_TELEPORTS ? `<${appTeleportTag}${propsToString(appTeleportAttrs)}>` : "";
const APP_TELEPORT_CLOSE_TAG = HAS_APP_TELEPORTS ? `</${appTeleportTag}>` : "";
const PAYLOAD_URL_RE = /^[^?]*\/_payload.json(?:\?.*)?$/ ;
const PAYLOAD_FILENAME = "_payload.json" ;
const PAYLOAD_BUILD_ID_PARAM = "_b";
const handler = defineRenderHandler((event) => {
	const ssrError = event.path.startsWith("/__nuxt_error") ? getQuery$1(event) : null;
	if (ssrError && !("__unenv__" in event.node.req)) throw createError({
		status: 404,
		statusText: "Page Not Found: /__nuxt_error",
		message: "Page Not Found: /__nuxt_error"
	});
	return renderRoute(event, ssrError);
});
async function renderRoute(event, ssrError) {
	const nitroApp = useNitroApp();
	const ssrContext = createSSRContext(event);
	ssrContext.head.push(appHead);
	if (ssrError) {
		const status = ssrError.status || ssrError.statusCode;
		if (status) ssrError.status = ssrError.statusCode = Number.parseInt(status);
		if (typeof ssrError.data === "string") try {
			ssrError.data = destr(ssrError.data);
		} catch {}
		setSSRError(ssrContext, ssrError);
	}
	const routeOptions = getRouteRules(event);
	if (routeOptions.ssr === false) ssrContext.noSSR = true;
	!ssrContext.noSSR && (NUXT_RUNTIME_PAYLOAD_EXTRACTION);
	const isRenderingPayload = (routeOptions.prerender) && PAYLOAD_URL_RE.test(ssrContext.url);
	if (isRenderingPayload) {
		const payloadURL = new URL(ssrContext.url, "http://localhost");
		const url = payloadURL.pathname.slice(0, -`/${PAYLOAD_FILENAME}`.length) || "/";
		payloadURL.searchParams.delete(PAYLOAD_BUILD_ID_PARAM);
		ssrContext.url = url + payloadURL.search;
		event._path = event.node.req.url = ssrContext.url;
		getPayloadCacheKey(ssrContext.url);
	}
	const renderer = await getRenderer(ssrContext);
	const canStream = NUXT_SSR_STREAMING;
	const renderRouteContext = {
		canStream,
		prefersStream: false
	};
	await nitroApp.hooks.callHook("render:route", renderRouteContext, { event });
	const _rendered = await (renderer.renderToString(ssrContext)).catch(async (error) => {
		if ((ssrContext["~renderResponse"] || ssrContext._renderResponse) && error.message === "skipping render") return {};
		const _err = !ssrError && ssrContext.payload?.error || error;
		await ssrContext.nuxt?.hooks.callHook("app:error", _err);
		throw _err;
	});
	const inlinedStyles = [];
	await ssrContext.nuxt?.hooks.callHook("app:rendered", {
		ssrContext,
		renderResult: _rendered
	});
	if (ssrContext["~renderResponse"] || ssrContext._renderResponse) return ssrContext["~renderResponse"] || ssrContext._renderResponse;
	if (ssrContext.payload?.error && !ssrError) throw ssrContext.payload.error;
	if (isRenderingPayload) {
		const response = renderPayloadResponse(ssrContext);
		return response;
	}
	const NO_SCRIPTS = routeOptions.noScripts;
	const { styles, scripts } = getRequestDependencies(ssrContext, renderer.rendererContext);
	if (inlinedStyles.length) ssrContext.head.push({ style: inlinedStyles });
	const link = [];
	for (const resource of Object.values(styles)) {
		if ("inline" in getQuery(resource.file)) continue;
		link.push({
			rel: "stylesheet",
			href: renderer.rendererContext.buildAssetsURL(resource.file),
			crossorigin: ""
		});
	}
	if (link.length) ssrContext.head.push({ link });
	if (!NO_SCRIPTS) {
		const dependencyOptions = ssrContext["~lazyHydratedModules"]?.size ? { exclude: ssrContext["~lazyHydratedModules"] } : void 0;
		const excludeHrefs = new Set(link.map((l) => l.href));
		for (const id of ssrContext["~neverHydratedModules"] ?? []) {
			const file = renderer.rendererContext.manifest?.[id]?.file;
			if (file) excludeHrefs.add(renderer.rendererContext.buildAssetsURL(file));
		}
		const hints = [];
		for (const l of getPreloadLinks(ssrContext, renderer.rendererContext, dependencyOptions)) if (!excludeHrefs.has(l.href)) hints.push(l);
		for (const l of getPrefetchLinks(ssrContext, renderer.rendererContext, dependencyOptions)) if (!excludeHrefs.has(l.href)) hints.push(l);
		ssrContext.head.push({ link: hints });
		ssrContext.head.push({ script: renderPayloadJsonScript({
			ssrContext,
			data: stripInlineOnlyPayloadFields(ssrContext.payload)
		})   }, {
			tagPosition: "bodyClose",
			tagPriority: "high"
		});
	}
	if (!routeOptions.noScripts) {
		const tagPosition = "head";
		ssrContext.head.push({ script: Object.values(scripts).map((resource) => ({
			type: resource.module ? "module" : null,
			src: renderer.rendererContext.buildAssetsURL(resource.file),
			defer: resource.module ? null : true,
			tagPosition,
			crossorigin: ""
		})) });
	}
	const { headTags, bodyTags, bodyTagsOpen, htmlAttrs, bodyAttrs } = renderSSRHead(ssrContext.head, renderSSRHeadOptions);
	const htmlContext = {
		htmlAttrs: htmlAttrs ? [htmlAttrs] : [],
		head: normalizeChunks([headTags]),
		bodyAttrs: bodyAttrs ? [bodyAttrs] : [],
		bodyPrepend: normalizeChunks([bodyTagsOpen, ssrContext.teleports?.body]),
		body: [replaceIslandTeleports(ssrContext, _rendered.html) , APP_TELEPORT_OPEN_TAG + (HAS_APP_TELEPORTS ? joinTags([ssrContext.teleports?.[`#${appTeleportAttrs.id}`]]) : "") + APP_TELEPORT_CLOSE_TAG],
		bodyAppend: [bodyTags]
	};
	await nitroApp.hooks.callHook("render:html", htmlContext, { event });
	return {
		body: renderHTMLDocument(htmlContext),
		statusCode: getResponseStatus(event),
		statusMessage: getResponseStatusText(event),
		headers: {
			"content-type": "text/html;charset=utf-8",
			"x-powered-by": "Nuxt"
		}
	};
}
function getPayloadCacheKey(url) {
	const { pathname, search } = new URL(url, "http://localhost");
	return (pathname === "/" ? "/" : pathname.replace(/\/$/, "")) + (search ? encodeURIComponent(search) : "") + ".json";
}
function normalizeChunks(chunks) {
	const result = [];
	for (const _chunk of chunks) {
		const chunk = _chunk?.trim();
		if (chunk) result.push(chunk);
	}
	return result;
}
function joinTags(tags) {
	return tags.join("");
}
function joinAttrs(chunks) {
	if (chunks.length === 0) return "";
	return " " + chunks.join(" ");
}
function renderHTMLDocument(html) {
	return `<!DOCTYPE html><html${joinAttrs(html.htmlAttrs)}><head>${joinTags(html.head)}</head><body${joinAttrs(html.bodyAttrs)}>${joinTags(html.bodyPrepend)}${joinTags(html.body)}${joinTags(html.bodyAppend)}</body></html>`;
}
function stripInlineOnlyPayloadFields(payload) {
	if (!payload.prefetchLinks) return payload;
	const { prefetchLinks: _, ...rest } = payload;
	return rest;
}

const renderer = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: handler
}, Symbol.toStringTag, { value: 'Module' }));
//# sourceMappingURL=index.mjs.map
