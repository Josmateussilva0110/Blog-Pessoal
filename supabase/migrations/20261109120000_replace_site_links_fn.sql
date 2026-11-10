-- Troca todos os links do site numa única transação. Antes o backend apagava e
-- inseria em duas idas ao banco: se o insert falhasse, o site ficava sem links.
CREATE OR REPLACE FUNCTION public.replace_site_links(p_links jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.site_links WHERE true;

  INSERT INTO public.site_links (id, category, label, href, icon, external, sort_order, updated_at)
  SELECT
    (link->>'id')::uuid,
    link->>'category',
    link->>'label',
    link->>'href',
    link->>'icon',
    COALESCE((link->>'external')::boolean, false),
    (link->>'sort_order')::integer,
    now()
  FROM jsonb_array_elements(p_links) AS link;
END;
$$;

-- Funções nascem executáveis por PUBLIC: só a service role (backend) pode chamar esta
REVOKE ALL ON FUNCTION public.replace_site_links(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.replace_site_links(jsonb) TO service_role;
