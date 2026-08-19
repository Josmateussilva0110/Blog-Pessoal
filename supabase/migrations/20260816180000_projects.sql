CREATE TABLE IF NOT EXISTS public.projects (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT NOT NULL UNIQUE,
  title            TEXT NOT NULL,
  summary          TEXT NOT NULL,
  description      TEXT NOT NULL DEFAULT '',
  content_markdown TEXT NOT NULL DEFAULT '',
  status           TEXT NOT NULL DEFAULT 'wip'
    CHECK (status IN ('active', 'archived', 'wip')),
  tags             TEXT[] NOT NULL DEFAULT '{}',
  tech_stack       TEXT[] NOT NULL DEFAULT '{}',
  repo_url         TEXT,
  live_url         TEXT,
  cover_image_url  TEXT,
  images           TEXT[] NOT NULL DEFAULT '{}',
  markdown_files   JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured         BOOLEAN NOT NULL DEFAULT false,
  created_by       UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS projects_status_idx ON public.projects (status);
CREATE INDEX IF NOT EXISTS projects_featured_idx ON public.projects (featured);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Projetos ativos são públicos" ON public.projects;
CREATE POLICY "Projetos ativos são públicos"
  ON public.projects FOR SELECT
  USING (status = 'active');

DROP POLICY IF EXISTS "Admin gerencia projetos" ON public.projects;
CREATE POLICY "Admin gerencia projetos"
  ON public.projects FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-images',
  'project-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-assets',
  'project-assets',
  true,
  1048576,
  ARRAY['text/markdown', 'text/plain', 'application/octet-stream']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Project images public read" ON storage.objects;
CREATE POLICY "Project images public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Project assets public read" ON storage.objects;
CREATE POLICY "Project assets public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'project-assets');
