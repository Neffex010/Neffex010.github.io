import { AppView } from './views/AppView.js';
import { QRForm } from './components/QRForm.js';
import { QRPreview } from './components/QRPreview.js';
import { Toast } from './components/Toast.js';
import { QRValidator } from '../core/QRValidator.js';
import { QRGenerator } from '../core/QRGenerator.js';
import { QRDownloader } from '../core/QRDownloader.js';
import { QRReader } from '../core/QRReader.js';
import { QRConfig } from '../models/QRConfig.js';
import { StorageService } from '../services/StorageService.js';
import { CONTENT_TYPE_LABELS, DEFAULT_CONFIG, formatBy } from '../utils/constants.js';
import { classify } from '../utils/templates.js';
import { clearChildren, el } from '../utils/dom.js';

const RENDER_DELAY = 220;

export class UIManager {
  #form;
  #preview;
  #historySlot;
  #lastConfig = null;
  #renderTimer = null;
  #thumbCache = new Map();
  #readInput = null;
  #renderVersion = 0;
  #cameraStream = null;
  #cameraFrame = null;
  #scanCanvas = document.createElement('canvas');
  #lastScanAt = 0;

  constructor(root) {
    this.view = new AppView();
    this.view.mount(root);

    this.#applyTheme(StorageService.loadTheme());
    this.view.themeBtn.addEventListener('click', () => this.#toggleTheme());
    this.view.readBtn.addEventListener('click', () => this.#readInput?.click());
    this.view.cameraBtn.addEventListener('click', () => this.#startCamera());
    this.view.scannerDialog.addEventListener('close', () => this.#stopCamera());
    this.view.resetBtn.addEventListener('click', () => this.#reset());

    this.#historySlot = this.view.historySlot;

    this.#preview = new QRPreview({
      onDownload: (format) => this.#download(format),
      onCopy: () => this.#copy(),
      onCopyContent: () => this.#copyContent(),
      onPrint: () => this.#print(),
    });
    this.#form = new QRForm((config) => this.#onConfigChange(config));

    this.#form.mount(this.view.formSlot);
    this.#preview.mount(this.view.previewSlot);
    this.#renderHistory();

    this.#setupReadInput();
    this.#setupShortcuts();
    this.#setupPaste();

    const stored = StorageService.loadConfig();
    const initial = stored
      ? new QRConfig(stored)
      : new QRConfig({
          ...DEFAULT_CONFIG,
          type: 'url',
          values: { url: 'https://example.com' },
          data: 'https://example.com',
        });
    this.#form.setConfig(initial);
    this.#render(initial);
  }

  #applyTheme(theme) {
    const safe = theme === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = safe;
    document.documentElement.style.colorScheme = safe;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', safe === 'light' ? '#f3eee3' : '#1c1b18');
    this.view.themeBtn?.setAttribute('aria-pressed', String(safe === 'light'));
    this.view.themeBtn?.classList.toggle('is-light', safe === 'light');
  }

  #toggleTheme() {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    this.#applyTheme(next);
    StorageService.saveTheme(next);
    Toast.show(next === 'light' ? 'Tema claro activado.' : 'Tema oscuro activado.', 'info');
  }

  #setupReadInput() {
    const input = el('input', {
      type: 'file',
      accept: 'image/*',
      hidden: true,
      'aria-label': 'Seleccionar imagen con código QR',
    });
    document.body.append(input);
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (file) await this.#readQRFromFile(file);
      input.value = '';
    });
    this.#readInput = input;
  }

  #setupShortcuts() {
    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        const target = event.target;
        if (target && target.closest('.qr-form')) {
          event.preventDefault();
          this.#cancelPendingRender();
          this.#render(this.#form.getConfig());
        }
      }
    });
  }

  #setupPaste() {
    document.addEventListener('paste', async (event) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            event.preventDefault();
            await this.#readQRFromFile(file);
          }
          return;
        }
      }
    });
  }

  async #readQRFromFile(file) {
    Toast.show('Leyendo imagen…', 'info');
    try {
      const data = await QRReader.decodeFile(file);
      this.#loadDecodedQR(data);
    } catch (error) {
      Toast.show(error.message, 'error');
    }
  }

  #onConfigChange(config) {
    this.#renderVersion += 1;
    const validation = QRValidator.validate(config.data);

    if (!validation.valid) {
      this.#cancelPendingRender();
      this.#preview.setError(validation.errors[0]);
      return;
    }

    if (this.#renderTimer !== null) window.clearTimeout(this.#renderTimer);
    this.#renderTimer = window.setTimeout(() => {
      this.#renderTimer = null;
      this.#render(config);
    }, RENDER_DELAY);
  }

  #cancelPendingRender() {
    if (this.#renderTimer !== null) {
      window.clearTimeout(this.#renderTimer);
      this.#renderTimer = null;
    }
  }

  #render(config) {
    const version = ++this.#renderVersion;
    const validation = QRValidator.validate(config.data);

    if (!validation.valid) {
      this.#preview.setError(validation.errors[0]);
      return;
    }

    this.#preview.setFormat(config.format);
    this.#preview.setLoading();

    const canvas = document.createElement('canvas');
    QRGenerator.renderToCanvas(canvas, config)
      .then(() => {
        if (version !== this.#renderVersion) return;
        this.#preview.canvas.width = config.size;
        this.#preview.canvas.height = config.size;
        this.#preview.canvas.getContext('2d').drawImage(canvas, 0, 0);
        this.#preview.setReady(config, config.type);
        this.#lastConfig = config;
        this.#remember(config);
      })
      .catch((error) => {
        if (version !== this.#renderVersion) return;
        console.error(error);
        this.#preview.setError('No se pudo generar el QR.');
        Toast.show(error.message || 'No se pudo generar el QR.', 'error');
      });
  }

  #loadDecodedQR(data) {
    const { type, values } = classify(data);
    const config = new QRConfig({ ...(this.#lastConfig?.toObject() || {}), type, values, data });
    this.#cancelPendingRender();
    this.#form.setConfig(config);
    this.#render(config);
    Toast.show('QR leído y cargado en el editor.', 'success');
  }

  async #startCamera() {
    const dialog = this.view.scannerDialog;
    const status = dialog.querySelector('.scanner-dialog__status');
    if (!navigator.mediaDevices?.getUserMedia) {
      Toast.show('Tu navegador no permite usar la cámara en este sitio.', 'error');
      return;
    }
    dialog.showModal();
    status.textContent = 'Solicitando acceso a la cámara…';
    try {
      this.#cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      if (!dialog.open) {
        this.#stopCamera();
        return;
      }
      const video = dialog.querySelector('video');
      video.srcObject = this.#cameraStream;
      await video.play();
      status.textContent = 'Apunta la cámara al código QR.';
      this.#scanFrame();
    } catch (error) {
      status.textContent = error.name === 'NotAllowedError'
        ? 'No se concedió permiso para usar la cámara.'
        : 'No se pudo iniciar la cámara. Revisa los permisos del navegador.';
      this.#stopCamera();
    }
  }

  #scanFrame = () => {
    const dialog = this.view.scannerDialog;
    const video = dialog.querySelector('video');
    if (!dialog.open || !this.#cameraStream) return;
    const now = performance.now();
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth && now - this.#lastScanAt >= 120) {
      this.#lastScanAt = now;
      const scale = Math.min(1, 1000 / Math.max(video.videoWidth, video.videoHeight));
      this.#scanCanvas.width = Math.round(video.videoWidth * scale);
      this.#scanCanvas.height = Math.round(video.videoHeight * scale);
      const context = this.#scanCanvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(video, 0, 0, this.#scanCanvas.width, this.#scanCanvas.height);
      const decoded = QRReader.decodeImageData(context.getImageData(0, 0, this.#scanCanvas.width, this.#scanCanvas.height));
      if (decoded) {
        dialog.close();
        this.#loadDecodedQR(decoded);
        return;
      }
    }
    this.#cameraFrame = requestAnimationFrame(this.#scanFrame);
  };

  #stopCamera() {
    if (this.#cameraFrame !== null) cancelAnimationFrame(this.#cameraFrame);
    this.#cameraFrame = null;
    this.#cameraStream?.getTracks().forEach((track) => track.stop());
    this.#cameraStream = null;
    const video = this.view.scannerDialog.querySelector('video');
    if (video) video.srcObject = null;
  }

  async #copyContent() {
    if (!this.#lastConfig) return;
    try {
      await navigator.clipboard.writeText(this.#lastConfig.data);
      Toast.show('Contenido copiado al portapapeles.', 'success');
    } catch {
      Toast.show('No se pudo copiar el contenido. Revisa los permisos del navegador.', 'error');
    }
  }

  #remember(config) {
    StorageService.saveConfig(config.toObject());

    const history = StorageService.loadHistory();
    const entry = {
      config: config.toObject(),
      data: config.data,
      type: config.type,
      createdAt: Date.now(),
    };

    StorageService.saveHistory([entry, ...history.filter((item) => item.data !== config.data)]);
    this.#renderHistory();
  }

  async #download(format) {
    if (!this.#lastConfig) return;
    const spec = formatBy(format);
    const config = this.#lastConfig.with({ format });

    try {
      if (spec.id === 'svg') {
        const svg = await QRGenerator.toSVG(config);
        QRDownloader.downloadSVG(svg, config.data);
      } else {
        const dataUrl = await QRGenerator.toDataURL(config, spec.mime);
        QRDownloader.downloadDataURL(dataUrl, config.data, spec.ext);
      }
      Toast.show(`QR descargado como ${spec.label}.`, 'success');
    } catch (error) {
      console.error(error);
      Toast.show(`No se pudo generar el ${spec.label}.`, 'error');
    }
  }

  async #copy() {
    if (!this.#lastConfig || this.#preview.canvas.hidden) return false;

    const blob = await new Promise((resolve) => this.#preview.canvas.toBlob(resolve, 'image/png'));

    if (!blob || !window.ClipboardItem) {
      Toast.show('Tu navegador no permite copiar imágenes.', 'error');
      return false;
    }

    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      Toast.show('QR copiado al portapapeles.', 'success');
      return true;
    } catch {
      Toast.show('No se pudo copiar la imagen.', 'error');
      return false;
    }
  }

  async #print() {
    if (!this.#lastConfig) return;
    const config = this.#lastConfig.with({ size: 640 });
    try {
      const dataUrl = await QRGenerator.toDataURL(config, 'image/png');
      QRDownloader.printDataURL(dataUrl);
    } catch {
      Toast.show('No se pudo preparar la impresión.', 'error');
    }
  }

  #renderHistory() {
    const history = StorageService.loadHistory();
    clearChildren(this.#historySlot);

    if (history.length === 0) {
      this.#historySlot.append(
        el('div', { class: 'history-header' }, [el('h2', { class: 'panel__title' }, 'Historial')]),
        el('p', { class: 'history-empty' }, 'Aún no hay códigos en el historial. Los QR que generes aparecerán aquí.'),
      );
      return;
    }

    const list = el('ul', { class: 'history-list' });

    history.forEach((item) => {
      const type = item.type && CONTENT_TYPE_LABELS[item.type] ? item.type : 'text';
      const thumb = el('img', { class: 'history-item__thumb', alt: '', width: '56', height: '56', loading: 'lazy' });

      const thumbKey = item.data || '';
      if (this.#thumbCache.has(thumbKey)) {
        thumb.src = this.#thumbCache.get(thumbKey);
      } else {
        QRGenerator.toThumbnail(thumbKey)
          .then((url) => {
            this.#thumbCache.set(thumbKey, url);
            if (thumb.isConnected) thumb.src = url;
          })
          .catch(() => {});
      }

      const button = el('button', { class: 'history-item' }, [
        el('span', { class: 'history-item__thumb-wrap' }, [thumb]),
        el('span', { class: 'history-item__body' }, [
          el('span', { class: 'history-item__text', title: item.data }, item.data),
          el('span', { class: 'history-item__meta' }, [
            el('span', { class: `type-badge type-badge--${type}` }, CONTENT_TYPE_LABELS[type]),
            el('span', {}, ` · ${new Date(item.createdAt).toLocaleString()}`),
          ]),
        ]),
      ]);
      button.addEventListener('click', () => this.#loadHistoryItem(item));
      list.append(el('li', {}, button));
    });

    const clearButton = el('button', {
      class: 'btn btn--ghost btn--danger',
      onclick: () => {
        StorageService.saveHistory([]);
        this.#thumbCache.clear();
        this.#renderHistory();
        Toast.show('Historial borrado.', 'info');
      },
    }, 'Borrar');

    this.#historySlot.append(
      el('div', { class: 'history-header' }, [
        el('h2', { class: 'panel__title' }, `Historial · ${history.length}`),
        clearButton,
      ]),
      list,
    );
  }

  #loadHistoryItem(item) {
    let config;
    if (item.config) {
      config = new QRConfig(item.config);
    } else {
      const { type, values } = classify(item.data);
      config = new QRConfig({
        ...(this.#lastConfig?.toObject() || {}),
        ...DEFAULT_CONFIG,
        data: item.data,
        type,
        values,
      });
    }
    this.#cancelPendingRender();
    this.#form.setConfig(config);
    this.#render(config);
  }

  #reset() {
    StorageService.saveConfig(null);
    const config = new QRConfig({
      ...DEFAULT_CONFIG,
      type: 'url',
      values: { url: 'https://example.com' },
      data: 'https://example.com',
    });
    this.#cancelPendingRender();
    this.#form.setConfig(config);
    this.#render(config);
    Toast.show('Ajustes restablecidos.', 'info');
  }
}
