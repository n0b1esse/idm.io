# Database

PostgreSQL-схема для idm.io: заявки, услуги, кейсы, отзывы.

## Структура

| Путь | Назначение |
|------|------------|
| `schema/001_initial.sql` | Полная схема (источник правды) |
| `migrations/` | Скрипты применения при изменениях |
| `seeds/` | Демо-данные для разработки |

## Локальный запуск

Из корня репозитория:

```bash
docker compose up -d db
```

Применить схему:

```bash
docker compose exec db psql -U idm -d idm -f /docker-entrypoint-initdb.d/001_initial.sql
```

Или с хоста (после `docker compose up`):

```bash
psql postgresql://idm:idm@localhost:5432/idm -f database/schema/001_initial.sql
psql postgresql://idm:idm@localhost:5432/idm -f database/seeds/001_demo_content.sql
```

## Таблицы

- **leads** — заявки с форм сайта (CRM)
- **services** / **service_categories** — контент «Услуги»
- **cases** / **case_categories** — портфолио
- **reviews** — отзывы
