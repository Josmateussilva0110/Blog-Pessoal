UPDATE public.projects
SET status = 'completed'
WHERE status IN ('closed', 'archived');

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_status_check;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_status_check
  CHECK (status IN ('active', 'completed', 'wip'));

DROP POLICY IF EXISTS "Projetos públicos são visíveis" ON public.projects;
DROP POLICY IF EXISTS "Projetos ativos são públicos" ON public.projects;

CREATE POLICY "Projetos públicos são visíveis"
  ON public.projects FOR SELECT
  USING (status IN ('active', 'completed', 'wip'));
