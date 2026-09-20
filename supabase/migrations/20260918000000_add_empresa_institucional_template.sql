-- Migration: Add Empresa Institucional template to public.templates
INSERT INTO public.templates (slug, name, category, description, accent_color, is_featured, is_active)
VALUES (
  'empresa-institucional',
  'Empresa Institucional',
  'Institucional / Serviços / Financeiro',
  'Landing page corporativa completa com identidade da empresa, ficha cadastral, missão, quem somos, serviços dinâmicos, localização com mapa e conformidade LGPD.',
  '#1e3a8a',
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  accent_color = EXCLUDED.accent_color,
  is_featured = EXCLUDED.is_featured,
  is_active = EXCLUDED.is_active;
