CREATE TABLE IF NOT EXISTS public.site_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category   TEXT NOT NULL CHECK (category IN ('nav', 'social', 'skill')),
  label      TEXT NOT NULL,
  href       TEXT,
  icon       TEXT,
  external   BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS site_links_category_sort_idx
  ON public.site_links (category, sort_order);

ALTER TABLE public.site_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Links do site são públicos" ON public.site_links;
CREATE POLICY "Links do site são públicos"
  ON public.site_links FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin gerencia links do site" ON public.site_links;
CREATE POLICY "Admin gerencia links do site"
  ON public.site_links FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

INSERT INTO public.site_links (category, label, href, external, sort_order) VALUES
  ('nav', 'home', '/', false, 0),
  ('nav', 'projects', '/#projetos', false, 1),
  ('nav', 'about', '/#sobre', false, 2),
  ('nav', 'github', 'https://github.com', true, 3);

INSERT INTO public.site_links (category, label, href, sort_order) VALUES
  ('social', 'github', 'https://github.com', 0),
  ('social', 'linkedin', 'https://linkedin.com', 1);

INSERT INTO public.site_links (category, label, icon, href, sort_order) VALUES
  ('skill', 'Python', 'python', NULL, 0),
  ('skill', 'Node.js', 'nodejs', 'https://nodejs.org', 1),
  ('skill', 'JavaScript', 'javascript', NULL, 2),
  ('skill', 'TypeScript', 'typescript', 'https://www.typescriptlang.org', 3),
  ('skill', 'React', 'react', 'https://react.dev', 4),
  ('skill', 'Flutter', 'flutter', NULL, 5),
  ('skill', 'Dart', 'dart', NULL, 6),
  ('skill', 'Git', 'git', NULL, 7),
  ('skill', 'PostgreSQL', 'postgres', NULL, 8),
  ('skill', 'MySQL', 'mysql', NULL, 9),
  ('skill', 'Supabase', 'supabase', 'https://supabase.com', 10),
  ('skill', 'Docker', 'docker', NULL, 11),
  ('skill', 'Postman', 'postman', NULL, 12),
  ('skill', 'Vite', 'vite', NULL, 13),
  ('skill', 'Express', 'express', NULL, 14);
