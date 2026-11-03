import { el, clearChildren } from '../../utils/dom.js';
import { CONTENT_TYPE_LABELS, formatBy, MODULE_STYLES } from '../../utils/constants.js';

export class QRPreview {
  #onDownload;
  #onCopy;
  #onPrint;
  #onCopyContent;
  #status;
  #meta;
  #loader;
  #downloadBtn;
  #copyBtn;
  #copyContentBtn;
  #printBtn;
  #format = 'png';
  #copyTimer = null;

  constructor({ onDownload, onCopy, onCopyContent, onPrint }) {
    this.#onDownload = onDownload;
    this.#onCopy = onCopy;
    this.#onPrint = onPrint;
    this.#onCopyContent = onCopyContent;

    this.canvas = el('canvas', { class: 'preview-canvas', width: '0', height: '0', 'aria-label': 'Vista previa del código QR' });
    this.#status = el('div', { class: 'preview-status', hidden: true, 'aria-live': 'polite' });
    this.#loader = el('div', { class: 'preview-loader', hidden: true }, [
      el('span', { class: 'spinner' }),
      el('span', {}, 'Generando QR…'),
    ]);

    this.#downloadBtn = el('button', { class: 'btn btn--primary btn--download', title: 'Descargar imagen', onclick: () => this.#handleDownload() }, 'Descargar PNG');
    this.#copyBtn = el('button', { class: 'btn btn--soft', title: 'Copiar la imagen del QR al portapapeles', onclick: () => this.#handleCopy() }, 'Copiar');
    this.#copyContentBtn = el('button', { class: 'btn btn--soft', title: 'Copiar el contenido codificado' }, 'Copiar texto');
    this.#copyContentBtn.addEventListener('click', () => this.#onCopyContent());
    this.#printBtn = el('button', { class: 'btn btn--secondary', title: 'Imprimir el QR', onclick: () => this.#handlePrint() }, 'Imprimir');

    this.#meta = el('div', { class: 'preview-meta' });
  }

  mount(container) {
    const downloadBar = el('div', { class: 'preview-downloads' }, [
      el('span', { class: 'preview-label' }, 'Acciones'),
      this.#downloadBtn,
      this.#copyBtn,
      this.#copyContentBtn,
      this.#printBtn,
    ]);

    container.append(
      el('div', { class: 'preview-box' }, [
        el('div', { class: 'preview-stage' }, [this.#loader, this.#status, this.canvas]),
        this.#meta,
        downloadBar,
      ]),
    );
  }

  setFormat(format) {
    const spec = formatBy(format);
    this.#format = spec.id;
    this.#downloadBtn.textContent = `Descargar ${spec.label}`;
    this.#downloadBtn.title = `Descargar imagen ${spec.label}`;
  }

  setLoading() {
    this.#loader.hidden = false;
    this.#status.hidden = true;
    this.canvas.hidden = true;
    this.#disableActions(true);
  }

  setReady(config, type = 'text') {
    this.#loader.hidden = true;
    this.#status.hidden = true;
    this.canvas.hidden = false;
    this.#setMeta(config, type);
    this.#disableActions(false);
  }

  setError(message) {
    this.#loader.hidden = true;
    this.canvas.hidden = true;
    this.#setStatus(message, 'preview-status--error', true);
    this.#disableActions(true);
  }

  #setMeta(config, type) {
    clearChildren(this.#meta);
    const label = CONTENT_TYPE_LABELS[type] || 'Texto';
    const styleLabel = MODULE_STYLES[config.moduleStyle] || 'Cuadrado';
    const items = [
      label,
      `${config.size} × ${config.size}px`,
      `Nivel ${config.errorCorrectionLevel}`,
      `Margen ${config.margin}`,
      styleLabel,
    ];
    items.forEach((text, index) => {
      if (index > 0) this.#meta.append(el('span', { class: 'preview-meta-sep' }, '·'));
      this.#meta.append(el('span', { class: 'preview-meta-item' }, text));
    });
  }

  #setStatus(message, className, visible) {
    this.#status.className = `preview-status ${className}`;
    this.#status.textContent = message;
    this.#status.hidden = !visible;
  }

  #disableActions(disabled) {
    [this.#downloadBtn, this.#copyBtn, this.#copyContentBtn, this.#printBtn].forEach((btn) => {
      btn.disabled = disabled;
    });
  }

  #handleDownload() {
    this.#onDownload(this.#format);
  }

  async #handleCopy() {
    const copied = await this.#onCopy();
    if (!copied) return;
    clearTimeout(this.#copyTimer);
    this.#copyBtn.textContent = '¡Copiado!';
    this.#copyTimer = setTimeout(() => {
      this.#copyBtn.textContent = 'Copiar';
    }, 1600);
  }

  #handlePrint() {
    this.#onPrint();
  }
}
