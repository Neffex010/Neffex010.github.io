# Generador QR

Aplicación web para crear y personalizar códigos QR directamente en el navegador. No envía el contenido a un servidor: la configuración y el historial se guardan localmente en `localStorage`.

## Funciones

- Contenido para texto, enlaces, email, teléfono, WiFi, SMS, WhatsApp, ubicación y contacto (vCard).
- Vista previa en vivo y cálculo del tamaño del contenido frente al límite de capacidad.
- Personalización del tamaño, margen, corrección de errores, colores, degradados y forma de los módulos.
- Logotipo central con ajuste de tamaño.
- Descarga en PNG, WEBP, JPEG y SVG, copia de imagen o contenido, e impresión.
- Lectura de códigos QR desde una imagen o desde la cámara. La cámara requiere permiso del navegador y un contexto seguro (HTTPS o `localhost`).
- Historial local de hasta 20 códigos y restauración de la última configuración.
- Temas claro y oscuro, diseño adaptable y controles de contenido navegables con teclado.

## Requisitos

- Node.js 20.19 o superior de la rama 20, o Node.js 22.12 o superior.

## Desarrollo

```bash
npm install
npm run dev
```

El servidor de desarrollo abre la aplicación en `http://localhost:5173`.

## Publicar en GitHub Pages

El repositorio incluye un flujo de GitHub Actions que compila la app y publica `dist` cada vez que hay cambios en `main`. Crea el repositorio en GitHub, sube este proyecto a la rama `main` y, en **Settings → Pages**, selecciona **GitHub Actions** como fuente.

## Producción

```bash
npm run build
npm run preview
```

## Tecnologías

- Vite para desarrollo y compilación.
- `qrcode` para codificar códigos QR.
- `jsQR` para leer códigos QR desde imágenes y cámara.
