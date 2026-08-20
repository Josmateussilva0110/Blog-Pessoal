CREATE INDEX IF NOT EXISTS projects_updated_at_idx
  ON public.projects (updated_at DESC);
