import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { checkRateLimit } from "@/lib/rate-limiter";

export const CreateMpCheckoutInput = z
  .object({
    packageId: z.string(),
    packageSlug: z.string(),
    origin: z.string().url(),
  })
  .strict();

export const createMercadoPagoCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => CreateMpCheckoutInput.parse(data))
  .handler(async ({ data: input, context }) => {
    const { supabase, userId } = context;
    const { getPackageBySlugOrId } = await import("@/config/tokens");

    // 1. Fetch package details (from central TOKEN_CONFIG or database)
    const configuredPkg = getPackageBySlugOrId(input.packageSlug) || getPackageBySlugOrId(input.packageId);

    let pkg = configuredPkg ? { ...configuredPkg } : null;
    if (!pkg) {
      const { data: dbPkg } = await supabase
        .from("token_packages")
        .select("id, name, slug, tokens, price_cents")
        .eq("id", input.packageId)
        .eq("is_active", true)
        .maybeSingle();
      if (dbPkg) pkg = dbPkg;
    }

    if (!pkg) {
      throw new Error("Pacote de tokens não encontrado.");
    }

    // 2. Fetch user details for payer
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", userId)
      .single();

    // Rate Limiting (Anti-Spam / DoS protection on checkout creation)
    const rateCheck = checkRateLimit(`checkout:${userId}`, {
      maxRequests: 6,
      windowMs: 120000, // 6 checkouts per 2 minutes
    });
    if (!rateCheck.allowed) {
      throw new Error(
        `Muitas tentativas de checkout. Por favor, aguarde ${rateCheck.resetInSeconds} segundos para tentar novamente.`
      );
    }

    const MP_ACCESS_TOKEN = process.env["MERCADO_PAGO_ACCESS_TOKEN"];

    // 3. If Mercado Pago token is configured, call official Checkout Pro API
    if (MP_ACCESS_TOKEN) {
      try {
        const preferencePayload = {
          items: [
            {
              id: pkg.id,
              title: `Pacote ${pkg.tokens} Tokens — ADSPainel`,
              description: `Adição de ${pkg.tokens} tokens na conta ADSPainel para geração de sites com IA.`,
              quantity: 1,
              currency_id: "BRL",
              unit_price: pkg.price_cents / 100,
            },
          ],
          payer: {
            name: profile?.full_name || "Cliente",
            email: profile?.email || (context.claims as { email?: string })?.email || "cliente@adspainel.com",
          },
          back_urls: {
            success: `${input.origin}/dashboard?payment=success&pkg=${pkg.slug}&tokens=${pkg.tokens}`,
            failure: `${input.origin}/dashboard?payment=failure`,
            pending: `${input.origin}/dashboard?payment=pending`,
          },
          ...(input.origin.startsWith("https://") ? { auto_return: "approved" } : {}),
          metadata: {
            user_id: userId,
            package_id: pkg.id,
            tokens: pkg.tokens,
            package_slug: pkg.slug,
          },
          statement_descriptor: "ADSPAINEL",
          payment_methods: {
            excluded_payment_types: [
              { id: "credit_card" },
              { id: "debit_card" },
              { id: "ticket" },
            ],
            default_payment_method_id: "pix",
          },
        };

        const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
          },
          body: JSON.stringify(preferencePayload),
        });

        if (!mpRes.ok) {
          const errData = await mpRes.text();
          console.error("[Mercado Pago] Error creating preference:", errData);
          throw new Error("Erro ao gerar checkout no Mercado Pago.");
        }

        const mpData = (await mpRes.json()) as {
          init_point: string;
          sandbox_init_point?: string;
        };

        return {
          checkoutUrl: mpData.init_point || mpData.sandbox_init_point,
          isSandbox: false,
        };
      } catch (err: unknown) {
        console.error("[Mercado Pago] Preference error:", err);
        throw err;
      }
    }

    // 4. Fallback if Access Token is not yet set in .env (Provides instructions & demo URL)
    return {
      checkoutUrl: null,
      message:
        "Access Token do Mercado Pago não configurado. Adicione MERCADO_PAGO_ACCESS_TOKEN no .env.",
      isSandbox: true,
      demoSuccessUrl: `${input.origin}/dashboard?payment=success&pkg=${pkg.slug}&tokens=${pkg.tokens}&demo=true`,
    };
  });
