/* ============================================================
   MARQUEE — cinta infinita de skills
   ------------------------------------------------------------
   Extrae los .skill-tag, arma dos sets (2º en contorno "ghost")
   y lo inserta tras Habilidades. Loop: translateX(-50%).
   ============================================================ */
"use strict";

Portfolio.Marquee = class {
  constructor() {
    this.utils = Portfolio.utils;
    this.config = Portfolio.config;
  }

  init() {
    if (this.config.reducedMotion) return;
    const { $, $$ } = this.utils;
    const tags = $$(".skill-tag")
      .map((t) => t.textContent.trim())
      .filter(Boolean);
    if (tags.length < 3) return;

    const buildSet = () => {
      const set = document.createElement("div");
      set.className = "marquee__set";
      tags.forEach((txt, i) => {
        if (i) {
          const sep = document.createElement("span");
          sep.className = "marquee__sep";
          sep.textContent = "✦";
          set.appendChild(sep);
        }
        const item = document.createElement("span");
        item.className = "marquee__item";
        item.textContent = txt;
        set.appendChild(item);
      });
      return set;
    };

    const buildTrack = (reverse) => {
      const set = buildSet();
      const track = document.createElement("div");
      track.className =
        "marquee__track" + (reverse ? " marquee__track--rev" : "");
      track.appendChild(set);
      track.appendChild(set.cloneNode(true));
      return track;
    };

    const wrap = document.createElement("div");
    wrap.className = "marquee";
    wrap.setAttribute("aria-hidden", "true");
    wrap.appendChild(buildTrack(false));
    wrap.appendChild(buildTrack(true));

    const insertAfter = $("#habilidades") || $("#sobre-mi");
    if (insertAfter) insertAfter.after(wrap);
  }
};