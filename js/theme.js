/* ============================================================
   THEME — tema claro/oscuro (botón + preferencia del sistema)
   ============================================================ */
"use strict";

Portfolio.Theme = class {
  constructor() {
    this.utils = Portfolio.utils;
    this.root = document.documentElement;
    this.toggle = this.utils.$("#theme-toggle");
    this.schemeMq = window.matchMedia("(prefers-color-scheme: dark)");
  }

  readStored() {
    try {
      const t = localStorage.getItem("theme");
      return t === "dark" || t === "light" ? t : "";
    } catch (e) {
      return ""; // almacenamiento bloqueado (modo privado/iframe)
    }
  }

  writeStored(t) {
    try {
      localStorage.setItem("theme", t);
    } catch (e) {
      /* el tema no persiste, pero sí se aplica en la sesión */
    }
  }

  getSystem() {
    return this.schemeMq.matches ? "dark" : "light";
  }

  applyTheme(t) {
    this.root.dataset.theme = t;
    this.root.style.colorScheme = t;
    if (this.toggle) {
      this.toggle.setAttribute("aria-pressed", String(t === "dark"));
    }
  }

  init() {
    this.applyTheme(this.readStored() || this.getSystem());

    if (this.toggle) {
      this.toggle.addEventListener("click", () => {
        const next = this.root.dataset.theme === "dark" ? "light" : "dark";
        this.applyTheme(next);
        this.writeStored(next);
      });
    }

    const onSchemeChange = (e) => {
      if (!this.readStored()) this.applyTheme(e.matches ? "dark" : "light");
    };
    if (this.schemeMq.addEventListener) {
      this.schemeMq.addEventListener("change", onSchemeChange);
    } else if (this.schemeMq.addListener) {
      this.schemeMq.addListener(onSchemeChange);
    }
  }
};