/* ============================================================
   CURSOR — personalizado + magnético
   ------------------------------------------------------------
   - Dot sigue rápido, ring con estela; los targets magnéticos
     se atraen hacia el puntero y agrandan el anillo.
   - Solo puntero fino + desktop + sin reduced motion.
   ============================================================ */
"use strict";

Portfolio.Cursor = class {
  constructor() {
    this.utils = Portfolio.utils;
    this.config = Portfolio.config;
    this.body = document.body;
    this.magnetic = this.utils
      .$$(".btn:not(.is-disabled), .nav__link, .social__link, .footer__top")
      .map((el) => ({ el, on: false }));
    this.x = -100;
    this.y = -100;
    this.dx = this.x;
    this.dy = this.y;
    this.rx = this.x;
    this.ry = this.y;
    this.visible = false;
    this.overCard = false;
    this.ringScale = 1;
  }

  // Devuelve los elementos magnéticos a su estado base. Sin esto, al
  // salir de la ventana (o cambiar de pestaña) el último transform
  // inline se queda aplicado y el texto no vuelve a la normalidad.
  resetMagnets() {
    this.magnetic.forEach((m) => {
      if (!m.on && !m.el.style.transform) return;
      m.on = false;
      m.el.style.transform = "";
    });
    this.overCard = false;
    this.ringScale = 1;
    this.body.classList.remove("is-over-card");
  }

  frame(dt) {
    if (
      !this.config.desktop.matches ||
      !this.config.fine.matches ||
      this.config.reducedMotion
    ) {
      this.resetMagnets();
      this.body.classList.remove("has-cursor", "has-cursor-visible");
      return;
    }

    // Nunca ocultamos el cursor nativo salvo que el personalizado
    // ya sea visible (primera posición conocida del puntero).
    if (!this.visible) {
      this.resetMagnets();
      this.body.classList.remove("has-cursor");
      return;
    }
    this.body.classList.add("has-cursor");

    const kd = 1 - Math.exp(-35 * dt); // dot: rápido
    const kr = 1 - Math.exp(-14 * dt); // ring: estela
    this.dx += (this.x - this.dx) * kd;
    this.dy += (this.y - this.dy) * kd;
    this.rx += (this.x - this.rx) * kr;
    this.ry += (this.y - this.ry) * kr;

    this.dot.style.transform = `translate(${this.dx.toFixed(1)}px, ${this.dy.toFixed(1)}px) translate(-50%, -50%)`;
    this.ring.style.transform = `translate(${this.rx.toFixed(1)}px, ${this.ry.toFixed(1)}px) translate(-50%, -50%) scale(${this.ringScale.toFixed(3)})`;
    this.label.style.transform = `translate(${this.dx.toFixed(1)}px, ${this.dy.toFixed(1)}px) translate(-50%, -50%)`;

    this.body.classList.toggle("is-over-card", this.overCard);

    let near = false;
    this.magnetic.forEach((m) => {
      // Solo se magnetiza el elemento bajo el puntero. Antes, un enlace
      // vecino seguía desplazado aunque ya no estuviera hovered, y su
      // texto no volvía a la normalidad al pasar a otro enlace.
      if (!m.el.matches(":hover")) {
        if (m.on) {
          m.on = false;
          m.el.style.transform = "";
        }
        return;
      }

      const r = m.el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dist = Math.hypot(this.x - cx, this.y - cy);
      const radius = Math.max(r.width, r.height) + 90;
      const pull = this.utils.clamp(1 - dist / radius, 0, 1);

      near = true;
      m.on = true;
      // Atracción hacia el puntero (no repulsión): el elemento sigue
      // al cursor y al salir vuelve solo por la transición CSS.
      m.el.style.transform = `translate(${((this.x - cx) * pull * 0.18).toFixed(1)}px, ${((this.y - cy) * pull * 0.18).toFixed(1)}px) scale(${(1 + pull * 0.03).toFixed(3)})`;
    });

    this.ringScale += ((near ? 1.7 : 1) - this.ringScale) * (1 - Math.exp(-10 * dt));
    if (!near && this.ringScale < 1.02) this.ringScale = 1;
  }

  init() {
    if (this.config.reducedMotion || !this.config.fine.matches) return;

    this.dot = document.createElement("div");
    this.dot.className = "cursor-dot";
    this.dot.setAttribute("aria-hidden", "true");
    this.ring = document.createElement("div");
    this.ring.className = "cursor-ring";
    this.ring.setAttribute("aria-hidden", "true");
    this.label = document.createElement("div");
    this.label.className = "cursor-label";
    this.label.setAttribute("aria-hidden", "true");
    this.label.textContent = "VER";
    this.body.append(this.dot, this.ring, this.label);

    // Estado "VER" sobre las tarjetas de proyecto.
    this.utils.$$(".project-card").forEach((card) => {
      card.addEventListener("pointerenter", () => {
        this.overCard = true;
      });
      card.addEventListener("pointerleave", () => {
        this.overCard = false;
      });
    });

    window.addEventListener(
      "pointermove",
      (e) => {
        this.x = e.clientX;
        this.y = e.clientY;
        this.visible = true;
        this.body.classList.add("has-cursor-visible");
      },
      { passive: true }
    );

    // Salida/entrada real de la ventana (más fiable que mouseleave).
    window.addEventListener(
      "pointerout",
      (e) => {
        if (!e.relatedTarget) {
          this.visible = false;
          this.resetMagnets();
          this.body.classList.remove("has-cursor-visible");
        }
      },
      { passive: true }
    );

    // Cambio de pestaña/ventana: mismo reset para que ningún texto
    // quede escalado o desplazado al volver.
    window.addEventListener("blur", () => {
      this.visible = false;
      this.resetMagnets();
      this.body.classList.remove("has-cursor", "has-cursor-visible");
    });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) return;
      this.visible = false;
      this.resetMagnets();
      this.body.classList.remove("has-cursor", "has-cursor-visible");
    });
    window.addEventListener(
      "pointerover",
      (e) => {
        if (!e.relatedTarget) {
          this.visible = true;
          this.body.classList.add("has-cursor-visible");
        }
      },
      { passive: true }
    );

    Portfolio.ticker.add((dt) => this.frame(dt));
  }
};