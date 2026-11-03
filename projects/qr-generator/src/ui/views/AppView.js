import { el } from '../../utils/dom.js';

const ICON_SUN =
  '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>';
const ICON_MOON = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
const ICON_SCAN =
  '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M3 8v8M7 12h10M21 8v8"/>';

function svgIcon(inner) {
  return el('svg', {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '1.8',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
    html: inner,
  });
}

export class AppView {
  constructor() {
    this.formSlot = el('div', { class: 'slot' });
    this.previewSlot = el('div', { class: 'slot' });
    this.historySlot = el('div', { class: 'slot' });

    this.themeBtn = this.#buildThemeBtn();
    this.readBtn = this.#buildReadBtn();
    this.cameraBtn = el('button', { type: 'button', class: 'header-btn header-btn--camera', 'aria-label': 'Escanear QR con la cámara', title: 'Escanear QR con la cámara' }, 'Escanear');
    this.scannerDialog = el('dialog', { class: 'scanner-dialog', 'aria-labelledby': 'scanner-title' }, [
      el('div', { class: 'scanner-dialog__header' }, [
        el('div', {}, [el('h2', { id: 'scanner-title' }, 'Escanear código QR'), el('p', {}, 'Apunta la cámara al código para leerlo.')]),
        el('button', { type: 'button', class: 'scanner-dialog__close', 'aria-label': 'Cerrar escáner' }, '×'),
      ]),
      el('div', { class: 'scanner-dialog__video-wrap' }, [
        el('video', { class: 'scanner-dialog__video', autoplay: true, muted: true, playsinline: true, 'aria-label': 'Vista de la cámara' }),
        el('div', { class: 'scanner-dialog__aim', 'aria-hidden': 'true' }),
      ]),
      el('p', { class: 'scanner-dialog__status', 'aria-live': 'polite' }, 'Solicitando acceso a la cámara…'),
    ]);

    this.resetBtn = el('button', { type: 'button', class: 'panel__reset', title: 'Restablecer ajustes' }, 'Reiniciar');
  }

  #buildThemeBtn() {
    const btn = el('button', { type: 'button', class: 'header-btn header-btn--theme', 'aria-label': 'Cambiar tema', title: 'Cambiar tema' }, [
      el('span', { class: 'header-btn__sun' }, svgIcon(ICON_SUN)),
      el('span', { class: 'header-btn__moon' }, svgIcon(ICON_MOON)),
      el('span', { class: 'header-btn__text' }, 'Tema'),
    ]);
    return btn;
  }

  #buildReadBtn() {
    const btn = el('button', { type: 'button', class: 'header-btn header-btn--scan', 'aria-label': 'Leer un código QR desde una imagen', title: 'Leer QR desde una imagen' }, [
      el('span', { class: 'header-btn__icon' }, svgIcon(ICON_SCAN)),
      el('span', { class: 'header-btn__text' }, 'Leer QR'),
    ]);
    return btn;
  }

  mount(root) {
    root.append(
      el('header', { class: 'app-header' }, [
        el('div', { class: 'app-header__brand' }, [
          el('span', { class: 'app-header__logo', 'aria-hidden': 'true', title: 'QR' }),
          el('div', { class: 'app-header__titles' }, [
            el('h1', { class: 'app-header__title' }, [el('span', {}, 'Generador '), el('span', { class: 'app-header__title-accent' }, 'QR')]),
            el('p', { class: 'app-header__subtitle' }, 'Genera, personaliza y descarga. Todo en tu navegador.'),
          ]),
        ]),
        el('div', { class: 'app-header__actions' }, [
          this.cameraBtn,
          this.readBtn,
          this.themeBtn,
          el('span', { class: 'app-header__chip' }, 'En vivo'),
        ]),
      ]),
      el('main', { class: 'app-main' }, [
        el('section', { class: 'panel panel--form' }, [
          el('div', { class: 'panel__heading' }, [
            el('h2', { class: 'panel__title' }, 'Diseña tu QR'),
            this.resetBtn,
          ]),
          this.formSlot,
        ]),
        el('section', { class: 'panel panel--preview' }, [
          el('h2', { class: 'panel__title' }, 'Vista previa'),
          this.previewSlot,
        ]),
      ]),
      el('aside', { class: 'app-history' }, [this.historySlot]),
      el('footer', { class: 'app-footer' }, [
        el('span', {}, 'Generador QR · hecho con '),
        el('strong', {}, 'Vite, qrcode y jsQR'),
      ]),
      this.scannerDialog,
    );
    this.scannerDialog.querySelector('.scanner-dialog__close').addEventListener('click', () => this.scannerDialog.close());
    this.scannerDialog.addEventListener('click', (event) => {
      if (event.target === this.scannerDialog) this.scannerDialog.close();
    });
  }
}
