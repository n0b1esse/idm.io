/**
 * Успешная заявка: событие для аналитики + опциональный webhook.
 */
(function () {
  "use strict";

  /**
   * @param {HTMLFormElement} form
   * @param {string} [goal]
   */
  function notifyLeadSuccess(form, goal) {
    var goalName = goal || form.getAttribute("data-analytics-goal") || "lead_form_submit";
    document.dispatchEvent(
      new CustomEvent("idm:lead-success", {
        detail: {
          formId: form.id || "",
          goal: goalName,
          page: window.location.pathname,
        },
      })
    );

    var config = window.IDM_SITE_CONFIG || {};
    var url = String(config.leadWebhookUrl || "").trim();
    if (!url) {
      return;
    }

    var payload = {
      form: form.id || "unknown",
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
    };

    var fields = form.querySelectorAll("input, select, textarea");
    fields.forEach(function (field) {
      if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement)) {
        return;
      }
      var name = field.name;
      if (!name || field.type === "submit") {
        return;
      }
      payload[name] = field.value;
    });

    window
      .fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      })
      .catch(function () {
        /* webhook опционален */
      });
  }

  window.idmLead = { notifySuccess: notifyLeadSuccess };
})();
