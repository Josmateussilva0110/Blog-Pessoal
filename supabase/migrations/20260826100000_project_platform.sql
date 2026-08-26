ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'web'
  CHECK (platform IN ('mobile', 'web'));
