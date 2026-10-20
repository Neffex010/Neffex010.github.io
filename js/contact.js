/* ============================================================
   CONTACT — formulario mailto + feedback accesible
   ============================================================ */
"use strict";

Portfolio.Contact = class {
  constructor() {
    this.utils = Portfolio.utils;
    this.form = this.utils.$(".contact__form");
    this.status = this.utils.$("#form-status");
  }

  show(msg, ok) {
    this.status.textContent = msg;
    this.status.classList.toggle("is-ok", ok);
    this.status.classList.toggle("is-err", !ok);
    this.status.hidden = false;
  }

  init() {
    if (!this.form || !this.status) return;
    this.form.addEventListener("submit", (event) => {
      // La validación nativa (required/type=email) corta antes del submit.
      if (!this.form.reportValidity()) return;
      event.preventDefault();
      const data = new FormData(this.form);
      const to = (this.form.getAttribute("action") || "mailto:")
        .split(":")
        .slice(1)
        .join(":");
      const subject = encodeURIComponent(
        `Portafolio — mensaje de ${data.get("nombre") || "contacto"}`
      );
      const body = encodeURIComponent(
        `Nombre: ${data.get("nombre")}\nEmail: ${data.get("email")}\n\n${data.get("mensaje")}`
      );
      try {
        window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
        this.show(
          "Abriendo tu cliente de correo… el mensaje se enviará desde ahí.",
          true
        );
      } catch (e) {
        this.show(
          "No se pudo abrir el correo. Escríbeme a cabrera.luisenrique008@gmail.com",
          false
        );
      }
    });
  }
};