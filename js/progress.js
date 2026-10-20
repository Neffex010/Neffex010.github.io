/* ============================================================
   PROGRESS — barra de progreso de scroll (arriba del viewport)
   Actualización por transform scaleX dentro del ticker único.
   ============================================================ */
"use strict";

Portfolio.ScrollProgress = class {
  constructor() {
    this.utils = Portfolio.utils;
    this.html = document.documentElement;
    this.body = document.body;
  }

  frame() {
    const max = this.html.scrollHeight - window.innerHeight;
    const p = max > 0 ? this.utils.clamp(window.scrollY / max, 0, 1) : 0;
    this.bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
  }

  init() {
    this.bar = document.createElement("div");
    this.bar.className = "scroll-progress";
    this.bar.setAttribute("aria-hidden", "true");
    this.body.appendChild(this.bar);
    Portfolio.ticker.add(() => this.frame());
  }
};