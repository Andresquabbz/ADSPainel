import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getPublicSite } from "@/functions/get-public-site";
import { PublicContactForm } from "@/components/public/PublicContactForm";
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Construction,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import type { AnySection } from "@/components/editor/AddSectionModal";

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

export const Route = createFileRoute("/s/$siteSlug")({
  loader: async ({ params }) => {
    try {
      return await getPublicSite({ data: params.siteSlug });
    } catch {
      return null;
    }
  },
  head: ({ loaderData, params }) => {
    const site = loaderData?.site;
    const seo = (site?.seo as { title?: string; description?: string }) || {};
    const content = (site?.content as { facebook_domain_verification?: string; meta_tag?: string }) || {};
    const fbCode = extractMetaVerification(content.facebook_domain_verification || content.meta_tag);

    const metaList: Array<{ title?: string; name?: string; content?: string; property?: string }> = [
      { title: seo.title || site?.name || `Site — ${params.siteSlug}` },
      { name: "description", content: seo.description || `Site profissional de ${site?.name || params.siteSlug}` },
      { property: "og:title", content: seo.title || site?.name || `Site — ${params.siteSlug}` },
      { property: "og:description", content: seo.description || `Site profissional de ${site?.name || params.siteSlug}` },
      { property: "og:type", content: "website" },
    ];

    if (fbCode) {
      metaList.push({
        name: "facebook-domain-verification",
        content: fbCode,
      });
    }

    return {
      meta: metaList,
    };
  },
  component: PublicSitePage,
});

function formatPhone(raw: string | null): string {
  if (!raw) return "";
  const d = raw.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return raw;
}

function whatsappHref(raw: string | null): string {
  if (!raw) return "#";
  return `https://wa.me/55${raw.replace(/\D/g, "")}`;
}

function PublicSitePage() {
  const { siteSlug } = Route.useParams();
  const loaderData = Route.useLoaderData();
  return <PublicSiteView siteSlug={siteSlug} initialData={loaderData} />;
}

export function PublicSiteView({ siteSlug, initialData }: { siteSlug: string; initialData?: any }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["public-site", siteSlug],
    queryFn: () => getPublicSite({ data: siteSlug }),
    initialData,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-xs font-mono text-gray-500">Carregando site...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.site) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-6xl font-extrabold text-gray-900 font-mono">404</h1>
          <h2 className="text-xl font-bold text-gray-800">Site Não Encontrado</h2>
          <p className="text-sm text-gray-500">
            O endereço que você tentou acessar não existe ou foi alterado.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-colors"
            >
              Ir para ADSPainel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { site, pages, isPublished } = data;
  const primary = site.primary_color || "#e2603a";
  const font = site.font_family || "sans-serif";
  const cnpj = (site.content as { cnpj?: string })?.cnpj;

  // ── Inject Meta / Facebook BM verification tag into <head> ────────────────
  const fbVerification = extractMetaVerification(
    (site.content as { facebook_domain_verification?: string; meta_tag?: string })
      ?.facebook_domain_verification ||
      (site.content as { facebook_domain_verification?: string; meta_tag?: string })
        ?.meta_tag
  );

  useEffect(() => {
    if (fbVerification) {
      let metaTag = document.querySelector(
        'meta[name="facebook-domain-verification"]'
      );
      if (!metaTag) {
        metaTag = document.createElement("meta");
        metaTag.setAttribute("name", "facebook-domain-verification");
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute("content", fbVerification);
    }
  }, [fbVerification]);

  // ── 1. UNPUBLISHED (DRAFT) SCREEN ─────────────────────────────────────────
  if (!isPublished) {
    return (
      <div
        className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-6 sm:p-12 text-center"
        style={{ fontFamily: font }}
      >
        <header className="flex justify-center">
          <span className="font-extrabold text-xl tracking-tight" style={{ color: primary }}>
            {site.name}
          </span>
        </header>

        <main className="max-w-xl mx-auto space-y-6 my-auto py-12">
          <div className="flex justify-center">
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: primary }}
            >
              <Construction className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: primary }}
            >
              Em Construção
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {site.name}
            </h1>
            <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
              Estamos preparando nosso novo site oficial. Em breve você terá acesso a todas as novidades!
            </p>
          </div>

          {(site.whatsapp || site.phone || site.email) && (
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              {site.whatsapp && (
                <a
                  href={whatsappHref(site.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-xs font-bold text-white shadow-lg transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#25d366" }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Falar no WhatsApp
                </a>
              )}
              {site.email && (
                <a
                  href={`mailto:${site.email}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-xs font-bold border border-gray-700 hover:bg-gray-800 transition-colors"
                >
                  <Mail className="h-4 w-4 text-gray-400" />
                  Enviar E-mail
                </a>
              )}
            </div>
          )}
        </main>

        <footer className="text-xs text-gray-500 space-y-1">
          <p>© {new Date().getFullYear()} {site.business_name || site.name}</p>
          {cnpj && <p className="font-mono text-[11px]">CNPJ: {cnpj}</p>}
        </footer>
      </div>
    );
  }

  // ── 2. PUBLISHED PRODUCTION SITE ───────────────────────────────────────────
  const allSections: AnySection[] = [];
  if (pages && pages.length > 0) {
    for (const p of pages) {
      const sArr = Array.isArray(p.sections) ? (p.sections as AnySection[]) : [];
      allSections.push(...sArr);
    }
  }

  // Redundancy fallback: if pages had no sections, read from site.content.sections
  if (allSections.length === 0 && site) {
    const backupSecs = (site.content as Record<string, unknown>)?.["sections"];
    if (Array.isArray(backupSecs) && backupSecs.length > 0) {
      allSections.push(...(backupSecs as AnySection[]));
    }
  }

  return (
    <div
      className="min-h-screen bg-white text-slate-900 flex flex-col"
      style={{ fontFamily: font }}
    >
      {/* ── Public Site Header ── */}
      <header
        className="border-b px-6 py-4 sticky top-0 bg-white/95 backdrop-blur-md z-40"
        style={{ borderColor: primary + "20" }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xl font-extrabold tracking-tight" style={{ color: primary }}>
            {site.name}
          </span>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <a href="#sobre" className="hover:text-gray-900 transition-colors">Sobre</a>
            <a href="#contato" className="hover:text-gray-900 transition-colors">Contato</a>
          </nav>

          {site.whatsapp && (
            <a
              href={whatsappHref(site.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: primary }}
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          )}
        </div>
      </header>

      {/* ── Sections ── */}
      <main className="flex-1">
        {allSections.map((section, idx) => (
          <PublicSectionRenderer
            key={idx}
            section={section}
            siteId={site.id}
            primaryColor={primary}
            whatsapp={site.whatsapp || ""}
            phone={site.phone || ""}
            email={site.email || ""}
            city={site.city || ""}
            state={site.state || ""}
            address={site.address || ""}
            businessName={site.business_name || site.name}
          />
        ))}

        {!allSections.some((s) => s.type === "privacy_policy" || s.type === "privacy") && (
          <PublicSectionRenderer
            section={{
              type: "privacy_policy",
              title: "Política de Privacidade",
              subtitle: `Compromisso com a sua privacidade e conformidade com a LGPD (Lei nº 13.709/2018).`,
              body: `A ${site.business_name || site.name} preza pela segurança, confidencialidade e transparência no tratamento dos dados pessoais de seus clientes e usuários, em total conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018). As informações coletadas voluntariamente através de nossos canais de atendimento são utilizadas unicamente para responder a solicitações, esclarecer dúvidas e viabilizar a prestação dos serviços contratados.`,
              items: [
                { title: "Coleta e Finalidade", description: "Utilizamos informações de contato exclusivamente para responder suas dúvidas, pedidos e orçamentos." },
                { title: "Segurança das Informações", description: "Seus dados são protegidos com medidas adequadas e nunca comercializados com terceiros." },
                { title: "Seus Direitos (LGPD)", description: "Você pode solicitar acesso, alteração ou exclusão dos seus dados a qualquer momento por nossos canais." },
              ],
            }}
            siteId={site.id}
            primaryColor={primary}
            whatsapp={site.whatsapp || ""}
            phone={site.phone || ""}
            email={site.email || ""}
            city={site.city || ""}
            state={site.state || ""}
            address={site.address || ""}
            businessName={site.business_name || site.name}
          />
        )}
      </main>

      {/* ── Public Site Footer ── */}
      <footer
        className="border-t py-12 px-6 text-center text-xs text-gray-500 bg-gray-50"
        style={{ borderColor: primary + "20" }}
      >
        <div className="max-w-5xl mx-auto space-y-2">
          <p className="font-bold text-gray-800 text-sm">
            {site.business_name || site.name}
          </p>

          {(site.city || site.state) && (
            <p>{[site.address, site.city, site.state].filter(Boolean).join(" — ")}</p>
          )}

          {cnpj && (
            <p className="font-mono text-[11px] text-gray-600 font-semibold">
              CNPJ: {cnpj}
            </p>
          )}

          {site.email && (
            <p>
              <a href={`mailto:${site.email}`} className="hover:underline">{site.email}</a>
            </p>
          )}

          <div className="pt-6 border-t border-gray-200 mt-6 flex flex-col sm:flex-row items-center justify-between text-gray-400 text-[11px] gap-2">
            <p>© {new Date().getFullYear()} {site.business_name || site.name}. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
              <a href="#privacidade" className="hover:text-gray-700 underline transition-colors">
                Política de Privacidade
              </a>
              <span className="font-mono opacity-60">ADSPainel</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Public Section Renderer ─────────────────────────────────────────────────

interface SectionRendererProps {
  section: AnySection;
  siteId: string;
  primaryColor: string;
  whatsapp: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  address: string;
  businessName: string;
}

function PublicSectionRenderer({
  section: s,
  siteId,
  primaryColor: primary,
  whatsapp,
  phone,
  email,
  city,
  state,
  address,
  businessName,
}: SectionRendererProps) {
  switch (s.type) {
    case "hero":
      return (
        <section className="py-24 px-6 text-center relative overflow-hidden" style={{ backgroundColor: primary + "12" }}>
          <div className="max-w-4xl mx-auto space-y-6">
            {s.badge && (
              <span
                className="inline-block px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-white shadow-sm"
                style={{ backgroundColor: primary }}
              >
                {String(s.badge)}
              </span>
            )}
            <h1
              className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-gray-900"
              style={{ color: primary }}
            >
              {String(s.title)}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {String(s.subtitle)}
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              {s.cta_label && (
                <a
                  href={String(s.cta_href || "#contato")}
                  className="px-8 py-3.5 rounded-lg text-sm font-bold text-white shadow-md transition-all hover:opacity-95 hover:scale-105"
                  style={{ backgroundColor: primary }}
                >
                  {String(s.cta_label)}
                </a>
              )}
              {whatsapp && (
                <a
                  href={whatsappHref(whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-bold border-2 transition-all hover:opacity-80"
                  style={{ borderColor: "#25d366", color: "#25d366" }}
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </section>
      );

    case "features": {
      const items = (s.items as { icon?: string; title: string; body: string }[]) ?? [];
      return (
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center tracking-tight" style={{ color: primary }}>
            {String(s.title || "Diferenciais")}
          </h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, i) => (
              <div
                key={i}
                className="border-t-4 pt-6 rounded-b-xl bg-gray-50/70 p-6 shadow-sm hover:shadow-md transition-shadow"
                style={{ borderColor: primary }}
              >
                {item.icon && <span className="text-3xl">{item.icon}</span>}
                <h3 className="font-bold text-base mt-3 text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "services": {
      const items = (s.items as { icon?: string; title: string; body: string }[]) ?? [];
      return (
        <section className="py-20 px-6" style={{ backgroundColor: primary + "08" }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-center tracking-tight" style={{ color: primary }}>
              {String(s.title || "Nossos Serviços")}
            </h2>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  {item.icon && <span className="text-3xl">{item.icon}</span>}
                  <h3 className="font-bold text-base mt-4 text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "steps": {
      const items = (s.items as { number: string; title: string; description: string }[]) ?? [];
      return (
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center tracking-tight" style={{ color: primary }}>
            {String(s.title || "Como Funciona")}
          </h2>
          <ol className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {items.map((item, i) => (
              <li key={i} className="border-t-2 pt-6" style={{ borderColor: primary }}>
                <span className="font-mono text-3xl font-bold" style={{ color: primary }}>
                  {item.number}
                </span>
                <h3 className="font-bold text-base mt-3 text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{item.description}</p>
              </li>
            ))}
          </ol>
        </section>
      );
    }

    case "about":
      return (
        <section id="sobre" className="py-20 px-6" style={{ backgroundColor: primary + "06" }}>
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: primary }}>
              {String(s.title || "Sobre Nós")}
            </h2>
            {s.highlight && (
              <p className="font-semibold text-lg sm:text-xl text-gray-800" style={{ color: primary }}>
                {String(s.highlight)}
              </p>
            )}
            <p className="text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
              {String(s.body || "História e missão da empresa.")}
            </p>
          </div>
        </section>
      );

    case "menu_highlight": {
      const items = (s.items as { name: string; description: string; price: string }[]) ?? [];
      return (
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center tracking-tight" style={{ color: primary }}>
            {String(s.title || "Cardápio em Destaque")}
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {items.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                <h3 className="font-bold text-base text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                <p className="font-mono font-bold text-base mt-4" style={{ color: primary }}>{item.price}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "categories":
    case "specialties": {
      const items = (s.items as { name: string; description: string }[]) ?? [];
      return (
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center tracking-tight" style={{ color: primary }}>
            {String(s.title || "Categorias")}
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {items.map((item, i) => (
              <div key={i} className="border-l-4 bg-gray-50 p-6 rounded-r-xl shadow-sm" style={{ borderColor: primary }}>
                <h3 className="font-bold text-base text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600 mt-2">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "faq": {
      const items = (s.items as { question: string; answer: string }[]) ?? [];
      return (
        <section className="py-20 px-6 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center tracking-tight" style={{ color: primary }}>
            {String(s.title || "Dúvidas Frequentes")}
          </h2>
          <div className="mt-10 space-y-4">
            {items.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-6 bg-gray-50/60 shadow-sm">
                <h3 className="font-bold text-base text-gray-900">{item.question}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "contact":
      return (
        <section id="contato" className="py-20 px-6" style={{ backgroundColor: primary + "10" }}>
          <div className="max-w-4xl mx-auto space-y-10 text-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: primary }}>
                {String(s.title || "Fale Conosco")}
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Entre em contato pelos nossos canais ou envie uma mensagem direta abaixo.
              </p>
            </div>

            {/* Quick Contact Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-700">
              {phone && (
                <a href={`tel:${phone.replace(/\D/g, "")}`} className="inline-flex items-center gap-2 hover:underline">
                  <Phone className="h-5 w-5" style={{ color: primary }} />
                  {formatPhone(phone)}
                </a>
              )}
              {whatsapp && (
                <a href={whatsappHref(whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:underline">
                  <MessageCircle className="h-5 w-5" style={{ color: "#25d366" }} />
                  {formatPhone(whatsapp)} (WhatsApp)
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="inline-flex items-center gap-2 hover:underline">
                  <Mail className="h-5 w-5" style={{ color: primary }} />
                  {email}
                </a>
              )}
              {(address || city) && (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-5 w-5" style={{ color: primary }} />
                  {[address, city, state].filter(Boolean).join(", ")}
                </span>
              )}
            </div>

            {/* Interactive Lead Form */}
            <PublicContactForm siteId={siteId} primaryColor={primary} />
          </div>
        </section>
      );

    case "privacy_policy":
    case "privacy": {
      const items = (s.items as { title: string; description: string }[]) ?? [];
      return (
        <section id="privacidade" className="py-20 px-6 border-t border-gray-100 bg-gray-50/60">
          <div className="max-w-4xl mx-auto space-y-8 text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-full mb-1" style={{ backgroundColor: primary + "15" }}>
              <ShieldCheck className="h-7 w-7" style={{ color: primary }} />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                {String(s.title || "Política de Privacidade")}
              </h2>
              {s.subtitle && (
                <p className="text-sm text-gray-500 mt-2 max-w-xl mx-auto leading-relaxed">
                  {String(s.subtitle)}
                </p>
              )}
            </div>

            {s.body && (
              <div className="bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-8 text-sm text-gray-600 leading-relaxed shadow-sm text-left">
                <p>{String(s.body)}</p>
              </div>
            )}

            {items.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {items.map((item, i) => (
                  <div key={i} className="border border-gray-200/80 rounded-xl p-5 bg-white shadow-sm space-y-1.5">
                    <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: primary }} />
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      );
    }

    default:
      return null;
  }
}
