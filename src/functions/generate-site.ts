import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generatePageSections } from "@/lib/content-generator";
import { checkRateLimit } from "@/lib/rate-limiter";
import { findAvailableSlug } from "@/lib/slug";

// ─── Input schema (Strict & Sanitized) ────────────────────────────────────────

export const GenerateSiteInput = z
  .object({
    name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
    business_name: z.string().trim().min(2).max(150),
    cnpj: z.string().trim().max(25).optional().nullable(),
    category: z.string().trim().max(80).optional().nullable(),
    goal: z.string().trim().max(100).optional().nullable(),
    style: z.string().trim().max(60).optional().nullable(),
    primary_color: z.string().trim().max(20).default("#e2603a"),
    font_family: z.string().trim().max(60).default("Hanken Grotesk"),
    phone: z.string().trim().max(30).optional().nullable(),
    whatsapp: z.string().trim().max(30).optional().nullable(),
    email: z.string().trim().max(120).optional().nullable(),
    city: z.string().trim().max(80).optional().nullable(),
    state: z.string().trim().max(10).optional().nullable(),
  })
  .strict();

export type GenerateSiteInputType = z.infer<typeof GenerateSiteInput>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function buildPrompt(input: GenerateSiteInputType): string {
  const styleHints: Record<string, string> = {
    Moderno: "design limpo, tipografia sem serifa, muito espaço em branco",
    Minimalista: "máxima simplicidade, poucos elementos, elegância discreta",
    Elegante: "sofisticação, linguagem refinada, tom premium",
    Corporativo: "profissional, sóbrio, confiável, linguagem formal",
    Criativo: "dinâmico, descontraído, expressivo, jovial",
    Luxuoso: "exclusividade, tom aspiracional, detalhes de luxo",
    Tecnológico: "inovador, técnico, moderno, focado em inovação",
  };

  const styleDesc = styleHints[input.style ?? ""] ?? "profissional e moderno";

  return `Você é um copywriter especialista em sites para o mercado brasileiro.
Gere conteúdo completo e personalizado para um site de ${input.category ?? "negócio"} com estilo ${styleDesc}.

DADOS DO NEGÓCIO:
- Nome do site: ${input.name}
- Empresa: ${input.business_name}
${input.cnpj ? `- CNPJ: ${input.cnpj}` : ""}
${input.category ? `- Segmento: ${input.category}` : ""}
${input.goal ? `- Objetivo principal: ${input.goal}` : ""}
${input.city ? `- Cidade: ${input.city}${input.state ? `/${input.state}` : ""}` : ""}
${input.phone ? `- Telefone: ${input.phone}` : ""}
${input.whatsapp ? `- WhatsApp: ${input.whatsapp}` : ""}
${input.email ? `- E-mail: ${input.email}` : ""}

REGRAS OBRIGATÓRIAS:
1. Retorne APENAS JSON válido, sem markdown, sem texto adicional
2. Textos em português brasileiro natural e profissional
3. O hero deve ter um título impactante de até 8 palavras, focado no benefício do cliente
4. Mencione a cidade quando disponível para gerar conexão local
5. Inclua 4 features com emojis relevantes ao nicho
6. O about deve contar a história/missão de forma autêntica com 2-3 frases
7. Gere entre 4 e 6 seções dependendo do nicho

ESTRUTURA JSON ESPERADA:
{
  "sections": [
    {
      "type": "hero",
      "badge": "frase curta de destaque (ex: Atendimento em ${input.city ?? "sua cidade"})",
      "title": "Título impactante do hero",
      "subtitle": "Subtítulo explicativo com proposta de valor clara (1-2 frases)",
      "cta_label": "Texto do botão principal"
    },
    {
      "type": "features",
      "title": "Título da seção de diferenciais",
      "items": [
        { "icon": "🎯", "title": "Diferencial 1", "body": "Descrição breve e persuasiva" },
        { "icon": "⚡", "title": "Diferencial 2", "body": "Descrição breve e persuasiva" },
        { "icon": "🏆", "title": "Diferencial 3", "body": "Descrição breve e persuasiva" },
        { "icon": "🤝", "title": "Diferencial 4", "body": "Descrição breve e persuasiva" }
      ]
    },
    {
      "type": "services",
      "title": "Título dos serviços/produtos",
      "items": [
        { "icon": "emoji", "title": "Serviço/Produto 1", "body": "Descrição" },
        { "icon": "emoji", "title": "Serviço/Produto 2", "body": "Descrição" },
        { "icon": "emoji", "title": "Serviço/Produto 3", "body": "Descrição" },
        { "icon": "emoji", "title": "Serviço/Produto 4", "body": "Descrição" }
      ]
    },
    {
      "type": "steps",
      "title": "Como funciona / Nosso processo",
      "items": [
        { "number": "01", "title": "Passo 1", "description": "Descrição do passo" },
        { "number": "02", "title": "Passo 2", "description": "Descrição do passo" },
        { "number": "03", "title": "Passo 3", "description": "Descrição do passo" },
        { "number": "04", "title": "Passo 4", "description": "Descrição do passo" }
      ]
    },
    {
      "type": "about",
      "title": "Sobre nós / Sobre ${input.name}",
      "highlight": "Frase de missão curta e impactante",
      "body": "Parágrafo sobre a empresa, história e missão. 2-3 frases. Mencione a cidade."
    },
    {
      "type": "contact",
      "title": "Título da seção de contato"
    }
  ],
  "seo": {
    "title": "${input.name} — ${input.category ?? ""} ${input.city ? `em ${input.city}` : ""}",
    "description": "Meta description de até 160 caracteres para o Google"
  }
}

ADAPTE as seções conforme o segmento (${input.category ?? "geral"}). Para restaurante: use menu_highlight. Para imobiliária: use categories. Inclua apenas seções que façam sentido para o negócio.`;
}

// ─── Server function ──────────────────────────────────────────────────────────

export const generateSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => GenerateSiteInput.parse(data))
  .handler(async ({ data: input, context }) => {
    const { supabase, userId } = context;
    const { TOKEN_CONFIG } = await import("@/config/tokens");
    const TOKEN_COST = TOKEN_CONFIG.tokensPerSite; // 2.5 tokens per site

    // ── 1. Validate token balance (2.5 tokens per site, exempt super admin) ──
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("token_balance, email")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      throw new Error("Perfil não encontrado.");
    }

    const SUPER_ADMIN_EMAILS = ["andre.jesus.rocha@gmail.com"];
    const userEmail = (profile.email || (context.claims as { email?: string })?.email || "").toLowerCase();
    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(userEmail);

    const currentBalance = Number(profile.token_balance) || 0;
    if (!isSuperAdmin && currentBalance < TOKEN_COST) {
      throw new Error(
        `Saldo insuficiente. Você precisa de ${TOKEN_COST.toString().replace(".", ",")} tokens para gerar um site (saldo atual: ${currentBalance.toString().replace(".", ",")}). Recarregue seu saldo para continuar.`
      );
    }

    // ── Rate Limiting (Anti-Abuse / DoS) ──────────────────────────────────────
    if (!isSuperAdmin) {
      const rateCheck = checkRateLimit(`gen:${userId}`, {
        maxRequests: 5,
        windowMs: 60000,
      });
      if (!rateCheck.allowed) {
        throw new Error(
          `Muitas gerações simultâneas. Por favor, aguarde ${rateCheck.resetInSeconds} segundos antes de gerar outro site.`
        );
      }
    }

    // ── 2. Call Gemini (or fallback to template) ─────────────────────────────
    const GEMINI_KEY = process.env["GEMINI_API_KEY"];
    let sections: unknown[];
    let seoData: { title: string; description: string } | undefined;

    if (GEMINI_KEY) {
      try {
        const prompt = buildPrompt(input);

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (!geminiRes.ok) {
          const errText = await geminiRes.text();
          console.error("[Gemini] API error:", errText);
          throw new Error("Gemini API error");
        }

        const geminiJson = await geminiRes.json() as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };

        const rawText =
          geminiJson.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

        // Strip potential markdown code fences
        const cleaned = rawText
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();

        const parsed = JSON.parse(cleaned) as {
          sections: unknown[];
          seo?: { title: string; description: string };
        };

        if (!Array.isArray(parsed.sections) || parsed.sections.length === 0) {
          throw new Error("Gemini returned empty sections");
        }

        sections = parsed.sections;
        seoData = parsed.seo;
        console.log(`[Gemini] Generated ${sections.length} sections for "${input.name}"`);
      } catch (geminiError) {
        // Fallback to template on any Gemini failure
        console.warn("[Gemini] Falling back to template:", geminiError);
        sections = generatePageSections(input);
      }
    } else {
      // No API key — use template generator
      console.log("[AI] GEMINI_API_KEY not set, using template generator");
      sections = generatePageSections(input);
    }

    // ── 3. Create the site record ────────────────────────────────────────────
    const uniqueSlug = await findAvailableSlug(
      supabase,
      input.name || input.business_name
    );

    const { data: site, error: siteError } = await supabase
      .from("sites")
      .insert({
        user_id: userId,
        name: input.name,
        slug: uniqueSlug,
        business_name: input.business_name,
        category: input.category ?? null,
        goal: input.goal ?? null,
        style: input.style ?? null,
        primary_color: input.primary_color,
        font_family: input.font_family,
        phone: input.phone ?? null,
        whatsapp: input.whatsapp ?? null,
        email: input.email ?? null,
        city: input.city ?? null,
        state: input.state ?? null,
        status: "published",
        published_at: new Date().toISOString(),
        description: "",
        content: {
          cnpj: input.cnpj ?? null,
          generated: true,
          ai: !!GEMINI_KEY,
          sections: sections as any,
        },
      })
      .select("id")
      .single();

    if (siteError || !site) {
      throw new Error("Erro ao criar o site: " + siteError?.message);
    }

    // ── 4. Save the generated homepage ──────────────────────────────────────
    const { error: pageError } = await supabase.from("site_pages").insert({
      site_id: site.id,
      user_id: userId,
      title: "Página inicial",
      path: "/",
      position: 0,
      sections: sections as any,
      seo: seoData ?? {
        title: `${input.name} — ${input.category ?? ""}${input.city ? ` em ${input.city}` : ""}`,
        description: `${input.business_name}${input.city ? ` em ${input.city}` : ""}. Entre em contato.`,
      },
    });

    if (pageError) {
      // Site already created — still return slug but log the page error
      console.error("[generate-site] page insert error:", pageError.message);
    }

    // ── 5. Debit 2.5 tokens (exempt super admin) ────────────────────────────
    if (!isSuperAdmin) {
      const { data: freshProfile } = await supabase
        .from("profiles")
        .select("token_balance")
        .eq("id", userId)
        .single();

      const currentBal = Number(freshProfile?.token_balance ?? currentBalance) || 0;
      const newBalance = Math.max(0, currentBal - TOKEN_COST);

      const { error: updateErr } = await supabase
        .from("profiles")
        .update({
          token_balance: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateErr) {
        console.error("[generate-site] Error updating balance:", updateErr);
      }

      try {
        await supabase.from("token_transactions").insert({
          user_id: userId,
          type: "generation",
          amount: -TOKEN_COST,
          balance_after: newBalance,
          description: `Geração de site: ${input.name}`,
        });
      } catch (txErr) {
        console.error("[generate-site] Transaction log error (ignored):", txErr);
      }

      console.log(`[generate-site] Debited ${TOKEN_COST} tokens from user ${userId}. Balance: ${currentBal} -> ${newBalance}`);
    } else {
      console.log(`[generate-site] Super admin generation for ${userEmail}: tokens infinitos (sem débito).`);
    }

    // ── 6. Return result ─────────────────────────────────────────────────────
    return {
      siteSlug: uniqueSlug,
      siteId: site.id,
      sectionsCount: sections.length,
      usedAI: !!GEMINI_KEY,
    };
  });
