/* ============================================================
   TEXT SPLIT + SCRUB — palabras con máscara y "encendido" por scroll
   ------------------------------------------------------------
   - split(el): envuelve cada palabra (<span.split-word><inner>).
   - Los inner de [data-scrub] con soporte se registran en
     scrubList; el frame de scrub pinta --f palabra por palabra
     (ola de color que recorre el título según el scroll).
   - Soporta reduced motion y navegadores sin background-clip:text.
   ============================================================ */
"use strict";

Portfolio.TextSplit = class {
  constructor() {
    this.utils = Portfolio.utils;
    this.config = Portfolio.config;
    this.scrubOK =
      !this.config.reducedMotion && this.utils.supportsBgClipText();
    this.scrubList = [];
  }

  split(el) {
    const { $$ } = this.utils;
    if (el.dataset.split || this.config.reducedMotion) return;
    el.dataset.split = "1";

    const text = el.textContent.trim();
    if (!text) return;
    el.setAttribute("aria-label", text);

    const words = text.split(/\s+/);
    const frag = document.createDocumentFragment();

    words.forEach((word, i) => {
      if (i) frag.appendChild(document.createTextNode(" "));
      const wrap = document.createElement("span");
      wrap.className = "split-word";
      wrap.style.setProperty("--d", `${(i * 0.055).toFixed(3)}s`);
      const inner = document.createElement("span");
      inner.className = "split-word-i";
      inner.setAttribute("aria-hidden", "true");
      inner.textContent = word;
      if (el.hasAttribute("data-scrub") && this.scrubOK) {
        inner.classList.add("scrub-word");
      }
      wrap.appendChild(inner);
      frag.appendChild(wrap);
    });

    el.textContent = "";
    el.appendChild(frag);

    if (el.hasAttribute("data-scrub") && this.scrubOK) {
      this.scrubList.push({ el, words: $$(".scrub-word", el) });
      if (this.scrubList.length === 1) {
        // El ticker arranca cuando el primer título con scrub se divide.
        Portfolio.ticker.add((dt) => this.scrubFrame(dt));
      }
    }

    const show = () => el.classList.add("is-split");
    requestAnimationFrame(() => requestAnimationFrame(show));
    // Red de seguridad: si un rAF se pierde (tab en background,
    // throttling), las palabras nunca quedan ocultas más de 1.2s.
    setTimeout(show, 1200);
  }

  scrubFrame(dt) {
    if (!this.scrubList.length) return;
    const { clamp } = this.utils;
    const vh = window.innerHeight;

    for (let k = 0; k < this.scrubList.length; k++) {
      const it = this.scrubList[k];
      const r = it.el.getBoundingClientRect();
      const c = r.top + r.height / 2;
      // 0 = justo entrando por abajo, 1 = ya pasó el centro.
      const p = clamp((1 - c / vh) / 0.65, 0, 1);
      const n = it.words.length || 1;
      for (let i = 0; i < it.words.length; i++) {
        const f = clamp((p * n - i) / 0.7, 0, 1);
        it.words[i].style.setProperty("--f", (f * 100).toFixed(1) + "%");
      }
    }
  }
};