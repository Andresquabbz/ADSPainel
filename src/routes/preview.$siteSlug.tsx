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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { subdomainFor } from "@/config/app";

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

type AnySection = Record<string, unknown> & { type: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Section renderers ────────────────────────────────────────────────────────

function SectionHero({ s, site }: { s: AnySection; site: SiteData }) {
  const primary = site.primary_color;
  const font = site.font_family;
  return (
    <section className="relative overflow-hidden py-28 text-center" style={{ backgroundColor: primary + "14" }}>
      <div className="mx-auto max-w-4xl px-6">
        {s.badge && (
          <span className="mb-4 inline-block rounded-full px-4 py-1 font-mono text-xs font-bold uppercase tracking-widest text-white"
            style={{ backgroundColor: primary }}>
            {String(s.badge)}
          </span>
        )}
        <h1 className="mt-4 text-5xl font-extrabold leading-tight tracking-tight md:text-6xl"
          style={{ fontFamily: font, color: primary }}>
          {String(s.title ?? "")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500">{String(s.subtitle ?? "")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {s.cta_label && (
            <a href={String(s.cta_href ?? "#contato")}
              className="inline-block px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: primary }}>
              {String(s.cta_label)}
            </a>
          )}
          {site.whatsapp && (
            <a href={whatsappHref(site.whatsapp)} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border px-8 py-3.5 text-sm font-bold transition-colors hover:opacity-80"
              style={{ borderColor: "#25d366", color: "#25d366" }}>
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function SectionFeatures({ s, site }: { s: AnySection; site: SiteData }) {
  const items = (s.items as { icon?: string; title: string; body: string }[]) ?? [];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: site.primary_color }}>
          Diferenciais
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight">{String(s.title ?? "")}</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <div key={i} className="border-t-4 pt-5" style={{ borderColor: site.primary_color }}>
              {item.icon && <span className="text-2xl">{item.icon}</span>}
              <h3 className="mt-2 font-bold tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionServices({ s, site }: { s: AnySection; site: SiteData }) {
  const items = (s.items as { icon?: string; title: string; body: string }[]) ?? [];
  return (
    <section className="py-24" style={{ backgroundColor: site.primary_color + "08" }}>
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: site.primary_color }}>
          Serviços
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight">{String(s.title ?? "")}</h2>
        <div className="mt-12 grid gap-px bg-gray-200 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <div key={i} className="bg-white p-7">
              {item.icon && <span className="text-3xl">{item.icon}</span>}
              <h3 className="mt-4 font-bold tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionSteps({ s, site }: { s: AnySection; site: SiteData }) {
  const items = (s.items as { number: string; title: string; description: string }[]) ?? [];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: site.primary_color }}>
          Como funciona
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight">{String(s.title ?? "")}</h2>
        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <li key={i} className="border-t-2 pt-5" style={{ borderColor: site.primary_color }}>
              <span className="font-mono text-3xl font-bold" style={{ color: site.primary_color }}>
                {item.number}
              </span>
              <h3 className="mt-3 font-bold tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{item.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function SectionAbout({ s, site }: { s: AnySection; site: SiteData }) {
  return (
    <section className="py-24" style={{ backgroundColor: site.primary_color + "06" }}>
      <div className="mx-auto max-w-5xl px-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: site.primary_color }}>
          Sobre nós
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight">{String(s.title ?? "")}</h2>
        {s.highlight && (
          <p className="mt-4 text-lg font-semibold" style={{ color: site.primary_color }}>
            {String(s.highlight)}
          </p>
        )}
        <p className="mt-4 max-w-2xl text-gray-500">{String(s.body ?? "")}</p>
      </div>
    </section>
  );
}

function SectionMenuHighlight({ s, site }: { s: AnySection; site: SiteData }) {
  const items = (s.items as { name: string; description: string; price: string }[]) ?? [];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: site.primary_color }}>
          Cardápio
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight">{String(s.title ?? "")}</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {items.map((item, i) => (
            <div key={i} className="border border-gray-200 p-6">
              <h3 className="font-bold tracking-tight">{item.name}</h3>
              <p className="mt-2 text-sm text-gray-500">{item.description}</p>
              <p className="mt-4 font-mono font-bold" style={{ color: site.primary_color }}>{item.price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionCategories({ s, site }: { s: AnySection; site: SiteData }) {
  const items = (s.items as { name: string; description: string }[]) ?? [];
  return (
    <section className="py-24" style={{ backgroundColor: site.primary_color + "08" }}>
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: site.primary_color }}>
          Categorias
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight">{String(s.title ?? "")}</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {items.map((item, i) => (
            <div key={i} className="border-l-4 bg-white p-6 shadow-sm" style={{ borderColor: site.primary_color }}>
              <h3 className="font-bold">{item.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionSpecialties({ s, site }: { s: AnySection; site: SiteData }) {
  const items = (s.items as { name: string; description: string }[]) ?? [];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: site.primary_color }}>
          Especialidades
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight">{String(s.title ?? "")}</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {items.map((item, i) => (
            <div key={i} className="border p-6" style={{ borderColor: site.primary_color + "40" }}>
              <h3 className="font-bold" style={{ color: site.primary_color }}>{item.name}</h3>
              <p className="mt-2 text-sm text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionContact({ s, site }: { s: AnySection; site: SiteData }) {
  const hasCta = site.phone || site.whatsapp || site.email;
  return (
    <section id="contato" className="py-24" style={{ backgroundColor: site.primary_color + "12" }}>
      <div className="mx-auto max-w-5xl px-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: site.primary_color }}>
          Contato
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight">{String(s.title ?? "Entre em contato")}</h2>
        <div className="mt-10 flex flex-col gap-5">
          {site.phone && (
            <a href={`tel:${site.phone.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-3 text-sm font-medium hover:underline">
              <Phone className="h-5 w-5" style={{ color: site.primary_color }} />
              {formatPhone(site.phone)}
            </a>
          )}
          {site.whatsapp && (
            <a href={whatsappHref(site.whatsapp)} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-sm font-medium hover:underline">
              <MessageCircle className="h-5 w-5" style={{ color: "#25d366" }} />
              {formatPhone(site.whatsapp)} — WhatsApp
            </a>
          )}
          {site.email && (
            <a href={`mailto:${site.email}`}
              className="inline-flex items-center gap-3 text-sm font-medium hover:underline">
              <Mail className="h-5 w-5" style={{ color: site.primary_color }} />
              {site.email}
            </a>
          )}
          {(site.address || site.city) && (
            <span className="inline-flex items-center gap-3 text-sm">
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
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 text-sm font-bold text-white shadow-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: site.primary_color }}>
            <MessageCircle className="h-4 w-4" />
            {String(s.title ?? "Fale conosco")}
          </a>
        )}
      </div>
    </section>
  );
}

function renderSection(block: AnySection, site: SiteData, idx: number) {
  const props = { s: block, site };
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
      const { data, error } = await supabase
        .from("sites")
        .select("*")
        .eq("slug", siteSlug)
        .maybeSingle();
      if (error) throw error;
      return data as SiteData | null;
    },
  });

  const { data: pages } = useQuery({
    queryKey: ["preview-pages", site?.id],
    enabled: !!site?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_pages")
        .select("id, title, path, sections, position")
        .eq("site_id", site!.id)
        .order("position");
      if (error) throw error;
      return (data ?? []) as SitePage[];
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
      const secs = Array.isArray(page.sections) ? page.sections as AnySection[] : [];
      allSections.push(...secs);
    }
  }

  const hasContent = allSections.length > 0;

  return (
    <div style={{ fontFamily: font, color: "#111" }} className="min-h-screen bg-white">

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
      <header className="border-b px-6" style={{ borderColor: primary + "25" }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between">
          <span className="text-lg font-extrabold tracking-tight" style={{ fontFamily: font, color: primary }}>
            {site.name}
          </span>
          <nav className="hidden items-center gap-8 text-sm font-medium text-gray-500 md:flex">
            <a href="#sobre" className="hover:text-gray-900 transition-colors">Sobre</a>
            <a href="#contato" className="hover:text-gray-900 transition-colors">Contato</a>
          </nav>
          {site.whatsapp && (
            <a href={whatsappHref(site.whatsapp)} target="_blank" rel="noopener noreferrer"
              className="hidden items-center gap-2 px-4 py-2 text-xs font-bold text-white sm:inline-flex transition-opacity hover:opacity-90"
              style={{ backgroundColor: primary }}>
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
          )}
        </div>
      </header>

      {/* Sections */}
      {hasContent
        ? allSections.map((block, idx) => renderSection(block, site, idx))
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
                className="mt-8 inline-flex items-center gap-2 px-8 py-4 text-sm font-bold text-white"
                style={{ backgroundColor: primary }}>
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            )}
          </div>
        )}

      {/* Footer */}
      <footer className="border-t py-12 text-center text-xs text-gray-400" style={{ borderColor: primary + "20" }}>
        <p className="font-semibold text-gray-600">
          © {new Date().getFullYear()} {site.business_name}
          {(site.city || site.state) && (
            <span> · {[site.city, site.state].filter(Boolean).join(" — ")}</span>
          )}
        </p>
        {cnpj && (
          <p className="mt-2 font-mono text-[11px]">CNPJ: {cnpj}</p>
        )}
        {site.email && (
          <p className="mt-1">
            <a href={`mailto:${site.email}`} className="hover:text-gray-600 underline">{site.email}</a>
          </p>
        )}
        <p className="mt-3 font-mono text-[10px] opacity-40">Criado com ADSPainel</p>
      </footer>
    </div>
  );
}
