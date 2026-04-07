/**
 * Страница отзывов: вкладки «текст / сканы» и lightbox для изображений.
 */
(function () {
  "use strict";

  const root = document.querySelector("[data-reviews-tabs]");
  if (!root) {
    return;
  }

  const tabs = root.querySelectorAll('[role="tab"]');
  const panels = root.querySelectorAll('[role="tabpanel"]');
  let active = 0;

  function setTab(index) {
    const next = Math.max(0, Math.min(index, tabs.length - 1));
    active = next;
    tabs.forEach((tab, i) => {
      const on = i === next;
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.setAttribute("tabindex", on ? "0" : "-1");
      tab.classList.toggle("is-active", on);
    });
    panels.forEach((panel, i) => {
      const on = i === next;
      if (on) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
      panel.setAttribute("aria-hidden", on ? "false" : "true");
    });
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => setTab(i));
    tab.addEventListener("keydown", (e) => {
      const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
      if (keys.indexOf(e.key) === -1) {
        return;
      }
      e.preventDefault();
      let next = active;
      if (e.key === "ArrowLeft") {
        next = active === 0 ? tabs.length - 1 : active - 1;
      } else if (e.key === "ArrowRight") {
        next = active === tabs.length - 1 ? 0 : active + 1;
      } else if (e.key === "Home") {
        next = 0;
      } else if (e.key === "End") {
        next = tabs.length - 1;
      }
      setTab(next);
      tabs[next].focus();
    });
  });

  setTab(0);

  const lightbox = document.getElementById("review-lightbox");
  const lightboxImg = lightbox ? lightbox.querySelector(".lightbox__img") : null;
  const closeBtn = lightbox ? lightbox.querySelector(".lightbox__close") : null;
  /** @type {HTMLElement | null} */
  let lastFocus = null;

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) {
      return;
    }
    lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.removeAttribute("hidden");
    lightbox.classList.add("is-open");
    document.body.classList.add("lightbox-open");
    if (closeBtn) {
      closeBtn.focus();
    }
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImg) {
      return;
    }
    lightbox.setAttribute("hidden", "");
    lightbox.classList.remove("is-open");
    document.body.classList.remove("lightbox-open");
    lightboxImg.removeAttribute("src");
    lightboxImg.alt = "";
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  }

  root.querySelectorAll("[data-lightbox-src]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const src = trigger.getAttribute("data-lightbox-src");
      const alt = trigger.getAttribute("data-lightbox-alt") || "";
      if (src) {
        openLightbox(src, alt);
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox && !lightbox.hasAttribute("hidden")) {
      closeLightbox();
    }
  });
})();
