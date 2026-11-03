function cleanFileName(value) {
  const slug = String(value || 'qr')
    .trim()
    .slice(0, 60)
    .toLowerCase()
    .replace(/[^\w]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'qr';
}

function triggerDownload(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
}

export class QRDownloader {
  static downloadDataURL(dataUrl, data, extension) {
    triggerDownload(dataUrl, `${cleanFileName(data)}.${extension}`);
  }

  static downloadSVG(svgString, data) {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${cleanFileName(data)}.svg`);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  static printDataURL(dataUrl) {
    const win = window.open('', '_blank', 'width=680,height=720');
    if (!win) return;
    win.document.write(
      '<!DOCTYPE html><html lang="es"><head><title>Imprimir QR</title>' +
        '<style>html,body{margin:0;display:grid;place-items:center;min-height:100vh;background:#fff}' +
        'img{width:min(70vw,560px);height:auto;image-rendering:pixelated;border-radius:8px;box-shadow:0 10px 40px rgba(0,0,0,.18)}' +
        '@media print{body{min-height:auto}img{box-shadow:none}}</style></head>' +
        `<body><img src="${dataUrl}" alt="Código QR"/></body></html>`,
    );
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 250);
  }
}