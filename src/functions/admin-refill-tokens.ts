import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const ADMIN_EMAILS = ["andre.jesus.rocha@gmail.com"];

export const adminRefillTokens = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        amount: z.number().positive().default(50),
      })
      .parse(data)
  )
  .handler(async ({ data: input, context }) => {
    const { userId, claims } = context;
    const userEmail = (claims as { email?: string })?.email || "";

    if (!ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
      throw new Error("Acesso restrito ao Super Administrador.");
    }

    const SUPABASE_URL = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
    const SUPABASE_KEY =
      process.env["SUPABASE_SERVICE_ROLE_KEY"] ||
      process.env["SUPABASE_PUBLISHABLE_KEY"] ||
      process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error("Configuração do Supabase não encontrada.");
    }

    const adminClient = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);

    const { data: prof, error: profErr } = await adminClient
      .from("profiles")
      .select("token_balance")
      .eq("id", userId)
      .single();

    if (profErr || !prof) {
      throw new Error("Perfil não encontrado.");
    }

    const currentBal = Number(prof.token_balance) || 0;
    const newBal = currentBal + input.amount;

    const { error: updErr } = await adminClient
      .from("profiles")
      .update({
        token_balance: newBal,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updErr) {
      throw new Error(`Erro ao atualizar saldo: ${updErr.message}`);
    }

    await adminClient.from("token_transactions").insert({
      user_id: userId,
      type: "admin",
      amount: input.amount,
      balance_after: newBal,
      description: `Recarga Super Admin (+${input.amount} tokens)`,
    });

    return { success: true, newBalance: newBal };
  });
