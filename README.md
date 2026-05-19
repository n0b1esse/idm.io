# idm.io

Сайт маркетингового агентства IDM. Репозиторий разделён на три части по **Clean Architecture**:

| Каталог | Описание |
|---------|----------|
| [`frontend/`](frontend/) | Статический сайт (HTML / CSS / JS) |
| [`backend/`](backend/) | REST API (Node.js, Express) |
| [`database/`](database/) | Схема PostgreSQL, миграции, сиды |

Подробнее: [ARCHITECTURE.md](ARCHITECTURE.md).

## Быстрый старт (локально)

```bash
# 1. База данных
docker compose up -d db

# 2. API
cd backend
cp .env.example .env
npm install
npm run dev

# 3. Сайт
npx --yes serve frontend -p 8080
```

В `frontend/js/site-config.js` для заявок:

```javascript
leadWebhookUrl: "http://localhost:3000/api/v1/leads",
```

## Документация

- [TECHNICAL_SPEC.md](TECHNICAL_SPEC.md) — ТЗ и чеклист
- [ANALYTICS.md](ANALYTICS.md) — Метрика, GA4, UTM
- [WP-INTEGRATION.md](WP-INTEGRATION.md) — WordPress REST (опционально)

## GitHub Pages

Сайт: `https://n0b1esse.github.io/idm.io/`

**Рекомендуется** (URL без `/frontend/` в пути): **Settings → Pages → Source:** `GitHub Actions`  
(workflow `.github/workflows/pages.yml` публикует содержимое папки `frontend/` в корень сайта).

**Альтернатива:** Source `Deploy from a branch` → branch `main` → папка **`/frontend`**.

Если в настройках выбран корень репозитория (`/`), сработает редирект из корневого `index.html` на `frontend/`.

## Перед продакшеном

1. `frontend/js/site-config.js` — ID Метрики, GA4, URL API заявок
2. Заменить placeholder-контент или подключить WordPress
3. Логотипы клиентов в `frontend/img/clients/`
