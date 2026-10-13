-- O backend grava sempre com a service role (ignora RLS). As policies
-- "FOR ALL USING (auth.uid() IS NOT NULL)" liberavam escrita direta via
-- PostgREST para qualquer conta do Supabase Auth, não só para o admin.
-- Sem elas, anon/authenticated ficam só com as policies de leitura pública.

DROP POLICY IF EXISTS "Admin gerencia projetos" ON public.projects;
DROP POLICY IF EXISTS "Admin gerencia atualizações de projetos" ON public.project_updates;
DROP POLICY IF EXISTS "Admin gerencia links do site" ON public.site_links;
DROP POLICY IF EXISTS "Admin gerencia configurações" ON public.site_settings;

-- Sem policy nenhuma: só a service role acessa os pedidos de reset de senha
DROP POLICY IF EXISTS "Admin gerencia reset de senha" ON public.password_reset_requests;
