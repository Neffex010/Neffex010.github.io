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

  setupCopyEmail() {
    const btn = this.utils.$("#copy-email");
    if (!btn) return;

    const email = btn.dataset.copy || "";
    const original = btn.textContent.trim();
    let resetTimer = 0;

    btn.addEventListener("click", async () => {
      const copied = await this.copyText(email);
      clearTimeout(resetTimer);

      if (copied) {
        btn.textContent = "¡Copiado!";
        btn.classList.add("is-copied");
      } else {
        // Último recurso: deja el correo seleccionado para Ctrl+C.
        const link = this.utils.$(".contact__email");
        if (link) {
          const range = document.createRange();
          range.selectNodeContents(link);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
        btn.textContent = "Correo seleccionado: Ctrl+C";
      }

      resetTimer = setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove("is-copied");
      }, 2200);
    });
  }

  /* Clipboard API y, si no está disponible (file://, HTTP, permisos),
     fallback clásico con textarea + execCommand. */
  async copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
        /* continúa al fallback */
      }
    }

    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.top = "-1000px";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    field.setSelectionRange(0, text.length);

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (e) {
      copied = false;
    }

    field.remove();
    return copied;
  }

  init() {
    if (!this.form || !this.status) return;
    this.setupCopyEmail();
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