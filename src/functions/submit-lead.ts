import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { checkRateLimit } from "@/lib/rate-limiter";

// ─── Input Validation Schema (Strict & Sanitized) ─────────────────────────────
// .strict() blocks Mass Assignment (disallows any unexpected fields)
export const SubmitLeadInput = z
  .object({
    siteId: z.string().uuid(),
    name: z
      .string()
      .trim()
      .min(2, "Nome deve ter no mínimo 2 caracteres")
      .max(100, "Nome muito longo"),
    phone: z
      .string()
      .trim()
      .max(30, "Telefone muito longo")
      .optional()
      .nullable(),
    email: z
      .string()
      .trim()
      .email("E-mail inválido")
      .max(120, "E-mail muito longo")
      .optional()
      .or(z.literal("")),
    message: z
      .string()
      .trim()
      .min(3, "Mensagem deve ter no mínimo 3 caracteres")
      .max(2000, "Mensagem muito longa (máximo 2000 caracteres)"),
    // Bot Protection: Honeypot field (must be empty from real humans)
    hp_check: z.string().optional().nullable(),
  })
  .strict();

export type SubmitLeadInputType = z.infer<typeof SubmitLeadInput>;

export const submitLead = createServerFn({ method: "POST" })
  .validator((data: unknown) => SubmitLeadInput.parse(data))
  .handler(async ({ data: input }) => {
    // ── 1. Bot Protection (Honeypot Trap) ───────────────────────────────────
    if (input.hp_check && input.hp_check.trim().length > 0) {
      // Silently succeed to mislead bots without recording spam
      console.warn("[Security] Bot blocked via honeypot trap on site:", input.siteId);
      return { success: true };
    }

    // ── 2. Rate Limiting ────────────────────────────────────────────────────
    // Limit to 5 submissions per site every 10 minutes to prevent spam floods
    const rateCheck = checkRateLimit(`lead:${input.siteId}`, {
      maxRequests: 5,
      windowMs: 600000, // 10 minutes
    });

    if (!rateCheck.allowed) {
      throw new Error(
        `Limite de mensagens atingido temporariamente. Aguarde ${rateCheck.resetInSeconds} segundos para enviar novamente.`
      );
    }

    // ── 3. Database connection ──────────────────────────────────────────────
    const SUPABASE_URL = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
    const SUPABASE_KEY =
      process.env["SUPABASE_SERVICE_ROLE_KEY"] ||
      process.env["SUPABASE_PUBLISHABLE_KEY"] ||
      process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error("Erro de configuração.");
    }

    const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);

    // ── 4. Verify site existence ────────────────────────────────────────────
    const { data: site, error: siteError } = await supabase
      .from("sites")
      .select("id, name, user_id")
      .eq("id", input.siteId)
      .single();

    if (siteError || !site) {
      throw new Error("Site não encontrado.");
    }

    // ── 5. Notify site owner ────────────────────────────────────────────────
    const contactInfo = [
      input.phone ? `WhatsApp/Tel: ${input.phone}` : null,
      input.email ? `E-mail: ${input.email}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    await supabase.from("notifications").insert({
      user_id: site.user_id,
      title: `Novo lead recebido em ${site.name}`,
      message: `${input.name} enviou uma mensagem: "${input.message}". ${contactInfo}`,
      kind: "lead",
      is_read: false,
    });

    // ── 6. Log activity ─────────────────────────────────────────────────────
    await supabase.from("activity_logs").insert({
      user_id: site.user_id,
      action: "lead_received",
      entity_type: "site",
      entity_id: site.id,
      metadata: {
        visitor_name: input.name,
        visitor_phone: input.phone || null,
        visitor_email: input.email || null,
        visitor_message: input.message,
        site_name: site.name,
      },
    });

    return { success: true };
  });
