/**
 * IDM — бургер, год, скролл шапки, reveal, счётчики, Lucide, exit-intent, форма
 */
(function () {
  "use strict";

  const yearEl = document.getElementById("footer-year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  const header = document.getElementById("site-header");
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 8) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  const burger = document.getElementById("burger-toggle");
  const nav = document.getElementById("site-nav");
  const body = document.body;

  if (burger && nav) {
    const mq = window.matchMedia("(min-width: 768px)");

    function setExpanded(expanded) {
      burger.setAttribute("aria-expanded", expanded ? "true" : "false");
      burger.setAttribute("aria-label", expanded ? "Закрыть меню" : "Открыть меню");
      nav.classList.toggle("is-open", expanded);
      body.classList.toggle("nav-open", expanded);
    }

    function closeMenu() {
      setExpanded(false);
    }

    burger.addEventListener("click", () => {
      const next = burger.getAttribute("aria-expanded") !== "true";
      setExpanded(next);
    });

    nav.addEventListener("click", (e) => {
      const link = e.target.closest("a[href]");
      if (link && mq.matches === false) {
        closeMenu();
      }
    });

    function onMqChange(e) {
      if (e.matches) {
        closeMenu();
      }
    }

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onMqChange);
    } else {
      mq.addListener(onMqChange);
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    });
  }

  /* Reveal on scroll */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    revealEls.forEach((el) => revealObs.observe(el));
  }

  /**
   * Счётчики: data-number-target (legacy) и data-target (спека)
   */
  function animateCounterEl(el, options) {
    const duration = options && typeof options.duration === "number" ? options.duration : 2000;
    const raw =
      el.getAttribute("data-target") != null && el.getAttribute("data-target") !== ""
        ? el.getAttribute("data-target")
        : el.getAttribute("data-number-target");
    if (raw === null || raw === "") {
      return;
    }
    const target = Number.parseFloat(raw);
    if (Number.isNaN(target)) {
      return;
    }
    const suffix =
      el.getAttribute("data-suffix") || el.getAttribute("data-number-suffix") || "";
    const decimalsAttr = el.getAttribute("data-number-decimals");
    let decimals;
    if (decimalsAttr !== null && decimalsAttr !== "") {
      decimals = Number.parseInt(decimalsAttr, 10);
    } else if (!String(raw).includes(".")) {
      decimals = 0;
    } else {
      decimals = (String(raw).split(".")[1] || "").length;
    }
    const safeDecimals = Number.isFinite(decimals) && decimals >= 0 ? decimals : 0;
    let startTs = null;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function frame(ts) {
      if (startTs === null) {
        startTs = ts;
      }
      const progress = Math.min((ts - startTs) / duration, 1);
      const eased = easeOutCubic(progress);
      const current = target * eased;
      const display =
        safeDecimals > 0 ? current.toFixed(safeDecimals) : String(Math.floor(current));
      el.textContent = display + suffix;
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        const finalDisplay =
          safeDecimals > 0 ? target.toFixed(safeDecimals) : String(Math.round(target));
        el.textContent = finalDisplay + suffix;
      }
    }
    requestAnimationFrame(frame);
  }

  const statsSection = document.getElementById("stats-numbers");
  if (statsSection) {
    const counterObs = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || statsSection.dataset.numbersAnimated === "true") {
            return;
          }
          statsSection.dataset.numbersAnimated = "true";
          statsSection.querySelectorAll("[data-number-target], [data-target]").forEach((el) => {
            if (el instanceof HTMLElement) {
              animateCounterEl(el, { duration: 2000 });
            }
          });
          obs.disconnect();
        });
      },
      { threshold: 0.25, rootMargin: "0px 0px -5% 0px" }
    );
    counterObs.observe(statsSection);
  }

  /**
   * Для внешних вызовов (WordPress и т.д.)
   */
  function animateNumbers(rootElement, options) {
    if (!rootElement) {
      return;
    }
    rootElement.querySelectorAll("[data-number-target]").forEach((el) => {
      animateCounterEl(el, options || { duration: 1800 });
    });
  }

  window.animateNumbers = animateNumbers;

  /* Lucide icons */
  function initLucide() {
    if (typeof lucide !== "undefined" && lucide.createIcons) {
      lucide.createIcons();
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLucide);
  } else {
    initLucide();
  }

  /* Exit-intent popup */
  const exitPopup = document.getElementById("exit-popup");
  const exitClose = document.getElementById("exit-popup-close");
  if (exitPopup) {
    let shown = false;
    document.addEventListener("mouseleave", (e) => {
      if (shown || e.clientY >= 0) {
        return;
      }
      if (sessionStorage.getItem("idm-exit-popup") === "1") {
        return;
      }
      shown = true;
      exitPopup.classList.add("active");
    });
    function closeExit() {
      exitPopup.classList.remove("active");
      sessionStorage.setItem("idm-exit-popup", "1");
    }
    if (exitClose) {
      exitClose.addEventListener("click", closeExit);
    }
    exitPopup.addEventListener("click", (e) => {
      if (e.target === exitPopup) {
        closeExit();
      }
    });
  }

  /**
   * Форма заявки: проверка перед отправкой
   */
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    const nameInput = document.getElementById("contact-name");
    const emailInput = document.getElementById("contact-email");
    const phoneInput = document.getElementById("contact-phone");
    const messageInput = document.getElementById("contact-message");
    const nameError = document.getElementById("contact-name-error");
    const emailError = document.getElementById("contact-email-error");
    const phoneError = document.getElementById("contact-phone-error");
    const messageError = document.getElementById("contact-message-error");
    const statusEl = document.getElementById("contact-form-status");

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

    function phoneDigits(value) {
      return String(value).replace(/\D/g, "");
    }

    function isValidPhone(value) {
      const d = phoneDigits(value);
      return d.length >= 10 && d.length <= 15;
    }

    function setFieldError(input, errorEl, message) {
      if (!input || !errorEl) {
        return;
      }
      if (message) {
        input.setAttribute("aria-invalid", "true");
        errorEl.textContent = message;
        errorEl.hidden = false;
      } else {
        input.removeAttribute("aria-invalid");
        errorEl.textContent = "";
        errorEl.hidden = true;
      }
    }

    function validateName() {
      const v = nameInput ? nameInput.value.trim() : "";
      if (!v) {
        setFieldError(nameInput, nameError, "Укажите имя.");
        return false;
      }
      setFieldError(nameInput, nameError, "");
      return true;
    }

    function validateEmail() {
      if (!emailInput || !emailError) {
        return true;
      }
      const v = emailInput.value.trim();
      if (!v) {
        setFieldError(emailInput, emailError, "Укажите email.");
        return false;
      }
      if (!EMAIL_RE.test(v)) {
        setFieldError(emailInput, emailError, "Введите корректный email.");
        return false;
      }
      setFieldError(emailInput, emailError, "");
      return true;
    }

    function validatePhone() {
      const v = phoneInput ? phoneInput.value.trim() : "";
      if (!v) {
        setFieldError(phoneInput, phoneError, "Укажите телефон.");
        return false;
      }
      if (!isValidPhone(v)) {
        setFieldError(
          phoneInput,
          phoneError,
          "Введите номер: от 10 до 15 цифр (можно с +996, +7, скобками и пробелами)."
        );
        return false;
      }
      setFieldError(phoneInput, phoneError, "");
      return true;
    }

    function validateMessage() {
      if (!messageInput || !messageError) {
        return true;
      }
      setFieldError(messageInput, messageError, "");
      return true;
    }

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (statusEl) {
        statusEl.textContent = "";
        statusEl.classList.remove("is-success");
      }

      const okName = validateName();
      const okEmail = emailInput ? validateEmail() : true;
      const okPhone = validatePhone();
      const okMessage = validateMessage();

      if (!okName || !okEmail || !okPhone || !okMessage) {
        const firstInvalid =
          (!okName && nameInput) ||
          (!okEmail && emailInput) ||
          (!okPhone && phoneInput) ||
          null;
        if (firstInvalid && typeof firstInvalid.focus === "function") {
          firstInvalid.focus();
        }
        return;
      }

      if (statusEl) {
        statusEl.textContent =
          "Данные прошли проверку. Подключите отправку на сервер (WordPress / API).";
        statusEl.classList.add("is-success");
      }
    });
  }
})();
