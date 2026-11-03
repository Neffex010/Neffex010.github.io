const ICONS = {
  text: 'M4 7h16M4 12h16M4 17h10',
  url: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  email: 'M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM22 7l-10 6L2 7',
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
  wifi: 'M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01',
  sms: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
  whatsapp: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5zM9 10h6M9 14h4',
  geo: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  vcard: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
};

function escWifi(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/:/g, '\\:')
    .replace(/"/g, '\\"');
}

function unescWifi(value) {
  return String(value ?? '').replace(/\\(.)/g, '$1');
}

export const CONTENT_TYPES = [
  {
    id: 'text',
    label: 'Texto',
    icon: ICONS.text,
    fields: [
      { name: 'message', label: 'Mensaje', type: 'textarea', placeholder: 'Escribe cualquier texto…', required: true },
    ],
    build: (values) => String(values.message ?? '').trim(),
    parse: (data) => ({ message: data ?? '' }),
  },
  {
    id: 'url',
    label: 'URL',
    icon: ICONS.url,
    fields: [
      { name: 'url', label: 'Enlace', type: 'url', placeholder: 'https://tusitio.com', required: true },
    ],
    build: (values) => {
      const raw = String(values.url ?? '').trim();
      if (!raw) return '';
      return /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
    },
    parse: (data) => ({ url: data ?? '' }),
  },
  {
    id: 'email',
    label: 'Email',
    icon: ICONS.email,
    fields: [
      { name: 'to', label: 'Destinatario', type: 'email', placeholder: 'nombre@correo.com', required: true },
      { name: 'subject', label: 'Asunto', type: 'text', placeholder: 'Opcional' },
      { name: 'body', label: 'Mensaje', type: 'textarea', placeholder: 'Opcional', rows: 3 },
    ],
    build: (values) => {
      const to = String(values.to ?? '').trim();
      if (!to) return '';
      const query = [];
      if (values.subject) query.push(`subject=${encodeURIComponent(values.subject)}`);
      if (values.body) query.push(`body=${encodeURIComponent(values.body)}`);
      return `mailto:${to}${query.length ? `?${query.join('&')}` : ''}`;
    },
    parse: (data) => {
      const match = /^mailto:([^?]+)\??(.*)$/i.exec(data || '');
      if (!match) return null;
      let subject = '';
      let body = '';
      if (match[2]) {
        const params = new URLSearchParams(match[2]);
        subject = params.get('subject') || '';
        body = params.get('body') || '';
      }
      return { to: match[1], subject, body };
    },
  },
  {
    id: 'phone',
    label: 'Teléfono',
    icon: ICONS.phone,
    fields: [
      { name: 'number', label: 'Número', type: 'tel', placeholder: '+34 600 000 000', required: true },
    ],
    build: (values) => {
      const number = String(values.number ?? '').trim();
      return number ? `tel:${number}` : '';
    },
    parse: (data) => {
      const match = /^tel:([\s\S]+)$/i.exec(data || '');
      if (!match) return null;
      return { number: match[1].trim() };
    },
  },
  {
    id: 'wifi',
    label: 'WiFi',
    icon: ICONS.wifi,
    fields: [
      { name: 'ssid', label: 'Nombre de red (SSID)', type: 'text', placeholder: 'MiRed', required: true },
      { name: 'password', label: 'Contraseña', type: 'password', placeholder: 'Opcional si no tiene' },
      {
        name: 'encryption',
        label: 'Seguridad',
        type: 'select',
        options: [['WPA', 'WPA / WPA2'], ['WEP', 'WEP'], ['nopass', 'Sin contraseña']],
      },
      { name: 'hidden', label: 'Red oculta', type: 'checkbox' },
    ],
    build: (values) => {
      const ssid = String(values.ssid ?? '').trim();
      const encryption = values.encryption || 'WPA';
      if (!ssid) return '';
      let out = `WIFI:T:${encryption};S:${escWifi(ssid)};`;
      if (encryption !== 'nopass') out += `P:${escWifi(values.password ?? '')};`;
      if (values.hidden) out += 'H:true;';
      out += ';';
      return out;
    },
    parse: (data) => {
      const field = '(?:\\\\.|[^;])*';
      const match = new RegExp(`^WIFI:T:([^;]+);S:(${field})(?:;P:(${field}))?(?:;H:(true|false))?;?`, 'i').exec(data || '');
      if (!match) return null;
      return {
        ssid: unescWifi(match[2]),
        password: match[3] ? unescWifi(match[3]) : '',
        encryption: match[1] || 'WPA',
        hidden: match[4] === 'true',
      };
    },
  },
  {
    id: 'sms',
    label: 'SMS',
    icon: ICONS.sms,
    fields: [
      { name: 'number', label: 'Número', type: 'tel', placeholder: '+34 600 000 000', required: true },
      { name: 'message', label: 'Mensaje', type: 'textarea', placeholder: 'Opcional', rows: 3 },
    ],
    build: (values) => {
      const number = String(values.number ?? '').trim();
      if (!number) return '';
      const message = String(values.message ?? '').trim();
      return `SMSTO:${number}${message ? `:${message}` : ''}`;
    },
    parse: (data) => {
      const match = /^SMSTO:([^:]+):?([\s\S]*)$/i.exec(data || '');
      if (!match) return null;
      return { number: match[1].trim(), message: match[2].trim() };
    },
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: ICONS.whatsapp,
    fields: [
      { name: 'number', label: 'Número', type: 'tel', placeholder: '34123456789', required: true },
      { name: 'message', label: 'Mensaje predefinido', type: 'textarea', placeholder: 'Hola, te escribo…', rows: 3 },
    ],
    build: (values) => {
      const number = String(values.number ?? '').trim().replace(/[^\d]/g, '');
      if (!number) return '';
      const message = String(values.message ?? '').trim();
      return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    },
    parse: (data) => {
      const match = /^https:\/\/wa\.me\/(\d+)(?:\?text=(.*))?$/i.exec(data || '');
      if (!match) return null;
      return {
        number: match[1],
        message: match[2] ? decodeURIComponent(match[2]) : '',
      };
    },
  },
  {
    id: 'geo',
    label: 'Ubicación',
    icon: ICONS.geo,
    fields: [
      { name: 'lat', label: 'Latitud', type: 'number', placeholder: '40.416775', required: true, step: 'any' },
      { name: 'lng', label: 'Longitud', type: 'number', placeholder: '-3.703790', required: true, step: 'any' },
    ],
    build: (values) => {
      const lat = String(values.lat ?? '').trim();
      const lng = String(values.lng ?? '').trim();
      if (!lat || !lng || Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) return '';
      return `geo:${lat},${lng}`;
    },
    parse: (data) => {
      const match = /^geo:([\d.\-]+),([\d.\-]+)$/i.exec(data || '');
      if (!match) return null;
      return { lat: match[1], lng: match[2] };
    },
  },
  {
    id: 'vcard',
    label: 'Contacto',
    icon: ICONS.vcard,
    fields: [
      { name: 'name', label: 'Nombre completo', type: 'text', placeholder: 'Ana García', required: true },
      { name: 'phone', label: 'Teléfono', type: 'tel', placeholder: '+34 600 000 000' },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'ana@correo.com' },
      { name: 'org', label: 'Empresa', type: 'text', placeholder: 'Nova Design' },
      { name: 'title', label: 'Puesto', type: 'text', placeholder: 'Diseñadora' },
    ],
    build: (values) => {
      const name = String(values.name ?? '').trim();
      if (!name) return '';
      const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${name}`];
      if (values.org) lines.push(`ORG:${values.org}`);
      if (values.title) lines.push(`TITLE:${values.title}`);
      if (values.phone) lines.push(`TEL:${values.phone}`);
      if (values.email) lines.push(`EMAIL:${values.email}`);
      lines.push('END:VCARD');
      return lines.join('\n');
    },
    parse: (data) => {
      if (!/BEGIN:VCARD/i.test(data || '')) return null;
      const get = (key) => (data.match(new RegExp(`^${key}:([^\\r\\n]*)`, 'im')) || [null, ''])[1];
      return {
        name: get('FN'),
        phone: get('TEL'),
        email: get('EMAIL'),
        org: get('ORG'),
        title: get('TITLE'),
      };
    },
  },
];

export function getContentType(id) {
  return CONTENT_TYPES.find((type) => type.id === id) || CONTENT_TYPES[0];
}

export function buildPayload(typeId, values) {
  return getContentType(typeId).build(values || {});
}

export function roundTrip(data, type) {
  const parsed = type.parse(data || '');
  if (!parsed) return null;
  const rebuilt = type.build(parsed);
  if (!rebuilt) return null;
  return rebuilt === (data || '');
}

const CLASSIFY_ORDER = ['wifi', 'sms', 'vcard', 'geo', 'whatsapp', 'email', 'phone', 'url'];

export function classify(data) {
  const value = String(data || '').trim();
  if (!value) return { type: 'text', values: { message: '' } };

  for (const typeId of CLASSIFY_ORDER) {
    const type = getContentType(typeId);
    if (roundTrip(value, type)) {
      return { type: type.id, values: type.parse(value) };
    }
  }

  return { type: 'text', values: { message: value } };
}