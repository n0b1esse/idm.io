/**
 * Портфолио: фильтр кейсов и карусель отзывов.
 */
(function () {
  "use strict";

  /* --- Фильтр кейсов: класс .hidden на карточках (делегирование — карточки могут подгрузиться из API) --- */
  function initPortfolioCaseFilter(filterRoot) {
    if (!(filterRoot instanceof HTMLElement)) {
      return;
    }

    function setFilter(value) {
      const buttons = filterRoot.querySelectorAll("[data-filter]");
      const cards = filterRoot.querySelectorAll("[data-category]");

      buttons.forEach((btn) => {
        if (!(btn instanceof HTMLButtonElement)) {
          return;
        }
        const v = btn.getAttribute("data-filter") || "";
        const on = v === value;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });

      cards.forEach((card) => {
        if (!(card instanceof HTMLElement)) {
          return;
        }
        const cat = card.getAttribute("data-category") || "";
        const show = value === "all" || cat === value;
        card.classList.toggle("hidden", !show);
      });
    }

    if (filterRoot.dataset.portfolioFilterBound !== "true") {
      filterRoot.dataset.portfolioFilterBound = "true";
      filterRoot.addEventListener("click", (e) => {
        const btn = e.target && e.target.closest ? e.target.closest("[data-filter]") : null;
        if (!(btn instanceof HTMLButtonElement) || !filterRoot.contains(btn)) {
          return;
        }
        const v = btn.getAttribute("data-filter") || "all";
        setFilter(v);
      });
    }

    setFilter("all");
  }

  document.querySelectorAll("[data-portfolio-filter]").forEach((root) => {
    initPortfolioCaseFilter(root);
  });

  window.idmInitPortfolioFilter = function () {
    document.querySelectorAll("[data-portfolio-filter]").forEach((root) => {
      initPortfolioCaseFilter(root);
    });
  };

  /* --- Карусель отзывов --- */
  const carousel = document.querySelector("[data-reviews-carousel]");
  if (!(carousel instanceof HTMLElement)) {
    return;
  }

  const track = carousel.querySelector(".reviews-carousel__track");
  const slides = carousel.querySelectorAll(".reviews-carousel__slide");
  const btnPrev = carousel.querySelector(".reviews-carousel__btn--prev");
  const btnNext = carousel.querySelector(".reviews-carousel__btn--next");
  const dotsRoot = carousel.querySelector(".reviews-carousel__dots");

  if (!track || slides.length === 0) {
    return;
  }

  let index = 0;
  const total = slides.length;

  function clamp(i) {
    return ((i % total) + total) % total;
  }

  function goTo(i) {
    index = clamp(i);
    const slide = slides[index];
    if (!(slide instanceof HTMLElement) || !track) {
      return;
    }
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const ideal = slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2;
    const left = Math.max(0, Math.min(ideal, maxScroll));
    track.scrollTo({ left, behavior: "smooth" });
    updateDots();
    updateAria();
  }

  function updateDots() {
    if (!dotsRoot) {
      return;
    }
    const dots = dotsRoot.querySelectorAll(".reviews-carousel__dot");
    dots.forEach((d, i) => {
      if (d instanceof HTMLButtonElement) {
        d.setAttribute("aria-selected", i === index ? "true" : "false");
        d.classList.toggle("is-active", i === index);
      }
    });
  }

  function updateAria() {
    slides.forEach((s, i) => {
      if (s instanceof HTMLElement) {
        s.setAttribute("aria-hidden", i === index ? "false" : "true");
      }
    });
  }

  if (btnPrev instanceof HTMLButtonElement) {
    btnPrev.addEventListener("click", () => goTo(index - 1));
  }
  if (btnNext instanceof HTMLButtonElement) {
    btnNext.addEventListener("click", () => goTo(index + 1));
  }

  if (dotsRoot) {
    dotsRoot.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) {
        return;
      }
      const dot = t.closest(".reviews-carousel__dot");
      if (!(dot instanceof HTMLButtonElement)) {
        return;
      }
      const idx = dot.getAttribute("data-slide");
      if (idx !== null) {
        goTo(parseInt(idx, 10));
      }
    });
  }

  let scrollRaf = 0;
  function syncIndexFromScroll() {
    if (scrollRaf) {
      cancelAnimationFrame(scrollRaf);
    }
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0;
      const rect = track.getBoundingClientRect();
      const mid = rect.left + rect.width / 2;
      let best = 0;
      let bestDist = Infinity;
      slides.forEach((slide, i) => {
        if (!(slide instanceof HTMLElement)) {
          return;
        }
        const r = slide.getBoundingClientRect();
        const c = r.left + r.width / 2;
        const d = Math.abs(c - mid);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      if (best !== index) {
        index = best;
        updateDots();
        updateAria();
      }
    });
  }

  track.addEventListener("scroll", syncIndexFromScroll, { passive: true });

  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(index + 1);
    }
  });

  goTo(0);
})();
