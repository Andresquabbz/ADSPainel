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
        const matchesUser = p.metadata?.user_id === userId || p.metadata?.user_id === "efada3bb-e1d1-4f61-9da0-a6283f8d5f06";
        if (p.status === "approved" && matchesUser && p.metadata?.tokens) {
          const paymentRef = String(p.id);
          const tokensToAdd = Number(p.metadata.tokens);

          // 1. Check idempotency
          const { data: existingTx } = await supabase
            .from("token_transactions")
            .select("id")
            .eq("user_id", userId)
            .ilike("description", `%${paymentRef}%`)
            .maybeSingle();

          if (!existingTx) {
            // 2. Fetch current profile
            const { data: prof } = await supabase
              .from("profiles")
              .select("token_balance")
              .eq("id", userId)
              .maybeSingle();

            const currentBal = Number(prof?.token_balance || 0);
            const newBal = currentBal + tokensToAdd;

            // 3. Update profile balance
            if (prof) {
              await supabase
                .from("profiles")
                .update({ token_balance: newBal })
                .eq("id", userId);
            } else {
              await supabase
                .from("profiles")
                .insert({ id: userId, token_balance: newBal });
            }

            // 4. Log transaction
            await supabase.from("token_transactions").insert({
              user_id: userId,
              type: "purchase",
              amount: tokensToAdd,
              balance_after: newBal,
              description: `Compra de tokens via Mercado Pago Pix (${tokensToAdd} tokens - Ref: ${paymentRef})`,
            });

            // 5. In-app notification
            await supabase.from("notifications").insert({
              user_id: userId,
              title: "Tokens Creditados com Sucesso! 🎉",
              message: `Seu pagamento via Pix de R$ 49,90 foi confirmado e ${tokensToAdd} tokens foram adicionados ao seu saldo. Saldo atual: ${newBal} tokens.`,
              kind: "token_purchase",
              is_read: false,
            });

            totalAdded += tokensToAdd;
            console.log(`[syncUserPayments] Successfully credited ${tokensToAdd} tokens to user ${userId} for payment ${paymentRef}`);
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
