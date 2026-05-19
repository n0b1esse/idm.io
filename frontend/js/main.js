/**
 * IDM — бургер, год, скролл шапки, reveal, счётчики, Lucide, exit-intent, форма
 */
(function () {
  "use strict";

  const yearEl = document.getElementById("footer-year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  function normalizePhone(value) {
    return String(value || "").replace(/\s+/g, "");
  }

  function isStrictPhone(value) {
    const normalized = normalizePhone(value);
    return /^\+?\d{8,15}$/.test(normalized);
  }

  function hasMinNameLength(value) {
    return String(value || "").trim().length >= 2;
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
      if (!hasMinNameLength(v)) {
        setFieldError(nameInput, nameError, "Имя должно содержать минимум 2 символа.");
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
      if (!isStrictPhone(v)) {
        setFieldError(
          phoneInput,
          phoneError,
          "Телефон: только цифры и +, длина от 8 до 15 символов."
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

      if (window.idmLead && contactForm instanceof HTMLFormElement) {
        window.idmLead.notifySuccess(contactForm, "lead_form_index");
      }
    });
  }

  const exitPopupForm = document.getElementById("exit-popup-form");
  if (exitPopupForm) {
    const exitName = document.getElementById("exit-name");
    const exitPhone = document.getElementById("exit-phone");
    const exitCloseBtn = document.getElementById("exit-popup-close");

    exitPopupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!(exitName instanceof HTMLInputElement) || !(exitPhone instanceof HTMLInputElement)) {
        return;
      }

      const nameValid = hasMinNameLength(exitName.value);
      const phoneValid = isStrictPhone(exitPhone.value);

      exitName.setAttribute("aria-invalid", nameValid ? "false" : "true");
      exitPhone.setAttribute("aria-invalid", phoneValid ? "false" : "true");

      if (!nameValid) {
        exitName.focus();
        return;
      }

      if (!phoneValid) {
        exitPhone.focus();
        return;
      }

      if (exitCloseBtn instanceof HTMLButtonElement) {
        exitCloseBtn.click();
      }

      const statusNote = exitPopupForm.querySelector(".exit-popup__success");
      if (statusNote instanceof HTMLElement) {
        statusNote.hidden = false;
      }

      if (window.idmLead && exitPopupForm instanceof HTMLFormElement) {
        window.idmLead.notifySuccess(exitPopupForm, "lead_form_exit");
      }
    });
  }

  const contactPageForm = document.getElementById("contact-page-form");
  if (contactPageForm) {
    contactPageForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const contactPageName = document.getElementById("c-name");
      const contactPagePhone = document.getElementById("c-phone");
      const contactPageEmail = document.getElementById("c-email");
      const statusEl = document.getElementById("contact-page-form-status");

      if (
        !(contactPageName instanceof HTMLInputElement) ||
        !(contactPagePhone instanceof HTMLInputElement)
      ) {
        return;
      }

      const nameValid = hasMinNameLength(contactPageName.value);
      const phoneValid = isStrictPhone(contactPagePhone.value);
      const emailValid =
        !(contactPageEmail instanceof HTMLInputElement) ||
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(contactPageEmail.value.trim());

      contactPageName.setAttribute("aria-invalid", nameValid ? "false" : "true");
      contactPagePhone.setAttribute("aria-invalid", phoneValid ? "false" : "true");
      if (contactPageEmail instanceof HTMLInputElement) {
        contactPageEmail.setAttribute("aria-invalid", emailValid ? "false" : "true");
      }

      if (!nameValid || !phoneValid || !emailValid) {
        if (!nameValid) {
          contactPageName.focus();
        } else if (!phoneValid) {
          contactPagePhone.focus();
        } else if (contactPageEmail instanceof HTMLInputElement) {
          contactPageEmail.focus();
        }
        return;
      }

      if (statusEl) {
        statusEl.textContent =
          "Данные прошли проверку. Подключите отправку на сервер (WordPress / API).";
        statusEl.classList.add("is-success");
      }

      if (window.idmLead && contactPageForm instanceof HTMLFormElement) {
        window.idmLead.notifySuccess(contactPageForm, "lead_form_contacts");
      }
    });
  }

  /**
   * Унифицированная отправка простых lead-форм (data-lead-form)
   */
  document.querySelectorAll("form[data-lead-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameInput = form.querySelector('[name="name"]');
      const phoneInput = form.querySelector('[name="phone"]');
      const contactInput = form.querySelector('[name="contact"]');
      const statusEl = form.querySelector(".cta-form__status");

      let valid = true;

      if (nameInput instanceof HTMLInputElement) {
        const nameValid = hasMinNameLength(nameInput.value);
        nameInput.setAttribute("aria-invalid", nameValid ? "false" : "true");
        if (!nameValid) {
          valid = false;
          nameInput.focus();
        }
      }

      if (phoneInput instanceof HTMLInputElement) {
        const phoneValid = isStrictPhone(phoneInput.value);
        phoneInput.setAttribute("aria-invalid", phoneValid ? "false" : "true");
        if (!phoneValid && valid) {
          valid = false;
          phoneInput.focus();
        } else if (!phoneValid) {
          valid = false;
        }
      }

      if (contactInput instanceof HTMLInputElement) {
        const contactVal = contactInput.value.trim();
        const contactValid = contactVal.length >= 5;
        contactInput.setAttribute("aria-invalid", contactValid ? "false" : "true");
        if (!contactValid && valid) {
          valid = false;
          contactInput.focus();
        } else if (!contactValid) {
          valid = false;
        }
      }

      if (!valid) {
        return;
      }

      if (statusEl) {
        statusEl.textContent =
          "Данные прошли проверку. Подключите отправку на сервер (WordPress / API).";
        statusEl.classList.add("is-success");
      }

      if (window.idmLead && form instanceof HTMLFormElement) {
        var leadGoal = form.id === "audit-form" ? "lead_form_audit" : form.id === "reviews-cta-form" ? "lead_form_reviews" : "lead_form_submit";
        window.idmLead.notifySuccess(form, leadGoal);
      }

      form.reset();
    });
  });

  /* IDM: логика WhatsApp/Telegram виджета */
  const chatWidget = document.querySelector("[data-idm-new-chat]");
  if (chatWidget instanceof HTMLElement) {
    const chatToggle = chatWidget.querySelector(".idm-new-chat-widget__toggle");

    window.setTimeout(() => {
      chatWidget.classList.add("idm-new-chat-widget--visible");
    }, 2000);

    if (chatToggle instanceof HTMLButtonElement) {
      chatToggle.addEventListener("click", () => {
        const isOpen = chatWidget.classList.toggle("idm-new-chat-widget--open");
        chatToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }

    document.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof Node) || chatWidget.contains(target)) {
        return;
      }
      chatWidget.classList.remove("idm-new-chat-widget--open");
      if (chatToggle instanceof HTMLButtonElement) {
        chatToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* IDM: FAQ аккордеон (одна открытая карточка) */
  document.querySelectorAll("[data-idm-new-faq]").forEach((faqRoot) => {
    const faqItems = faqRoot.querySelectorAll(".idm-new-faq__item");
    if (!faqItems.length) {
      return;
    }

    function closeItem(item) {
      const trigger = item.querySelector(".idm-new-faq__question");
      const answer = item.querySelector(".idm-new-faq__answer");
      if (!(trigger instanceof HTMLButtonElement) || !(answer instanceof HTMLElement)) {
        return;
      }
      item.classList.remove("idm-new-faq__item--open");
      trigger.setAttribute("aria-expanded", "false");
      answer.style.maxHeight = "0px";
    }

    function openItem(item) {
      const trigger = item.querySelector(".idm-new-faq__question");
      const answer = item.querySelector(".idm-new-faq__answer");
      if (!(trigger instanceof HTMLButtonElement) || !(answer instanceof HTMLElement)) {
        return;
      }
      item.classList.add("idm-new-faq__item--open");
      trigger.setAttribute("aria-expanded", "true");
      answer.style.maxHeight = answer.scrollHeight + "px";
    }

    faqItems.forEach((item, idx) => {
      const trigger = item.querySelector(".idm-new-faq__question");
      if (!(trigger instanceof HTMLButtonElement)) {
        return;
      }

      trigger.addEventListener("click", () => {
        const isOpen = item.classList.contains("idm-new-faq__item--open");
        faqItems.forEach((currentItem) => closeItem(currentItem));
        if (!isOpen) {
          openItem(item);
        }
      });

      if (idx === 0) {
        openItem(item);
      } else {
        closeItem(item);
      }
    });
  });
})();
