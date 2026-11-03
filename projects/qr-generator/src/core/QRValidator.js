import { MAX_BYTES } from '../utils/constants.js';

function byteLength(value) {
  return new TextEncoder().encode(value).length;
}

export class QRValidator {
  static validate(data) {
    const errors = [];

    if (data === undefined || data === null || String(data).trim() === '') {
      errors.push('El contenido del QR no puede estar vacío.');
    } else if (byteLength(String(data)) > MAX_BYTES) {
      errors.push(`El contenido supera el límite de ${MAX_BYTES} bytes del modo byte.`);
    }

    return { valid: errors.length === 0, errors };
  }

  static detectType(data) {
    const value = String(data || '').trim();

    if (/^(https?:\/\/|www\.)/i.test(value)) {
      return 'url';
    }

    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      return 'email';
    }

    if (/^\+?[\d\s().-]{7,20}$/.test(value)) {
      return 'phone';
    }

    return 'text';
  }
}