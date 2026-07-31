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
   * Fotos recomendadas: 1600 x 920 px (16:9.2), formato .webp, < 300 KB.
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
        alt: "Cocina antes de la remodelación en CABA: muebles viejos y azulejos originales",
      },
      after: {
        src: "assets/imgs/obras/cocina-despues.webp",
        alt: "Cocina remodelada en CABA con muebles a medida, mesada nueva e iluminación LED",
      },
    },

    fachada: {
      label: "Fachada",
      before: {
        src: "assets/imgs/obras/fachada-antes.webp",
        alt: "Fachada deteriorada antes de la reforma en Ciudad Autónoma de Buenos Aires",
      },
      after: {
        src: "assets/imgs/obras/fachada-despues.webp",
        alt: "Fachada renovada en Ciudad Autónoma de Buenos Aires con revestimiento y pintura nueva",
      },
    },

    living: {
      label: "Living",
      before: {
        src: "assets/imgs/obras/living-antes.webp",
        alt: "Living antes de la remodelación: pisos y carpintería originales",
      },
      after: {
        src: "assets/imgs/obras/living-despues.webp",
        alt: "Living remodelado en Gran Buenos Aires con pisos nuevos y aberturas ampliadas",
      },
    },
  };

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
      img.width = 1600;
      img.height = 920;
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
  /* Arranque                                                         */
  /* ---------------------------------------------------------------- */

  const init = () => {
    initMobileNav();
    initBeforeAfter();
    initScrollToTop();
    initContactForm();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();