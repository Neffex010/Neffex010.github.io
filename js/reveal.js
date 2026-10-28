/* ============================================================
   REVEAL — reveals con clip-path + stagger (IntersectionObserver)
   ------------------------------------------------------------
   - Al terminar retira [data-reveal]: los hovers vuelven a sus
     propias transiciones.
   - Los .section__title se dividen (TextSplit) al ser revelados.
   - Red de seguridad: barrido por scroll + revelado total a los 3s.
   ============================================================ */
"use strict";

Portfolio.Reveal = class {
  constructor({ textSplit }) {
    this.utils = Portfolio.utils;
    this.config = Portfolio.config;
    this.textSplit = textSplit;
    this.body = document.body;
  }

  getCandidates() {
    return this.utils.$$(
      ".section__title, .section__text, " +
        ".timeline__item, .project-card, .mini-project, .skill-tag, .form__field, " +
        ".contact__form .btn, .social__link, .footer__top"
    );
  }

  reveal(el) {
    if (el.classList.contains("is-in")) return;
    el.classList.add("is-in");
    if (el.classList.contains("section__title")) this.textSplit.split(el);

    const release = (event) => {
      if (event.target !== el) return;
      if (
        event.propertyName === "clip-path" ||
        event.propertyName === "transform"
      ) {
        el.removeEventListener("transitionend", release);
        el.removeAttribute("data-reveal");
      }
    };
    el.addEventListener("transitionend", release);
  }

  init() {
    if (this.config.reducedMotion) return;

    this.body.classList.add("js-anim");

    this.getCandidates().forEach((el) => el.setAttribute("data-reveal", ""));

    // stagger por grupo (hijos del mismo padre)
    this.utils.$$("[data-reveal]").forEach((el) => {
      const parent = el.parentElement;
      const siblings = parent
        ? Array.from(parent.children).filter((c) => c.matches("[data-reveal]"))
        : [el];
      el.style.setProperty("--i", siblings.indexOf(el));
    });

    const items = this.utils.$$("[data-reveal]");

    if (typeof IntersectionObserver === "undefined") {
      // Fallback total: sin IO el contenido nunca queda oculto.
      items.forEach((el) => this.reveal(el));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          this.reveal(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
    );

    items.forEach((el) => observer.observe(el));

    // RED DE SEGURIDAD: aunque el IO falle, las secciones SIEMPRE
    // aparecen. Barrido por scroll + revelado total a los 3s.
    const sweep = () => {
      const hidden = this.utils.$$("[data-reveal]:not(.is-in)");
      if (!hidden.length) return;
      const vh = window.innerHeight;
      hidden.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) this.reveal(el);
      });
    };
    const sweepThrottled = this.utils.rafThrottle(sweep);

    setTimeout(sweep, 600);
    window.addEventListener("scroll", sweepThrottled, { passive: true });

    // Garantía dura: nada puede permanecer oculto pasados 3s.
    setTimeout(() => {
      this.utils.$$("[data-reveal]:not(.is-in)").forEach((el) => this.reveal(el));
      window.removeEventListener("scroll", sweepThrottled);
    }, 3000);
  }
};
