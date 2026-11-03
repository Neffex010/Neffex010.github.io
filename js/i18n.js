/* ============================================================
   IDIOMA — contenido español/inglés con preferencia persistente.
   ============================================================ */
"use strict";

Portfolio.Language = class {
  constructor({ textSplit }) {
    this.textSplit = textSplit;
    this.button = document.querySelector("#language-toggle");
    this.translations = new Map(Object.entries({
      "Principal": "Main navigation", "Inicio": "Home", "Proyectos": "Projects", "Sobre mí": "About me", "Formación": "Education", "Formación y certificaciones": "Education & Certifications", "Habilidades": "Skills", "Contacto": "Contact", "Hablemos": "Let's talk",
      "Pachuca · Remoto e híbrido": "Pachuca · Remote and hybrid", "Desarrollo soluciones web e integro inteligencia artificial para resolver necesidades reales.": "I build web solutions and integrate artificial intelligence to solve real needs.", "Desarrollo web · IA aplicada": "Web development · Applied AI", "Ver mis proyectos": "View my projects", "Desliza": "Scroll", "Bajar a Proyectos": "Scroll to Projects",
      "Construyo soluciones útiles con desarrollo web e inteligencia artificial.": "I build useful solutions with web development and artificial intelligence.",
      "Proyecto académico · IA": "Academic project · AI", "Proyecto para negocio local": "Local business project", "Proyecto personal · PWA": "Personal project · PWA", "Proyecto académico · IA multimodal": "Academic project · Multimodal AI", "Proyecto académico · IA aplicada": "Academic project · Applied AI",
      "EntrevistaLab — Simulador de entrevistas con IA": "EntrevistaLab — AI Interview Simulator", "Prototipo funcional para un taller de investigación: genera preguntas según el puesto, evalúa las respuestas con IA y exporta un informe PDF.": "A functional prototype for a research workshop: generates role-specific questions, evaluates answers with AI, and exports a PDF report.",
      "Simula entrevistas: genera preguntas por puesto, evalúa respuestas con IA y exporta informes PDF.": "Simulates interviews: generates role-specific questions, evaluates answers with AI, and exports PDF reports.",
      "Manualidades Lua — Catálogo de productos": "Manualidades Lua — Product Catalog", "Catálogo para un negocio local de crochet, desarrollado con apoyo de agentes de IA. Incluye cuatro categorías, filtros y cotización por WhatsApp con el producto seleccionado.": "A catalog for a local crochet business, built with support from AI agents. It includes four categories, filters, and WhatsApp quotes for selected products.",
      "Herramientas para técnicos de redes: inventario de puntos, conexiones, pruebas de enlaces, etiquetas QR, calculadoras y planos. Funciona sin conexión y conserva los datos en el navegador.": "Tools for network technicians: outlet and connection inventory, link tests, QR labels, calculators, and floor plans. Works offline and stores data in the browser.",
      "Traductor Inteligente Multimodal": "Multimodal AI Translator", "Traduce entre español e inglés por chat, audio e imágenes; también procesa documentos y conserva el contexto de la conversación.": "Translates between Spanish and English through chat, audio, and images. It also processes documents and keeps conversation context.",
      "Traduce entre español e inglés mediante texto, audio e imágenes, y procesa documentos con IA.": "Translates between Spanish and English through text, audio, and images, and processes documents with AI.",
      "Agente Investigador TIC": "IT Research Agent", "Analiza consultas de tecnología, busca fuentes en línea, contrasta hallazgos y organiza la información en reportes con referencias.": "Researches technology questions, finds online sources, cross-checks findings, and organizes information into reports with references.",
      "Investiga temas TIC en fuentes web, contrasta hallazgos y genera reportes con referencias.": "Researches ICT topics using web sources, cross-checks findings, and generates reports with references.",
      "Prompt Hub — Explorador de prompts": "Prompt Hub — Prompt Explorer", "Explorador de más de 2,700 prompts open source con filtros, variables editables, favoritos y enlaces para probarlos en ChatGPT o Claude.": "Explore more than 2,700 open-source prompts with filters, editable variables, favorites, and links to try them in ChatGPT or Claude.",
      "Explora más de 2,700 prompts con filtros, variables editables y favoritos.": "Explore more than 2,700 prompts with filters, editable variables, and favorites.",
      "Código": "Code", "Tecnologías utilizadas": "Technologies used", "Abrir la demo de EntrevistaLab": "Open the EntrevistaLab demo", "Ver el código en GitHub": "View the source code on GitHub", "Abrir la demo de Manualidades Lua": "Open the Manualidades Lua demo", "Abrir la demo de Net Tools Web": "Open the Net Tools Web demo", "Abrir la demo del Traductor Inteligente Multimodal": "Open the Multimodal AI Translator demo", "Ver el código del Traductor Inteligente Multimodal en GitHub": "View the Multimodal AI Translator source code on GitHub", "Abrir la demo del Agente Investigador TIC": "Open the IT Research Agent demo", "Ver el código del Agente Investigador TIC en GitHub": "View the IT Research Agent source code on GitHub", "Abrir la demo de Prompt Hub": "Open the Prompt Hub demo", "Ver el código de Prompt Hub en GitHub": "View the Prompt Hub source code on GitHub",
      "Abrir la demo de Galactic Swarm": "Open the Galactic Swarm demo", "Ver el código de Galactic Swarm en GitHub": "View the Galactic Swarm source code on GitHub", "Abrir la demo de Clima Global": "Open the Global Weather demo", "Ver el código de Clima Global en GitHub": "View the Global Weather source code on GitHub", "Abrir la demo del Generador QR": "Open the QR Generator demo", "Ver el código del Generador QR": "View the QR Generator source code", "Ver el código de Manualidades Lua en GitHub": "View Manualidades Lua source code on GitHub", "Ver el código de Net Tools Web en GitHub": "View Net Tools Web source code on GitHub",
      "Colaboración local": "Local collaboration", "Otros proyectos": "More projects", "Shooter arcade en Canvas 2D con colisiones AABB propias y dificultad adaptativa, sin librerías externas.": "A Canvas 2D arcade shooter with custom AABB collision detection and adaptive difficulty, built without external libraries.", "Pronóstico a 7 días e histórico del clima, con gráficos y exportación de datos. JavaScript · Vite · Open-Meteo API · Canvas 2D.": "7-day forecast and historical weather with charts and data export. JavaScript · Vite · Open-Meteo API · Canvas 2D.", "Crea, personaliza, escanea y descarga códigos QR; guarda el historial directamente en el navegador.": "Create, customize, scan, and download QR codes; history is saved directly in the browser.",
      "Catálogo de crochet con filtros por categoría y cotización por WhatsApp.": "Crochet catalog with category filters and WhatsApp quote requests.", "PWA para inventario de redes, pruebas de enlace y planos; funciona sin conexión.": "PWA for network inventory, link tests, and floor plans; works offline.",
      "Estudio Ingeniería en TIC en el Instituto Tecnológico de Pachuca. Me enfoco en desarrollo web e IA aplicada, con bases académicas en datos, redes y soporte.": "I study ICT Engineering at Instituto Tecnológico de Pachuca. I focus on web development and applied AI, with academic foundations in data, networking, and support.", "Ver mi CV": "View my resume (Spanish)", "Ver mi currículum en una pestaña nueva": "Open my resume in a new tab (Spanish)",
      "Interfaz de EntrevistaLab, simulador de entrevistas técnicas con IA": "EntrevistaLab interface, an AI technical interview simulator", "Catálogo web de Manualidades Lua con productos de crochet por categoría": "Manualidades Lua web catalog with crochet products by category", "Dashboard de Net Tools Web, PWA para diagnóstico e inventario de redes": "Net Tools Web dashboard, a PWA for network diagnostics and inventory", "Interfaz del Traductor Inteligente Multimodal para texto, audio, documentos e imágenes": "Multimodal AI Translator interface for text, audio, documents, and images", "Portada del Agente Investigador que busca y contrasta fuentes sobre temas TIC": "IT Research Agent cover showing its source research interface", "Portada gráfica de Prompt Hub, explorador open source de prompts": "Prompt Hub cover, an open-source prompt explorer", "Retrato de Luis Enrique Cabrera García": "Portrait of Luis Enrique Cabrera García",
      "Egreso estimado · 2027": "Expected graduation · 2027", "Ingeniería en Tecnologías de la Información y Comunicaciones": "Information and Communications Technology Engineering", "Instituto Tecnológico de Pachuca": "Pachuca Institute of Technology", "Enfoque en desarrollo de software, redes e infraestructura en la nube.": "Focus on software development, networking, and cloud infrastructure.", "Insignia de formación": "Training badge", "AWS Academy — Cloud Foundations": "AWS Academy — Cloud Foundations", "Curso AWS Academy Cloud Foundations completado; insignia de formación emitida por Amazon Web Services.": "Completed AWS Academy Cloud Foundations; training badge issued by Amazon Web Services.", "17 de junio de 2026 · 26 horas": "June 17, 2026 · 26 hours", "Capacítate para el Empleo · Fundación Carlos Slim": "Capacítate para el Empleo · Carlos Slim Foundation", "Curso completado y aprobado.": "Course completed and passed.", "Verificar constancia": "Verify certificate", "Titulado": "Graduate", "Técnico en Programación": "Programming Technician", "Bases de programación, bases de datos y desarrollo de aplicaciones.": "Programming fundamentals, databases, and application development.",
      "Ver insignia AWS": "View AWS badge", "Enlace de insignia AWS pendiente de agregar": "AWS badge link to be added", "Añade aquí el enlace público de tu insignia AWS": "Add your public AWS badge link here",
      "Enfoque en software, redes e infraestructura en la nube.": "Focus on software, networking, and cloud infrastructure.", "Curso completado; insignia de formación emitida por AWS.": "Course completed; training badge issued by AWS.", "Fundamentos de programación, datos y desarrollo de aplicaciones.": "Foundations in programming, data, and application development.",
      "Desarrollo web y software": "Web & Software Development", "Programación modular y POO": "Modular programming & OOP", "IA y datos": "AI & Data", "Diseño de prompts": "Prompt design", "Agentes de búsqueda": "Research agents", "Infraestructura y redes": "Infrastructure & Networking", "Subneteo": "Subnetting", "IP · Subneteo · Router · Switch": "IP · Subnetting · Router · Switch", "Soporte y mantenimiento de PC": "Computer support & maintenance", "Herramientas y flujo de trabajo": "Tools & Workflow", "Despliegue: Pages · Netlify · Vercel": "Deployment: Pages · Netlify · Vercel", "Idiomas": "Languages", "Español nativo · Inglés B2": "Native Spanish · English B2",
      "Estudios": "Education", "Certificaciones": "Certifications",
      "¿Tienes un proyecto o propuesta? Escríbeme.": "Have a project or opportunity in mind? Get in touch.", "Formulario de contacto": "Contact form", "Nombre": "Name", "Tu nombre": "Your name", "Mensaje": "Message", "Escribe tu mensaje…": "Write your message…", "Preparar correo": "Compose email", "Correo": "Email", "Enviar un correo electrónico": "Send an email", "Enviar mensaje": "Send a message", "Contactar por WhatsApp al +52 771 776 1908": "Contact me on WhatsApp at +52 771 776 1908", "Ver perfil de LinkedIn": "View LinkedIn profile", "Todos los derechos reservados.": "All rights reserved.", "Luis Enrique Cabrera García. Todos los derechos reservados.": "Luis Enrique Cabrera García. All rights reserved.", "Volver arriba": "Back to top", "↑ Volver arriba": "↑ Back to top", "Abrir menú": "Open menu", "Cerrar menú": "Close menu", "Cambiar tema": "Toggle theme"
    }));
    this.attributes = ["aria-label", "title", "placeholder", "alt"];
    this.originalNodes = new Map();
    this.originalHeadings = new Map();
    this.originalAttrs = new WeakMap();
    this.originalMeta = new Map();
    this.current = "es";
  }

  t(es) { return this.current === "en" ? (this.translations.get(es) || es) : es; }

  init() {
    try { this.current = localStorage.getItem("portfolio-language") === "en" ? "en" : "es"; } catch (_) {}
    if (this.button) this.button.addEventListener("click", () => this.set(this.current === "es" ? "en" : "es"));
    this.capture();
    this.apply();
  }

  capture() {
    document.querySelectorAll(".section__title").forEach((el) => this.originalHeadings.set(el, el.textContent.trim()));
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement.closest("script,style,svg,#hero-role,#language-toggle,.section__title")) continue;
      const original = node.nodeValue;
      if (this.translations.has(original.trim())) this.originalNodes.set(node, original);
    }
    document.querySelectorAll("[aria-label],[title],[placeholder]").forEach((el) => {
      const saved = {};
      this.attributes.forEach((attr) => { if (el.hasAttribute(attr)) saved[attr] = el.getAttribute(attr); });
      this.originalAttrs.set(el, saved);
    });
    ["title", "description", "og:title", "og:description", "og:locale", "twitter:title", "twitter:description"].forEach((key) => {
      const selector = key === "title" ? "title" : key === "description" ? 'meta[name="description"]' : key.startsWith("twitter:") ? `meta[name="${key}"]` : `meta[property="${key}"]`;
      const el = document.querySelector(selector);
      if (el) this.originalMeta.set(key, { el, value: key === "title" ? el.textContent : el.content });
    });
  }

  set(language) {
    this.current = language;
    try { localStorage.setItem("portfolio-language", language); } catch (_) {}
    this.apply();
    document.dispatchEvent(new CustomEvent("portfolio:languagechange", { detail: { language } }));
  }

  apply() {
    document.documentElement.lang = this.current;
    this.originalNodes.forEach((original, node) => {
      const source = original.trim();
      const translated = this.t(source);
      node.nodeValue = original.replace(source, translated);
    });
    this.originalHeadings.forEach((original, heading) => {
      const translated = this.t(original);
      if (heading.dataset.split) this.textSplit.refresh(heading, translated);
      else heading.textContent = translated;
    });
    document.querySelectorAll("[aria-label],[title],[placeholder]").forEach((el) => {
      const saved = this.originalAttrs.get(el);
      if (!saved) return;
      this.attributes.forEach((attr) => { if (saved[attr]) el.setAttribute(attr, this.t(saved[attr])); });
    });
    this.originalMeta.forEach(({ el, value }, key) => {
      if (key === "og:locale") el.content = this.current === "en" ? "en_US" : value;
      else if (key === "title") el.textContent = this.current === "en" ? "Luis Enrique Cabrera García — Web Development & AI" : value;
      else if (key === "description") el.content = this.current === "en" ? "Portfolio of Luis Enrique Cabrera García, ICT Engineering student. Web development and applied AI projects, with academic experience in networking, infrastructure, and technical support." : value;
      else if (key === "og:title" || key === "twitter:title") el.content = this.current === "en" ? "Luis Enrique Cabrera García — Web Development & AI" : value;
      else if (key === "og:description" || key === "twitter:description") el.content = this.current === "en" ? "Web development and AI integration. ICT Engineering student with experience in technical support and personal projects." : value;
    });
    if (this.button) {
      this.button.textContent = this.current === "es" ? "EN" : "ES";
      this.button.lang = this.current === "es" ? "en" : "es";
      const label = this.current === "es" ? "Cambiar idioma a inglés" : "Switch language to Spanish";
      this.button.setAttribute("aria-label", label);
      this.button.title = label;
    }
  }
};
