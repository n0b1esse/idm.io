/**
 * IDM — бургер-меню, год в футере, анимация счётчиков
 */
(function () {
  "use strict";

  const yearEl = document.getElementById("footer-year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

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

  /**
   * Анимирует числа внутри root от 0 до data-number-target (ease-out).
   * @param {HTMLElement} rootElement — контейнер с [data-number-target]
   * @param {{ duration?: number }} [options]
   */
  function animateNumbers(rootElement, options) {
    if (!rootElement) {
      return;
    }

    const duration = options && typeof options.duration === "number" ? options.duration : 1800;
    const nodes = rootElement.querySelectorAll("[data-number-target]");

    nodes.forEach((el) => {
      const raw = el.getAttribute("data-number-target");
      if (raw === null || raw === "") {
        return;
      }

      const target = Number.parseFloat(raw);
      if (Number.isNaN(target)) {
        return;
      }

      const suffix = el.getAttribute("data-number-suffix") || "";
      const decimalsAttr = el.getAttribute("data-number-decimals");
      let decimals;
      if (decimalsAttr !== null && decimalsAttr !== "") {
        decimals = Number.parseInt(decimalsAttr, 10);
      } else if (!raw.includes(".")) {
        decimals = 0;
      } else {
        decimals = (raw.split(".")[1] || "").length;
      }

      const safeDecimals = Number.isFinite(decimals) && decimals >= 0 ? decimals : 0;
      let startTs = null;

      function easeOutQuad(t) {
        return 1 - (1 - t) * (1 - t);
      }

      function frame(ts) {
        if (startTs === null) {
          startTs = ts;
        }
        const elapsed = ts - startTs;
        const t = Math.min(1, elapsed / duration);
        const eased = easeOutQuad(t);
        const current = target * eased;
        const display =
          safeDecimals > 0 ? current.toFixed(safeDecimals) : String(Math.round(current));
        el.textContent = display + suffix;
        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          const finalDisplay =
            safeDecimals > 0 ? target.toFixed(safeDecimals) : String(Math.round(target));
          el.textContent = finalDisplay + suffix;
        }
      }

      requestAnimationFrame(frame);
    });
  }

  const statsSection = document.getElementById("stats-numbers");
  if (statsSection) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          if (statsSection.dataset.numbersAnimated === "true") {
            return;
          }
          statsSection.dataset.numbersAnimated = "true";
          animateNumbers(statsSection, { duration: 1900 });
          obs.disconnect();
        });
      },
      { threshold: 0.25, rootMargin: "0px 0px -5% 0px" }
    );
    observer.observe(statsSection);
  }

  window.animateNumbers = animateNumbers;

  /**
   * Форма заявки: проверка перед отправкой (обязательные поля, email, телефон).
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
      const v = emailInput ? emailInput.value.trim() : "";
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
      const okEmail = validateEmail();
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
