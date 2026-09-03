import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const VERCEL_TOKEN = (
  process.env["VERCEL_AUTH_TOKEN"] ||
  ""
).replace(/^['"]|['"]$/g, "");

const VERCEL_PROJECT_ID = (
  process.env["VERCEL_PROJECT_ID"] ||
  "prj_K3Ws5NMDkw8AA7TX7Jmtl8ohdDb8"
).replace(/^['"]|['"]$/g, "");

function getSupabaseAdmin() {
  const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"] || "";
  const key =
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ||
    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    "";
  return createClient<Database>(url, key);
}

// ── 1. Add Domain to Vercel & Supabase ────────────────────────────────────────
export const addCustomDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({
        siteId: z.string(),
        domain: z.string().min(3),
      })
      .parse(input)
  )
  .handler(async ({ context, data }) => {
    const { userId } = context;
    const { siteId, domain } = data;
    const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");

    const supabase = getSupabaseAdmin();

    // Verify site ownership
    const { data: site, error: siteErr } = await supabase
      .from("sites")
      .select("id, user_id, content")
      .eq("id", siteId)
      .single();

    if (siteErr || !site || site.user_id !== userId) {
      throw new Error("Você não tem permissão para alterar este site.");
    }

    let vercelVerified = false;

    // Register on Vercel
    if (VERCEL_TOKEN && VERCEL_PROJECT_ID) {
      try {
        const vercelRes = await fetch(
          `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${VERCEL_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: cleanDomain }),
          }
        );

        if (vercelRes.ok) {
          const vData = (await vercelRes.json()) as { verified?: boolean };
          vercelVerified = !!vData.verified;
        } else {
          const errBody = await vercelRes.text();
          console.warn("[Vercel API] Add domain response:", errBody);
        }
      } catch (err) {
        console.error("[Vercel API] Error adding domain:", err);
      }
    }

    // Save in Supabase domains table
    const { data: existingDomain } = await supabase
      .from("domains")
      .select("id")
      .eq("site_id", siteId)
      .maybeSingle();

    if (existingDomain) {
      await supabase
        .from("domains")
        .update({
          domain: cleanDomain,
          status: vercelVerified ? "verified" : "pending",
          ssl_active: vercelVerified,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingDomain.id);
    } else {
      await supabase.from("domains").insert({
        user_id: userId,
        site_id: siteId,
        domain: cleanDomain,
        record_type: "CNAME",
        status: vercelVerified ? "verified" : "pending",
        is_primary: true,
        ssl_active: vercelVerified,
      });
    }

    // Also update site.content.custom_domain
    const existingContent = (site.content as Record<string, unknown>) || {};
    await supabase
      .from("sites")
      .update({
        content: {
          ...existingContent,
          custom_domain: cleanDomain,
        },
      })
      .eq("id", siteId);

    return {
      success: true,
      domain: cleanDomain,
      verified: vercelVerified,
    };
  });

// ── 2. Remove Domain from Vercel & Supabase ──────────────────────────────────
export const removeCustomDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({
        siteId: z.string(),
        domain: z.string(),
      })
      .parse(input)
  )
  .handler(async ({ context, data }) => {
    const { userId } = context;
    const { siteId, domain } = data;
    const cleanDomain = domain.toLowerCase().trim();

    const supabase = getSupabaseAdmin();

    // Verify site ownership
    const { data: site, error: siteErr } = await supabase
      .from("sites")
      .select("id, user_id, content")
      .eq("id", siteId)
      .single();

    if (siteErr || !site || site.user_id !== userId) {
      throw new Error("Você não tem permissão para alterar este site.");
    }

    // Remove from Vercel
    if (VERCEL_TOKEN && VERCEL_PROJECT_ID) {
      try {
        await fetch(
          `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${cleanDomain}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${VERCEL_TOKEN}`,
            },
          }
        );
      } catch (err) {
        console.error("[Vercel API] Error deleting domain:", err);
      }
    }

    // Remove from Supabase domains table
    await supabase.from("domains").delete().eq("site_id", siteId);

    // Remove custom_domain from site.content
    const existingContent = (site.content as Record<string, unknown>) || {};
    delete existingContent["custom_domain"];
    await supabase
      .from("sites")
      .update({ content: existingContent as any })
      .eq("id", siteId);

    return { success: true };
  });

// ── 3. Verify Domain DNS & SSL on Vercel ──────────────────────────────────────
export const verifyCustomDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({
        siteId: z.string(),
        domain: z.string(),
      })
      .parse(input)
  )
  .handler(async ({ data }) => {
    const { siteId, domain } = data;
    const cleanDomain = domain.toLowerCase().trim();

    let verified = false;

    if (VERCEL_TOKEN && VERCEL_PROJECT_ID) {
      try {
        const res = await fetch(
          `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${cleanDomain}/verify`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${VERCEL_TOKEN}`,
            },
          }
        );

        if (res.ok) {
          const json = (await res.json()) as { verified?: boolean };
          verified = !!json.verified;
        }
      } catch (err) {
        console.error("[Vercel API] Verify error:", err);
      }
    }

    // If verified on Vercel, update database
    if (verified) {
      const supabase = getSupabaseAdmin();
      await supabase
        .from("domains")
        .update({
          status: "verified",
          ssl_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("site_id", siteId);
    }

    return { verified };
  });
