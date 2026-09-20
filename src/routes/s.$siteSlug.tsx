import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import { getPublicSite } from "@/functions/get-public-site";
import { PublicContactForm } from "@/components/public/PublicContactForm";
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Construction,
  ShieldCheck,
  Building2,
  FileText,
  Briefcase,
  TrendingUp,
  Scale,
  Users,
  CheckCircle2,
  Headphones,
  Globe,
  Award,
  Clock,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import type { AnySection } from "@/components/editor/AddSectionModal";
import { getVisualStyle, type VisualStyle } from "@/lib/visual-styles";
import { subdomainFor } from "@/config/app";
import type { CompanyData } from "@/lib/templates/institutional-template";
import { resolveCompanyVariables } from "@/lib/templates/institutional-template";

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
    const content = (site?.content as any) || {};
    const company = (content.company_data as CompanyData) || {};
    const seo = (site?.seo as { title?: string; description?: string }) || {};
    const fbCode = extractMetaVerification(content.facebook_domain_verification || content.meta_tag);

    const companyName = company.name || site?.name || params.siteSlug;
    const activityArea = company.activity_area || site?.category || "Institucional";
    const autoTitle = `${companyName} | ${activityArea}`;
    const autoDesc = company.about_description
      ? company.about_description.slice(0, 160)
      : seo.description || `Site institucional oficial de ${companyName}. Saiba mais sobre nossos serviços e entre em contato.`;

    const title = seo.title || autoTitle;
    const description = seo.description || autoDesc;
    const ogImage = company.logo_url || "/logo.png";
    const canonicalUrl = `https://${subdomainFor(site?.slug || params.siteSlug)}`;

    const metaList: Array<{ title?: string; name?: string; content?: string; property?: string }> = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:image", content: ogImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: ogImage },
    ];

    if (fbCode) {
      metaList.push({
        name: "facebook-domain-verification",
        content: fbCode,
      });
    }

    return {
      meta: metaList,
      links: [{ rel: "canonical", href: canonicalUrl }],
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

function whatsappHref(raw: string | null, customMessage?: string): string {
  if (!raw) return "#";
  const num = raw.replace(/\D/g, "");
  const base = `https://wa.me/55${num}`;
  if (customMessage) {
    return `${base}?text=${encodeURIComponent(customMessage)}`;
  }
  return base;
}

function renderServiceIcon(iconName: string, primaryColor: string) {
  const iconProps = { className: "h-6 w-6", style: { color: primaryColor } };
  switch (iconName) {
    case "FileText": return <FileText {...iconProps} />;
    case "Building": return <Building2 {...iconProps} />;
    case "TrendingUp": return <TrendingUp {...iconProps} />;
    case "ShieldCheck": return <ShieldCheck {...iconProps} />;
    case "Scale": return <Scale {...iconProps} />;
    case "Users": return <Users {...iconProps} />;
    case "CheckCircle2": return <CheckCircle2 {...iconProps} />;
    case "Headphones": return <Headphones {...iconProps} />;
    case "Globe": return <Globe {...iconProps} />;
    case "Award": return <Award {...iconProps} />;
    case "Clock": return <Clock {...iconProps} />;
    case "Briefcase":
    default:
      return <Briefcase {...iconProps} />;
  }
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  const content = (site.content as any) || {};
  const company = (content.company_data as CompanyData) || null;
  const primary = site.primary_color || "#1e3a8a";
  const font = site.font_family || "sans-serif";
  const cnpj = company?.cnpj || content?.cnpj;
  const displayName = company?.name || site.name;
  const displayWhatsapp = company?.whatsapp || site.whatsapp;
  const floatingConfig = company?.floating_whatsapp || {
    enabled: true,
    phone: displayWhatsapp || "",
    message: "Olá! Gostaria de saber mais informações sobre os serviços.",
    label: "Fale Conosco",
  };

  // ── Inject Meta / Facebook BM verification tag into <head> ────────────────
  const fbVerification = extractMetaVerification(
    content.facebook_domain_verification || content.meta_tag
  );

  useEffect(() => {
    if (fbVerification) {
      let metaTag = document.querySelector('meta[name="facebook-domain-verification"]');
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
            {displayName}
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
              {displayName}
            </h1>
            <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
              Estamos preparando nosso novo site oficial. Em breve você terá acesso a todas as novidades!
            </p>
          </div>

          {(displayWhatsapp || site.phone || site.email) && (
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              {displayWhatsapp && (
                <a
                  href={whatsappHref(displayWhatsapp)}
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
          <p>© {new Date().getFullYear()} {site.business_name || displayName}</p>
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

  if (allSections.length === 0 && site) {
    const backupSecs = content?.["sections"];
    if (Array.isArray(backupSecs) && backupSecs.length > 0) {
      allSections.push(...(backupSecs as AnySection[]));
    }
  }

  const theme = getVisualStyle(site?.style);

  // Filter only enabled sections
  const activeSections = allSections.filter((s) => s.enabled !== false);

  // Dynamic Navigation Links based on active sections
  const navLinks = useMemo(() => {
    const links: { href: string; label: string }[] = [];
    const types = new Set(activeSections.map((s) => s.type));
    if (types.has("about")) links.push({ href: "#sobre", label: "Quem Somos" });
    if (types.has("mission")) links.push({ href: "#missao", label: "Missão" });
    if (types.has("features")) links.push({ href: "#diferenciais", label: "Diferenciais" });
    if (types.has("company_services") || types.has("services")) links.push({ href: "#servicos", label: "Serviços" });
    if (types.has("steps")) links.push({ href: "#como-funciona", label: "Como Funciona" });
    if (types.has("menu_highlight")) links.push({ href: "#cardapio", label: "Cardápio" });
    if (types.has("categories") || types.has("specialties")) links.push({ href: "#especialidades", label: "Especialidades" });
    if (types.has("company_info")) links.push({ href: "#informacoes", label: "Empresa" });
    if (types.has("location")) links.push({ href: "#localizacao", label: "Onde Estamos" });
    if (types.has("faq")) links.push({ href: "#faq", label: "Dúvidas" });
    if (types.has("contact")) links.push({ href: "#contato", label: "Contato" });
    return links;
  }, [activeSections]);

  // Schema.org JSON-LD Structured Data
  const schemaOrgData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company?.legal_name || displayName,
    alternateName: company?.fantasy_name || displayName,
    url: `https://${subdomainFor(site.slug)}`,
    logo: company?.logo_url || undefined,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: company?.phone || site.phone || undefined,
      contactType: "customer service",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: company?.address_street
        ? `${company.address_street}, ${company.address_number || ""}`.trim()
        : site.address || undefined,
      addressLocality: company?.address_city || site.city || undefined,
      addressRegion: company?.address_state || site.state || undefined,
      postalCode: company?.address_cep || undefined,
      addressCountry: "BR",
    },
    sameAs: [
      company?.instagram,
      company?.linkedin,
      company?.facebook,
      company?.youtube,
      company?.tiktok,
      company?.website,
    ].filter(Boolean),
  };

  return (
    <div
      className={`min-h-screen flex flex-col relative ${theme.wrapperClass}`}
      style={{ fontFamily: font }}
    >
      {/* Schema.org JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgData) }}
      />

      {/* ── Public Site Header ── */}
      <header
        className={`px-6 py-4 sticky top-0 z-40 ${theme.headerClass}`}
        style={{ borderColor: primary + "25" }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt={displayName}
                className="h-8 max-h-8 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : null}
            <span
              className={`text-xl font-extrabold tracking-tight ${theme.headingClass}`}
              style={{ color: primary }}
            >
              {displayName}
            </span>
          </div>

          {/* Desktop Navigation */}
          {navLinks.length > 0 && (
            <nav
              className={`hidden md:flex items-center gap-8 text-sm font-semibold ${
                theme.isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="hover:opacity-80 transition-opacity">
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-3">
            {displayWhatsapp && (
              <a
                href={whatsappHref(displayWhatsapp, floatingConfig.message)}
                target="_blank"
                rel="noopener noreferrer"
                className={`hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white shadow-sm transition-transform hover:scale-105 ${theme.buttonPrimaryClass}`}
                style={{ backgroundColor: primary }}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            )}

            {/* Mobile Hamburger Toggle Button */}
            {navLinks.length > 0 && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg border border-border md:hidden text-foreground"
                aria-label="Abrir Menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && navLinks.length > 0 && (
          <div className="md:hidden border-t border-border mt-3 pt-3 pb-2 space-y-2 flex flex-col bg-background px-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-sm font-medium border-b border-border/50"
              >
                {link.label}
              </a>
            ))}
            {displayWhatsapp && (
              <a
                href={whatsappHref(displayWhatsapp, floatingConfig.message)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold text-white bg-[#25d366]"
              >
                <MessageCircle className="h-4 w-4" /> Fale no WhatsApp
              </a>
            )}
          </div>
        )}
      </header>

      {/* ── Sections ── */}
      <main className="flex-1">
        {activeSections.map((section, idx) => (
          <PublicSectionRenderer
            key={idx}
            section={section}
            siteId={site.id}
            primaryColor={primary}
            whatsapp={displayWhatsapp || ""}
            phone={company?.phone || site.phone || ""}
            email={company?.email || site.email || ""}
            city={company?.address_city || site.city || ""}
            state={company?.address_state || site.state || ""}
            address={company?.address_street ? `${company.address_street}, ${company.address_number || ""}` : site.address || ""}
            businessName={company?.legal_name || site.business_name || displayName}
            theme={theme}
            companyData={company}
          />
        ))}

        {!activeSections.some((s) => s.type === "privacy_policy" || s.type === "privacy") && (
          <PublicSectionRenderer
            section={{
              type: "privacy_policy",
              title: "Política de Privacidade e Termos",
              subtitle: "Seus dados estão protegidos em total conformidade com a LGPD (Lei nº 13.709/2018).",
              body: company?.privacy?.policy_text || `A ${displayName} preza pela segurança, confidencialidade e transparência no tratamento dos dados pessoais de seus clientes e usuários, em total conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).`,
              items: [
                { title: "Coleta e Finalidade", description: "Utilizamos informações de contato exclusivamente para responder suas dúvidas e orçamentos." },
                { title: "Segurança das Informações", description: "Seus dados são protegidos com padrões rígidos e nunca comercializados com terceiros." },
                { title: "Direitos do Titular (LGPD)", description: "Você pode solicitar confirmação, correção ou exclusão dos seus dados a qualquer momento." },
              ],
            }}
            siteId={site.id}
            primaryColor={primary}
            whatsapp={displayWhatsapp || ""}
            phone={company?.phone || site.phone || ""}
            email={company?.email || site.email || ""}
            city={company?.address_city || site.city || ""}
            state={company?.address_state || site.state || ""}
            address={site.address || ""}
            businessName={company?.legal_name || site.business_name || displayName}
            theme={theme}
            companyData={company}
          />
        )}
      </main>

      {/* Floating WhatsApp Button */}
      {floatingConfig.enabled !== false && displayWhatsapp && (
        <aside className="fixed bottom-6 right-6 z-50">
          <a
            href={whatsappHref(floatingConfig.phone || displayWhatsapp, floatingConfig.message)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#25d366] text-white font-bold text-xs shadow-2xl hover:scale-105 transition-transform group"
            title="Fale conosco no WhatsApp"
          >
            <MessageCircle className="h-5 w-5 fill-current animate-pulse" />
            <span className="hidden sm:inline">
              {floatingConfig.label || "Fale Conosco"}
            </span>
          </a>
        </aside>
      )}

      {/* ── Public Site Footer ── */}
      <footer
        className={`py-12 px-6 text-center text-xs ${theme.footerClass}`}
        style={{ borderColor: primary + "25" }}
      >
        <div className="max-w-5xl mx-auto space-y-2">
          <p className={`font-bold text-sm ${theme.isDark ? "text-gray-200" : "text-gray-800"}`}>
            {company?.legal_name || site.business_name || displayName}
          </p>

          {(company?.address_city || site.city || site.state) && (
            <p>
              {[company?.address_street, company?.address_city || site.city, company?.address_state || site.state]
                .filter(Boolean)
                .join(" — ")}
            </p>
          )}

          {cnpj && (
            <p className="font-mono text-[11px] font-semibold opacity-80">
              CNPJ: {cnpj}
            </p>
          )}

          {(company?.email || site.email) && (
            <p>
              <a href={`mailto:${company?.email || site.email}`} className="hover:underline">
                {company?.email || site.email}
              </a>
            </p>
          )}

          <div className="pt-6 border-t border-current/10 mt-6 flex flex-col sm:flex-row items-center justify-between opacity-70 text-[11px] gap-2">
            <p>© {new Date().getFullYear()} {company?.legal_name || site.business_name || displayName}. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
              <a href="#privacidade" className="hover:underline transition-colors">
                Política de Privacidade & Termos
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
  theme: VisualStyle;
  companyData?: CompanyData | null;
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
  theme,
  companyData,
}: SectionRendererProps) {
  function t(text: string | unknown) {
    if (typeof text !== "string") return "";
    return companyData ? resolveCompanyVariables(text, companyData) : text;
  }

  switch (s.type) {
    // ── HERO ──
    case "hero":
      return (
        <section
          className={`py-24 px-6 text-center ${theme.heroBgClass}`}
          style={{ backgroundColor: theme.isDark ? undefined : primary + "12" }}
        >
          <div className="max-w-4xl mx-auto space-y-6">
            {s.badge && (
              <span
                className={`inline-block px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-sm ${theme.badgeRadius}`}
                style={{ backgroundColor: primary }}
              >
                {t(s.badge)}
              </span>
            )}
            <h1
              className={`text-4xl sm:text-6xl ${theme.headingClass} leading-tight font-extrabold`}
              style={{ color: primary }}
            >
              {t(s.title || businessName)}
            </h1>
            <p className={`text-lg sm:text-xl ${theme.subheadingClass} max-w-2xl mx-auto leading-relaxed`}>
              {t(s.subtitle || "Soluções completas com qualidade, credibilidade e transparência.")}
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              {s.cta_label && (
                <a
                  href={String(s.cta_href || "#contato")}
                  className={`px-8 py-3.5 text-sm font-bold text-white shadow-sm ${theme.buttonPrimaryClass}`}
                  style={{ backgroundColor: primary }}
                >
                  {t(s.cta_label)}
                </a>
              )}
              {s.secondary_cta_label && (
                <a
                  href={String(s.secondary_cta_href || "#servicos")}
                  className={`px-8 py-3.5 text-sm font-bold border transition-colors ${theme.buttonSecondaryClass}`}
                  style={{ borderColor: primary, color: primary }}
                >
                  {t(s.secondary_cta_label)}
                </a>
              )}
              {whatsapp && !s.cta_label && (
                <a
                  href={whatsappHref(whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-8 py-3.5 text-sm ${theme.buttonSecondaryClass}`}
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

    // ── MISSION ──
    case "mission": {
      const pillars = (s.pillars as { title: string; description: string }[]) || [];
      return (
        <section id="missao" className={`py-20 px-6 ${theme.accentSectionBgClass}`}>
          <div className="max-w-5xl mx-auto space-y-10 text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-full mb-1" style={{ backgroundColor: primary + "15" }}>
              <ShieldCheck className="h-8 w-8" style={{ color: primary }} />
            </div>
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>
                Propósito Institucional
              </p>
              <h2 className={`text-3xl sm:text-4xl mt-2 font-extrabold ${theme.headingClass}`} style={{ color: primary }}>
                {t(s.title || "Nossa Missão")}
              </h2>
              <p className={`mt-4 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto ${theme.isDark ? "text-gray-300" : "text-gray-700"}`}>
                {t(s.description)}
              </p>
            </div>

            {pillars.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-left">
                {pillars.map((pillar, i) => (
                  <div key={i} className={`p-6 rounded-xl border ${theme.cardClass}`} style={{ borderTopWidth: "4px", borderTopColor: primary }}>
                    <h3 className={`font-bold text-base ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{pillar.title}</h3>
                    <p className={`text-sm mt-2 leading-relaxed ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{pillar.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      );
    }

    // ── ABOUT / QUEM SOMOS ──
    case "about":
      return (
        <section id="sobre" className={`py-20 px-6 ${theme.altSectionBgClass}`}>
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>
              Institucional
            </p>
            <h2 className={`text-3xl sm:text-4xl font-extrabold ${theme.headingClass}`} style={{ color: primary }}>
              {t(s.title || "Quem Somos")}
            </h2>
            {(s.foundation_year || s.activity_area) && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold" style={{ borderColor: primary + "40", color: primary }}>
                {s.foundation_year && <span>Fundada em {String(s.foundation_year)}</span>}
                {s.foundation_year && s.activity_area && <span>•</span>}
                {s.activity_area && <span>{String(s.activity_area)}</span>}
              </div>
            )}
            {s.highlight && (
              <p className="font-semibold text-lg sm:text-xl" style={{ color: primary }}>
                {t(s.highlight)}
              </p>
            )}
            <p className={`text-base leading-relaxed max-w-2xl mx-auto ${theme.isDark ? "text-gray-300" : "text-gray-600"}`}>
              {t(s.body || "História e trajetória corporativa.")}
            </p>
          </div>
        </section>
      );

    // ── COMPANY SERVICES / SERVIÇOS DINÂMICOS ──
    case "company_services": {
      const items = (s.items as any[]) || [];
      const activeServices = items.filter((item) => item.status !== "inactive");
      return (
        <section id="servicos" className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center space-y-3">
            <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>
              Soluções Especializadas
            </p>
            <h2 className={`text-3xl sm:text-4xl font-extrabold ${theme.headingClass}`} style={{ color: primary }}>
              {t(s.title || "Nossos Serviços")}
            </h2>
            {s.subtitle && (
              <p className={`text-sm max-w-md mx-auto ${theme.subheadingClass}`}>{t(s.subtitle)}</p>
            )}
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeServices.map((srv, i) => (
              <div
                key={srv.id || i}
                className={`p-6 rounded-2xl border flex flex-col justify-between transition-all hover:shadow-lg ${theme.cardClass}`}
                style={{ borderTopWidth: "4px", borderTopColor: primary }}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      {renderServiceIcon(srv.icon, primary)}
                    </div>
                    {srv.category && (
                      <span className="font-mono text-[10px] px-2.5 py-0.5 rounded bg-muted text-muted-foreground uppercase font-bold">
                        {srv.category}
                      </span>
                    )}
                  </div>
                  <h3 className={`font-bold text-base tracking-tight ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>
                    {srv.name}
                  </h3>
                  <p className={`text-xs mt-2 leading-relaxed ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {srv.description}
                  </p>
                </div>
                {srv.link && (
                  <a
                    href={srv.link}
                    className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
                    style={{ color: primary }}
                  >
                    Saiba mais <ChevronRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    }

    // ── COMPANY INFO / FICHA CADASTRAL ──
    case "company_info":
      return (
        <section id="informacoes" className={`py-20 px-6 ${theme.altSectionBgClass}`}>
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>
                Transparência Corporativa
              </p>
              <h2 className={`text-3xl sm:text-4xl font-extrabold ${theme.headingClass}`} style={{ color: primary }}>
                {t(s.title || "Informações da Empresa")}
              </h2>
              <p className={`text-sm max-w-lg mx-auto ${theme.subheadingClass}`}>
                {t(s.subtitle || "Ficha cadastral e registros institucionais.")}
              </p>
            </div>

            <div className={`p-8 rounded-2xl border shadow-sm ${theme.cardClass}`}>
              <div className="flex items-center gap-4 pb-6 border-b border-border">
                <Building2 className="h-8 w-8" style={{ color: primary }} />
                <div>
                  <h3 className="font-bold text-lg">{s.fantasy_name || businessName}</h3>
                  <p className="text-xs text-muted-foreground">{s.legal_name || businessName}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 text-sm">
                <div>
                  <p className="font-mono text-[11px] text-muted-foreground uppercase">CNPJ</p>
                  <p className="font-mono font-bold mt-1 text-base">{s.cnpj || "00.000.000/0001-00"}</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] text-muted-foreground uppercase">Data de Abertura</p>
                  <p className="font-semibold mt-1">{s.opening_date || "—"}</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] text-muted-foreground uppercase">Situação Cadastral</p>
                  <span className="inline-block mt-1 font-semibold px-2.5 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-600 font-mono">
                    {s.registration_status || "Ativa"}
                  </span>
                </div>
                <div>
                  <p className="font-mono text-[11px] text-muted-foreground uppercase">Porte</p>
                  <p className="font-semibold mt-1">{s.company_size || "Demais"}</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] text-muted-foreground uppercase">Tipo</p>
                  <p className="font-semibold mt-1">{s.company_type || "Matriz"}</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] text-muted-foreground uppercase">Capital Social</p>
                  <p className="font-semibold mt-1">{s.share_capital || "—"}</p>
                </div>
                <div className="sm:col-span-2 lg:col-span-3 pt-3 border-t border-border">
                  <p className="font-mono text-[11px] text-muted-foreground uppercase">Natureza Jurídica</p>
                  <p className="font-semibold mt-1">{s.legal_nature || "206-2 - Sociedade Empresária Limitada"}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      );

    // ── LOCATION / ONDE ESTAMOS ──
    case "location": {
      const fullAddress = [
        s.address_street,
        s.address_number,
        s.address_complement,
        s.address_neighborhood,
        s.address_city,
        s.address_state,
        s.address_cep,
      ]
        .filter(Boolean)
        .join(", ");

      const mapQuery = encodeURIComponent(
        [s.address_street, s.address_number, s.address_city, s.address_state].filter(Boolean).join(" ") || "São Paulo SP"
      );

      return (
        <section id="localizacao" className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center space-y-3 mb-10">
            <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>
              Nossa Sede
            </p>
            <h2 className={`text-3xl sm:text-4xl font-extrabold ${theme.headingClass}`} style={{ color: primary }}>
              {t(s.title || "Onde Estamos")}
            </h2>
            <p className={`text-sm max-w-md mx-auto ${theme.subheadingClass}`}>
              {t(s.subtitle || "Venha tomar um café conosco ou agende um atendimento presencial.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            <div className={`p-8 rounded-2xl border flex flex-col justify-center space-y-5 ${theme.cardClass}`}>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <MapPin className="h-6 w-6" style={{ color: primary }} />
                </div>
                <h3 className="font-bold text-base">Endereço Completo</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {fullAddress || "Endereço corporativo cadastrado."}
              </p>
              {s.address_cep && (
                <p className="font-mono text-xs text-muted-foreground">
                  CEP: {s.address_cep}
                </p>
              )}
            </div>

            {s.show_map !== false && (
              <div className="md:col-span-2 rounded-2xl overflow-hidden border border-border h-80 shadow-md">
                <iframe
                  title="Mapa de Localização da Empresa"
                  width="100%"
                  height="100%"
                  loading="lazy"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                />
              </div>
            )}
          </div>
        </section>
      );
    }

    // ── CONTACT ──
    case "contact": {
      const displayWpp = s.whatsapp || whatsapp;
      const displayPhone = s.phone || phone;
      const displayEmail = s.email || email;

      return (
        <section id="contato" className={`py-20 px-6 ${theme.altSectionBgClass}`}>
          <div className="max-w-4xl mx-auto space-y-10 text-center">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>
                Canais de Atendimento
              </p>
              <h2 className={`text-3xl sm:text-4xl font-extrabold mt-1 ${theme.headingClass}`} style={{ color: primary }}>
                {t(s.title || "Fale Conosco")}
              </h2>
              <p className={`text-sm mt-2 ${theme.subheadingClass}`}>
                {t(s.subtitle || "Entre em contato pelos nossos canais ou envie uma mensagem direta abaixo.")}
              </p>
            </div>

            {/* Quick Contact Links */}
            <div className={`flex flex-wrap justify-center gap-6 text-sm font-medium ${theme.isDark ? "text-gray-300" : "text-gray-700"}`}>
              {displayPhone && (
                <a href={`tel:${displayPhone.replace(/\D/g, "")}`} className="inline-flex items-center gap-2 hover:underline">
                  <Phone className="h-5 w-5" style={{ color: primary }} />
                  {formatPhone(displayPhone)}
                </a>
              )}
              {displayWpp && (
                <a
                  href={whatsappHref(displayWpp, "Olá! Gostaria de saber mais informações sobre os serviços.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:underline"
                >
                  <MessageCircle className="h-5 w-5" style={{ color: "#25d366" }} />
                  {formatPhone(displayWpp)} (WhatsApp)
                </a>
              )}
              {displayEmail && (
                <a href={`mailto:${displayEmail}`} className="inline-flex items-center gap-2 hover:underline">
                  <Mail className="h-5 w-5" style={{ color: primary }} />
                  {displayEmail}
                </a>
              )}
              {(address || city) && (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-5 w-5" style={{ color: primary }} />
                  {[address, city, state].filter(Boolean).join(", ")}
                </span>
              )}
            </div>

            {/* Social Networks (Only rendered when filled) */}
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {s.instagram && (
                <a href={s.instagram} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full border border-border bg-card hover:text-primary transition-colors" title="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {s.linkedin && (
                <a href={s.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full border border-border bg-card hover:text-primary transition-colors" title="LinkedIn">
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {s.facebook && (
                <a href={s.facebook} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full border border-border bg-card hover:text-primary transition-colors" title="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {s.youtube && (
                <a href={s.youtube} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full border border-border bg-card hover:text-primary transition-colors" title="YouTube">
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              {s.website && (
                <a href={s.website} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full border border-border bg-card hover:text-primary transition-colors" title="Website">
                  <Globe className="h-5 w-5" />
                </a>
              )}
            </div>

            {displayWpp && (
              <div>
                <a
                  href={whatsappHref(displayWpp, "Olá! Gostaria de saber mais informações sobre os serviços.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-8 py-4 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 ${theme.buttonPrimaryClass}`}
                  style={{ backgroundColor: primary }}
                >
                  <MessageCircle className="h-5 w-5" />
                  Fale Conosco no WhatsApp
                </a>
              </div>
            )}

            {/* Interactive Lead Form */}
            <div className="pt-4">
              <PublicContactForm siteId={siteId} primaryColor={primary} />
            </div>
          </div>
        </section>
      );
    }

    // ── PRIVACY POLICY ──
    case "privacy_policy":
    case "privacy": {
      const items = (s.items as { title: string; description: string }[]) ?? [];
      return (
        <section id="privacidade" className={`py-20 px-6 ${theme.privacySectionBgClass}`}>
          <div className="max-w-4xl mx-auto space-y-8 text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-full mb-1" style={{ backgroundColor: primary + "15" }}>
              <ShieldCheck className="h-7 w-7" style={{ color: primary }} />
            </div>
            <div>
              <h2 className={`text-3xl sm:text-4xl font-extrabold ${theme.headingClass}`} style={{ color: primary }}>
                {t(s.title || "Política de Privacidade")}
              </h2>
              {s.subtitle && (
                <p className={`text-sm mt-2 max-w-xl mx-auto leading-relaxed ${theme.subheadingClass}`}>
                  {t(s.subtitle)}
                </p>
              )}
            </div>

            {s.body && (
              <div className={`p-6 sm:p-8 text-sm leading-relaxed text-left ${theme.cardClass}`}>
                <p>{t(s.body)}</p>
              </div>
            )}

            {s.terms_text && (
              <div className={`p-6 sm:p-8 text-sm leading-relaxed text-left ${theme.cardClass}`}>
                <h3 className="font-bold text-sm mb-2">Termos de Uso</h3>
                <p>{t(s.terms_text)}</p>
              </div>
            )}

            {items.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {items.map((item, i) => (
                  <div key={i} className={`p-5 space-y-1.5 ${theme.cardClass}`}>
                    <h3 className={`font-bold text-sm flex items-center gap-2 ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: primary }} />
                      {item.title}
                    </h3>
                    <p className={`text-xs leading-relaxed ${theme.isDark ? "text-gray-400" : "text-gray-500"}`}>{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      );
    }

    // Default existing sections
    case "features": {
      const items = (s.items as { icon?: string; title: string; body: string }[]) ?? [];
      return (
        <section id="diferenciais" className="py-20 px-6 max-w-6xl mx-auto">
          <h2 className={`text-3xl sm:text-4xl text-center font-extrabold ${theme.headingClass}`} style={{ color: primary }}>
            {t(s.title || "Diferenciais")}
          </h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, i) => (
              <div key={i} className={`p-6 ${theme.cardClass}`} style={{ borderTopWidth: "4px", borderTopColor: primary }}>
                {item.icon && <span className="text-3xl">{item.icon}</span>}
                <h3 className={`font-bold text-base mt-3 ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{t(item.title)}</h3>
                <p className={`text-sm mt-2 leading-relaxed ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{t(item.body)}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "services": {
      const items = (s.items as { icon?: string; title: string; body: string }[]) ?? [];
      return (
        <section id="servicos" className={`py-20 px-6 ${theme.altSectionBgClass}`}>
          <div className="max-w-6xl mx-auto">
            <h2 className={`text-3xl sm:text-4xl text-center font-extrabold ${theme.headingClass}`} style={{ color: primary }}>
              {t(s.title || "Nossos Serviços")}
            </h2>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item, i) => (
                <div key={i} className={`p-6 ${theme.cardClass}`}>
                  {item.icon && <span className="text-3xl">{item.icon}</span>}
                  <h3 className={`font-bold text-base mt-4 ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{t(item.title)}</h3>
                  <p className={`text-sm mt-2 leading-relaxed ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{t(item.body)}</p>
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
        <section id="como-funciona" className="py-20 px-6 max-w-5xl mx-auto">
          <h2 className={`text-3xl sm:text-4xl text-center font-extrabold ${theme.headingClass}`} style={{ color: primary }}>
            {t(s.title || "Como Funciona")}
          </h2>
          <ol className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, i) => (
              <li key={i} className={`p-6 ${theme.cardClass} flex flex-col justify-between`}>
                <span className={`font-mono text-2xl font-extrabold ${theme.stepNumberClass}`} style={{ color: primary }}>
                  {item.number}
                </span>
                <h3 className={`font-bold text-base mt-3 ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{t(item.title)}</h3>
                <p className={`text-sm mt-2 leading-relaxed ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{t(item.description)}</p>
              </li>
            ))}
          </ol>
        </section>
      );
    }

    case "menu_highlight": {
      const items = (s.items as { name: string; description: string; price: string }[]) ?? [];
      return (
        <section id="cardapio" className="py-20 px-6 max-w-6xl mx-auto">
          <h2 className={`text-3xl sm:text-4xl text-center font-extrabold ${theme.headingClass}`} style={{ color: primary }}>
            {t(s.title || "Cardápio em Destaque")}
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {items.map((item, i) => (
              <div key={i} className={`p-6 ${theme.cardClass}`}>
                <h3 className={`font-bold text-base ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{t(item.name)}</h3>
                <p className={`text-sm mt-2 ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{t(item.description)}</p>
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
        <section id="especialidades" className="py-20 px-6 max-w-6xl mx-auto">
          <h2 className={`text-3xl sm:text-4xl text-center font-extrabold ${theme.headingClass}`} style={{ color: primary }}>
            {t(s.title || "Especialidades")}
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {items.map((item, i) => (
              <div key={i} className={`p-6 ${theme.cardClass} ${theme.cardBorderHighlight}`} style={{ borderLeftColor: primary }}>
                <h3 className={`font-bold text-base ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{t(item.name)}</h3>
                <p className={`text-sm mt-2 ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{t(item.description)}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "faq": {
      const items = (s.items as { question: string; answer: string }[]) ?? [];
      return (
        <section id="faq" className="py-20 px-6 max-w-3xl mx-auto">
          <h2 className={`text-3xl sm:text-4xl text-center font-extrabold ${theme.headingClass}`} style={{ color: primary }}>
            {t(s.title || "Dúvidas Frequentes")}
          </h2>
          <div className="mt-10 space-y-4">
            {items.map((item, i) => (
              <div key={i} className={`p-6 ${theme.cardClass}`}>
                <h3 className={`font-bold text-base ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{t(item.question)}</h3>
                <p className={`text-sm mt-2 leading-relaxed ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{t(item.answer)}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    default:
      return null;
  }
}
