/**
 * Headless WordPress: загрузка CPT через REST API и рендер карточек.
 * Замените WP_API_URL на URL вашего сайта (должен быть доступен с фронта, при CORS — настройте плагин или прокси).
 */
(function () {
  "use strict";

  /** @type {string} Базовый URL REST (без завершающего слэша) */
  var WP_API_URL = "https://твой-домен.com/wp-json/wp/v2";

  /** Slug’и CPT в WordPress (CPT UI → Advanced Options → REST API) */
  var WP_CPT = {
    service: "service",
    case: "case",
    review: "review",
  };

  /** Таксономии (должны быть с show_in_rest) */
  var WP_TAX = {
    caseCategory: "case_category",
    serviceCategory: "service_category",
  };

  /**
   * @param {string} text
   * @returns {string}
   */
  function escapeHtml(text) {
    var d = document.createElement("div");
    d.textContent = text == null ? "" : String(text);
    return d.innerHTML;
  }

  /**
   * @param {string} html
   * @returns {string}
   */
  function stripTags(html) {
    var d = document.createElement("div");
    d.innerHTML = html || "";
    return (d.textContent || d.innerText || "").trim();
  }

  /**
   * @param {object} post
   * @returns {string}
   */
  function getFeaturedImageUrl(post) {
    try {
      var emb = post._embedded;
      if (!emb || !emb["wp:featuredmedia"] || !emb["wp:featuredmedia"][0]) {
        return "";
      }
      var m = emb["wp:featuredmedia"][0];
      if (m.source_url) {
        return m.source_url;
      }
      var sizes = m.media_details && m.media_details.sizes;
      if (sizes && sizes.large && sizes.large.source_url) {
        return sizes.large.source_url;
      }
      if (sizes && sizes.medium_large && sizes.medium_large.source_url) {
        return sizes.medium_large.source_url;
      }
    } catch (e) {
      /* noop */
    }
    return "";
  }

  /**
   * @param {object} post
   * @param {string} taxRestBase
   * @returns {string}
   */
  function getFirstTermSlug(post, taxRestBase) {
    var key = taxRestBase;
    if (!post[key] || !post[key].length) {
      return "seo";
    }
    var id = post[key][0];
    var emb = post._embedded && post._embedded["wp:term"];
    if (!emb) {
      return "seo";
    }
    for (var i = 0; i < emb.length; i++) {
      var terms = emb[i];
      for (var j = 0; j < terms.length; j++) {
        if (terms[j].id === id && terms[j].taxonomy === taxRestBase) {
          var s = terms[j].slug || "";
          if (s === "target" || s === "seo") {
            return s;
          }
          return s.indexOf("target") !== -1 || s.indexOf("таргет") !== -1 ? "target" : "seo";
        }
      }
    }
    return "seo";
  }

  /**
   * @param {object} post
   * @param {string} taxRestBase
   * @returns {string}
   */
  function getFirstTermName(post, taxRestBase) {
    var key = taxRestBase;
    if (!post[key] || !post[key].length) {
      return "SEO";
    }
    var id = post[key][0];
    var emb = post._embedded && post._embedded["wp:term"];
    if (!emb) {
      return "SEO";
    }
    for (var i = 0; i < emb.length; i++) {
      var terms = emb[i];
      for (var j = 0; j < terms.length; j++) {
        if (terms[j].id === id && terms[j].taxonomy === taxRestBase) {
          return terms[j].name || "SEO";
        }
      }
    }
    return "SEO";
  }

  /**
   * @param {string} endpoint
   * @returns {Promise<object[]>}
   */
  function fetchCollection(endpoint) {
    var url =
      WP_API_URL +
      "/" +
      endpoint +
      "?per_page=100&_embed=wp:featuredmedia,wp:term&context=embed";
    return fetch(url, { credentials: "omit" }).then(function (res) {
      if (!res.ok) {
        throw new Error("HTTP " + res.status);
      }
      return res.json();
    });
  }

  /**
   * @returns {Promise<object[]>}
   */
  function getServices() {
    return fetchCollection(WP_CPT.service);
  }

  /**
   * @returns {Promise<object[]>}
   */
  function getCases() {
    return fetchCollection(WP_CPT.case);
  }

  /**
   * @returns {Promise<object[]>}
   */
  function getReviews() {
    return fetchCollection(WP_CPT.review);
  }

  /** @type {object[]} */
  var MOCK_SERVICES = [
    {
      title: { rendered: "Реклама в соцсетях" },
      excerpt: { rendered: "Таргетированная реклама в Instagram, Facebook, VK." },
      categorySlug: "social",
      categoryName: "Реклама в соцсетях",
    },
    {
      title: { rendered: "Контекстная реклама" },
      excerpt: { rendered: "Продвижение в поиске Google и Яндекс." },
      categorySlug: "context",
      categoryName: "Контекстная реклама",
    },
    {
      title: { rendered: "Медийная реклама" },
      excerpt: { rendered: "Размещение через programmatic-платформы Eskimi и BYYD." },
      categorySlug: "media",
      categoryName: "Медийная реклама",
    },
    {
      title: { rendered: "Разработка" },
      excerpt: { rendered: "Создание сайтов: лендинги, порталы, интернет-магазины." },
      categorySlug: "dev",
      categoryName: "Разработка",
    },
    {
      title: { rendered: "Консалтинг" },
      excerpt: { rendered: "Маркетинговые стратегии и исследования рынка." },
      categorySlug: "consulting",
      categoryName: "Консалтинг",
    },
  ];

  /** @type {object[]} */
  var MOCK_CASES = [
    {
      title: "Нур Телеком (О!)",
      excerpt: "Телеком: digital-кампании и коммуникации для оператора связи.",
      link: "#",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      category: "target",
      tagLabel: "Таргет",
    },
    {
      title: "О!Банк",
      excerpt: "Банки: performance и медийное сопровождение.",
      link: "#",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      category: "target",
      tagLabel: "Таргет",
    },
    {
      title: "Компаньон Банк",
      excerpt: "Банки: стратегия присутствия в digital-каналах.",
      link: "#",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
      category: "seo",
      tagLabel: "SEO",
    },
    {
      title: "Демир Банк",
      excerpt: "Банки: комплексное продвижение и креативы.",
      link: "#",
      image:
        "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80",
      category: "seo",
      tagLabel: "SEO",
    },
    {
      title: "Тойбосс (Адал Азык)",
      excerpt: "Ритейл: охваты и продажи для сети.",
      link: "#",
      image:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
      category: "target",
      tagLabel: "Таргет",
    },
    {
      title: "Абдыш-Ата",
      excerpt: "Ритейл: бренд и digital-коммуникации.",
      link: "#",
      image:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
      category: "seo",
      tagLabel: "SEO",
    },
    {
      title: "Синематика",
      excerpt: "Ритейл: продвижение в digital.",
      link: "#",
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
      category: "target",
      tagLabel: "Таргет",
    },
    {
      title: "Toyota Центр (Автоперекресток)",
      excerpt: "Авто: digital-стратегия для дилерского центра.",
      link: "#",
      image:
        "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80",
      category: "target",
      tagLabel: "Таргет",
    },
  ];

  /** @type {object[]} */
  var MOCK_REVIEWS = [
    {
      text:
        "«За три месяца вывели ключевые запросы в топ и удвоили органические заявки. Отчёты понятные, без воды.»",
      author: "Анна Морозова",
      role: "CMO, B2B-сервис",
    },
    {
      text:
        "«Таргет в VK и Telegram окупился уже в первом месяце. Команда быстро тестирует гипотезы и масштабирует победителей.»",
      author: "Илья Ветров",
      role: "Основатель e-commerce",
    },
    {
      text:
        "«Сложный продукт — нужна была аккуратная семантика и посадочные. Результат по SEO превзошёл ожидания.»",
      author: "Елена Сафонова",
      role: "Руководитель маркетинга",
    },
    {
      text:
        "«Запускали приложение с нуля: настроили воронку и креативы, держали CPA в рамках плана.»",
      author: "Максим Орлов",
      role: "Product lead",
    },
  ];

  /**
   * Нормализация записи услуги из REST.
   * @param {object} post
   * @returns {object}
   */
  function normalizeServicePost(post) {
    var title = stripTags((post.title && post.title.rendered) || "");
    var excerpt = stripTags(
      (post.excerpt && post.excerpt.rendered) ||
        (post.content && post.content.rendered) ||
        ""
    );
    var catSlug = getFirstTermSlug(post, WP_TAX.serviceCategory);
    var catName = getFirstTermName(post, WP_TAX.serviceCategory);
    if (!post[WP_TAX.serviceCategory] || !post[WP_TAX.serviceCategory].length) {
      catSlug = "other";
      catName = "Услуги";
    }
    return { title: title, text: excerpt, categorySlug: catSlug, categoryName: catName };
  }

  /**
   * @param {object[]} items
   * @returns {Record<string, { name: string, items: object[] }>}
   */
  function groupServices(items) {
    /** @type {Record<string, { name: string, items: object[] }>} */
    var map = {};
    items.forEach(function (it) {
      var key = it.categorySlug || "other";
      if (!map[key]) {
        map[key] = { name: it.categoryName || key, items: [] };
      }
      map[key].items.push(it);
    });
    return map;
  }

  /**
   * @param {object[]} services — нормализованные услуги
   * @returns {string} HTML виджета вкладок
   */
  function buildServicesWidgetHtml(services) {
    var grouped = groupServices(services);
    var keys = Object.keys(grouped);
    if (keys.length === 0) {
      keys.push("fallback");
      grouped.fallback = { name: "Услуги", items: [] };
    }
    var parts = [];
    keys.forEach(function (key, index) {
      var g = grouped[key];
      var tabId = "services-tab-" + index;
      var panelId = "services-panel-" + index;
      var lis = g.items
        .map(function (s) {
          return (
            '<li class="services-list__item">' +
            '<h3 class="services-list__name">' +
            escapeHtml(s.title) +
            "</h3>" +
            '<p class="services-list__text">' +
            escapeHtml(s.text) +
            "</p>" +
            "</li>"
          );
        })
        .join("");
      if (!lis) {
        lis =
          '<li class="services-list__item"><h3 class="services-list__name">—</h3><p class="services-list__text">Нет пунктов в этой категории.</p></li>';
      }
      parts.push(
        '<div class="services-widget__item">' +
          '<button type="button" class="services-widget__tab" id="' +
          tabId +
          '" role="tab" data-tab-index="' +
          index +
          '" aria-selected="' +
          (index === 0 ? "true" : "false") +
          '" aria-controls="' +
          panelId +
          '"' +
          (index === 0 ? "" : ' aria-expanded="false"') +
          ">" +
          escapeHtml(g.name) +
          "</button>" +
          '<div class="services-widget__panel" id="' +
          panelId +
          '" role="tabpanel" data-tab-index="' +
          index +
          '" aria-labelledby="' +
          tabId +
          '"' +
          (index === 0 ? "" : " hidden") +
          ">" +
          '<ul class="services-list">' +
          lis +
          "</ul>" +
          "</div>" +
          "</div>"
      );
    });
    return parts.join("");
  }

  /**
   * @param {object[]} services
   */
  function renderServices(services) {
    var mount = document.getElementById("services-dynamic-mount");
    if (!mount) {
      return;
    }
    var html = buildServicesWidgetHtml(services);
    mount.innerHTML = html;
    if (typeof window.idmInitServicesTabs === "function") {
      window.idmInitServicesTabs();
    }
  }

  /**
   * @param {object[]} cases — нормализованные кейсы
   */
  function renderCases(cases) {
    var grid = document.getElementById("cases-grid");
    if (!grid) {
      return;
    }
    var html = cases
      .map(function (c) {
        var title = escapeHtml(c.title);
        var excerpt = escapeHtml(c.excerpt);
        var img = escapeHtml(c.image);
        var link = escapeHtml(c.link);
        var cat = escapeHtml(c.category);
        var tag = escapeHtml(c.tagLabel);
        var alt = escapeHtml("Кейс: " + stripTags(c.title));
        return (
          '<article class="case-card portfolio-card" data-category="' +
          cat +
          '">' +
          '<a class="case-card__link" href="' +
          link +
          '">' +
          '<div class="case-card__media">' +
          '<img class="case-card__img" src="' +
          img +
          '" width="800" height="600" alt="' +
          alt +
          '" loading="lazy">' +
          '<div class="case-card__overlay">' +
          '<p class="case-card__excerpt">' +
          excerpt +
          "</p>" +
          '<span class="case-card__more">Подробнее</span>' +
          "</div>" +
          "</div>" +
          '<h3 class="case-card__title">' +
          title +
          "</h3>" +
          "</a>" +
          '<p class="portfolio-card__tag">' +
          tag +
          "</p>" +
          "</article>"
        );
      })
      .join("");
    grid.innerHTML = html;
    if (typeof window.idmInitPortfolioFilter === "function") {
      window.idmInitPortfolioFilter();
    }
  }

  /**
   * @param {object[]} reviews — { text, author, role }
   */
  function renderReviews(reviews) {
    var list = document.getElementById("reviews-text-list");
    if (!list) {
      return;
    }
    var html = reviews
      .map(function (r) {
        return (
          "<li>" +
          '<blockquote class="review-card">' +
          '<p class="review-card__text">' +
          escapeHtml(r.text) +
          "</p>" +
          '<footer class="review-card__footer">' +
          '<cite class="review-card__author">' +
          escapeHtml(r.author) +
          "</cite>" +
          '<span class="review-card__role">' +
          escapeHtml(r.role) +
          "</span>" +
          "</footer>" +
          "</blockquote>" +
          "</li>"
        );
      })
      .join("");
    list.innerHTML = html;
  }

  /**
   * @param {object[]} posts
   * @returns {object[]}
   */
  function normalizeCasePosts(posts) {
    return posts.map(function (post) {
      var title = stripTags((post.title && post.title.rendered) || "");
      var excerpt = stripTags(
        (post.excerpt && post.excerpt.rendered) ||
          (post.content && post.content.rendered) ||
          ""
      );
      var slug = getFirstTermSlug(post, WP_TAX.caseCategory);
      var tagLabel = getFirstTermName(post, WP_TAX.caseCategory);
      var link = post.link || "#";
      var image = getFeaturedImageUrl(post);
      if (!image) {
        image =
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80";
      }
      return {
        title: title,
        excerpt: excerpt || "Кейс",
        link: link,
        image: image,
        category: slug === "target" ? "target" : "seo",
        tagLabel: tagLabel,
      };
    });
  }

  /**
   * @param {object[]} posts
   * @returns {object[]}
   */
  function normalizeReviewPosts(posts) {
    return posts.map(function (post) {
      var body = stripTags(
        (post.content && post.content.rendered) ||
          (post.excerpt && post.excerpt.rendered) ||
          ""
      );
      if (body && body.indexOf("«") !== 0) {
        body = "«" + body + "»";
      }
      var author = stripTags((post.title && post.title.rendered) || "Клиент");
      var role = "";
      if (post.acf && typeof post.acf.role === "string") {
        role = post.acf.role;
      }
      return { text: body || "«Отзыв»", author: author, role: role };
    });
  }

  function mockServicesNormalized() {
    return MOCK_SERVICES.map(function (m) {
      return {
        title: stripTags(m.title.rendered),
        text: stripTags(m.excerpt.rendered),
        categorySlug: m.categorySlug,
        categoryName: m.categoryName,
      };
    });
  }

  function bootstrapServices() {
    var mount = document.getElementById("services-dynamic-mount");
    if (!mount) {
      return;
    }
    (async function () {
      try {
        var posts = await getServices();
        if (!Array.isArray(posts)) {
          throw new Error("Invalid response");
        }
        var normalized = posts.map(normalizeServicePost);
        renderServices(normalized);
      } catch (e) {
        renderServices(mockServicesNormalized());
      }
    })();
  }

  function bootstrapCases() {
    var grid = document.getElementById("cases-grid");
    if (!grid) {
      return;
    }
    (async function () {
      try {
        var posts = await getCases();
        if (!Array.isArray(posts)) {
          throw new Error("Invalid response");
        }
        renderCases(normalizeCasePosts(posts));
      } catch (e) {
        renderCases(MOCK_CASES);
      }
    })();
  }

  function bootstrapReviews() {
    var list = document.getElementById("reviews-text-list");
    if (!list) {
      return;
    }
    (async function () {
      try {
        var posts = await getReviews();
        if (!Array.isArray(posts)) {
          throw new Error("Invalid response");
        }
        renderReviews(normalizeReviewPosts(posts));
      } catch (e) {
        renderReviews(MOCK_REVIEWS);
      }
    })();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      bootstrapServices();
      bootstrapCases();
      bootstrapReviews();
    });
  } else {
    bootstrapServices();
    bootstrapCases();
    bootstrapReviews();
  }

  window.idmWpApi = {
    WP_API_URL: WP_API_URL,
    WP_CPT: WP_CPT,
    getServices: getServices,
    getCases: getCases,
    getReviews: getReviews,
    renderServices: renderServices,
    renderCases: renderCases,
    renderReviews: renderReviews,
  };
})();
