/**
 * Статические табы услуг (data-tab → панели)
 */
(function () {
  "use strict";

  const root = document.querySelector("[data-services-static-tabs]");
  if (!root) {
    return;
  }

  const tabs = root.querySelectorAll(".services-tabs-bar .tab");
  const panels = root.querySelectorAll(".services-tab-panel");

  function activate(id) {
    tabs.forEach((btn) => {
      const on = btn.getAttribute("data-tab") === id;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    panels.forEach((panel) => {
      const on = panel.getAttribute("data-panel") === id;
      panel.classList.toggle("is-active", on);
      panel.toggleAttribute("hidden", !on);
    });
  }

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-tab");
      if (id) {
        activate(id);
      }
    });
  });

  const first = tabs[0] && tabs[0].getAttribute("data-tab");
  if (first) {
    activate(first);
  }
})();
