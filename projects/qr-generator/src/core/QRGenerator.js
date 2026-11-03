import QRCode from 'qrcode';

const TAU = Math.PI * 2;

function qrMatrix(config) {
  return QRCode.create(config.data, { errorCorrectionLevel: config.errorCorrectionLevel }).modules;
}

function layout(config) {
  const matrix = qrMatrix(config);
  const count = matrix.size + config.margin * 2;
  const cell = config.size / count;
  return { matrix, cell, offset: config.margin * cell, count };
}

function inFinderZone(row, col, size) {
  return (row < 8 && col < 8) || (row < 8 && col > size - 9) || (row > size - 9 && col < 8);
}

function roundRect(ctx, x, y, w, h, radius) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawModule(ctx, x, y, cell, style, inFinder) {
  const styleName = style === 'dots' && !inFinder ? 'circle' : inFinder ? 'square' : style;

  switch (styleName) {
    case 'circle': {
      ctx.beginPath();
      ctx.arc(x + cell / 2, y + cell / 2, cell * 0.42, 0, TAU);
      ctx.fill();
      break;
    }
    case 'rounded': {
      const inset = cell * 0.06;
      roundRect(ctx, x + inset, y + inset, cell - inset * 2, cell - inset * 2, (cell - inset * 2) * 0.32);
      ctx.fill();
      break;
    }
    case 'classy': {
      const inset = cell * 0.04;
      roundRect(ctx, x + inset, y + inset, cell - inset * 2, cell - inset * 2, (cell - inset * 2) * 0.5);
      ctx.fill();
      const size = cell * 0.34;
      ctx.beginPath();
      ctx.arc(x + cell / 2, y + cell / 2, size, 0, TAU);
      ctx.fill();
      break;
    }
    default:
      ctx.fillRect(x, y, cell, cell);
  }
}

function makeFill(ctx, config, width, height) {
  if (config.gradient) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, config.colorDark);
    gradient.addColorStop(1, config.gradientColor);
    return gradient;
  }
  return config.colorDark;
}

async function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('No se pudo cargar el logotipo.'));
    image.src = src;
  });
}

function drawLogo(ctx, config, image) {
  const maxSide = config.size * config.logoScale;
  const scale = Math.min(maxSide / image.naturalWidth, maxSide / image.naturalHeight);
  const boxW = image.naturalWidth * scale;
  const boxH = image.naturalHeight * scale;
  const pad = boxW * 0.12;
  const x = (config.size - boxW) / 2;
  const y = (config.size - boxH) / 2;

  ctx.save();
  ctx.fillStyle = config.colorLight;
  roundRect(ctx, x - pad, y - pad, boxW + pad * 2, boxH + pad * 2, (boxW + pad * 2) * 0.2);
  ctx.fill();
  ctx.clip();
  ctx.drawImage(image, x, y, boxW, boxH);
  ctx.restore();
}

export class QRGenerator {
  static async renderToCanvas(canvas, config) {
    const { matrix, cell, offset } = layout(config);
    canvas.width = config.size;
    canvas.height = config.size;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, config.size, config.size);

    ctx.fillStyle = config.colorLight;
    ctx.fillRect(0, 0, config.size, config.size);

    ctx.fillStyle = makeFill(ctx, config, config.size, config.size);
    for (let row = 0; row < matrix.size; row += 1) {
      for (let col = 0; col < matrix.size; col += 1) {
        if (!matrix.get(row, col)) continue;
        drawModule(
          ctx,
          offset + col * cell,
          offset + row * cell,
          cell,
          config.moduleStyle,
          inFinderZone(row, col, matrix.size),
        );
      }
    }

    if (config.logo) {
      const image = await loadImage(config.logo);
      drawLogo(ctx, config, image);
    }

    return canvas;
  }

  static async toDataURL(config, mime = 'image/png') {
    const canvas = document.createElement('canvas');
    await QRGenerator.renderToCanvas(canvas, config);
    return canvas.toDataURL(mime);
  }

  static toSVG(config) {
    const { matrix, cell, offset, count } = layout(config);
    const size = config.size;
    const defs = [];
    let fill = config.colorDark;

    if (config.gradient) {
      const stops =
        `<stop offset="0" stop-color="${config.colorDark}"/>` +
        `<stop offset="1" stop-color="${config.gradientColor}"/>`;
      defs.push(
        `<linearGradient id="qrg" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">${stops}</linearGradient>`,
      );
      fill = 'url(#qrg)';
    }

    const shapes = [];
    for (let row = 0; row < matrix.size; row += 1) {
      for (let col = 0; col < matrix.size; col += 1) {
        if (!matrix.get(row, col)) continue;
        const x = +(offset + col * cell).toFixed(3);
        const y = +(offset + row * cell).toFixed(3);
        const inFinder = inFinderZone(row, col, matrix.size);
        const style = config.moduleStyle === 'dots' && !inFinder ? 'circle' : inFinder ? 'square' : config.moduleStyle;

        if (style === 'circle') {
          shapes.push(`<circle cx="${+(x + cell / 2).toFixed(3)}" cy="${+(y + cell / 2).toFixed(3)}" r="${+(cell * 0.42).toFixed(3)}"/>`);
        } else if (style === 'rounded' || style === 'classy') {
          const inset = cell * 0.06;
          const radius = style === 'classy' ? (cell - inset * 2) * 0.5 : (cell - inset * 2) * 0.32;
          shapes.push(`<rect x="${+(x + inset).toFixed(3)}" y="${+(y + inset).toFixed(3)}" width="${+(cell - inset * 2).toFixed(3)}" height="${+(cell - inset * 2).toFixed(3)}" rx="${+radius.toFixed(3)}"/>`);
        } else {
          shapes.push(`<rect x="${x}" y="${y}" width="${+cell.toFixed(3)}" height="${+cell.toFixed(3)}"/>`);
        }
      }
    }

    let logoMarkup = '';
    if (config.logo) {
      const maxSide = size * config.logoScale;
      const image = QRGenerator.#logoSizeCache.get(config.logo);
      let boxW = maxSide;
      let boxH = maxSide;
      if (image) {
        const scale = Math.min(maxSide / image.naturalWidth, maxSide / image.naturalHeight);
        boxW = image.naturalWidth * scale;
        boxH = image.naturalHeight * scale;
      }
      const pad = boxW * 0.12;
      const x = (size - boxW) / 2;
      const y = (size - boxH) / 2;
      logoMarkup =
        `<rect x="${x - pad}" y="${y - pad}" width="${boxW + pad * 2}" height="${boxH + pad * 2}" rx="${(boxW + pad * 2) * 0.2}" fill="${config.colorLight}"/>` +
        `<image href="${config.logo}" x="${x}" y="${y}" width="${boxW}" height="${boxH}"/>`;
    }

    const defsMarkup = defs.length ? `<defs>${defs.join('')}</defs>` : '';
    const body = shapes.join('');
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">` +
      `${defsMarkup}` +
      `<rect width="${size}" height="${size}" fill="${config.colorLight}"/>` +
      (body ? `<g fill="${fill}">${body}</g>` : '') +
      `${logoMarkup}` +
      `</svg>`
    );
  }

  static #logoSizeCache = new Map();

  static toThumbnail(data, size = 128) {
    return QRCode.toDataURL(data, {
      width: size,
      margin: 0,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
    });
  }

  static resizeLogoImage(file, maxSize = 240) {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(objectUrl);
        QRGenerator.#logoSizeCache.set(canvas.toDataURL('image/png'), {
          naturalWidth: canvas.width,
          naturalHeight: canvas.height,
        });
        resolve(canvas.toDataURL('image/png'));
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Imagen no válida.'));
      };
      image.src = objectUrl;
    });
  }
}