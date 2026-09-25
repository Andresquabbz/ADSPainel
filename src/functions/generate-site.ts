import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generatePageSections } from "@/lib/content-generator";
import { generateInstitutionalSections, INITIAL_COMPANY_DATA } from "@/lib/templates/institutional-template";
import { checkRateLimit } from "@/lib/rate-limiter";
import { findAvailableSlug } from "@/lib/slug";
import type { Database } from "@/integrations/supabase/types";

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
    template_id: z.string().trim().max(80).optional().nullable(),
    activity_area: z.string().trim().max(250).optional().nullable(),
    company_data: z.record(z.any()).optional().nullable(),
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
  const rawActivity = input.activity_area || (input.company_data as any)?.activity_area || "";
  const cleanActivity = rawActivity.replace(/^(\d{2}\.\d{2}-\d-\d{2}\s*-\s*)/, "").trim();
  const effectiveNiche = cleanActivity || input.category || "negócio e comércio";

  return `Você é um copywriter especialista em criação de sites para o mercado brasileiro.
Gere conteúdo completo, atraente e 100% PERSONALIZADO para um negócio de ${effectiveNiche} com estilo ${styleDesc}.

DADOS DO NEGÓCIO:
- Nome Fantasia / Marca: ${input.name}
- Razão Social: ${input.business_name}
- Ramo de Atuação / Nicho Real: ${effectiveNiche}
${input.cnpj ? `- CNPJ: ${input.cnpj}` : ""}
${input.category ? `- Segmento Geral: ${input.category}` : ""}
${input.goal ? `- Objetivo principal: ${input.goal}` : ""}
${input.city ? `- Cidade: ${input.city}${input.state ? `/${input.state}` : ""}` : ""}
${input.phone ? `- Telefone: ${input.phone}` : ""}
${input.whatsapp ? `- WhatsApp: ${input.whatsapp}` : ""}
${input.email ? `- E-mail: ${input.email}` : ""}

REGRAS OBRIGATÓRIAS:
1. RECONHEÇA E HONRE O NICHO REAL DO NEGÓCIO: O conteúdo (títulos, subtítulos, diferenciais, serviços, sobre nós) DEVE SER 100% FIEL ao ramo de atuação ("${effectiveNiche}").
2. JAMAIS use termos genéricos de "consultoria" ou "assessoria" se o negócio for de outro ramo (ex: roupas/vestuário/moda, oficina mecânica, salão de beleza, barbearia, restaurante, pet shop, clínica médica, etc.).
3. A seção "services" deve conter serviços/produtos reais e específicos desse nicho com nomes atrativos e descrições claras.
4. O hero deve ter um título impactante de até 8 palavras, focado no benefício do cliente.
5. Mencione a cidade quando disponível para gerar conexão local.
6. Inclua 4 features com emojis relevantes ao nicho.
7. O about deve contar a história/missão de forma autêntica com 2-3 frases no nicho.
8. Gere entre 4 e 7 seções dependendo do nicho.
9. Inclua OBRIGATORIAMENTE uma seção do tipo "privacy_policy" em conformidade com a LGPD.
10. Retorne APENAS JSON válido, sem markdown, sem texto adicional em português brasileiro natural e profissional.

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
    },
    {
      "type": "privacy_policy",
      "title": "Política de Privacidade",
      "subtitle": "Compromisso com a sua privacidade e segurança (LGPD).",
      "body": "Texto profissional destacando a privacidade e segurança dos dados dos clientes.",
      "items": [
        { "title": "Coleta e Finalidade", "description": "Uso exclusivo para atendimento e orçamentos." },
        { "title": "Segurança dos Dados", "description": "Proteção e sigilo das informações recebidas." },
        { "title": "Direitos LGPD", "description": "Livre solicitação de exclusão ou alteração de dados." }
      ]
    }
  ],
  "seo": {
    "title": "${input.name} — ${input.category ?? ""} ${input.city ? `em ${input.city}` : ""}",
    "description": "Meta description de até 160 caracteres para o Google"
  }
}

ADAPTE as seções conforme o segmento (${input.category ?? "geral"}). Para restaurante: use menu_highlight. Para imobiliária: use categories. Inclua sempre a seção privacy_policy.`;
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

    // ── 2. Call Institutional Generator or Gemini (or fallback) ──────────
    const GEMINI_KEY = process.env["GEMINI_API_KEY"];
    let sections: unknown[];
    let seoData: { title: string; description: string } | undefined;

    const isInstitutional =
      input.template_id === "empresa-institucional" ||
      input.category === "Institucional / Serviços / Financeiro" ||
      input.category === "Empresa Institucional";

    let finalCompanyData: any = null;

    if (isInstitutional) {
      const rawCompanyData = input.company_data || {};
      const resolvedActivity =
        input.activity_area?.trim() ||
        rawCompanyData.activity_area?.trim() ||
        (input.category && input.category !== "Institucional / Serviços / Financeiro" ? input.category : "") ||
        "Serviços Especializados";

      finalCompanyData = {
        ...INITIAL_COMPANY_DATA,
        name: input.name,
        fantasy_name: rawCompanyData.fantasy_name || input.name,
        legal_name: rawCompanyData.legal_name || input.business_name || input.name,
        cnpj: input.cnpj || rawCompanyData.cnpj || "",
        phone: input.phone || rawCompanyData.phone || "",
        whatsapp: input.whatsapp || rawCompanyData.whatsapp || "",
        email: input.email || rawCompanyData.email || "",
        address_city: input.city || rawCompanyData.address_city || "",
        address_state: input.state || rawCompanyData.address_state || "",
        ...rawCompanyData,
        activity_area: resolvedActivity,
      };

      if (GEMINI_KEY) {
        try {
          const instPrompt = `Você é um diretor de criação e copywriter corporativo brasileiro sênior.
Crie o conteúdo institucional (Missão, Quem Somos) e o catálogo de serviços especializados ("Soluções Especializadas") para a seguinte empresa:

DADOS DA EMPRESA:
- Nome Fantasia / Marca: ${finalCompanyData.name}
- Razão Social: ${finalCompanyData.legal_name}
- Ramo de Atuação / Atividade Principal (CNAE): ${finalCompanyData.activity_area}
${finalCompanyData.address_city ? `- Cidade/UF: ${finalCompanyData.address_city}/${finalCompanyData.address_state}` : ""}
${input.goal ? `- Objetivo: ${input.goal}` : ""}

REGRAS OBRIGATÓRIAS:
1. RECONHEÇA O NICHO REAL DA EMPRESA: Analise com máxima atenção o Ramo de Atuação ("${finalCompanyData.activity_area}") e a Razão Social ("${finalCompanyData.legal_name}").
2. NÃO use termos genéricos de assessoria ou consultoria se a empresa atuar em confecção de roupas, vestuário, comércio, alimentação, construção civil, transporte/logística, saúde, etc.
3. Descreva a Missão e o Quem Somos com vocabulário técnico e profissional fiel ao que a empresa REALMENTE fabrica, comercializa ou executa.
4. Em "services" ("Soluções Especializadas"), gere entre 3 e 5 serviços/produtos específicos desse nicho com nomes atrativos, descrições claras e categorias adequadas.
5. Retorne APENAS um JSON válido, sem markdown.

FORMATO JSON ESPERADO:
{
  "hero_badge": "Frase curta de destaque do nicho (ex: Excelência em Confecção e Vestuário)",
  "hero_subtitle": "Subtítulo claro explicando o que a empresa faz e sua proposta de valor (1-2 frases)",
  "mission_title": "Nossa Missão",
  "mission_description": "Texto da missão focado no nicho de atuação e compromisso com o cliente (2-3 frases)",
  "about_title": "Sobre a ${finalCompanyData.name}",
  "about_body": "Texto de quem somos destacando especialização, dedicação e qualidade no nicho (3-4 frases)",
  "about_highlight": "Frase de autoridade no nicho",
  "services_title": "Nossas Soluções Especializadas",
  "services_subtitle": "Produtos e serviços planejados para atender às necessidades específicas do seu negócio.",
  "services": [
    {
      "name": "Nome do Serviço/Produto 1 no nicho",
      "description": "Descrição clara e persuasiva do serviço ou produto",
      "icon": "Scissors",
      "category": "Categoria ou badge"
    }
  ]
}`;

          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: instPrompt }] }],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 2048,
                  responseMimeType: "application/json",
                },
              }),
            }
          );

          if (geminiRes.ok) {
            const geminiJson = (await geminiRes.json()) as any;
            const rawText = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
            const cleaned = rawText
              .replace(/^```json\s*/i, "")
              .replace(/^```\s*/i, "")
              .replace(/\s*```$/i, "")
              .trim();
            const parsed = JSON.parse(cleaned);

            if (parsed.mission_description) {
              finalCompanyData.mission_description = parsed.mission_description;
            }
            if (parsed.mission_title) {
              finalCompanyData.mission_title = parsed.mission_title;
            }
            if (parsed.about_body) {
              finalCompanyData.about_description = parsed.about_body;
            }
            if (parsed.about_title) {
              finalCompanyData.about_title = parsed.about_title;
            }
            if (parsed.about_highlight) {
              finalCompanyData.about_highlight = parsed.about_highlight;
            }
            if (parsed.hero_badge) {
              finalCompanyData.hero_badge = parsed.hero_badge;
            }
            if (parsed.hero_subtitle) {
              finalCompanyData.hero_subtitle = parsed.hero_subtitle;
            }
            if (parsed.services_title) {
              finalCompanyData.services_title = parsed.services_title;
            }
            if (parsed.services_subtitle) {
              finalCompanyData.services_subtitle = parsed.services_subtitle;
            }
            if (Array.isArray(parsed.services) && parsed.services.length > 0) {
              finalCompanyData.services = parsed.services.map((s: any, idx: number) => ({
                id: `srv-${idx + 1}`,
                name: s.name || s.title || `Serviço ${idx + 1}`,
                description: s.description || "",
                icon: s.icon || "Sparkles",
                category: s.category || s.badge || "Especialidade",
                link: "#contato",
                status: "active",
              }));
            }
            console.log(`[Gemini] Specialized institutional copy generated for "${finalCompanyData.name}" (${finalCompanyData.activity_area})`);
          }
        } catch (geminiInstErr) {
          console.warn("[Gemini] Failed to generate institutional copy via AI, using heuristic fallback:", geminiInstErr);
        }
      }

      sections = generateInstitutionalSections(finalCompanyData);
      seoData = {
        title: `${input.name} | ${finalCompanyData.activity_area || "Soluções Especializadas"}`,
        description: `Conheça a ${input.name} (${input.business_name}). ${finalCompanyData.about_highlight || "Qualidade e excelência em serviços"}${input.city ? ` em ${input.city}` : ""}.`,
      };
      console.log(`[Institutional] Generated ${sections.length} sections for "${input.name}"`);
    } else if (GEMINI_KEY) {
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

    // ── Guarantee Privacy Policy section is present ─────────────────────────
    const hasPrivacy = (sections as any[]).some(
      (s: any) => s?.type === "privacy_policy" || s?.type === "privacy"
    );
    if (!hasPrivacy) {
      (sections as any[]).push({
        type: "privacy_policy",
        title: "Política de Privacidade",
        subtitle: `Compromisso com a sua privacidade e segurança na ${input.business_name || input.name}.`,
        body: `A ${input.business_name || input.name} preza pela segurança, confidencialidade e transparência no tratamento dos dados pessoais de seus clientes e usuários, em total conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018). As informações coletadas voluntariamente por meio de nossos canais de atendimento são utilizadas unicamente para responder a solicitações, esclarecer dúvidas e viabilizar a prestação dos serviços contratados.`,
        items: [
          { title: "Coleta e Finalidade", description: "Coletamos apenas dados necessários (como nome, telefone e e-mail) fornecidos por você ao solicitar contato ou orçamento." },
          { title: "Segurança das Informações", description: "Adotamos padrões rígidos para proteger seus dados contra acessos não autorizados, perdas ou divulgação indevida." },
          { title: "Não Compartilhamento", description: "Seus dados pessoais nunca são comercializados ou compartilhados com terceiros sem seu expresso consentimento." },
          { title: "Direitos do Titular (LGPD)", description: "Você pode solicitar a confirmação, correção ou exclusão dos seus dados a qualquer momento pelos nossos canais oficiais." },
        ],
      });
    }

    // ── 3. Create the site record ────────────────────────────────────────────
    const uniqueSlug = await findAvailableSlug(
      supabase,
      input.name || input.business_name
    );

    // Safely resolve template_id as valid UUID or null
    let dbTemplateId: string | null = null;
    const templateSlug = input.template_id ?? (isInstitutional ? "empresa-institucional" : null);
    if (templateSlug) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(templateSlug);
      if (isUuid) {
        dbTemplateId = templateSlug;
      } else {
        try {
          const { data: tpl } = await supabase
            .from("templates")
            .select("id")
            .eq("slug", templateSlug)
            .maybeSingle();
          if (tpl?.id) {
            dbTemplateId = tpl.id;
          }
        } catch (err) {
          console.warn("[generate-site] Template lookup by slug failed, setting template_id to null:", err);
        }
      }
    }

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
        template_id: dbTemplateId,
        content: {
          cnpj: input.cnpj ?? null,
          template_slug: isInstitutional ? "empresa-institucional" : null,
          generated: true,
          ai: !isInstitutional && !!GEMINI_KEY,
          sections: sections as any,
          company_data: finalCompanyData || undefined,
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
    let newBalance = currentBalance;

    if (!isSuperAdmin) {
      try {
        const { data: rpcRes, error: rpcErr } = await (supabase.rpc as any)(
          "deduct_tokens_for_generation",
          {
            p_user_id: userId,
            p_tokens: TOKEN_COST,
            p_site_name: input.name,
          }
        );
        if (!rpcErr && rpcRes?.token_balance !== undefined) {
          newBalance = Number(rpcRes.token_balance);
          console.log(`[generate-site] RPC deducted tokens: new balance ${newBalance}`);
        } else {
          // Fallback: direct authenticated update
          const { data: freshProf } = await supabase
            .from("profiles")
            .select("token_balance")
            .eq("id", userId)
            .single();

          const latestBal = Number(freshProf?.token_balance ?? currentBalance) || 0;
          newBalance = Math.max(0, latestBal - TOKEN_COST);

          await supabase
            .from("profiles")
            .update({
              token_balance: newBalance,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

          await supabase.from("token_transactions").insert({
            user_id: userId,
            type: "generation",
            amount: -TOKEN_COST,
            balance_after: newBalance,
            description: `Geração de site: ${input.name}`,
          });
        }
      } catch (debitErr) {
        console.error("[generate-site] Debit error:", debitErr);
      }
    } else {
      console.log(`[generate-site] Super admin generation for ${userEmail}: tokens infinitos (sem débito).`);
    }

    // ── 6. Return result ─────────────────────────────────────────────────────
    return {
      siteSlug: uniqueSlug,
      siteId: site.id,
      sectionsCount: sections.length,
      usedAI: !!GEMINI_KEY,
      newBalance,
    };
  });
