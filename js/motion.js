/* ============================================================
   MOTION — parallax multi-capa + scale-on-scroll del hero
   ------------------------------------------------------------
   - Parallax: cada capa suaviza su valor con su propio lerp.
   - Scale: [data-scale] crece 0.96→1 al entrar al viewport y
     suma un skewX sutil proporcional a la velocidad del smooth.
   - will-change temporal vía Portfolio.willChangeObserver.
   ============================================================ */
"use strict";

Portfolio.Motion = class {
  constructor({ smooth = null } = {}) {
    this.utils = Portfolio.utils;
    this.config = Portfolio.config;
    this.smooth = smooth;
    this.items = this.utils.$$("[data-parallax]").map((el) => ({
      el,
      factor: parseFloat(el.dataset.parallax) || 0.12,
      pscale: parseFloat(el.dataset.pscale) || 1,
      cur: 0,
    }));
    this.scaleItems = this.utils.$$("[data-scale]");
  }

  parallaxFrame(dt) {
    if (this.config.reducedMotion || !this.config.desktop.matches) return;
    const { clamp } = this.utils;
    const vh = window.innerHeight;
    const mid = vh / 2;
    const k = 1 - Math.exp(-8 * dt);

    // Dos pasadas: leer todas las rect primero y escribir después
    // evita layout thrashing (leer/escribir entremezclados).
    const targets = this.items.map((it) => {
      const r = it.el.getBoundingClientRect();
      const elMid = r.top + r.height / 2;
      return clamp((mid - elMid) * it.factor, -120, 120);
    });

    this.items.forEach((it, i) => {
      it.cur += (targets[i] - it.cur) * k;
      it.el.style.transform = `translateY(${it.cur.toFixed(2)}px) scale(${it.pscale})`;
    });
  }

  scaleFrame(dt) {
    if (this.config.reducedMotion || !this.config.desktop.matches) return;
    const { clamp } = this.utils;
    const vh = window.innerHeight;
    const skew = this.smooth ? this.smooth.skew : 0;

    this.scaleItems.forEach((el) => {
      const r = el.getBoundingClientRect();
      const t = clamp(1 - r.top / (vh * 0.6), 0, 1);
      el.style.transform = `scale(${(0.96 + 0.04 * t).toFixed(4)}) skewX(${skew.toFixed(3)}deg)`;
    });
  }

  init() {
    if (Portfolio.willChangeObserver) {
      this.items.forEach((it) => Portfolio.willChangeObserver.observe(it.el));
      this.scaleItems.forEach((el) => Portfolio.willChangeObserver.observe(el));
    }

    if (this.items.length) {
      Portfolio.ticker.add((dt) => this.parallaxFrame(dt));
    }
    if (this.scaleItems.length) {
      Portfolio.ticker.add((dt) => this.scaleFrame(dt));
    }
  }
};