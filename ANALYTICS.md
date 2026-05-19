# Аналитика и UTM

## Подключение счётчиков

Откройте `frontend/js/site-config.js` и укажите ID:

```javascript
yandexMetrikaId: "12345678",
ga4MeasurementId: "G-XXXXXXXXXX",
hotjarId: "1234567", // опционально
```

Скрипт `frontend/js/analytics.js` подключается на всех страницах. Пока ID пустые — внешние скрипты не загружаются, цели копятся только в консоли при отладке (через событие `idm:lead-success`).

## Цели в Метрике / GA4

Рекомендуемые имена целей (атрибут `data-analytics-goal` на кнопках и ссылках):

| Цель | Где |
|------|-----|
| `cta_header_consultation` | «Получить консультацию» в шапке |
| `cta_hero_lead` | «Оставить заявку» в hero |
| `cta_hero_cases` | «Смотреть наши кейсы» |
| `lead_form_submit` | Успешная отправка любой формы |
| `lead_form_index` | Форма на главной |
| `lead_form_contacts` | Форма на contacts.html |
| `lead_form_audit` | Форма аудита на services.html |
| `lead_form_reviews` | CTA на reviews.html |
| `lead_form_exit` | Exit-intent попап |

После настройки ID создайте в Метрике цели типа «JavaScript-событие» с этими именами. В GA4 — события с теми же именами (отправляются через `gtag('event', ...)`).

## UTM для рекламы

Шаблон ссылки на главную:

```
https://n0b1esse.github.io/idm.io/?utm_source=yandex&utm_medium=cpc&utm_campaign=brand_search&utm_content=ad1
```

| Параметр | Пример | Назначение |
|----------|--------|------------|
| `utm_source` | `yandex`, `google`, `instagram` | Источник |
| `utm_medium` | `cpc`, `social`, `email` | Канал |
| `utm_campaign` | `spring_2026` | Кампания |
| `utm_content` | `banner_a` | Креатив |
| `utm_term` | `маркетинг бишкек` | Ключ (для поиска) |

Страницы услуг / контактов:

```
https://n0b1esse.github.io/idm.io/contacts.html?utm_source=google&utm_medium=cpc&utm_campaign=lead_form
```

Метрика и GA4 подхватывают UTM автоматически после установки счётчиков.

## Webhook заявок (Telegram / Make)

В `frontend/js/site-config.js` задайте `leadWebhookUrl` (например `https://api.example.com/api/v1/leads` или локально `http://localhost:3000/api/v1/leads`). При успешной валидации формы `main.js` отправит POST с JSON:

```json
{
  "form": "contact-page-form",
  "name": "...",
  "phone": "...",
  "email": "...",
  "page": "/contacts.html"
}
```

Для Telegram удобно использовать Make.com или n8n: форма → HTTP → Bot API.
