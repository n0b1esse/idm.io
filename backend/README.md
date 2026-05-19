# Backend

HTTP API на Node.js + Express. Слои **Clean Architecture**:

```
src/
├── domain/           # Сущности и контракты репозиториев (без фреймворков)
├── application/      # Use cases и DTO
├── infrastructure/   # PostgreSQL, внешние сервисы
└── presentation/     # HTTP (Express routes)
```

## Запуск

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Проверка: `GET http://localhost:3000/api/v1/health`

## API

### `POST /api/v1/leads`

Тело (совместимо с webhook из `frontend/js/lead-submit.js`):

```json
{
  "form": "contact-page-form",
  "name": "Иван",
  "phone": "+996555123456",
  "email": "",
  "page": "/contacts.html"
}
```

Ответ `201`: `{ "ok": true, "id": "uuid", "status": "new" }`

## Подключение фронтенда

В `frontend/js/site-config.js`:

```javascript
leadWebhookUrl: "http://localhost:3000/api/v1/leads",
```

На проде укажите URL вашего API (HTTPS).
