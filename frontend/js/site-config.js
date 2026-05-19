/**
 * Настройки сайта: URL, счётчики, CRM (подставьте значения перед продакшеном).
 * Пустая строка = функция отключена.
 */
window.IDM_SITE_CONFIG = {
  /** Базовый URL без завершающего слэша (для sitemap, canonical). */
  siteUrl: "https://n0b1esse.github.io/idm.io",
  /** ID счётчика Яндекс.Метрики (только цифры). */
  yandexMetrikaId: "",
  /** ID потока GA4 (G-XXXXXXXX). */
  ga4MeasurementId: "",
  /** Hotjar: hjid (опционально). */
  hotjarId: "",
  /**
   * URL для заявок: backend API, Make, n8n, Telegram webhook.
   * Локально: "http://localhost:3000/api/v1/leads"
   * POST JSON: { form, name, phone, email, contact, service, message, page }
   */
  leadWebhookUrl: "",
};
