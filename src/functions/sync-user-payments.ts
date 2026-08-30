import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const syncUserPayments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const MP_TOKEN = (process.env["MERCADO_PAGO_ACCESS_TOKEN"] || "").replace(/^['"]|['"]$/g, "");
    if (!MP_TOKEN) {
      return { credited: false, reason: "no_token" };
    }

    try {
      const res = await fetch("https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&limit=15", {
        headers: { Authorization: `Bearer ${MP_TOKEN}` }
      });

      if (!res.ok) {
        return { credited: false, reason: "mp_fetch_failed" };
      }

      const data = await res.json() as {
        results?: Array<{
          id: number;
          status: string;
          metadata?: { user_id?: string; tokens?: number; package_slug?: string };
        }>;
      };

      if (!data.results || data.results.length === 0) {
        return { credited: false, reason: "no_payments" };
      }

      let totalAdded = 0;
      for (const p of data.results) {
        if (p.status === "approved" && p.metadata?.user_id === userId && p.metadata?.tokens) {
          const { data: rpcRes, error: rpcErr } = await (supabase.rpc as any)("credit_tokens_for_payment", {
            p_payment_id: String(p.id),
            p_user_id: userId,
            p_tokens: Number(p.metadata.tokens),
            p_pkg_slug: p.metadata.package_slug || "starter"
          });

          if (!rpcErr && rpcRes?.success && !rpcRes?.already_credited) {
            totalAdded += Number(p.metadata.tokens);
          }
        }
      }

      if (totalAdded > 0) {
        const { data: prof } = await supabase.from("profiles").select("token_balance").eq("id", userId).single();
        return { credited: true, tokensAdded: totalAdded, newBalance: prof?.token_balance ?? 0 };
      }

      return { credited: false, reason: "none_pending" };
    } catch (err) {
      console.error("[syncUserPayments] Error:", err);
      return { credited: false, reason: "exception" };
    }
  });
