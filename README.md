# idm.io

Статический сайт IDM (HTML / CSS / JS).

## Перед продакшеном

1. **`js/site-config.js`** — ID Яндекс.Метрики, GA4, URL webhook для заявок (см. [ANALYTICS.md](ANALYTICS.md)).
2. **Контент** — замените placeholder'ы (кейсы, фото, сканы писем/сертификатов) в HTML или подключите WordPress ([WP-INTEGRATION.md](WP-INTEGRATION.md)).
3. **Логотипы клиентов** — положите PNG/SVG в `img/clients/` и подключите в блоке «Нам доверяют» на главной (класс `trust-logo--img`).

## GitHub Pages

1. Репозиторий на GitHub → **Settings** → **Pages** (в боковом меню).
2. **Build and deployment** → **Source**: **Deploy from a branch**.
3. **Branch**: `main`, папка **/ (root)** → **Save**.

Через 1–2 минуты сайт будет доступен по адресу:

**`https://n0b1esse.github.io/idm.io/`**

Файл `.nojekyll` отключает обработку Jekyll, чтобы отдавались все статические файлы как есть.
