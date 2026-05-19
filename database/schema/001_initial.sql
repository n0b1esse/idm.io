-- IDM: начальная схема (PostgreSQL 15+)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Заявки с форм сайта
CREATE TABLE IF NOT EXISTS leads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id       VARCHAR(64)  NOT NULL,
  name          VARCHAR(255) NOT NULL,
  phone         VARCHAR(32),
  email         VARCHAR(255),
  contact       VARCHAR(255),
  service       VARCHAR(128),
  message       TEXT,
  page_url      VARCHAR(512),
  utm_source    VARCHAR(128),
  utm_medium    VARCHAR(128),
  utm_campaign  VARCHAR(128),
  utm_content   VARCHAR(128),
  utm_term      VARCHAR(128),
  status        VARCHAR(32)  NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'in_progress', 'done', 'spam')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);

-- Категории услуг
CREATE TABLE IF NOT EXISTS service_categories (
  id         SERIAL PRIMARY KEY,
  slug       VARCHAR(64)  NOT NULL UNIQUE,
  name       VARCHAR(255) NOT NULL,
  sort_order INT          NOT NULL DEFAULT 0
);

-- Услуги
CREATE TABLE IF NOT EXISTS services (
  id          SERIAL PRIMARY KEY,
  category_id INT          REFERENCES service_categories(id) ON DELETE SET NULL,
  slug        VARCHAR(128) NOT NULL UNIQUE,
  title       VARCHAR(255) NOT NULL,
  excerpt     TEXT,
  body        TEXT,
  sort_order  INT          NOT NULL DEFAULT 0,
  is_published BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Категории кейсов
CREATE TABLE IF NOT EXISTS case_categories (
  id         SERIAL PRIMARY KEY,
  slug       VARCHAR(64)  NOT NULL UNIQUE,
  name       VARCHAR(255) NOT NULL
);

-- Кейсы (портфолио)
CREATE TABLE IF NOT EXISTS cases (
  id           SERIAL PRIMARY KEY,
  category_id  INT          REFERENCES case_categories(id) ON DELETE SET NULL,
  slug         VARCHAR(128) NOT NULL UNIQUE,
  title        VARCHAR(255) NOT NULL,
  excerpt      TEXT,
  body         TEXT,
  result_label VARCHAR(255),
  cover_url    VARCHAR(512),
  external_url VARCHAR(512),
  sort_order   INT          NOT NULL DEFAULT 0,
  is_published BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Отзывы
CREATE TABLE IF NOT EXISTS reviews (
  id           SERIAL PRIMARY KEY,
  author_name  VARCHAR(255) NOT NULL,
  author_role  VARCHAR(255),
  body         TEXT         NOT NULL,
  rating       SMALLINT     CHECK (rating BETWEEN 1 AND 5),
  source       VARCHAR(64),
  is_featured  BOOLEAN      NOT NULL DEFAULT FALSE,
  is_published BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_leads_updated_at ON leads;
CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_services_updated_at ON services;
CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_cases_updated_at ON cases;
CREATE TRIGGER trg_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
