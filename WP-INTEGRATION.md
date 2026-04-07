# Headless WordPress + статическая вёрстка (REST API)

В `js/api.js` задайте **`WP_API_URL`** на ваш домен, например `https://example.com/wp-json/wp/v2`. Slug’и типов записей и таксономий должны совпадать с константами **`WP_CPT`** и **`WP_TAX`** в том же файле (или поправьте константы под свою админку).

## CPT UI: три шага

1. **Установите плагин** [Custom Post Type UI](https://wordpress.org/plugins/custom-post-type-ui/) и откройте **CPT UI → Add/Edit Post Types**. Создайте три типа с включённым REST: для каждого в блоке **Supports** отметьте минимум **Title**, **Editor** (и **Excerpt** / **Featured Image** для кейсов), в **Settings** включите **Show in REST API** и задайте понятный **REST Base** (например `service`, `case`, `review` — как в `api.js`).

2. **CPT UI → Add/Edit Taxonomies** — добавьте таксономии **`service_category`** (привязка к типу `service`) и **`case_category`** (к к типу `case`). В настройках таксономии включите **Show in REST API**. Для фильтра портфолио создайте термины со slug **`seo`** и **`target`** (они совпадают с кнопками фильтра на сайте).

3. **Сохраните постоянные ссылки**: **Настройки → Постоянные ссылки** → «Сохранить» (без изменений), чтобы сбросить rewrite rules. Проверьте в браузере `https://ваш-домен/wp-json/wp/v2/service` — должен открываться JSON (при необходимости настройте CORS или прокси, если фронт на другом домене).
