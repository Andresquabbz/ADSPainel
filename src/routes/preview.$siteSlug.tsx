import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  ArrowLeft,
  ExternalLink,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { subdomainFor } from "@/config/app";
import { getVisualStyle, type VisualStyle } from "@/lib/visual-styles";

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

export const Route = createFileRoute("/preview/$siteSlug")({
  component: PreviewPage,
});

// ─── Types ───────────────────────────────────────────────────────────────────

interface SiteData {
  id: string;
  name: string;
  slug: string;
  business_name: string;
  category: string | null;
  goal: string | null;
  style: string | null;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  description: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  instagram: string | null;
  facebook: string | null;
  status: string;
  content: { cnpj?: string | null; generated?: boolean } | null;
}

interface SitePage {
  id: string;
  title: string;
  path: string;
  sections: unknown;
  position: number;
}

interface AnySection {
  type: string;
  badge?: any;
  title?: any;
  subtitle?: any;
  cta_label?: any;
  cta_href?: any;
  highlight?: any;
  body?: any;
  description?: any;
  name?: any;
  role?: any;
  avatar?: any;
  image?: any;
  items?: any;
  [key: string]: any;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPhone(raw: unknown): string {
  if (!raw) return "";
  const str = String(raw);
  const d = str.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return str;
}

function whatsappHref(raw: unknown): string {
  if (!raw) return "#";
  const str = String(raw);
  return `https://wa.me/55${str.replace(/\D/g, "")}`;
}

// ─── Section renderers ────────────────────────────────────────────────────────

function SectionHero({ s, site, theme }: { s: AnySection; site: SiteData; theme: VisualStyle }) {
  const primary = site.primary_color;
  const font = site.font_family;
  return (
    <section className={`relative overflow-hidden py-28 text-center ${theme.heroBgClass}`} style={{ backgroundColor: theme.isDark ? undefined : primary + "14" }}>
      <div className="mx-auto max-w-4xl px-6">
        {s.badge && (
          <span className={`mb-4 inline-block px-4 py-1 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-sm ${theme.badgeRadius}`}
            style={{ backgroundColor: primary }}>
            {String(s.badge)}
          </span>
        )}
        <h1 className={`mt-4 text-5xl font-extrabold leading-tight tracking-tight md:text-6xl ${theme.headingClass}`}
          style={{ fontFamily: font, color: primary }}>
          {String(s.title ?? "")}
        </h1>
        <p className={`mx-auto mt-6 max-w-2xl text-lg ${theme.subheadingClass}`}>{String(s.subtitle ?? "")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {s.cta_label && (
            <a href={String(s.cta_href ?? "#contato")}
              className={`inline-block px-8 py-3.5 text-sm text-white ${theme.buttonPrimaryClass}`}
              style={{ backgroundColor: primary }}>
              {String(s.cta_label)}
            </a>
          )}
          {site.whatsapp && (
            <a href={whatsappHref(site.whatsapp)} target="_blank" rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-8 py-3.5 text-sm ${theme.buttonSecondaryClass}`}
              style={{ borderColor: "#25d366", color: "#25d366" }}>
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function SectionFeatures({ s, site, theme }: { s: AnySection; site: SiteData; theme: VisualStyle }) {
  const items = (s.items as { icon?: string; title: string; body: string }[]) ?? [];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: site.primary_color }}>
          Diferenciais
        </p>
        <h2 className={`mt-3 text-3xl font-extrabold tracking-tight ${theme.headingClass}`}>{String(s.title ?? "")}</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <div key={i} className={`p-6 ${theme.cardClass}`} style={{ borderTopWidth: "4px", borderTopColor: site.primary_color }}>
              {item.icon && <span className="text-2xl">{item.icon}</span>}
              <h3 className={`mt-2 font-bold tracking-tight ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{item.title}</h3>
              <p className={`mt-2 text-sm leading-relaxed ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionServices({ s, site, theme }: { s: AnySection; site: SiteData; theme: VisualStyle }) {
  const items = (s.items as { icon?: string; title: string; body: string }[]) ?? [];
  return (
    <section className={`py-24 ${theme.altSectionBgClass}`}>
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: site.primary_color }}>
          Serviços
        </p>
        <h2 className={`mt-3 text-3xl font-extrabold tracking-tight ${theme.headingClass}`}>{String(s.title ?? "")}</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <div key={i} className={`p-7 ${theme.cardClass}`}>
              {item.icon && <span className="text-3xl">{item.icon}</span>}
              <h3 className={`mt-4 font-bold tracking-tight ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{item.title}</h3>
              <p className={`mt-2 text-sm leading-relaxed ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionSteps({ s, site, theme }: { s: AnySection; site: SiteData; theme: VisualStyle }) {
  const items = (s.items as { number: string; title: string; description: string }[]) ?? [];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: site.primary_color }}>
          Como funciona
        </p>
        <h2 className={`mt-3 text-3xl font-extrabold tracking-tight ${theme.headingClass}`}>{String(s.title ?? "")}</h2>
        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <li key={i} className={`border-t-2 pt-5`} style={{ borderColor: site.primary_color }}>
              <span className="font-mono text-3xl font-bold" style={{ color: site.primary_color }}>
                {item.number}
              </span>
              <h3 className={`mt-3 font-bold tracking-tight ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{item.title}</h3>
              <p className={`mt-2 text-sm leading-relaxed ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{item.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function SectionAbout({ s, site, theme }: { s: AnySection; site: SiteData; theme: VisualStyle }) {
  return (
    <section id="sobre" className={`py-24 ${theme.accentSectionBgClass}`}>
      <div className="mx-auto max-w-5xl px-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: site.primary_color }}>
          Sobre nós
        </p>
        <h2 className={`mt-3 max-w-2xl text-3xl font-extrabold tracking-tight ${theme.headingClass}`}>{String(s.title ?? "")}</h2>
        {s.highlight && (
          <p className="mt-4 text-lg font-semibold" style={{ color: site.primary_color }}>
            {String(s.highlight)}
          </p>
        )}
        <p className={`mt-4 max-w-2xl leading-relaxed ${theme.isDark ? "text-gray-300" : "text-gray-600"}`}>{String(s.body ?? "")}</p>
      </div>
    </section>
  );
}

function SectionMenuHighlight({ s, site, theme }: { s: AnySection; site: SiteData; theme: VisualStyle }) {
  const items = (s.items as { name: string; description: string; price: string }[]) ?? [];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: site.primary_color }}>
          Cardápio
        </p>
        <h2 className={`mt-3 text-3xl font-extrabold tracking-tight ${theme.headingClass}`}>{String(s.title ?? "")}</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {items.map((item, i) => (
            <div key={i} className={`p-6 ${theme.cardClass}`}>
              <h3 className={`font-bold tracking-tight ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{item.name}</h3>
              <p className={`mt-2 text-sm ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{item.description}</p>
              <p className="mt-4 font-mono font-bold" style={{ color: site.primary_color }}>{item.price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionCategories({ s, site, theme }: { s: AnySection; site: SiteData; theme: VisualStyle }) {
  const items = (s.items as { name: string; description: string }[]) ?? [];
  return (
    <section className={`py-24 ${theme.altSectionBgClass}`}>
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: site.primary_color }}>
          Categorias
        </p>
        <h2 className={`mt-3 text-3xl font-extrabold tracking-tight ${theme.headingClass}`}>{String(s.title ?? "")}</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {items.map((item, i) => (
            <div key={i} className={`p-6 ${theme.cardClass} ${theme.cardBorderHighlight}`} style={{ borderLeftColor: site.primary_color }}>
              <h3 className={`font-bold ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{item.name}</h3>
              <p className={`mt-1 text-sm ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionSpecialties({ s, site, theme }: { s: AnySection; site: SiteData; theme: VisualStyle }) {
  const items = (s.items as { name: string; description: string }[]) ?? [];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: site.primary_color }}>
          Especialidades
        </p>
        <h2 className={`mt-3 text-3xl font-extrabold tracking-tight ${theme.headingClass}`}>{String(s.title ?? "")}</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {items.map((item, i) => (
            <div key={i} className={`p-6 ${theme.cardClass} ${theme.cardBorderHighlight}`} style={{ borderLeftColor: site.primary_color }}>
              <h3 className={`font-bold ${theme.isDark ? "text-gray-100" : "text-gray-900"}`} style={{ color: site.primary_color }}>{item.name}</h3>
              <p className={`mt-2 text-sm ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionContact({ s, site, theme }: { s: AnySection; site: SiteData; theme: VisualStyle }) {
  const hasCta = site.phone || site.whatsapp || site.email;
  return (
    <section id="contato" className={`py-24 ${theme.altSectionBgClass}`}>
      <div className="mx-auto max-w-5xl px-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: site.primary_color }}>
          Contato
        </p>
        <h2 className={`mt-3 text-3xl font-extrabold tracking-tight ${theme.headingClass}`}>{String(s.title ?? "Entre em contato")}</h2>
        <div className="mt-10 flex flex-col gap-5">
          {site.phone && (
            <a href={`tel:${site.phone.replace(/\D/g, "")}`}
              className={`inline-flex items-center gap-3 text-sm font-medium hover:underline ${theme.isDark ? "text-gray-300" : "text-gray-700"}`}>
              <Phone className="h-5 w-5" style={{ color: site.primary_color }} />
              {formatPhone(site.phone)}
            </a>
          )}
          {site.whatsapp && (
            <a href={whatsappHref(site.whatsapp)} target="_blank" rel="noopener noreferrer"
              className={`inline-flex items-center gap-3 text-sm font-medium hover:underline ${theme.isDark ? "text-gray-300" : "text-gray-700"}`}>
              <MessageCircle className="h-5 w-5" style={{ color: "#25d366" }} />
              {formatPhone(site.whatsapp)} — WhatsApp
            </a>
          )}
          {site.email && (
            <a href={`mailto:${site.email}`}
              className={`inline-flex items-center gap-3 text-sm font-medium hover:underline ${theme.isDark ? "text-gray-300" : "text-gray-700"}`}>
              <Mail className="h-5 w-5" style={{ color: site.primary_color }} />
              {site.email}
            </a>
          )}
          {(site.address || site.city) && (
            <span className={`inline-flex items-center gap-3 text-sm ${theme.isDark ? "text-gray-300" : "text-gray-700"}`}>
              <MapPin className="h-5 w-5" style={{ color: site.primary_color }} />
              {[site.address, site.city, site.state].filter(Boolean).join(", ")}
            </span>
          )}
          {!hasCta && (
            <p className="text-sm text-gray-400 italic">Dados de contato não informados.</p>
          )}
        </div>
        {site.whatsapp && (
          <a href={whatsappHref(site.whatsapp)} target="_blank" rel="noopener noreferrer"
            className={`mt-8 inline-flex items-center gap-2 px-8 py-4 text-sm text-white ${theme.buttonPrimaryClass}`}
            style={{ backgroundColor: site.primary_color }}>
            <MessageCircle className="h-4 w-4" />
            {String(s.title ?? "Fale conosco")}
          </a>
        )}
      </div>
    </section>
  );
}

function SectionPrivacyPolicy({ s, site, theme }: { s: AnySection; site: SiteData; theme: VisualStyle }) {
  const items = (s.items as { title: string; description: string }[]) ?? [];
  return (
    <section id="privacidade" className={`py-20 ${theme.privacySectionBgClass}`}>
      <div className="mx-auto max-w-4xl px-6 space-y-8 text-center">
        <div className="inline-flex items-center justify-center p-3 rounded-full mb-1" style={{ backgroundColor: site.primary_color + "15" }}>
          <ShieldCheck className="h-7 w-7" style={{ color: site.primary_color }} />
        </div>
        <div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${theme.headingClass}`}>
            {String(s.title || "Política de Privacidade")}
          </h2>
          {s.subtitle && (
            <p className={`text-sm mt-2 max-w-xl mx-auto leading-relaxed ${theme.subheadingClass}`}>
              {String(s.subtitle)}
            </p>
          )}
        </div>

        {s.body && (
          <div className={`p-6 sm:p-8 text-sm leading-relaxed text-left ${theme.cardClass}`}>
            <p>{String(s.body)}</p>
          </div>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {items.map((item, i) => (
              <div key={i} className={`p-5 space-y-1.5 ${theme.cardClass}`}>
                <h3 className={`font-bold text-sm flex items-center gap-2 ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: site.primary_color }} />
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

function renderSection(block: AnySection, site: SiteData, idx: number, theme: VisualStyle) {
  const props = { s: block, site, theme };
  switch (block.type) {
    case "hero":            return <SectionHero key={idx} {...props} />;
    case "features":        return <SectionFeatures key={idx} {...props} />;
    case "services":        return <SectionServices key={idx} {...props} />;
    case "steps":           return <SectionSteps key={idx} {...props} />;
    case "about":           return <SectionAbout key={idx} {...props} />;
    case "menu_highlight":  return <SectionMenuHighlight key={idx} {...props} />;
    case "categories":      return <SectionCategories key={idx} {...props} />;
    case "specialties":     return <SectionSpecialties key={idx} {...props} />;
    case "contact":         return <SectionContact key={idx} {...props} />;
    case "privacy_policy":
    case "privacy":         return <SectionPrivacyPolicy key={idx} {...props} />;
    default:
      return (
        <div key={idx} className="mx-auto max-w-4xl px-6 py-10">
          <div className="border border-dashed p-8 text-center text-xs text-gray-400">
            Seção: <code>{block.type}</code>
          </div>
        </div>
      );
  }
}

// ─── Main page ────────────────────────────────────────────────────────────────

function PreviewPage() {
  const { siteSlug } = Route.useParams();

  const { data: site, isLoading, error } = useQuery({
    queryKey: ["preview-site", siteSlug],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("sites")
          .select("*")
          .eq("slug", siteSlug)
          .maybeSingle();
        if (error) {
          console.error("Preview site error:", error);
          return null;
        }
        return data as SiteData | null;
      } catch (err) {
        console.error("Preview site exception:", err);
        return null;
      }
    },
  });

  const { data: pages } = useQuery({
    queryKey: ["preview-pages", site?.id],
    enabled: !!site?.id,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("site_pages")
          .select("id, title, path, sections, position")
          .eq("site_id", site!.id)
          .order("position");
        if (error) {
          console.error("Preview pages error:", error);
          return [];
        }
        return (data ?? []) as SitePage[];
      } catch (err) {
        console.error("Preview pages exception:", err);
        return [];
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-400">Carregando preview...</p>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-sm text-gray-400">Site não encontrado.</p>
        <Link to="/dashboard" className="text-sm text-blue-600 underline">
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  const primary = site.primary_color || "#e2603a";
  const font = site.font_family || "sans-serif";
  const cnpj = site.content?.cnpj;

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

  // Flatten all sections from all pages
  const allSections: AnySection[] = [];
  if (pages && pages.length > 0) {
    for (const page of pages) {
      const secs = Array.isArray(page.sections) ? (page.sections as AnySection[]) : [];
      allSections.push(...secs);
    }
  }

  // Redundancy fallback: if pages had no sections, read from site.content.sections
  if (allSections.length === 0 && site) {
    const backupSecs = (site.content as Record<string, unknown>)?.["sections"];
    if (Array.isArray(backupSecs) && backupSecs.length > 0) {
      allSections.push(...(backupSecs as AnySection[]));
    }
  }

  const hasContent = allSections.length > 0;
  const theme = getVisualStyle(site.style);

  return (
    <div style={{ fontFamily: font }} className={`min-h-screen flex flex-col ${theme.wrapperClass}`}>

      {/* Preview banner */}
      <div className="sticky top-0 z-50 flex items-center justify-between gap-4 bg-gray-900 px-4 py-2 text-xs text-white">
        <div className="flex items-center gap-2">
          <Eye className="h-3.5 w-3.5 text-yellow-400" />
          <span className="font-mono font-bold uppercase tracking-widest text-yellow-400">
            Modo Preview
          </span>
          <span className="hidden text-gray-400 sm:inline">
            — {hasContent ? `${allSections.length} seções geradas` : "Conteúdo padrão"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-gray-400 sm:inline">{subdomainFor(site.slug)}</span>
          <Link to="/dashboard"
            className="inline-flex items-center gap-1 rounded bg-white/10 px-2.5 py-1 font-bold transition-colors hover:bg-white/20">
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <a href={`https://${subdomainFor(site.slug)}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded px-2.5 py-1 font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: primary }}>
            <ExternalLink className="h-3 w-3" /> Domínio
          </a>
        </div>
      </div>

      {/* Site header */}
      <header className={`px-6 sticky top-8 z-40 ${theme.headerClass}`} style={{ borderColor: primary + "25" }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between">
          <span className={`text-lg font-extrabold tracking-tight ${theme.headingClass}`} style={{ fontFamily: font, color: primary }}>
            {site.name}
          </span>
          <nav className={`hidden items-center gap-8 text-sm font-medium md:flex ${theme.isDark ? "text-gray-300" : "text-gray-500"}`}>
            <a href="#sobre" className="hover:opacity-80 transition-opacity">Sobre</a>
            <a href="#contato" className="hover:opacity-80 transition-opacity">Contato</a>
          </nav>
          {site.whatsapp && (
            <a href={whatsappHref(site.whatsapp)} target="_blank" rel="noopener noreferrer"
              className={`hidden items-center gap-2 px-4 py-2 text-xs font-bold text-white sm:inline-flex ${theme.buttonPrimaryClass}`}
              style={{ backgroundColor: primary }}>
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
          )}
        </div>
      </header>

      {/* Sections */}
      {hasContent
        ? (
          <>
            {allSections.map((block, idx) => renderSection(block, site, idx, theme))}
            {!allSections.some((s) => s.type === "privacy_policy" || s.type === "privacy") && (
              renderSection(
                {
                  type: "privacy_policy",
                  title: "Política de Privacidade",
                  subtitle: `Compromisso com a sua privacidade e conformidade com a LGPD (Lei nº 13.709/2018).`,
                  body: `A ${site.business_name || site.name} preza pela segurança, confidencialidade e transparência no tratamento dos dados pessoais de seus clientes e usuários, em total conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018). As informações coletadas voluntariamente através de nossos canais de atendimento são utilizadas unicamente para responder a solicitações, esclarecer dúvidas e viabilizar a prestação dos serviços contratados.`,
                  items: [
                    { title: "Coleta e Finalidade", description: "Utilizamos informações de contato exclusivamente para responder suas dúvidas, pedidos e orçamentos." },
                    { title: "Segurança das Informações", description: "Seus dados são protegidos com medidas adequadas e nunca comercializados com terceiros." },
                    { title: "Seus Direitos (LGPD)", description: "Você pode solicitar acesso, alteração ou exclusão dos seus dados a qualquer momento por nossos canais." },
                  ],
                },
                site,
                9999,
                theme
              )
            )}
          </>
        )
        : (
          // Minimal fallback when no content was generated
          <div className="mx-auto max-w-4xl px-6 py-32 text-center">
            <h1 className="text-4xl font-extrabold" style={{ color: primary }}>{site.name}</h1>
            <p className="mt-4 text-gray-500">
              {site.business_name}
              {site.city ? ` — ${site.city}` : ""}
            </p>
            {site.whatsapp && (
              <a href={whatsappHref(site.whatsapp)} target="_blank" rel="noopener noreferrer"
                className={`mt-8 inline-flex items-center gap-2 px-8 py-4 text-sm font-bold text-white ${theme.buttonPrimaryClass}`}
                style={{ backgroundColor: primary }}>
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            )}
          </div>
        )}

      {/* Footer */}
      <footer className={`py-12 text-center text-xs ${theme.footerClass}`} style={{ borderColor: primary + "25" }}>
        <p className={`font-semibold ${theme.isDark ? "text-gray-200" : "text-gray-600"}`}>
          © {new Date().getFullYear()} {site.business_name}
          {(site.city || site.state) && (
            <span> · {[site.city, site.state].filter(Boolean).join(" — ")}</span>
          )}
        </p>
        {cnpj && (
          <p className="mt-2 font-mono text-[11px] opacity-80">CNPJ: {cnpj}</p>
        )}
        {site.email && (
          <p className="mt-1">
            <a href={`mailto:${site.email}`} className="hover:underline">{site.email}</a>
          </p>
        )}
        <div className="pt-4 border-t border-current/10 mt-4 flex flex-col sm:flex-row items-center justify-between opacity-70 text-[10px] gap-2 px-6">
          <a href="#privacidade" className="hover:underline">
            Política de Privacidade (LGPD)
          </a>
          <span className="font-mono opacity-60">Criado com ADSPainel</span>
        </div>
      </footer>
    </div>
  );
}
