CREATE TABLE IF NOT EXISTS public.site_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Configurações públicas são legíveis" ON public.site_settings;
CREATE POLICY "Configurações públicas são legíveis"
  ON public.site_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin gerencia configurações" ON public.site_settings;
CREATE POLICY "Admin gerencia configurações"
  ON public.site_settings FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

INSERT INTO public.site_settings (key, value)
VALUES ('hero_stats', '{"yearsCoding": 4}'::jsonb)
ON CONFLICT (key) DO NOTHING;
