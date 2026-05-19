/**
 * Услуги: на мобильных — аккордеон, от 768px — вкладки (одна активная категория).
 */
(function () {
  "use strict";

  const BP = window.matchMedia("(min-width: 768px)");

  /**
   * @param {HTMLElement} root
   */
  function initServicesTabs(root) {
    const items = root.querySelectorAll(".services-widget__item");
    if (!items.length) {
      return;
    }

    /** @type {HTMLButtonElement[]} */
    const tabs = [];
    /** @type {HTMLElement[]} */
    const panels = [];

    items.forEach((item, index) => {
      const tab = item.querySelector(".services-widget__tab");
      const panel = item.querySelector(".services-widget__panel");
      if (!tab || !panel) {
        return;
      }
      tab.dataset.tabIndex = String(index);
      panel.dataset.tabIndex = String(index);
      tabs.push(tab);
      panels.push(panel);

      if (!tab.id) {
        tab.id = "services-tab-" + index;
      }
      if (!panel.id) {
        panel.id = "services-panel-" + index;
      }
      tab.setAttribute("aria-controls", panel.id);
      panel.setAttribute("aria-labelledby", tab.id);
    });

    let active = 0;

    function applyState() {
      const isDesktop = BP.matches;

      tabs.forEach((tab, i) => {
        const on = i === active;
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.setAttribute("tabindex", on ? "0" : "-1");
        tab.classList.toggle("is-active", on);
        if (!isDesktop) {
          tab.setAttribute("aria-expanded", on ? "true" : "false");
        } else {
          tab.removeAttribute("aria-expanded");
        }
      });

      panels.forEach((panel, i) => {
        const on = i === active;
        panel.classList.toggle("is-active", on);
        if (on) {
          panel.removeAttribute("hidden");
        } else {
          panel.setAttribute("hidden", "");
        }
        panel.setAttribute("aria-hidden", on ? "false" : "true");
      });

      root.dataset.mode = isDesktop ? "tabs" : "accordion";
    }

    function setActive(index) {
      const next = Math.max(0, Math.min(index, tabs.length - 1));
      active = next;
      applyState();
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => {
        setActive(i);
      });

      tab.addEventListener("keydown", (e) => {
        if (!BP.matches) {
          return;
        }
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
        setActive(next);
        tabs[next].focus();
      });
    });

    function onBpChange() {
      applyState();
    }

    if (typeof BP.addEventListener === "function") {
      BP.addEventListener("change", onBpChange);
    } else {
      BP.addListener(onBpChange);
    }

    setActive(0);
  }

  function initAllServicesTabs() {
    document.querySelectorAll("[data-services-tabs]").forEach((root) => {
      if (root instanceof HTMLElement) {
        initServicesTabs(root);
      }
    });
  }

  initAllServicesTabs();

  window.idmInitServicesTabs = initAllServicesTabs;
})();
