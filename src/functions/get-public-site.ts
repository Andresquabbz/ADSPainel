import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const getPublicSite = createServerFn({ method: "GET" })
  .validator((slug: unknown) => z.string().parse(slug))
  .handler(async ({ data: slug }) => {
    const SUPABASE_URL = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
    const SUPABASE_KEY =
      process.env["SUPABASE_SERVICE_ROLE_KEY"] ||
      process.env["SUPABASE_PUBLISHABLE_KEY"] ||
      process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return { site: null, pages: [], isPublished: false };
    }

    const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);

    // 1. Try RPC function first
    try {
      const { data: rpcData, error: rpcError } = await (supabase.rpc as any)(
        "get_public_site_by_slug",
        { site_slug: slug }
      );
      if (!rpcError && rpcData?.site) {
        return {
          site: rpcData.site,
          pages: rpcData.pages || [],
          isPublished: !!rpcData.isPublished,
        };
      }
    } catch {}

    // 2. Fetch site by slug
    const { data: site, error: siteError } = await supabase
      .from("sites")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (siteError || !site) {
      return { site: null, pages: [], isPublished: false };
    }

    // 2. Fetch pages
    const { data: pages } = await supabase
      .from("site_pages")
      .select("id, title, path, sections, seo, position")
      .eq("site_id", site.id)
      .order("position");

    let finalPages = pages || [];
    const hasAnySection = finalPages.some(
      (p) => Array.isArray(p.sections) && p.sections.length > 0
    );
    if (!hasAnySection && site) {
      const backupSections = (site.content as Record<string, unknown>)?.["sections"];
      if (Array.isArray(backupSections) && backupSections.length > 0) {
        finalPages = [
          {
            id: "default-page",
            title: "Página inicial",
            path: "/",
            position: 0,
            sections: backupSections,
            seo: (site.seo as Record<string, unknown>) || {},
          } as any,
        ];
      }
    }

    return {
      site,
      pages: finalPages,
      isPublished: site.status === "published",
    };
  });
