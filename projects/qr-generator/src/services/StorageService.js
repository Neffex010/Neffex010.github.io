import { STORAGE_KEYS, MAX_HISTORY_ITEMS } from '../utils/constants.js';

export class StorageService {
  static read(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      const value = JSON.parse(raw);
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  static write(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // El almacenamiento puede estar no disponible (modo privado).
    }
  }

  static remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Sin acción.
    }
  }

  static loadHistory() {
    const stored = StorageService.read(STORAGE_KEYS.HISTORY, []);
    return Array.isArray(stored) ? stored : [];
  }

  static saveHistory(items) {
    StorageService.write(STORAGE_KEYS.HISTORY, items.slice(0, MAX_HISTORY_ITEMS));
  }

  static loadConfig() {
    return StorageService.read(STORAGE_KEYS.CONFIG, null);
  }

  static saveConfig(config) {
    StorageService.write(STORAGE_KEYS.CONFIG, config);
  }

  static loadTheme() {
    return StorageService.read(STORAGE_KEYS.THEME, 'light');
  }

  static saveTheme(theme) {
    StorageService.write(STORAGE_KEYS.THEME, theme);
  }
}
