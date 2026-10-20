/* ============================================================
   SMOOTH SCROLL — tween de window.scrollTo con lerp en rAF
   ------------------------------------------------------------
   - Tweenea window.scrollTo: no desestructura layout, el sticky
     y los fixed siguen funcionando.
   - Solo desktop + puntero fino + sin reduced motion.
   - Expone goto(top) para las anclas y la propiedad skew
     (radianes→grados) que usa el scale del hero.
   ============================================================ */
"use strict";

Portfolio.SmoothScroll = class {
  constructor() {
    this.utils = Portfolio.utils;
    this.config = Portfolio.config;
    this.html = document.documentElement;
    this.state = {
      current: window.scrollY,
      target: window.scrollY,
      moving: false,
      skew: 0,
    };
    this._wheel = (e) => this.onWheel(e);
    this._key = (e) => this.onKey(e);
    this._resize = () => this.onResize();
  }

  enabled() {
    return (
      !this.config.reducedMotion &&
      this.config.desktop.matches &&
      this.config.fine.matches
    );
  }

  adopt() {
    const y = window.scrollY;
    this.state.current = y;
    this.state.target = y;
    this.state.moving = false;
    this.state.skew = 0;
  }

  onWheel(e) {
    if (!this.enabled() || e.ctrlKey) return; // ctrl+wheel = zoom
    // No secuestramos el scroll en campos editables ni en
    // contenedores con scroll propio (formulario, etc.).
    const target = e.target;
    if (
      target &&
      target.closest &&
      target.closest(
        "textarea, input, select, [contenteditable], [data-native-scroll]"
      )
    ) {
      return;
    }
    e.preventDefault();
    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 16;
    else if (e.deltaMode === 2) delta *= window.innerHeight;
    const max = this.html.scrollHeight - window.innerHeight;
    this.state.target = this.utils.clamp(this.state.target + delta, 0, max);
    this.state.moving = true;
  }

  onKey(e) {
    // Salto de teclado (espacio, PageUp/Down, Home, End): adoptamos.
    const NAVKEYS = new Set([" ", "PageUp", "PageDown", "Home", "End"]);
    if (!this.enabled() || !NAVKEYS.has(e.key)) return;
    requestAnimationFrame(() => requestAnimationFrame(() => this.adopt()));
  }

  onResize() {
    const max = this.html.scrollHeight - window.innerHeight;
    this.state.target = this.utils.clamp(this.state.target, 0, max);
    this.state.current = this.utils.clamp(this.state.current, 0, max);
  }

  frame(dt) {
    if (!this.enabled()) {
      this.html.classList.remove("js-smooth");
      return;
    }
    this.html.classList.add("js-smooth");

    const y = window.scrollY;

    if (!this.state.moving) {
      // scrollbar/touch externo
      if (Math.abs(y - this.state.current) > 2) this.adopt();
      this.state.skew = 0;
      return;
    }

    // Interacción externa durante el tween: cedemos el control.
    if (Math.abs(y - this.state.current) > 60) {
      this.adopt();
      return;
    }

    // lerp frame-rate independent
    const k = 1 - Math.exp(-5 * dt);
    this.state.current += (this.state.target - this.state.current) * k;
    const v = (this.state.current - y) / Math.max(dt, 0.001);

    if (Math.abs(this.state.target - this.state.current) < 0.4) {
      this.state.current = this.state.target;
      this.state.moving = false;
      this.state.skew = 0;
    } else {
      this.state.skew = this.utils.clamp(v / 2200, -1.2, 1.2); // sutil
    }

    window.scrollTo(0, this.state.current);
  }

  goto(top) {
    this.state.target = this.utils.clamp(
      top,
      0,
      this.html.scrollHeight - window.innerHeight
    );
    this.state.moving = true;
  }

  get skew() {
    return this.state.skew;
  }

  init() {
    window.addEventListener("wheel", this._wheel, { passive: false });
    window.addEventListener("keydown", this._key);
    window.addEventListener("resize", this._resize, { passive: true });
    Portfolio.ticker.add((dt) => this.frame(dt));
  }
};