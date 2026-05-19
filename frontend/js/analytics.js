/**
 * Аналитика: Яндекс.Метрика, GA4, цели на CTA и формах.
 * ID задаются в js/site-config.js
 */
(function () {
  "use strict";

  var config = window.IDM_SITE_CONFIG || {};
  var ymId = String(config.yandexMetrikaId || "").trim();
  var gaId = String(config.ga4MeasurementId || "").trim();
  var hjId = String(config.hotjarId || "").trim();

  function loadScript(src, async) {
    var s = document.createElement("script");
    s.src = src;
    if (async) {
      s.async = true;
    }
    document.head.appendChild(s);
  }

  if (ymId) {
    (function (m, e, t, r, i, k, a) {
      m[i] =
        m[i] ||
        function () {
          (m[i].a = m[i].a || []).push(arguments);
        };
      m[i].l = 1 * new Date();
      for (var j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j].src === r) {
          return;
        }
      }
      k = e.createElement(t);
      a = e.getElementsByTagName(t)[0];
      k.async = 1;
      k.src = r;
      a.parentNode.insertBefore(k, a);
    })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
    window.ym(Number(ymId), "init", {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true,
    });
  }

  if (gaId) {
    loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(gaId), true);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", gaId);
  }

  if (hjId) {
    (function (h, o, t, j, a, r) {
      h.hj =
        h.hj ||
        function () {
          (h.hj.q = h.hj.q || []).push(arguments);
        };
      h._hjSettings = { hjid: Number(hjId), hjsv: 6 };
      a = o.getElementsByTagName("head")[0];
      r = o.createElement("script");
      r.async = 1;
      r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
      a.appendChild(r);
    })(window, document, "https://static.hotjar.com/c/hotjar-", ".js?sv=");
  }

  /**
   * @param {string} goalName
   * @param {Record<string, string> | undefined} params
   */
  function trackGoal(goalName, params) {
    if (!goalName) {
      return;
    }
    var payload = params || {};

    if (ymId && typeof window.ym === "function") {
      window.ym(Number(ymId), "reachGoal", goalName, payload);
    }

    if (gaId && typeof window.gtag === "function") {
      var gaPayload = { event_category: "conversion", page_path: window.location.pathname };
      Object.keys(payload).forEach(function (key) {
        gaPayload[key] = payload[key];
      });
      window.gtag("event", goalName, gaPayload);
    }
  }

  window.idmAnalytics = { trackGoal: trackGoal };

  document.addEventListener(
    "click",
    function (e) {
      var el = e.target.closest("[data-analytics-goal]");
      if (!el) {
        return;
      }
      trackGoal(el.getAttribute("data-analytics-goal") || "cta_click", {
        element: el.tagName.toLowerCase(),
        label: (el.textContent || "").trim().slice(0, 80),
      });
    },
    true
  );

  document.addEventListener("idm:lead-success", function (e) {
    var detail = e.detail || {};
    trackGoal(detail.goal || "lead_form_submit", {
      form_id: detail.formId || "",
      page: detail.page || window.location.pathname,
    });
  });
})();
