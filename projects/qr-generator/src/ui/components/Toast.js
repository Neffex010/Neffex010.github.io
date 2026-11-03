import { el } from '../../utils/dom.js';

const TYPE_ICON = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

export class Toast {
  static #container = null;

  static show(message, type = 'info', duration = 3000) {
    const container = Toast.#getContainer();
    const toast = el(
      'div',
      { class: `toast toast--${type}`, role: 'status' },
      [el('span', { class: 'toast__icon' }, TYPE_ICON[type] || ''), el('span', { class: 'toast__message' }, message)],
    );

    container.append(toast);

    requestAnimationFrame(() => toast.classList.add('toast--visible'));

    window.setTimeout(() => {
      toast.classList.remove('toast--visible');
      window.setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  static #getContainer() {
    if (Toast.#container === null) {
      Toast.#container = el('div', { class: 'toast-container', 'aria-live': 'polite' });
      document.body.append(Toast.#container);
    }
    return Toast.#container;
  }
}