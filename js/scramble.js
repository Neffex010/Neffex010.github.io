/* ============================================================
   SCRAMBLE — "text scramble" al pasar el puntero
   ------------------------------------------------------------
   - Solo toca el PRIMER nodo de texto del elemento (los <span>
     internos, como la flecha de los botones, quedan intactos).
   - Solo puntero fino + desktop + sin reduced motion.
   - Usa Portfolio.ticker (el único rAF del sitio).
   ============================================================ */
"use strict";

Portfolio.Scramble = class {
  constructor() {
    this.utils = Portfolio.utils;
    this.config = Portfolio.config;
    this.chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=?";
  }

  target(el) {
    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim())
        return node;
    }
    return null;
  }

  run(node) {
    const original = node.nodeValue;
    const total = original.length + 8;
    const frameTime = 0.045; // s por paso
    let acc = 0;
    let iter = 0;

    const tick = (dt) => {
      acc += dt;
      if (acc < frameTime) return;
      acc = 0;
      iter++;

      const revealed = Math.max(0, iter - 6);
      let out = "";
      for (let i = 0; i < original.length; i++) {
        const ch = original[i];
        if (ch === " ") {
          out += " ";
        } else if (i < revealed) {
          out += ch;
        } else {
          out += this.chars[(Math.random() * this.chars.length) | 0];
        }
      }
      node.nodeValue = out;

      if (iter >= total) {
        node.nodeValue = original;
        Portfolio.ticker.remove(tick);
      }
    };

    Portfolio.ticker.add(tick);
  }

  init() {
    if (this.config.reducedMotion || !this.config.fine.matches) return;

    this.utils.$$(".nav__link, .btn").forEach((el) => {
      const node = this.target(el);
      if (!node) return;

      el.addEventListener("pointerenter", () => {
        if (el.dataset.scrambling === "1") return;
        el.dataset.scrambling = "1";
        const clear = () => {
          delete el.dataset.scrambling;
          el.removeEventListener("pointerleave", clear);
        };
        el.addEventListener("pointerleave", clear);
        this.run(node);
      });
    });
  }
};
