/**
 * Карусель услуг на странице портфолио
 */
(function () {
  "use strict";

  const root = document.querySelector("[data-services-slider]");
  if (!root) {
    return;
  }

  const track = root.querySelector(".services-slider__track");
  const slides = root.querySelectorAll(".services-slider__slide");
  const prev = root.querySelector('[data-slider-prev]');
  const next = root.querySelector('[data-slider-next]');
  if (!track || slides.length === 0) {
    return;
  }

  let index = 0;

  function slideWidth() {
    const s = slides[0];
    if (!(s instanceof HTMLElement)) {
      return 0;
    }
    const gap = parseFloat(getComputedStyle(track).gap) || 24;
    return s.offsetWidth + gap;
  }

  function go(delta) {
    const max = slides.length - 1;
    index = Math.max(0, Math.min(index + delta, max));
    const w = slideWidth();
    track.style.transform = "translateX(" + String(-index * w) + "px)";
  }

  if (prev instanceof HTMLButtonElement) {
    prev.addEventListener("click", () => go(-1));
  }
  if (next instanceof HTMLButtonElement) {
    next.addEventListener("click", () => go(1));
  }

  window.addEventListener(
    "resize",
    () => {
      const w = slideWidth();
      track.style.transform = "translateX(" + String(-index * w) + "px)";
    },
    { passive: true }
  );

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const AUTOPLAY_MS = 5000;
  let autoplayTimer = null;

  function stopAutoplay() {
    if (autoplayTimer !== null) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();
    if (reducedMotion.matches || slides.length <= 1) {
      return;
    }
    autoplayTimer = window.setInterval(() => {
      if (index >= slides.length - 1) {
        index = 0;
        track.style.transform = "translateX(0px)";
      } else {
        go(1);
      }
    }, AUTOPLAY_MS);
  }

  root.addEventListener("mouseenter", stopAutoplay);
  root.addEventListener("mouseleave", startAutoplay);
  root.addEventListener("focusin", stopAutoplay);
  root.addEventListener("focusout", (e) => {
    if (!root.contains(e.relatedTarget)) {
      startAutoplay();
    }
  });

  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", () => {
      if (reducedMotion.matches) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });
  }

  startAutoplay();
})();
