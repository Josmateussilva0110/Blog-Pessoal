UPDATE public.projects
SET status = 'closed'
WHERE status = 'archived';

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_status_check;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_status_check
  CHECK (status IN ('active', 'closed', 'wip'));

DROP POLICY IF EXISTS "Projetos ativos são públicos" ON public.projects;

CREATE POLICY "Projetos públicos são visíveis"
  ON public.projects FOR SELECT
  USING (status IN ('active', 'closed'));
