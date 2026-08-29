-- 1. Grant SELECT permissions on public tables to anon visitors
GRANT SELECT ON public.sites TO anon, authenticated;
GRANT SELECT ON public.site_pages TO anon, authenticated;

-- 2. Row Level Security policies allowing public viewing of sites
DROP POLICY IF EXISTS sites_public_select ON public.sites;
CREATE POLICY sites_public_select ON public.sites
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS site_pages_public_select ON public.site_pages;
CREATE POLICY site_pages_public_select ON public.site_pages
  FOR SELECT TO anon, authenticated
  USING (true);

-- 3. Security Definer RPC as ultra-fast fallback that bypasses client RLS restrictions
CREATE OR REPLACE FUNCTION public.get_public_site_by_slug(site_slug text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
DECLARE
  v_site record;
  v_pages jsonb;
BEGIN
  SELECT * INTO v_site FROM public.sites WHERE slug = site_slug LIMIT 1;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_agg(p) INTO v_pages FROM (
    SELECT id, title, path, sections, seo, position 
    FROM public.site_pages 
    WHERE site_id = v_site.id 
    ORDER BY position
  ) p;

  RETURN jsonb_build_object(
    'site', to_jsonb(v_site),
    'pages', COALESCE(v_pages, '[]'::jsonb),
    'isPublished', (v_site.status = 'published')
  );
END;
$;

GRANT EXECUTE ON FUNCTION public.get_public_site_by_slug(text) TO anon, authenticated;
