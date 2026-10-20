# Portafolio — Luis Enrique Cabrera García

Sitio personal estático de una sola página para presentar proyectos de desarrollo web,
integración de IA, soporte técnico e infraestructura.

- **Stack:** HTML5, CSS3 y JavaScript puro (sin frameworks ni build).
- **Publicado en:** GitHub Pages.
- **Idioma:** español.

## Estructura

```
portfolio/
├─ index.html        Contenido y orden de los scripts
├─ css/
│  └─ styles.css     Todos los estilos (tokens, temas y componentes)
├─ js/               Módulos POO en el namespace `Portfolio`
├─ assets/           Imágenes de los proyectos
├─ DOCUMENTACION.txt Guía técnica de arquitectura y mantenimiento
└─ README.md
```

## Desarrollo local

No requiere instalación ni build. Abre `index.html` en el navegador, o sirve la
carpeta con cualquier servidor estático:

```bash
npx serve .
```

## Publicar

El despliegue es automático: cualquier push a `main` publica el sitio con GitHub
Pages.

```bash
git add .
git commit -m "descripción del cambio"
git push
```

## Créditos

Diseño y desarrollo: Luis Enrique Cabrera García.
