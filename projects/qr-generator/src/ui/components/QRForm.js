import { el } from '../../utils/dom.js';
import { QRConfig } from '../../models/QRConfig.js';
import { QRGenerator } from '../../core/QRGenerator.js';
import { Toast } from './Toast.js';
import {
  COLOR_PRESETS,
  CONTENT_TYPE_LABELS,
  DEFAULT_CONFIG,
  ERROR_CORRECTION_LEVELS,
  ERROR_CORRECTION_LABELS,
  FORMATS,
  LOGO_LIMITS,
  MARGIN_LIMITS,
  MAX_BYTES,
  MODULE_STYLES,
  SIZE_LIMITS,
} from '../../utils/constants.js';
import { CONTENT_TYPES, buildPayload } from '../../utils/templates.js';

function group(label, content, hint) {
  const labelEl = content && content.id
    ? el('label', { class: 'form-label', for: content.id }, label)
    : el('label', { class: 'form-label' }, label);

  const box = el('div', { class: 'form-group' }, [labelEl, content]);
  if (hint) box.append(el('div', { class: 'form-hint' }, hint));
  return box;
}

function fieldControl(field) {
  switch (field.type) {
    case 'textarea':
      return el('textarea', {
        class: 'form-textarea form-textarea--field',
        name: field.name,
        rows: field.rows ?? 2,
        placeholder: field.placeholder ?? '',
        spellcheck: 'false',
      });
    case 'select': {
      const select = el('select', { class: 'form-select', name: field.name });
      field.options.forEach(([value, label]) => select.append(el('option', { value }, label)));
      return select;
    }
    case 'checkbox':
      return el('label', { class: 'field-check' }, [
        el('input', { type: 'checkbox', name: field.name, 'aria-label': field.label }),
        el('span', { class: 'switch' }, [el('span', { class: 'switch__knob' })]),
        el('span', { class: 'field-check__text' }, field.label),
      ]);
    case 'password': {
      const input = el('input', { class: 'form-input', type: 'password', name: field.name, placeholder: field.placeholder ?? '', autocomplete: 'off' });
      const toggle = el('button', { type: 'button', class: 'field-secret__toggle', 'aria-label': 'Mostrar contraseña', title: 'Mostrar' }, 'Mostrar');
      toggle.addEventListener('click', () => {
        const visible = input.type === 'text';
        input.type = visible ? 'password' : 'text';
        toggle.textContent = visible ? 'Mostrar' : 'Ocultar';
        toggle.setAttribute('aria-label', visible ? 'Mostrar contraseña' : 'Ocultar contraseña');
      });
      return el('div', { class: 'field-secret' }, [input, toggle]);
    }
    case 'number':
      return el('input', {
        class: 'form-input',
        type: 'number',
        name: field.name,
        placeholder: field.placeholder ?? '',
        step: field.step ?? 'any',
      });
    default:
      return el('input', {
        class: 'form-input',
        type: field.type || 'text',
        name: field.name,
        placeholder: field.placeholder ?? '',
        inputmode: field.type === 'number' ? 'decimal' : null,
      });
  }
}

export class QRForm {
  #onChange;
  #root;
  #type;
  #store = {};
  #panels = new Map();
  #pills = new Map();
  #logo = '';

  constructor(onChange) {
    this.#onChange = onChange;
    this.#type = DEFAULT_CONFIG.type;
    this.#store[this.#type] = {};
    this.#root = this.#build();
  }

  mount(container) {
    container.append(this.#root);
  }

  getElement() {
    return this.#root;
  }

  getConfig() {
    const input = (name) => this.#root.querySelector(`[name="${name}"]`);
    const checkedByName = (name) => this.#root.querySelector(`[name="${name}"]:checked`)?.value ?? '';
    const values = this.#store[this.#type] || {};

    return new QRConfig({
      type: this.#type,
      values: { ...values },
      data: buildPayload(this.#type, values),
      size: Number(input('size').value),
      margin: Number(input('margin').value),
      errorCorrectionLevel: input('level').value,
      colorDark: input('colorDark').value,
      colorLight: input('colorLight').value,
      gradient: input('gradient').checked,
      gradientColor: input('gradientColor').value,
      moduleStyle: checkedByName('moduleStyle'),
      format: checkedByName('format'),
      logo: this.#logo,
      logoScale: Number(input('logoScale').value),
    });
  }

  setConfig(config) {
    const safe = new QRConfig(config);
    const values = safe.values && Object.keys(safe.values).length ? safe.values : {};

    this.#activateType(safe.type, { render: false });
    this.#store[this.#type] = { ...values };
    this.#logo = safe.logo;

    const input = (name) => this.#root.querySelector(`[name="${name}"]`);

    input('size').value = safe.size;
    input('sizeRange').value = safe.size;
    input('margin').value = safe.margin;
    input('level').value = safe.errorCorrectionLevel;
    input('colorDark').value = safe.colorDark;
    input('colorLight').value = safe.colorLight;
    input('gradient').checked = safe.gradient;
    input('gradientColor').value = safe.gradientColor;
    const setRadio = (name, value) => {
      const radio = this.#root.querySelector(`[name="${name}"][value="${value}"]`);
      if (radio) radio.checked = true;
    };
    setRadio('moduleStyle', safe.moduleStyle);
    setRadio('format', safe.format);
    input('logoScale').value = safe.logoScale;

    CONTENT_TYPES.forEach((type) => {
      this.#panels.get(type.id).querySelectorAll('[name]').forEach((control) => {
        if (control.type === 'checkbox') control.checked = Boolean((this.#store[type.id] || {})[control.name]);
        else control.value = (this.#store[type.id] || {})[control.name] ?? '';
      });
    });

    this.#syncColorSwatches();
    this.#syncGradientVisibility();
    this.#syncLogoUI();
    this.#paintRange(input('sizeRange'));
    this.#paintRange(input('logoScale'));
    this.#refresh?.();
  }

  #activateType(typeId, { render = true } = {}) {
    this.#syncStoreFromDOM();

    if (this.#type !== typeId) {
      this.#store[typeId] = this.#store[typeId] || {};
      this.#type = typeId;
    }

    this.#pills.forEach((pill, id) => {
      const active = id === typeId;
      pill.classList.toggle('type-btn--active', active);
      pill.setAttribute('aria-selected', String(active));
      pill.setAttribute('tabindex', active ? '0' : '-1');
    });

    this.#panels.forEach((panel, id) => {
      const active = id === typeId;
      panel.hidden = !active;
      panel.classList.toggle('type-panel--active', active);
    });

    if (render) this.#onChange(this.getConfig());
  }

  #syncStoreFromDOM() {
    const values = {};
    this.#panels.get(this.#type)?.querySelectorAll('[name]').forEach((control) => {
      values[control.name] = control.type === 'checkbox' ? control.checked : control.value;
    });
    this.#store[this.#type] = values;
  }

  #syncColorSwatches() {
    const input = (name) => this.#root.querySelector(`[name="${name}"]`);
    ['colorDark', 'colorLight', 'gradientColor'].forEach((name) => {
      const node = input(name);
      node.style.backgroundColor = node.value;
      const hex = node.closest('.form-color-wrap')?.querySelector('.form-color-hex');
      if (hex) hex.textContent = node.value;
    });
  }

  #syncGradientVisibility() {
    const enabled = this.#root.querySelector('[name="gradient"]').checked;
    this.#root.querySelector('.form-row--gradient').hidden = !enabled;
    const gradientWrap = this.#root.querySelector('.form-color-wrap--gradient');
    gradientWrap.style.display = enabled ? '' : 'none';
    this.#root.querySelector('[name="gradientColor"]').style.backgroundColor = this.#root.querySelector('[name="gradientColor"]').value;
  }

  #syncLogoUI() {
    const hasLogo = Boolean(this.#logo);
    this.#root.querySelector('.logo-upload').classList.toggle('logo-upload--hidden', hasLogo);
    this.#root.querySelector('.logo-preview').hidden = !hasLogo;
    this.#root.querySelector('.logo-actions').hidden = !hasLogo;
    this.#root.querySelector('.logo-tools').hidden = !hasLogo;
    const img = this.#root.querySelector('.logo-preview__img');
    if (hasLogo) img.src = this.#logo;
  }

  #paintRange(range) {
    if (!range) return;
    const min = Number(range.min);
    const max = Number(range.max);
    const value = Number(range.value);
    const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;
    range.style.setProperty('--fill', `${percent}%`);
  }

  #build() {
    const content = this.#buildContent();
    const styleGroup = this.#buildStyle();
    const colors = this.#buildColors();
    const size = this.#buildSize();
    const marginLevel = this.#buildMarginLevel();
    const logo = this.#buildLogo();
    const format = this.#buildFormat();

    return el('div', { class: 'qr-form' }, [content, styleGroup, colors, size, marginLevel, logo, format]);
  }

  #buildContent() {
    const pillsWrap = el('div', { class: 'type-grid', role: 'tablist', 'aria-label': 'Tipo de contenido' });
    const panelsWrap = el('div', { class: 'type-panels' });

    CONTENT_TYPES.forEach((type) => {
      const pill = el('button', {
        type: 'button',
        class: 'type-btn',
        role: 'tab',
        id: `type-${type.id}`,
        'data-type': type.id,
        title: type.label,
        'aria-selected': 'false',
        'aria-controls': `panel-${type.id}`,
        tabindex: '-1',
      }, [
        el('svg', {
          class: 'type-btn__icon',
          viewBox: '0 0 24 24',
          'aria-hidden': 'true',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1.8',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          html: `<path d="${type.icon}"/>`,
        }),
        el('span', {}, type.label),
      ]);
      pill.addEventListener('click', () => this.#activateType(type.id));
      pill.addEventListener('keydown', (event) => {
        const current = CONTENT_TYPES.findIndex((item) => item.id === type.id);
        let next = current;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (current + 1) % CONTENT_TYPES.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (current - 1 + CONTENT_TYPES.length) % CONTENT_TYPES.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = CONTENT_TYPES.length - 1;
        else return;
        event.preventDefault();
        const target = CONTENT_TYPES[next];
        this.#activateType(target.id);
        this.#pills.get(target.id).focus();
      });

      const fieldsWrap = el('div', { class: 'types-stack' }, type.fields.map((field) => {
        const control = fieldControl(field);
        control.id = `${type.id}-${field.name}`;

        if (field.type === 'checkbox') {
          control.querySelector('input').addEventListener('change', (event) => {
            this.#syncStoreFromDOM();
            this.#refresh?.();
            this.#onChange(this.getConfig());
          });
          return el('div', { class: 'field' }, [control]);
        }

        const handler = (event) => {
          this.#syncStoreFromDOM();
          this.#refresh?.();
          this.#onChange(this.getConfig());
        };
        if (field.type === 'select') control.addEventListener('change', handler);
        else control.addEventListener('input', handler);

        return el('div', { class: 'field' }, [
          el('label', { class: 'field-label', for: control.id }, [
            field.label,
            field.required ? el('span', { class: 'field-required' }, '*') : null,
          ]),
          control,
        ]);
      }));

      const panel = el('div', { class: 'type-panel', id: `panel-${type.id}`, role: 'tabpanel', 'aria-labelledby': `type-${type.id}`, hidden: true }, [
        fieldsWrap,
        el('div', { class: 'form-usagemeta' }, [
          el('span', { class: `type-badge type-badge--${type.id}` }, CONTENT_TYPE_LABELS[type.id]),
          el('span', { class: 'form-hint form-hint--right', 'data-counter': '' }, '0 caracteres · 0 bytes'),
        ]),
        el('div', { class: 'capacity', role: 'group', 'aria-label': 'Capacidad' }, [
          el('div', { class: 'capacity__bar', role: 'progressbar', 'aria-label': 'Uso de la capacidad del QR', 'aria-valuemin': '0', 'aria-valuemax': '100' }, [
            el('i', { class: 'capacity__fill' }),
          ]),
          el('span', { class: 'capacity__text' }, `0 de ${MAX_BYTES} bytes`),
        ]),
        el('p', { class: 'payload-preview' }),
      ]);

      pillsWrap.append(pill);
      panelsWrap.append(panel);
      this.#pills.set(type.id, pill);
      this.#panels.set(type.id, panel);
    });

    const box = el('div', { class: 'form-stack' }, [pillsWrap, panelsWrap]);
    return group('Contenido', box);
  }

  #buildStyle() {
    const stylesGroup = el('div', { class: 'radio-group news', role: 'radiogroup', 'aria-label': 'Estilo de los módulos' });
    Object.entries(MODULE_STYLES).forEach(([value, label], index) => {
      stylesGroup.append(
        el('label', { class: 'radio-pill' }, [
          el('input', {
            type: 'radio',
            name: 'moduleStyle',
            value,
            checked: index === 0 ? 'checked' : null,
          }),
          el('span', {}, label),
        ]),
      );
    });
    stylesGroup.addEventListener('change', () => this.#onChange(this.getConfig()));
    return group('Estilo de módulos', stylesGroup, 'Los puntos y formas redondeadas mantienen la compatibilidad con todos los lectores.');
  }

  #buildColors() {
    const input = (name, extra = {}) => el('input', {
      type: 'color',
      class: 'form-color form-color--solid',
      name,
      value: extra.value ?? DEFAULT_CONFIG[name] ?? '#111827',
      'aria-label': extra.label ?? name,
    });

    const colorDark = input('colorDark', { value: DEFAULT_CONFIG.colorDark, label: 'Color principal del QR' });
    const colorLight = input('colorLight', { value: DEFAULT_CONFIG.colorLight, label: 'Color de fondo del QR' });
    const gradientColor = input('gradientColor', { value: DEFAULT_CONFIG.gradientColor, label: 'Color secundario del degradado' });

    const wrap = (color, hint, hexKey, extraClass = '') => el('label', { class: `form-color-wrap ${extraClass}` }, [
      color,
      el('span', { class: 'form-color-hint' }, hint),
      el('span', { class: 'form-color-hex', 'data-hex': hexKey }, color.value),
    ]);

    const gradientToggle = el('label', { class: 'field-check' }, [
      el('input', { type: 'checkbox', name: 'gradient', 'aria-label': 'Activar degradado' }),
      el('span', { class: 'switch' }, [el('span', { class: 'switch__knob' })]),
      el('span', { class: 'field-check__text' }, 'Degradado'),
    ]);
    gradientToggle.querySelector('input').addEventListener('change', () => {
      this.#syncGradientVisibility();
      this.#onChange(this.getConfig());
    });

    const presets = el('div', { class: 'presets', 'aria-label': 'Paletas rápidas' });
    COLOR_PRESETS.forEach((preset, index) => {
      const swatches = el('span', { class: 'preset__swatches' }, [
        el('i', { class: 'preset__dot', style: `background:${preset.dark}` }),
        preset.gradient ? el('i', { class: 'preset__dot preset__dot--grad', style: `background:linear-gradient(135deg,${preset.dark},${preset.gradientColor})` }) : null,
        el('i', { class: 'preset__dot preset__dot--light', style: `background:${preset.light}` }),
      ]);
      const button = el('button', {
        type: 'button',
        class: 'preset',
        title: preset.label,
        'aria-label': `Paleta ${preset.label}`,
        'data-index': String(index),
      }, [swatches]);
      button.addEventListener('click', () => {
        this.#root.querySelector('[name="colorDark"]').value = preset.dark;
        this.#root.querySelector('[name="colorLight"]').value = preset.light;
        this.#root.querySelector('[name="gradient"]').checked = Boolean(preset.gradient);
        this.#root.querySelector('[name="gradientColor"]').value = preset.gradientColor || DEFAULT_CONFIG.gradientColor;
        this.#syncColorSwatches();
        this.#syncGradientVisibility();
        this.#onChange(this.getConfig());
      });
      presets.append(button);
    });

    return el('div', { class: 'colors-box' }, [
      group('Colores', el('div', { class: 'form-row' }, [
        wrap(colorDark, 'Principal', 'dark'),
        wrap(colorLight, 'Fondo', 'light'),
        wrap(gradientColor, 'Degradado', 'gradient', 'form-color-wrap--gradient'),
      ])),
      el('div', { class: 'form-row form-row--gradient', hidden: true }, [gradientToggle]),
      group('Paletas', presets),
    ]);
  }

  #buildSize() {
    const syncSize = () => {
      const number = this.#root.querySelector('[name="size"]');
      const range = this.#root.querySelector('[name="sizeRange"]');
      number.value = range.value;
      this.#paintRange(range);
      this.#onChange(this.getConfig());
    };

    const sizeRange = el('input', {
      type: 'range',
      id: 'qr-size-range',
      class: 'form-range',
      name: 'sizeRange',
      min: SIZE_LIMITS.min,
      max: SIZE_LIMITS.max,
      step: SIZE_LIMITS.step,
      value: DEFAULT_CONFIG.size,
      'aria-label': 'Tamaño del QR en píxeles',
      oninput: syncSize,
    });

    const sizeNumber = el('input', {
      type: 'number',
      id: 'qr-size',
      class: 'form-input form-input--compact',
      name: 'size',
      min: SIZE_LIMITS.min,
      max: SIZE_LIMITS.max,
      step: SIZE_LIMITS.step,
      value: DEFAULT_CONFIG.size,
      'aria-label': 'Tamaño del QR en píxeles',
      oninput: () => {
        if (sizeNumber.value === '') return;
        sizeRange.value = sizeNumber.value;
        this.#paintRange(sizeRange);
        this.#onChange(this.getConfig());
      },
      onchange: () => {
        let value = Number(sizeNumber.value);
        if (Number.isNaN(value) || sizeNumber.value.trim() === '') value = DEFAULT_CONFIG.size;
        value = Math.min(SIZE_LIMITS.max, Math.max(SIZE_LIMITS.min, value));
        sizeNumber.value = value;
        sizeRange.value = value;
        this.#paintRange(sizeRange);
        this.#onChange(this.getConfig());
      },
    });

    return group('Tamaño', el('div', { class: 'form-inline' }, [sizeRange, sizeNumber]), 'Arrastra el deslizador o escribe el número en píxeles.');
  }

  #buildMarginLevel() {
    const marginSelect = el('select', { id: 'qr-margin', class: 'form-select', name: 'margin' });
    for (let i = MARGIN_LIMITS.min; i <= MARGIN_LIMITS.max; i += 1) {
      marginSelect.append(el('option', { value: i }, String(i)));
    }
    marginSelect.value = DEFAULT_CONFIG.margin;

    const levelSelect = el('select', { id: 'qr-level', class: 'form-select', name: 'level' });
    ERROR_CORRECTION_LEVELS.forEach((level) => {
      levelSelect.append(el('option', { value: level }, ERROR_CORRECTION_LABELS[level]));
    });
    levelSelect.value = DEFAULT_CONFIG.errorCorrectionLevel;

    [levelSelect, marginSelect].forEach((node) => node.addEventListener('change', () => this.#onChange(this.getConfig())));

    return el('div', { class: 'form-grid' }, [
      group('Margen', marginSelect),
      group('Corrección de errores', levelSelect),
    ]);
  }

  #buildLogo() {
    const fileInput = el('input', { type: 'file', accept: 'image/*', class: 'logo-file', hidden: true, 'aria-label': 'Subir logotipo' });

    const drop = el('button', {
      type: 'button',
      class: 'logo-upload',
      'aria-label': 'Subir un logotipo para el centro del QR',
    }, [
      el('span', { class: 'logo-upload__icon' }, '＋'),
      el('span', { class: 'logo-upload__text' }, [
        el('strong', {}, 'Añadir logotipo'),
        el('small', {}, 'PNG o JPG · se centra y redimensiona'),
      ]),
    ]);
    drop.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      try {
        if (file.size > 3 * 1024 * 1024) throw new Error('La imagen es demasiado grande (máx. 3 MB).');
        this.#logo = await QRGenerator.resizeLogoImage(file);
        this.#syncLogoUI();
        this.#onChange(this.getConfig());
      } catch (error) {
        Toast.show(error.message, 'error');
      }
      fileInput.value = '';
    });

    const img = el('img', { class: 'logo-preview__img', alt: 'Logotipo seleccionado' });
    const preview = el('div', { class: 'logo-preview', hidden: true }, [img]);

    const removeBtn = el('button', { type: 'button', class: 'btn btn--ghost btn--danger', onclick: () => {
      this.#logo = '';
      this.#syncLogoUI();
      this.#onChange(this.getConfig());
    } }, 'Quitar logotipo');

    const scaleRange = el('input', {
      type: 'range',
      class: 'form-range form-range--logo',
      name: 'logoScale',
      min: LOGO_LIMITS.min,
      max: LOGO_LIMITS.max,
      step: LOGO_LIMITS.step,
      value: DEFAULT_CONFIG.logoScale,
      'aria-label': 'Tamaño del logotipo',
      oninput: () => {
        this.#paintRange(scaleRange);
        this.#onChange(this.getConfig());
      },
    });
    const scaleLabel = el('span', { class: 'logo-scale__value' }, '22%');
    scaleRange.addEventListener('input', () => { scaleLabel.textContent = `${Math.round(Number(scaleRange.value) * 100)}%`; });

    const tools = el('div', { class: 'logo-tools', hidden: true }, [
      el('div', { class: 'logo-scale' }, [el('span', {}, 'Tamaño'), scaleRange, scaleLabel]),
      removeBtn,
    ]);
    const actions = el('div', { class: 'logo-actions', hidden: true });

    return group('Logotipo', el('div', { class: 'logo-box' }, [drop, fileInput, preview, tools, actions]), 'El logotipo reduce la capacidad de corrección: usa nivel Q o H si añades uno.');
  }

  #buildFormat() {
    const formatGroup = el('div', { class: 'radio-group news', role: 'radiogroup', 'aria-label': 'Formato de descarga' });
    FORMATS.forEach((format, index) => {
      formatGroup.append(
        el('label', { class: 'radio-pill' }, [
          el('input', {
            type: 'radio',
            name: 'format',
            value: format.id,
            checked: index === 0 ? 'checked' : null,
          }),
          el('span', {}, format.label),
        ]),
      );
    });
    formatGroup.addEventListener('change', () => this.#onChange(this.getConfig()));
    return group('Formato de descarga', formatGroup);
  }

  #refresh = () => {
    const panel = this.#panels.get(this.#type);
    if (panel) {
      const counter = panel.querySelector('[data-counter]');
      const capacityFill = panel.querySelector('.capacity__fill');
      const capacityBar = panel.querySelector('.capacity__bar');
      const capacityText = panel.querySelector('.capacity__text');
      const payload = panel.querySelector('.payload-preview');

      const values = this.#store[this.#type] || {};
      const data = buildPayload(this.#type, values);

      if (counter) counter.textContent = `${data.length} caracteres · ${new TextEncoder().encode(data).length} bytes`;

      const bytes = new TextEncoder().encode(data).length;
      const percent = bytes > 0 ? Math.min(100, Math.round((bytes / MAX_BYTES) * 100)) : 0;
      if (capacityFill) {
        capacityFill.style.width = `${percent}%`;
        capacityFill.className = `capacity__fill${percent >= 90 ? ' capacity__fill--danger' : percent >= 70 ? ' capacity__fill--warn' : ''}`;
      }
      capacityBar?.setAttribute('aria-valuenow', String(percent));
      if (capacityText) capacityText.textContent = `${bytes} de ${MAX_BYTES} bytes`;

      if (payload) {
        if (data) {
          payload.textContent = `Codifica: ${data.slice(0, 120)}${data.length > 120 ? '…' : ''}`;
          payload.classList.add('payload-preview--filled');
        } else {
          payload.textContent = 'Completa los campos para generar el QR.';
          payload.classList.remove('payload-preview--filled');
        }
      }

      const encryption = values.encryption || 'WPA';
      const passwordField = panel.querySelector('[name="password"]');
      if (passwordField) {
        passwordField.closest('.field').hidden = encryption === 'nopass';
      }
    }
  };
}
