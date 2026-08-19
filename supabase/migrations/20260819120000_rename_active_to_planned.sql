-- Troca status "active" por "planned" e atualiza constraint + policy pública.

UPDATE public.projects
SET status = 'planned'
WHERE status = 'active';

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_status_check;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_status_check
  CHECK (status IN ('planned', 'wip', 'completed'));

DROP POLICY IF EXISTS "Projetos públicos são visíveis" ON public.projects;

CREATE POLICY "Projetos públicos são visíveis"
  ON public.projects FOR SELECT
  USING (status IN ('planned', 'wip', 'completed'));
