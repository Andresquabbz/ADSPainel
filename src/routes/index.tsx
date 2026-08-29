import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { PublicSiteView } from "./s.$siteSlug";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { APP_CONFIG, formatBRL } from "@/config/app";
import { createServerFn } from "@tanstack/react-start";
import { getPublicSite } from "@/functions/get-public-site";
import { TOKEN_CONFIG } from "@/config/tokens";
import { supabase } from "@/integrations/supabase/client";

function extractMetaVerification(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/content=["']([^"']+)["']/i);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed.replace(/<[^>]*>?/gm, "").trim();
}

const getHostHeader = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();
    return req?.headers?.get("host") || "";
  } catch {
    return "";
  }
});

export const Route = createFileRoute("/")({
  loader: async () => {
    let host = "";
    if (typeof window !== "undefined") {
      host = window.location.hostname.toLowerCase();
    } else {
      try {
        host = await getHostHeader();
      } catch {
        host = "";
      }
    }
    const rootDomain = "adspainel.site";
    let subdomain: string | null = null;
    if (host.includes(`.${rootDomain}`)) {
      const parts = host.split(":")[0];
      if (parts.endsWith(`.${rootDomain}`)) {
        const sub = parts.slice(0, -(rootDomain.length + 1));
        const reserved = ["www", "app", "api", "admin", "mail", "cdn", "preview"];
        if (sub && !reserved.includes(sub)) {
          subdomain = sub;
        }
      }
    }

    if (subdomain) {
      try {
        const siteData = await getPublicSite({ data: subdomain });
        return { subdomain, siteData };
      } catch {
        return { subdomain, siteData: null };
      }
    }

    return { subdomain: null, siteData: null };
  },
  head: ({ loaderData }) => {
    if (loaderData?.siteData?.site) {
      const site = loaderData.siteData.site;
      const seo = (site.seo as { title?: string; description?: string }) || {};
      const content = (site.content as { facebook_domain_verification?: string; meta_tag?: string }) || {};
      const fbCode = extractMetaVerification(content.facebook_domain_verification || content.meta_tag);
      const metaList: Array<{ title?: string; name?: string; content?: string; property?: string }> = [
        { title: seo.title || site.name },
        { name: "description", content: seo.description || site.name },
        { property: "og:title", content: seo.title || site.name },
        { property: "og:description", content: seo.description || site.name },
        { property: "og:type", content: "website" },
      ];
      if (fbCode) {
        metaList.push({ name: "facebook-domain-verification", content: fbCode });
      }
      return { meta: metaList };
    }
    return {
      meta: [
        { title: `${APP_CONFIG.name} — Crie seu site profissional com IA` },
        { name: "description", content: APP_CONFIG.subtitle },
        { property: "og:title", content: `${APP_CONFIG.name} — Sites profissionais com IA` },
        { property: "og:description", content: APP_CONFIG.subtitle },
      ],
    };
  },
  component: IndexPage,
});

function IndexPage() {
  const { subdomain, siteData } = Route.useLoaderData();
  if (subdomain) {
    return <PublicSiteView siteSlug={subdomain} initialData={siteData} />;
  }
  return <Landing />;
}

const FEATURES = [
  {
    tag: "01",
    title: "Geração completa por IA",
    body: "Descreva seu negócio e receba um site inteiro: textos, estrutura, seções e SEO prontos.",
  },
  {
    tag: "02",
    title: "Editor visual sem código",
    body: "Ajuste cores, fontes, imagens e blocos com cliques. O que você vê é o que é publicado.",
  },
  {
    tag: "03",
    title: "Domínio próprio",
    body: "Publique em um subdomínio grátis ou conecte seu domínio com verificação automática.",
  },
  {
    tag: "04",
    title: "SEO técnico incluso",
    body: "Meta tags, sitemap, dados estruturados e performance configurados desde o primeiro deploy.",
  },
  {
    tag: "05",
    title: "Tokens transparentes",
    body: "Cada operação de IA tem custo claro em tokens. Sem surpresas na fatura.",
  },
  {
    tag: "06",
    title: "Pronto para converter",
    body: "Formulários, WhatsApp, integrações e chamadas para ação otimizadas para captar clientes.",
  },
];

const STEPS = [
  { n: "1", t: "Conte sobre o negócio", d: "Nome, segmento, objetivo e estilo visual." },
  { n: "2", t: "A IA constrói o site", d: "Estrutura, textos e design gerados em minutos." },
  { n: "3", t: "Refine no editor", d: "Ajuste tudo visualmente, sem tocar em código." },
  { n: "4", t: "Publique", d: "Subdomínio grátis ou seu domínio próprio." },
];

const FAQ = [
  {
    q: "Preciso saber programar?",
    a: "Não. Todo o processo é visual: você responde algumas perguntas e a IA constrói o site.",
  },
  {
    q: "Como funcionam os tokens?",
    a: "Cada operação de IA consome tokens do seu saldo. Gerar um site completo com IA consome apenas 2,5 tokens. Você pode adicionar saldo avulso via Pix a qualquer momento diretamente no seu painel.",
  },
  {
    q: "Posso usar meu próprio domínio?",
    a: "Sim. Em todos os planos você pode conectar seu domínio próprio apontando um CNAME e nós verificamos automaticamente em tempo real.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim, sem multa nem fidelidade. Seus sites publicados permanecem intactos.",
  },
];

function Landing() {

  const plans = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("id, name, slug, price_cents, monthly_tokens, max_sites, custom_domain, features")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return (data ?? []).filter((p) => p.slug !== "free" && p.price_cents > 0);
    },
  });

  const templates = useQuery({
    queryKey: ["templates", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("id, name, slug, category, description")
        .eq("is_active", true)
        .limit(8);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 grid-backdrop opacity-60" aria-hidden />
          <div className="relative mx-auto max-w-6xl px-6 py-28 text-center">
            <p className="label-mono text-primary">Plataforma de criação com IA</p>
            <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
              {APP_CONFIG.tagline}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
              {APP_CONFIG.subtitle}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Button asChild variant="hero" size="xl">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Criar meu site grátis
                </Link>
              </Button>
              <Button asChild variant="heroGhost" size="xl">
                <a href="#planos">Ver planos</a>
              </Button>
            </div>
            <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
              {[
                ["+12k", "sites criados"],
                ["4 min", "tempo médio"],
                ["99,9%", "uptime"],
                ["0", "linhas de código"],
              ].map(([value, label]) => (
                <div key={label} className="bg-background px-4 py-6">
                  <p className="font-mono text-2xl font-bold text-foreground">{value}</p>
                  <p className="label-mono mt-2 text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="recursos" className="border-b border-border">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <p className="label-mono text-primary">Recursos</p>
            <h2 className="mt-4 max-w-2xl text-4xl font-extrabold tracking-tight">
              Tudo que um site profissional precisa, sem complexidade.
            </h2>
            <div className="mt-14 grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <article key={f.tag} className="bg-background p-8">
                  <span className="label-mono text-primary">{f.tag}</span>
                  <h3 className="mt-4 text-lg font-bold tracking-tight">{f.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{f.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="border-b border-border bg-surface">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <p className="label-mono text-primary">Como funciona</p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight">Quatro passos. Um site.</h2>
            <ol className="mt-14 grid gap-8 md:grid-cols-4">
              {STEPS.map((s) => (
                <li key={s.n} className="border-t-2 border-primary pt-5">
                  <span className="font-mono text-3xl font-bold text-primary">{s.n}</span>
                  <h3 className="mt-3 font-bold tracking-tight">{s.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* TEMPLATES */}
        <section id="templates" className="border-b border-border">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <p className="label-mono text-primary">Templates</p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight">
              Pontos de partida por segmento.
            </h2>
            <div className="mt-14 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
              {(templates.data ?? []).map((t) => (
                <article key={t.id} className="bg-background p-6">
                  <span className="label-mono text-muted-foreground">{t.category}</span>
                  <h3 className="mt-3 font-bold tracking-tight">{t.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* PLANOS */}
        <section id="planos" className="border-b border-border bg-surface">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <p className="label-mono text-primary">Planos</p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight">
              Planos profissionais. Escolha o ideal para você.
            </h2>
            <div className="mt-14 grid gap-px bg-border md:grid-cols-2 lg:grid-cols-4">
              {TOKEN_CONFIG.packages.map((p) => {
                const sitesCount = Math.floor(p.tokens / TOKEN_CONFIG.tokensPerSite);
                return (
                  <article
                    key={p.id}
                    className={`relative flex flex-col bg-background p-8 ${
                      p.is_popular ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    {p.is_popular && (
                      <Badge className="absolute right-4 top-4 font-mono text-[10px] uppercase tracking-widest bg-primary text-primary-foreground">
                        Mais Escolhido
                      </Badge>
                    )}
                    <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-primary">
                      {p.name}
                    </h3>
                    <p className="mt-6 text-4xl font-extrabold tracking-tight">
                      {formatBRL(p.price_cents)}
                    </p>
                    <p className="label-mono mt-2 text-muted-foreground">pagamento único via Pix</p>
                    <ul className="mt-8 flex-1 space-y-3 text-sm text-muted-foreground">
                      <li className="font-bold text-foreground">{p.tokens} tokens inclusos</li>
                      <li>Até ~{sitesCount} sites com IA (2,5 tokens/site)</li>
                      <li>Domínio próprio & subdomínio</li>
                      <li>Editor visual completo</li>
                      <li>{p.slug === "agency" ? "Suporte VIP dedicado" : "Suporte prioritário"}</li>
                    </ul>
                    <Button
                      asChild
                      variant={p.is_popular ? "hero" : "monoOutline"}
                      className="mt-8 h-11 font-bold"
                    >
                      <Link to="/auth" search={{ mode: "signup" }}>
                        Começar com {p.name}
                      </Link>
                    </Button>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-b border-border">
          <div className="mx-auto max-w-3xl px-6 py-24">
            <p className="label-mono text-primary">FAQ</p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight">Perguntas frequentes</h2>
            <Accordion type="single" collapsible className="mt-10">
              {FAQ.map((item) => (
                <AccordionItem key={item.q} value={item.q}>
                  <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary">
          <div className="mx-auto max-w-4xl px-6 py-20 text-center">
            <h2 className="text-4xl font-extrabold tracking-tight text-primary-foreground">
              Seu próximo cliente está procurando você agora.
            </h2>
            <Button asChild variant="heroGhost" size="xl" className="mt-8">
              <Link to="/auth" search={{ mode: "signup" }}>
                Começar gratuitamente
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-10">
          <p className="label-mono text-muted-foreground">
            © {new Date().getFullYear()} {APP_CONFIG.company}
          </p>
          <a
            href={`mailto:${APP_CONFIG.supportEmail}`}
            className="label-mono text-muted-foreground hover:text-foreground"
          >
            {APP_CONFIG.supportEmail}
          </a>
        </div>
      </footer>
    </div>
  );
}
