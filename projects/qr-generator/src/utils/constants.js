export const ERROR_CORRECTION_LEVELS = ['L', 'M', 'Q', 'H'];

export const ERROR_CORRECTION_LABELS = {
  L: 'L · 7%',
  M: 'M · 15%',
  Q: 'Q · 25%',
  H: 'H · 30%',
};

export const CONTENT_TYPE_LABELS = {
  text: 'Texto',
  url: 'URL',
  email: 'Email',
  phone: 'Teléfono',
  wifi: 'WiFi',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  geo: 'Ubicación',
  vcard: 'Contacto',
};

export const MODULE_STYLES = {
  square: 'Cuadrado',
  dots: 'Puntos',
  rounded: 'Redondeado',
  classy: 'Classy',
};

export const FORMATS = [
  { id: 'png', label: 'PNG', ext: 'png', mime: 'image/png' },
  { id: 'webp', label: 'WEBP', ext: 'webp', mime: 'image/webp' },
  { id: 'jpeg', label: 'JPEG', ext: 'jpg', mime: 'image/jpeg' },
  { id: 'svg', label: 'SVG', ext: 'svg', mime: 'image/svg+xml' },
];

export function formatBy(id) {
  return FORMATS.find((format) => format.id === id) || FORMATS[0];
}

export const COLOR_PRESETS = [
  { label: 'Clásico', dark: '#111827', light: '#ffffff' },
  { label: 'Neón', dark: '#c6f04e', light: '#0b120d' },
  { label: 'Menta', dark: '#0f766e', light: '#ecfdf5' },
  {
    label: 'Océano',
    dark: '#2563eb',
    light: '#ffffff',
    gradient: true,
    gradientColor: '#06b6d4',
  },
  {
    label: 'Atardecer',
    dark: '#f43f5e',
    light: '#fff7ed',
    gradient: true,
    gradientColor: '#f59e0b',
  },
  {
    label: 'Galaxia',
    dark: '#7c3aed',
    light: '#faf5ff',
    gradient: true,
    gradientColor: '#ec4899',
  },
];

export const MAX_BYTES = 2953;

export const STORAGE_KEYS = {
  HISTORY: 'qr-generator:history',
  CONFIG: 'qr-generator:config',
  THEME: 'qr-generator:theme',
};

export const DEFAULT_CONFIG = {
  type: 'text',
  values: {},
  data: '',
  size: 300,
  margin: 2,
  errorCorrectionLevel: 'M',
  colorDark: '#111827',
  colorLight: '#ffffff',
  gradient: false,
  gradientColor: '#34d399',
  moduleStyle: 'square',
  format: 'png',
  logo: '',
  logoScale: 0.22,
};

export const SIZE_LIMITS = {
  min: 128,
  max: 1024,
  step: 16,
};

export const MARGIN_LIMITS = {
  min: 0,
  max: 10,
};

export const LOGO_LIMITS = {
  min: 0.1,
  max: 0.4,
  step: 0.01,
};

export const MAX_HISTORY_ITEMS = 20;