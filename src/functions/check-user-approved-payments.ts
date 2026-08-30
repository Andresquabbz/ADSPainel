import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const checkUserApprovedPayments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const MP_TOKEN = (process.env["MERCADO_PAGO_ACCESS_TOKEN"] || "").replace(/^['"]|['"]$/g, "");
    if (!MP_TOKEN) return { approvedPayments: [] };

    try {
      const res = await fetch(
        "https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&limit=15",
        {
          headers: { Authorization: "Bearer " + MP_TOKEN },
        }
      );
      if (!res.ok) return { approvedPayments: [] };

      const data = (await res.json()) as {
        results?: Array<{
          id: number;
          status: string;
          metadata?: { user_id?: string; tokens?: number; package_slug?: string };
        }>;
      };

      const userApproved = (data.results || [])
        .filter(
          (p) =>
            p.status === "approved" &&
            p.metadata?.user_id === userId &&
            p.metadata?.tokens
        )
        .map((p) => ({
          paymentId: String(p.id),
          tokens: Number(p.metadata!.tokens),
          packageSlug: p.metadata?.package_slug || "starter",
        }));

      return { approvedPayments: userApproved };
    } catch (e) {
      console.error("[checkUserApprovedPayments] Error:", e);
      return { approvedPayments: [] };
    }
  });
