-- Демо-данные для локальной разработки

INSERT INTO service_categories (slug, name, sort_order) VALUES
  ('social', 'Реклама в соцсетях', 1),
  ('context', 'Контекстная реклама', 2),
  ('media', 'Медийная реклама', 3),
  ('dev', 'Разработка', 4),
  ('consulting', 'Консалтинг', 5)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO case_categories (slug, name) VALUES
  ('target', 'Таргет'),
  ('seo', 'SEO'),
  ('smm', 'SMM'),
  ('content', 'Контент'),
  ('design', 'Дизайн')
ON CONFLICT (slug) DO NOTHING;
