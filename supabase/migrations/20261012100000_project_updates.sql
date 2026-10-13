CREATE TABLE IF NOT EXISTS public.project_updates (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  version          TEXT,
  content_markdown TEXT NOT NULL DEFAULT '',
  published_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_updates_project_published_idx
  ON public.project_updates (project_id, published_at DESC);

ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Atualizações de projetos são públicas" ON public.project_updates;
CREATE POLICY "Atualizações de projetos são públicas"
  ON public.project_updates FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin gerencia atualizações de projetos" ON public.project_updates;
CREATE POLICY "Admin gerencia atualizações de projetos"
  ON public.project_updates FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
