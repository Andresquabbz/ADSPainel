import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { checkRateLimit } from "@/lib/rate-limiter";

export const CreditTokensInput = z
  .object({
    tokens: z.number().positive(),
    pkgSlug: z.string(),
    paymentId: z.string().optional().nullable(),
  })
  .strict();

export const creditPurchasedTokens = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => CreditTokensInput.parse(data))
  .handler(async ({ data: input, context }) => {
    const { supabase, userId } = context;

    // Rate Limiting (Anti-Tampering / Abuse protection)
    const rateCheck = checkRateLimit(`credit:${userId}`, {
      maxRequests: 5,
      windowMs: 120000, // 5 requests per 2 minutes
    });
    if (!rateCheck.allowed) {
      throw new Error(
        `Limite de requisições atingido. Aguarde ${rateCheck.resetInSeconds} segundos para tentar novamente.`
      );
    }

    // 1. Check idempotency if paymentId is present to prevent double credit
    if (input.paymentId) {
      const { data: existing } = await supabase
        .from("token_transactions")
        .select("id")
        .eq("user_id", userId)
        .ilike("description", `%${input.paymentId}%`)
        .maybeSingle();

      if (existing) {
        const { data: currentProf } = await supabase
          .from("profiles")
          .select("token_balance")
          .eq("id", userId)
          .single();
        return { success: true, alreadyCredited: true, newBalance: currentProf?.token_balance ?? 0 };
      }
    }

    // 2. Fetch current profile balance
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("token_balance")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      throw new Error("Perfil não encontrado.");
    }

    const newBalance = profile.token_balance + input.tokens;

    // 3. Update profile
    await supabase
      .from("profiles")
      .update({ token_balance: newBalance })
      .eq("id", userId);

    // 4. Log transaction
    const desc = input.paymentId
      ? `Compra de tokens via Mercado Pago Pix (${input.tokens} tokens - Ref: ${input.paymentId})`
      : `Compra de tokens via Mercado Pago Pix (${input.tokens} tokens)`;

    await supabase.from("token_transactions").insert({
      user_id: userId,
      type: "purchase",
      amount: input.tokens,
      balance_after: newBalance,
      description: desc,
    });

    // 4. Create notification
    await supabase.from("notifications").insert({
      user_id: userId,
      title: "Tokens Creditados com Sucesso! 🎉",
      message: `Seu pagamento foi confirmado e ${input.tokens} tokens foram adicionados ao seu saldo. Saldo atual: ${newBalance} tokens.`,
      kind: "token_purchase",
      is_read: false,
    });

    return { success: true, newBalance };
  });
