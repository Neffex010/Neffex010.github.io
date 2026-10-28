/* ============================================================
   CORE — namespace, config, utils y ticker único
   ------------------------------------------------------------
   - window.Portfolio: espacio de nombres compartido por todos
     los módulos (tema, nav, smooth, reveals, etc.).
   - Portfolio.config: reducedMotion + media queries desktop/fine.
   - Portfolio.utils: $, $$, clamp, rafThrottle y detección de
     background-clip:text para el scrub de títulos.
   - Portfolio.ticker: el ÚNICO requestAnimationFrame del sitio.
   - Portfolio.willChangeObserver: will-change temporal (solo cerca
     del viewport, cero reservas eternas de GPU).
   ============================================================ */
"use strict";

window.Portfolio = window.Portfolio || {};

Portfolio.utils = (() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const rafThrottle = (fn) => {
    let queued = false;
    return (...args) => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        fn(...args);
      });
    };
  };
  const supportsBgClipText = () =>
    typeof window.CSS !== "undefined" &&
    typeof window.CSS.supports === "function" &&
    (window.CSS.supports("background-clip", "text") ||
      window.CSS.supports("-webkit-background-clip", "text")) &&
    (window.CSS.supports("-webkit-text-fill-color", "transparent") ||
      window.CSS.supports("text-fill-color", "transparent"));
  return { $, $$, clamp, rafThrottle, supportsBgClipText };
})();

Portfolio.config = (() => {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const desktop = window.matchMedia("(min-width: 768px)");
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  return { reducedMotion, desktop, fine };
})();

Portfolio.ticker = (() => {
  const fns = new Set();
  let running = false;
  let rafId = 0;

  function start() {
    if (running) return;
    running = true;
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      fns.forEach((fn) => fn(dt));
      if (running) rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  return {
    add(fn) {
      fns.add(fn);
      start();
    },
    start,
    stop,
  };
})();

/* Cancela todo el rAF al ocultar la pestaña (background) y lo
   reanuda al volver: sin trabajo de animación invisible. */
document.addEventListener("visibilitychange", () => {
  if (document.hidden) Portfolio.ticker.stop();
  else Portfolio.ticker.start();
});

Portfolio.willChangeObserver = (() => {
  if (typeof IntersectionObserver === "undefined") return null;
  return new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        e.target.style.willChange = e.isIntersecting ? "transform" : "";
      });
    },
    { rootMargin: "20% 0px" }
  );
})();
