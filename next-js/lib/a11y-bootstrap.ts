import {
  CONTRAST_CSS,
  FONT_SIZES,
  LEGACY_STORAGE_KEY,
  MOTION_KILL_CSS,
  STORAGE_KEY,
  STYLE_ID,
} from "@/lib/a11y-settings";

/* Inline, nonce'd script rendered in <head> by the root layout so the first
 * painted frame already has the visitor's text size / contrast / motion
 * settings (openspec next-accessibility § Persisted before paint). Mirrors
 * lib/a11y-settings.ts `loadSettings` + `applySettings`; the unit test runs it
 * against jsdom to keep the two in step. Plain ES5-ish, no external refs. */
export const A11Y_BOOTSTRAP_SCRIPT = [
  "(function(){",
  "try{",
  `var K=${JSON.stringify(STORAGE_KEY)},L=${JSON.stringify(LEGACY_STORAGE_KEY)},S=${JSON.stringify(STYLE_ID)};`,
  `var F=${JSON.stringify(FONT_SIZES)};`,
  "var d=document,h=d.documentElement,raw=null;",
  "try{raw=localStorage.getItem(K);if(!raw){var lg=localStorage.getItem(L);if(lg){localStorage.setItem(K,lg);localStorage.removeItem(L);raw=lg;}}}catch(e){}",
  "var s={textSize:'default',highContrast:false,reduceMotion:false};",
  "if(raw){try{var p=JSON.parse(raw);if(p&&typeof p==='object'){if(F[p.textSize])s.textSize=p.textSize;if(typeof p.highContrast==='boolean')s.highContrast=p.highContrast;if(typeof p.reduceMotion==='boolean')s.reduceMotion=p.reduceMotion;}}catch(e){}}",
  "var prm=false;try{prm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}",
  "var reduce=s.reduceMotion||prm;",
  "h.style.fontSize=F[s.textSize];h.setAttribute('data-text-size',s.textSize);h.setAttribute('data-motion',reduce?'reduce':'auto');",
  "var el=d.getElementById(S);if(!el){el=d.createElement('style');el.id=S;d.head.appendChild(el);}",
  `el.textContent=(reduce?${JSON.stringify(MOTION_KILL_CSS)}:'')+(s.highContrast?${JSON.stringify(CONTRAST_CSS)}:'');`,
  "if(s.highContrast){h.classList.add('a11y-contrast');}else{h.classList.remove('a11y-contrast');}",
  "}catch(e){}",
  "})();",
].join("");
