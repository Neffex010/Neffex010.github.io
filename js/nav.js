/* ============================================================
   NAV — menú, anclas suaves, scroll-spy, header compacto,
   año del footer e imágenes rotas
   ============================================================ */
"use strict";

Portfolio.Nav = class {
  constructor({ smooth = null } = {}) {
    this.utils = Portfolio.utils;
    this.smooth = smooth;
    const { $, $$ } = this.utils;
    this.body = document.body;
    this.header = $(".header");
    this.navToggle = $("#nav-toggle");
    this.navMenu = $("#nav-menu");
    this.yearEl = $("#year");
    this.navLinks = $$(".nav__link");
    this.spySections = $$("main section[id]");
    this._updateHeader = this.utils.rafThrottle(() => this.updateHeader());
  }

  closeMenu() {
    if (this.navMenu) this.navMenu.classList.remove("is-open");
    if (this.navToggle) {
      this.navToggle.setAttribute("aria-expanded", "false");
      this.navToggle.setAttribute("aria-label", "Abrir menú");
    }
  }

  /* Desplaza a un hash respetando la altura del header. */
  scrollToHash(hash) {
    if (!hash || hash === "#") return;
    const target = this.utils.$(hash);
    if (!target) return;
    const offset = this.header ? this.header.offsetHeight : 64;
    const top =
      target.getBoundingClientRect().top + window.pageYOffset - offset;
    if (this.smooth) this.smooth.goto(top);
    else window.scrollTo({ top, behavior: "smooth" });
  }

  /* Anclas: usan el motor de smooth, o scroll nativo. */
  setupAnchors() {
    this.utils.$$('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        if (!link.hash || link.hash === "#") {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        const target = this.utils.$(link.hash);
        if (!target) return;
        this.scrollToHash(link.hash);
        this.closeMenu();
        // Mantiene la URL en sincronía: enlace directo y botón atrás.
        if (window.location.hash !== link.hash) {
          try {
            history.pushState(null, "", link.hash);
          } catch (e) {
            /* file:// o restricciones del navegador: se ignora */
          }
        }
      });
    });
  }

  /* Atrás/adelante: el navegador cambia el hash pero no scrollea solo. */
  setupHistory() {
    window.addEventListener("popstate", () => {
      if (window.location.hash) this.scrollToHash(window.location.hash);
    });
  }

  setupMenu() {
    if (!this.navToggle || !this.navMenu) return;
    this.navToggle.addEventListener("click", () => {
      const open = !this.navMenu.classList.contains("is-open");
      this.navMenu.classList.toggle("is-open", open);
      this.navToggle.setAttribute("aria-expanded", String(open));
      this.navToggle.setAttribute(
        "aria-label",
        open ? "Cerrar menú" : "Abrir menú"
      );
    });
    document.addEventListener("click", (event) => {
      if (
        this.navMenu.classList.contains("is-open") &&
        !this.navMenu.contains(event.target) &&
        !this.navToggle.contains(event.target)
      ) {
        this.closeMenu();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.navMenu.classList.contains("is-open")) {
        this.closeMenu();
        this.navToggle.focus();
      }
    });
  }

  setActiveLink(id) {
    this.navLinks.forEach((l) => {
      const on = l.hash === `#${id}`;
      l.classList.toggle("is-active", on);
      if (on) l.setAttribute("aria-current", "true");
      else l.removeAttribute("aria-current");
    });
  }

  setupScrollSpy() {
    if (typeof IntersectionObserver !== "undefined" && this.spySections.length) {
      const spy = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) this.setActiveLink(entry.target.id);
          });
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
      );
      this.spySections.forEach((s) => spy.observe(s));
    } else if (this.spySections.length) {
      // Fallback: la última sección cuyo top pasa la mitad.
      const pick = () => {
        let id = this.spySections[0].id;
        this.spySections.forEach((s) => {
          if (s.getBoundingClientRect().top <= window.innerHeight * 0.5) {
            id = s.id;
          }
        });
        this.setActiveLink(id);
      };
      window.addEventListener("scroll", this.utils.rafThrottle(pick), {
        passive: true,
      });
      pick();
    }
  }

  updateHeader() {
    this.body.classList.toggle("is-scrolled", window.scrollY > 12);
  }

  /* Imágenes faltantes → panel limpio, sin icono roto. */
  setupBrokenImages() {
    const mark = (img) => {
      img.classList.add("is-broken");
      const holder = img.closest(".project-card__img");
      if (holder) holder.classList.add("is-broken");
    };
    this.utils.$$("img").forEach((img) => {
      // Si ya falló antes de que corriera el JS (caché/red), el evento
      // "error" no vuelve a dispararse: se detecta por dimensiones.
      if (img.complete && img.naturalWidth === 0) mark(img);
      else img.addEventListener("error", () => mark(img), { once: true });
    });
  }

  init() {
    if (this.yearEl) this.yearEl.textContent = new Date().getFullYear();
    this.setupAnchors();
    this.setupHistory();
    this.setupMenu();
    this.setupScrollSpy();
    this.setupBrokenImages();
    window.addEventListener("scroll", this._updateHeader, { passive: true });
    this.updateHeader();
  }
};
