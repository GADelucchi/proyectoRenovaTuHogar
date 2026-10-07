/**
 * Renová tu hogar — scripts del sitio.
 * Cada bloque de UI se inicializa por separado y no hace nada si su markup
 * no está presente, para que la página siga funcionando de forma aislada.
 */
(() => {
  "use strict";

  /* ---------------------------------------------------------------- */
  /* Configuración                                                    */
  /* ---------------------------------------------------------------- */

  const CONFIG = {
    whatsappNumber: "5491134295800",
    scrollTopOffset: 300,
    comparator: { min: 4, max: 96, initial: 50 },
    /* Hasta este ancho se usa el menú hamburguesa: cubre iPhones en ambas
       orientaciones e iPads de 8,3" a 11" verticales, más la iPad mini
       apaisada (1133 px). Por encima queda la navegación de escritorio. */
    mobileNavBreakpoint: 1140,
  };

  /* ---------------------------------------------------------------- */
  /* Utilidades                                                       */
  /* ---------------------------------------------------------------- */

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const buildWhatsAppUrl = (message) =>
    `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;

  /* ---------------------------------------------------------------- */
  /* Datos: obras del comparador antes / después                      */
  /* ---------------------------------------------------------------- */

  /**
   * Único lugar a editar para cargar obras reales.
   * Para agregar una obra nueva, sumá una entrada más: las solapas y las
   * miniaturas se generan solas a partir de este objeto.
   *
   * Fotos verticales 1200 x 1600 px (3:4), .webp, < 150 KB.
   * Sacar el antes y el después desde el MISMO ángulo para que el barrido
   * se vea bien.
   *
   * El texto de `alt` es el que lee Google: describir qué se hizo y dónde.
   */
  const PROJECTS = {
    cocina: {
      label: "Cocina",
      before: {
        src: "assets/imgs/obras/cocina-antes.webp",
        alt: "Cocina antes de la remodelación en CABA: muebles de melamina originales, azulejos con guarda y calefactor a la vista",
      },
      after: {
        src: "assets/imgs/obras/cocina-despues.webp",
        alt: "Cocina remodelada en CABA con muebles a medida sin tiradores, mesada blanca, anafe eléctrico e iluminación LED bajo alacena",
      },
    },
    bano: {
      label: "Baño",
      before: {
        src: "assets/imgs/obras/bano-antes.webp",
        alt: "Baño antes de la reforma: paredes descascaradas sin revestimiento, piso de mosaico granítico e inodoro con mochila a la vista",
      },
      after: {
        src: "assets/imgs/obras/bano-despues.webp",
        alt: "Baño reformado con porcelanato símil cemento, ducha a nivel con canaleta lineal, grifería empotrada acero y vanitory azul a medida",
      },
    },
    cocina2: {
      label: "Cocina 2",
      before: {
        src: "assets/imgs/obras/cocina2-antes.webp",
        alt: "Cocina antes de la remodelación: muebles blancos con tiradores, mesada de acero con pileta doble, cocina a gas de pie y azulejos blancos",
      },
      after: {
        src: "assets/imgs/obras/cocina2-despues.webp",
        alt: "Cocina remodelada con bajo mesada símil madera, alacenas gris claro sin tiradores hasta el techo, mesada blanca, anafe y horno empotrados y piso continuo gris",
      },
    },
  };

  /* ---------------------------------------------------------------- */
  /* Datos: galería de obras terminadas                               */
  /* ---------------------------------------------------------------- */

  /**
   * Único lugar a editar para sumar fotos a la galería.
   *
   * Fotos verticales 1200 x 1600 px (3:4), .webp, < 150 KB — la grilla
   * recorta a 3:4, así que lo importante tiene que estar centrado.
   *
   * `caption` es el rótulo que se ve sobre la foto; `alt` es el que lee
   * Google: describir qué se hizo y dónde.
   */
  const GALLERY = [
    {
      src: "assets/imgs/obras/bano-espejo.webp",
      caption: "Baño · espejo LED",
      alt: "Baño reformado en CABA con espejo ovalado retroiluminado LED, spots embutidos, grifería alta y bacha apoyada sobre vanitory azul",
    },
    {
      src: "assets/imgs/obras/cocina-despues.webp",
      caption: "Cocina · muebles a medida",
      alt: "Cocina remodelada en CABA con muebles a medida sin tiradores, mesada blanca, anafe eléctrico e iluminación LED bajo alacena",
    },
    {
      src: "assets/imgs/obras/hero-obra.webp",
      caption: "Cocina · tono grafito",
      alt: "Cocina remodelada por Renová tu hogar en CABA, con muebles a medida en tono grafito, mesada de granito e iluminación LED",
    },
  ];

  /* ---------------------------------------------------------------- */
  /* Comparador antes / después                                       */
  /* ---------------------------------------------------------------- */

  const initBeforeAfter = () => {
    const frame = $("#baFrame");
    const afterLayer = $("#baAfter");
    const beforeLayer = $("#baBefore");
    const handle = $("#baHandle");
    const tabsContainer = $("#baTabs");
    const thumbsContainer = $("#baThumbs");

    if (!frame || !afterLayer || !beforeLayer || !handle) return;

    const entries = Object.entries(PROJECTS);
    const { min, max, initial } = CONFIG.comparator;
    let isDragging = false;

    const createPhoto = ({ src, alt }, isPrimary) => {
      const img = new Image();
      img.className = "ba-photo";
      img.src = src;
      img.alt = alt;
      img.width = 1200;
      img.height = 1600;
      img.decoding = "async";
      img.draggable = false;
      if (!isPrimary) img.loading = "lazy";
      return img;
    };

    const renderTabs = () => {
      if (!tabsContainer) return;
      entries.forEach(([key, project]) => {
        const tab = document.createElement("button");
        tab.type = "button";
        tab.className = "ba-tab";
        tab.dataset.project = key;
        tab.textContent = project.label;
        tabsContainer.append(tab);
      });
    };

    const renderThumbs = () => {
      if (!thumbsContainer) return;
      entries.forEach(([key, project]) => {
        const thumb = document.createElement("button");
        thumb.type = "button";
        thumb.className = "ba-thumb";
        thumb.dataset.project = key;
        thumb.setAttribute("aria-label", `Ver obra: ${project.label}`);

        const img = new Image();
        img.src = project.after.src;
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        thumb.append(img);

        thumbsContainer.append(thumb);
      });
    };

    const setPosition = (percent) => {
      const value = clamp(percent, min, max);
      beforeLayer.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
      handle.style.left = `${value}%`;
    };

    const markActive = (key) => {
      $$(".ba-tab, .ba-thumb").forEach((el) =>
        el.classList.toggle("active", el.dataset.project === key)
      );
    };

    const loadProject = (key, isFirstRender = false) => {
      const project = PROJECTS[key];
      if (!project) return;

      afterLayer.replaceChildren(createPhoto(project.after, isFirstRender));

      const label = document.createElement("span");
      label.className = "ba-corner-label";
      label.textContent = "Antes";
      beforeLayer.replaceChildren(label, createPhoto(project.before, isFirstRender));

      markActive(key);
      setPosition(initial);
    };

    const percentFromEvent = (event) => {
      const { left, width } = frame.getBoundingClientRect();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      return ((clientX - left) / width) * 100;
    };

    const startDrag = (event) => {
      isDragging = true;
      setPosition(percentFromEvent(event));
    };

    const drag = (event) => {
      if (isDragging) setPosition(percentFromEvent(event));
    };

    const stopDrag = () => {
      isDragging = false;
    };

    renderTabs();
    renderThumbs();

    [tabsContainer, thumbsContainer].forEach((container) =>
      container?.addEventListener("click", (event) => {
        const target = event.target.closest("[data-project]");
        if (target) loadProject(target.dataset.project);
      })
    );

    frame.addEventListener("mousedown", startDrag);
    window.addEventListener("mousemove", drag);
    window.addEventListener("mouseup", stopDrag);

    frame.addEventListener("touchstart", startDrag, { passive: true });
    window.addEventListener("touchmove", drag, { passive: true });
    window.addEventListener("touchend", stopDrag);

    loadProject(entries[0]?.[0], true);
  };

  /* ---------------------------------------------------------------- */
  /* Menú hamburguesa (mobile / tablet)                               */
  /* ---------------------------------------------------------------- */

  const initMobileNav = () => {
    const header = $("header");
    const toggle = $("#menuToggle");
    const panel = $("#primaryNav");
    const backdrop = $("#navBackdrop");

    if (!header || !toggle || !panel) return;

    /* El panel se despliega justo debajo del header, cuya altura cambia
       según la orientación: la exponemos como variable CSS. */
    const syncHeaderHeight = () => {
      document.documentElement.style.setProperty(
        "--header-h",
        `${Math.round(header.getBoundingClientRect().height)}px`
      );
    };

    const isOpen = () => header.classList.contains("nav-open");

    const setOpen = (open) => {
      header.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      document.documentElement.classList.toggle("nav-open", open);

      if (!backdrop) return;
      if (open) {
        backdrop.hidden = false;
        requestAnimationFrame(() => backdrop.classList.add("show"));
      } else {
        backdrop.classList.remove("show");
        backdrop.hidden = true;
      }
    };

    const close = () => {
      if (isOpen()) setOpen(false);
    };

    syncHeaderHeight();

    toggle.addEventListener("click", () => {
      syncHeaderHeight();
      setOpen(!isOpen());
    });

    backdrop?.addEventListener("click", close);

    panel.addEventListener("click", (event) => {
      if (event.target.closest("a")) close();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });

    const desktop = window.matchMedia(
      `(min-width: ${CONFIG.mobileNavBreakpoint + 1}px)`
    );
    desktop.addEventListener("change", (event) => {
      if (event.matches) close();
      syncHeaderHeight();
    });

    window.addEventListener("resize", syncHeaderHeight, { passive: true });
    window.addEventListener("orientationchange", () => {
      close();
      setTimeout(syncHeaderHeight, 200);
    });

    if ("ResizeObserver" in window) {
      new ResizeObserver(syncHeaderHeight).observe(header);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Botón "volver arriba"                                            */
  /* ---------------------------------------------------------------- */

  const initScrollToTop = () => {
    const button = $("#scrollToTop");
    if (!button) return;

    const toggleVisibility = () =>
      button.classList.toggle("show", window.scrollY > CONFIG.scrollTopOffset);

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    button.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );

    toggleVisibility();
  };

  /* ---------------------------------------------------------------- */
  /* Formulario de contacto → WhatsApp                                */
  /* ---------------------------------------------------------------- */

  const initContactForm = () => {
    const form = $("#contactForm");
    if (!form) return;

    const readField = (name) => String(new FormData(form).get(name) ?? "").trim();

    const composeMessage = ({ nombre, tipo, mensaje }) =>
      [
        "¡Hola! Quiero consultar por una obra.",
        `Nombre: ${nombre}`,
        `Tipo de obra: ${tipo}`,
        mensaje && `Detalle: ${mensaje}`,
      ]
        .filter(Boolean)
        .join("\n");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const nombre = readField("nombre");
      if (!nombre) {
        form.elements.nombre?.focus();
        return;
      }

      const message = composeMessage({
        nombre,
        tipo: readField("tipo"),
        mensaje: readField("mensaje"),
      });

      window.open(buildWhatsAppUrl(message), "_blank", "noopener");
      form.reset();
    });
  };

  /* ---------------------------------------------------------------- */
  /* Galería de obras + lightbox                                      */
  /* ---------------------------------------------------------------- */

  const initGallery = () => {
    const grid = $("#galGrid");
    if (!grid || !GALLERY.length) return;

    let lightbox = null;
    let currentIndex = 0;
    let lastFocused = null;

    GALLERY.forEach((photo, index) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "gal-item";
      item.dataset.index = index;
      item.setAttribute("aria-label", `Ampliar foto: ${photo.caption}`);

      const img = new Image();
      img.src = photo.src;
      img.alt = photo.alt;
      img.width = 1200;
      img.height = 1600;
      img.loading = "lazy";
      img.decoding = "async";

      const caption = document.createElement("span");
      caption.className = "gal-cap";
      caption.textContent = photo.caption;

      item.append(img, caption);
      grid.append(item);
    });

    const iconButton = (className, label, path) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `lb-btn ${className}`;
      button.setAttribute("aria-label", label);
      button.innerHTML =
        `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
      return button;
    };

    const show = (index) => {
      currentIndex = (index + GALLERY.length) % GALLERY.length;
      const photo = GALLERY[currentIndex];
      $(".lb-photo", lightbox).src = photo.src;
      $(".lb-photo", lightbox).alt = photo.alt;
      $(".lb-caption", lightbox).textContent = photo.caption;
    };

    const close = () => {
      if (!lightbox) return;
      lightbox.remove();
      lightbox = null;
      document.body.style.overflow = "";
      lastFocused?.focus();
    };

    const open = (index) => {
      lastFocused = document.activeElement;

      lightbox = document.createElement("div");
      lightbox.className = "lightbox";
      lightbox.setAttribute("role", "dialog");
      lightbox.setAttribute("aria-modal", "true");
      lightbox.setAttribute("aria-label", "Foto de obra ampliada");

      const photo = new Image();
      photo.className = "lb-photo";

      const caption = document.createElement("p");
      caption.className = "lb-caption";

      const closeBtn = iconButton("lb-close", "Cerrar", "M6 6l12 12M18 6L6 18");
      const prevBtn = iconButton("lb-prev", "Foto anterior", "M15 5l-7 7 7 7");
      const nextBtn = iconButton("lb-next", "Foto siguiente", "M9 5l7 7-7 7");

      closeBtn.addEventListener("click", close);
      prevBtn.addEventListener("click", () => show(currentIndex - 1));
      nextBtn.addEventListener("click", () => show(currentIndex + 1));

      lightbox.append(photo, caption, closeBtn);
      if (GALLERY.length > 1) lightbox.append(prevBtn, nextBtn);

      lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) close();
      });

      document.body.append(lightbox);
      document.body.style.overflow = "hidden";
      show(index);
      closeBtn.focus();
    };

    grid.addEventListener("click", (event) => {
      const item = event.target.closest(".gal-item");
      if (item) open(Number(item.dataset.index));
    });

    document.addEventListener("keydown", (event) => {
      if (!lightbox) return;
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") show(currentIndex - 1);
      if (event.key === "ArrowRight") show(currentIndex + 1);
    });
  };

  /* ---------------------------------------------------------------- */
  /* Arranque                                                         */
  /* ---------------------------------------------------------------- */

  const init = () => {
    initMobileNav();
    initBeforeAfter();
    initGallery();
    initScrollToTop();
    initContactForm();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();