-- Menu do site em português. Só troca os rótulos que ainda estão no padrão em
-- inglês do seed: um rótulo já editado no admin fica como está.
UPDATE public.site_links
SET label = CASE label
    WHEN 'home' THEN 'início'
    WHEN 'projects' THEN 'projetos'
    WHEN 'about' THEN 'sobre'
    WHEN 'github' THEN 'GitHub'
  END,
  updated_at = now()
WHERE category = 'nav'
  AND label IN ('home', 'projects', 'about', 'github');
