import {
  DEFAULT_CONFIG,
  ERROR_CORRECTION_LEVELS,
  MODULE_STYLES,
  LOGO_LIMITS,
} from '../utils/constants.js';
import { CONTENT_TYPES } from '../utils/templates.js';

const CONTENT_TYPE_IDS = CONTENT_TYPES.map((type) => type.id);
const MODULE_STYLE_IDS = Object.keys(MODULE_STYLES);

function clampInt(value, min, max, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function clampNum(value, min, max, fallback) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function pick(object, key, fallback) {
  return object && object[key] !== undefined && object[key] !== null ? object[key] : fallback;
}

export class QRConfig {
  constructor(options = {}) {
    this.type = CONTENT_TYPE_IDS.includes(options.type) ? options.type : DEFAULT_CONFIG.type;
    this.values = options.values && typeof options.values === 'object' ? { ...options.values } : {};
    this.data = String(pick(options, 'data', DEFAULT_CONFIG.data));
    this.size = clampInt(options.size, 128, 1024, DEFAULT_CONFIG.size);
    this.margin = clampInt(options.margin, 0, 10, DEFAULT_CONFIG.margin);
    this.errorCorrectionLevel = ERROR_CORRECTION_LEVELS.includes(options.errorCorrectionLevel)
      ? options.errorCorrectionLevel
      : DEFAULT_CONFIG.errorCorrectionLevel;
    this.colorDark = String(pick(options, 'colorDark', DEFAULT_CONFIG.colorDark));
    this.colorLight = String(pick(options, 'colorLight', DEFAULT_CONFIG.colorLight));
    this.gradient = Boolean(pick(options, 'gradient', DEFAULT_CONFIG.gradient));
    this.gradientColor = String(pick(options, 'gradientColor', DEFAULT_CONFIG.gradientColor));
    this.moduleStyle = MODULE_STYLE_IDS.includes(options.moduleStyle)
      ? options.moduleStyle
      : DEFAULT_CONFIG.moduleStyle;
    this.format = ['png', 'webp', 'jpeg', 'svg'].includes(options.format)
      ? options.format
      : DEFAULT_CONFIG.format;
    this.logo = String(pick(options, 'logo', DEFAULT_CONFIG.logo));
    this.logoScale = clampNum(options.logoScale, LOGO_LIMITS.min, LOGO_LIMITS.max, DEFAULT_CONFIG.logoScale);
  }

  toObject() {
    return {
      type: this.type,
      values: { ...this.values },
      data: this.data,
      size: this.size,
      margin: this.margin,
      errorCorrectionLevel: this.errorCorrectionLevel,
      colorDark: this.colorDark,
      colorLight: this.colorLight,
      gradient: this.gradient,
      gradientColor: this.gradientColor,
      moduleStyle: this.moduleStyle,
      format: this.format,
      logo: this.logo,
      logoScale: this.logoScale,
    };
  }

  with(overrides) {
    return new QRConfig({ ...this.toObject(), ...overrides });
  }
}