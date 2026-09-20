import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  ArrowLeft,
  ExternalLink,
  Eye,
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
import { supabase } from "@/integrations/supabase/client";
import { subdomainFor } from "@/config/app";
import { getVisualStyle, type VisualStyle } from "@/lib/visual-styles";
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
  content: {
    cnpj?: string | null;
    generated?: boolean;
    company_data?: CompanyData;
    facebook_domain_verification?: string;
    meta_tag?: string;
    sections?: AnySection[];
    [key: string]: any;
  } | null;
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
  enabled?: boolean;
  badge?: any;
  title?: any;
  subtitle?: any;
  cta_label?: any;
  cta_href?: any;
  secondary_cta_label?: any;
  secondary_cta_href?: any;
  highlight?: any;
  body?: any;
  description?: any;
  name?: any;
  role?: any;
  avatar?: any;
  image?: any;
  items?: any;
  pillars?: any;
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

function whatsappHref(raw: unknown, customMessage?: string): string {
  if (!raw) return "#";
  const str = String(raw);
  const num = str.replace(/\D/g, "");
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

// ─── Section renderers ────────────────────────────────────────────────────────

function renderSection(
  block: AnySection,
  site: SiteData,
  idx: number,
  theme: VisualStyle,
  company?: CompanyData | null
) {
  const primary = site.primary_color;
  const font = site.font_family;

  function t(text: unknown) {
    if (typeof text !== "string") return "";
    return company ? resolveCompanyVariables(text, company) : text;
  }

  switch (block.type) {
    case "hero":
      return (
        <section
          key={idx}
          className={`relative overflow-hidden py-24 text-center ${theme.heroBgClass}`}
          style={{ backgroundColor: theme.isDark ? undefined : primary + "14" }}
        >
          <div className="mx-auto max-w-4xl px-6">
            {block.badge && (
              <span
                className={`mb-4 inline-block px-4 py-1 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-sm ${theme.badgeRadius}`}
                style={{ backgroundColor: primary }}
              >
                {t(block.badge)}
              </span>
            )}
            <h1
              className={`mt-4 text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight ${theme.headingClass}`}
              style={{ fontFamily: font, color: primary }}
            >
              {t(block.title ?? site.name)}
            </h1>
            <p className={`mx-auto mt-6 max-w-2xl text-lg ${theme.subheadingClass}`}>
              {t(block.subtitle ?? "")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {block.cta_label && (
                <a
                  href={String(block.cta_href ?? "#contato")}
                  className={`inline-block px-8 py-3.5 text-sm font-bold text-white shadow-sm ${theme.buttonPrimaryClass}`}
                  style={{ backgroundColor: primary }}
                >
                  {t(block.cta_label)}
                </a>
              )}
              {block.secondary_cta_label && (
                <a
                  href={String(block.secondary_cta_href ?? "#servicos")}
                  className={`inline-block px-8 py-3.5 text-sm font-bold border transition-colors ${theme.buttonSecondaryClass}`}
                  style={{ borderColor: primary, color: primary }}
                >
                  {t(block.secondary_cta_label)}
                </a>
              )}
              {site.whatsapp && !block.cta_label && (
                <a
                  href={whatsappHref(site.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-8 py-3.5 text-sm ${theme.buttonSecondaryClass}`}
                  style={{ borderColor: "#25d366", color: "#25d366" }}
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </section>
      );

    case "mission": {
      const pillars = (block.pillars as { title: string; description: string }[]) || [];
      return (
        <section key={idx} id="missao" className={`py-20 px-6 ${theme.accentSectionBgClass}`}>
          <div className="max-w-5xl mx-auto space-y-8 text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-full mb-1" style={{ backgroundColor: primary + "15" }}>
              <ShieldCheck className="h-8 w-8" style={{ color: primary }} />
            </div>
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>
                Propósito Institucional
              </p>
              <h2 className={`text-3xl sm:text-4xl mt-2 font-extrabold ${theme.headingClass}`} style={{ color: primary }}>
                {t(block.title || "Nossa Missão")}
              </h2>
              <p className={`mt-4 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto ${theme.isDark ? "text-gray-300" : "text-gray-700"}`}>
                {t(block.description)}
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

    case "about":
      return (
        <section key={idx} id="sobre" className={`py-20 px-6 ${theme.accentSectionBgClass}`}>
          <div className="mx-auto max-w-5xl px-6 text-center space-y-6">
            <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>
              Institucional
            </p>
            <h2 className={`mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight ${theme.headingClass}`}>
              {t(block.title ?? "Quem Somos")}
            </h2>
            {(block.foundation_year || block.activity_area) && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold" style={{ borderColor: primary + "40", color: primary }}>
                {block.foundation_year && <span>Fundada em {String(block.foundation_year)}</span>}
                {block.foundation_year && block.activity_area && <span>•</span>}
                {block.activity_area && <span>{String(block.activity_area)}</span>}
              </div>
            )}
            {block.highlight && (
              <p className="mt-4 text-lg font-semibold" style={{ color: primary }}>
                {t(block.highlight)}
              </p>
            )}
            <p className={`mt-4 max-w-2xl mx-auto leading-relaxed ${theme.isDark ? "text-gray-300" : "text-gray-600"}`}>
              {t(block.body ?? "")}
            </p>
          </div>
        </section>
      );

    case "company_services": {
      const items = (block.items as any[]) || [];
      const activeServices = items.filter((item) => item.status !== "inactive");
      return (
        <section key={idx} id="servicos" className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center space-y-3">
            <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>
              Soluções Especializadas
            </p>
            <h2 className={`text-3xl sm:text-4xl font-extrabold ${theme.headingClass}`} style={{ color: primary }}>
              {t(block.title || "Nossos Serviços")}
            </h2>
            {block.subtitle && (
              <p className={`text-sm max-w-md mx-auto ${theme.subheadingClass}`}>{t(block.subtitle)}</p>
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

    case "company_info":
      return (
        <section key={idx} id="informacoes" className={`py-20 px-6 ${theme.altSectionBgClass}`}>
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>
                Transparência Corporativa
              </p>
              <h2 className={`text-3xl sm:text-4xl font-extrabold ${theme.headingClass}`} style={{ color: primary }}>
                {t(block.title || "Informações da Empresa")}
              </h2>
              <p className={`text-sm max-w-lg mx-auto ${theme.subheadingClass}`}>
                {t(block.subtitle || "Ficha cadastral e registros institucionais.")}
              </p>
            </div>

            <div className={`p-8 rounded-2xl border shadow-sm ${theme.cardClass}`}>
              <div className="flex items-center gap-4 pb-6 border-b border-border">
                <Building2 className="h-8 w-8" style={{ color: primary }} />
                <div>
                  <h3 className="font-bold text-lg">{block.fantasy_name || site.name}</h3>
                  <p className="text-xs text-muted-foreground">{block.legal_name || site.business_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 text-sm">
                <div>
                  <p className="font-mono text-[11px] text-muted-foreground uppercase">CNPJ</p>
                  <p className="font-mono font-bold mt-1 text-base">{block.cnpj || "00.000.000/0001-00"}</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] text-muted-foreground uppercase">Data de Abertura</p>
                  <p className="font-semibold mt-1">{block.opening_date || "—"}</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] text-muted-foreground uppercase">Situação Cadastral</p>
                  <span className="inline-block mt-1 font-semibold px-2.5 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-600 font-mono">
                    {block.registration_status || "Ativa"}
                  </span>
                </div>
                <div>
                  <p className="font-mono text-[11px] text-muted-foreground uppercase">Porte</p>
                  <p className="font-semibold mt-1">{block.company_size || "Demais"}</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] text-muted-foreground uppercase">Tipo</p>
                  <p className="font-semibold mt-1">{block.company_type || "Matriz"}</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] text-muted-foreground uppercase">Capital Social</p>
                  <p className="font-semibold mt-1">{block.share_capital || "—"}</p>
                </div>
                <div className="sm:col-span-2 lg:col-span-3 pt-3 border-t border-border">
                  <p className="font-mono text-[11px] text-muted-foreground uppercase">Natureza Jurídica</p>
                  <p className="font-semibold mt-1">{block.legal_nature || "206-2 - Sociedade Empresária Limitada"}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      );

    case "location": {
      const fullAddress = [
        block.address_street,
        block.address_number,
        block.address_complement,
        block.address_neighborhood,
        block.address_city,
        block.address_state,
        block.address_cep,
      ]
        .filter(Boolean)
        .join(", ");

      const mapQuery = encodeURIComponent(
        [block.address_street, block.address_number, block.address_city, block.address_state].filter(Boolean).join(" ") || "São Paulo SP"
      );

      return (
        <section key={idx} id="localizacao" className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center space-y-3 mb-10">
            <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>
              Nossa Sede
            </p>
            <h2 className={`text-3xl sm:text-4xl font-extrabold ${theme.headingClass}`} style={{ color: primary }}>
              {t(block.title || "Onde Estamos")}
            </h2>
            <p className={`text-sm max-w-md mx-auto ${theme.subheadingClass}`}>
              {t(block.subtitle || "Venha tomar um café conosco ou agende um atendimento presencial.")}
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
              {block.address_cep && (
                <p className="font-mono text-xs text-muted-foreground">
                  CEP: {block.address_cep}
                </p>
              )}
            </div>

            {block.show_map !== false && (
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

    case "contact": {
      const hasCta = site.phone || site.whatsapp || site.email || block.phone || block.whatsapp || block.email;
      const displayWpp = block.whatsapp || site.whatsapp;
      const displayPhone = block.phone || site.phone;
      const displayEmail = block.email || site.email;

      return (
        <section key={idx} id="contato" className={`py-24 ${theme.altSectionBgClass}`}>
          <div className="mx-auto max-w-5xl px-6 text-center space-y-8">
            <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>
              Contato
            </p>
            <h2 className={`mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight ${theme.headingClass}`}>
              {t(block.title ?? "Entre em contato")}
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm font-medium">
              {displayPhone && (
                <a
                  href={`tel:${displayPhone.replace(/\D/g, "")}`}
                  className={`inline-flex items-center gap-2 hover:underline ${theme.isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  <Phone className="h-5 w-5" style={{ color: primary }} />
                  {formatPhone(displayPhone)}
                </a>
              )}
              {displayWpp && (
                <a
                  href={whatsappHref(displayWpp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 hover:underline ${theme.isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  <MessageCircle className="h-5 w-5" style={{ color: "#25d366" }} />
                  {formatPhone(displayWpp)} — WhatsApp
                </a>
              )}
              {displayEmail && (
                <a
                  href={`mailto:${displayEmail}`}
                  className={`inline-flex items-center gap-2 hover:underline ${theme.isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  <Mail className="h-5 w-5" style={{ color: primary }} />
                  {displayEmail}
                </a>
              )}
              {(site.address || site.city || block.address_street) && (
                <span className={`inline-flex items-center gap-2 text-sm ${theme.isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <MapPin className="h-5 w-5" style={{ color: primary }} />
                  {[block.address_street || site.address, block.address_city || site.city, block.address_state || site.state].filter(Boolean).join(", ")}
                </span>
              )}
              {!hasCta && (
                <p className="text-sm text-gray-400 italic">Dados de contato não informados.</p>
              )}
            </div>

            {/* Social Icons */}
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {block.instagram && (
                <a href={block.instagram} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full border border-border bg-card hover:text-primary transition-colors" title="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {block.linkedin && (
                <a href={block.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full border border-border bg-card hover:text-primary transition-colors" title="LinkedIn">
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {block.facebook && (
                <a href={block.facebook} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full border border-border bg-card hover:text-primary transition-colors" title="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {block.youtube && (
                <a href={block.youtube} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full border border-border bg-card hover:text-primary transition-colors" title="YouTube">
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              {block.website && (
                <a href={block.website} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full border border-border bg-card hover:text-primary transition-colors" title="Website">
                  <Globe className="h-5 w-5" />
                </a>
              )}
            </div>

            {displayWpp && (
              <div className="pt-2">
                <a
                  href={whatsappHref(displayWpp, "Olá! Gostaria de saber mais informações sobre os serviços.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-8 py-4 text-sm font-bold text-white shadow-sm transition-transform hover:scale-105 ${theme.buttonPrimaryClass}`}
                  style={{ backgroundColor: primary }}
                >
                  <MessageCircle className="h-5 w-5" />
                  Fale Conosco no WhatsApp
                </a>
              </div>
            )}
          </div>
        </section>
      );
    }

    case "privacy_policy":
    case "privacy": {
      const items = (block.items as { title: string; description: string }[]) ?? [];
      return (
        <section key={idx} id="privacidade" className={`py-20 ${theme.privacySectionBgClass}`}>
          <div className="mx-auto max-w-4xl px-6 space-y-8 text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-full mb-1" style={{ backgroundColor: primary + "15" }}>
              <ShieldCheck className="h-7 w-7" style={{ color: primary }} />
            </div>
            <div>
              <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${theme.headingClass}`}>
                {t(block.title || "Política de Privacidade")}
              </h2>
              {block.subtitle && (
                <p className={`text-sm mt-2 max-w-xl mx-auto leading-relaxed ${theme.subheadingClass}`}>
                  {t(block.subtitle)}
                </p>
              )}
            </div>

            {block.body && (
              <div className={`p-6 sm:p-8 text-sm leading-relaxed text-left ${theme.cardClass}`}>
                <p>{t(block.body)}</p>
              </div>
            )}

            {block.terms_text && (
              <div className={`p-6 sm:p-8 text-sm leading-relaxed text-left ${theme.cardClass}`}>
                <h3 className="font-bold text-sm mb-2">Termos de Uso</h3>
                <p>{t(block.terms_text)}</p>
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

    case "features": {
      const items = (block.items as { icon?: string; title: string; body: string }[]) ?? [];
      return (
        <section key={idx} id="diferenciais" className="py-24">
          <div className="mx-auto max-w-6xl px-6">
            <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>
              Diferenciais
            </p>
            <h2 className={`mt-3 text-3xl font-extrabold tracking-tight ${theme.headingClass}`}>{t(block.title ?? "")}</h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item, i) => (
                <div key={i} className={`p-6 ${theme.cardClass}`} style={{ borderTopWidth: "4px", borderTopColor: primary }}>
                  {item.icon && <span className="text-2xl">{item.icon}</span>}
                  <h3 className={`mt-2 font-bold tracking-tight ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{t(item.title)}</h3>
                  <p className={`mt-2 text-sm leading-relaxed ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{t(item.body)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "services": {
      const items = (block.items as { icon?: string; title: string; body: string }[]) ?? [];
      return (
        <section key={idx} id="servicos" className={`py-24 ${theme.altSectionBgClass}`}>
          <div className="mx-auto max-w-6xl px-6">
            <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>
              Serviços
            </p>
            <h2 className={`mt-3 text-3xl font-extrabold tracking-tight ${theme.headingClass}`}>{t(block.title ?? "")}</h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item, i) => (
                <div key={i} className={`p-7 ${theme.cardClass}`}>
                  {item.icon && <span className="text-3xl">{item.icon}</span>}
                  <h3 className={`mt-4 font-bold tracking-tight ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{t(item.title)}</h3>
                  <p className={`mt-2 text-sm leading-relaxed ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{t(item.body)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "steps": {
      const items = (block.items as { number: string; title: string; description: string }[]) ?? [];
      return (
        <section key={idx} id="como-funciona" className="py-24">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className={`text-center text-3xl font-extrabold tracking-tight ${theme.headingClass}`} style={{ color: primary }}>
              {t(block.title || "Como Funciona")}
            </h2>
            <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item, i) => (
                <li key={i} className={`p-6 ${theme.cardClass} flex flex-col justify-between`}>
                  <span className={`font-mono text-2xl font-extrabold ${theme.stepNumberClass}`} style={{ color: primary }}>
                    {item.number}
                  </span>
                  <h3 className={`mt-3 font-bold text-base ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{t(item.title)}</h3>
                  <p className={`mt-2 text-sm leading-relaxed ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{t(item.description)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      );
    }

    case "menu_highlight": {
      const items = (block.items as { name: string; description: string; price: string }[]) ?? [];
      return (
        <section key={idx} id="cardapio" className="py-24">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className={`text-center text-3xl font-extrabold tracking-tight ${theme.headingClass}`} style={{ color: primary }}>
              {t(block.title || "Cardápio em Destaque")}
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {items.map((item, i) => (
                <div key={i} className={`p-6 ${theme.cardClass}`}>
                  <h3 className={`font-bold text-base ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{t(item.name)}</h3>
                  <p className={`mt-2 text-sm ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{t(item.description)}</p>
                  <p className="mt-4 font-mono font-bold text-base" style={{ color: primary }}>{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "categories":
    case "specialties": {
      const items = (block.items as { name: string; description: string }[]) ?? [];
      return (
        <section key={idx} id="especialidades" className="py-24">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className={`text-center text-3xl font-extrabold tracking-tight ${theme.headingClass}`} style={{ color: primary }}>
              {t(block.title || "Especialidades")}
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {items.map((item, i) => (
                <div key={i} className={`p-6 ${theme.cardClass} ${theme.cardBorderHighlight}`} style={{ borderLeftColor: primary }}>
                  <h3 className={`font-bold text-base ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{t(item.name)}</h3>
                  <p className={`mt-2 text-sm ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{t(item.description)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "faq": {
      const items = (block.items as { question: string; answer: string }[]) ?? [];
      return (
        <section key={idx} id="faq" className="py-24 max-w-3xl mx-auto px-6">
          <h2 className={`text-center text-3xl font-extrabold tracking-tight ${theme.headingClass}`} style={{ color: primary }}>
            {t(block.title || "Dúvidas Frequentes")}
          </h2>
          <div className="mt-10 space-y-4">
            {items.map((item, i) => (
              <div key={i} className={`p-6 ${theme.cardClass}`}>
                <h3 className={`font-bold text-base ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{t(item.question)}</h3>
                <p className={`mt-2 text-sm leading-relaxed ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{t(item.answer)}</p>
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

// ─── Main page ────────────────────────────────────────────────────────────────

function PreviewPage() {
  const { siteSlug } = Route.useParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const primary = site.primary_color || "#1e3a8a";
  const font = site.font_family || "sans-serif";
  const content = site.content || {};
  const company = (content.company_data as CompanyData) || null;
  const cnpj = company?.cnpj || content?.cnpj;
  const displayName = company?.name || site.name;
  const displayWhatsapp = company?.whatsapp || site.whatsapp;
  const floatingConfig = company?.floating_whatsapp || {
    enabled: true,
    phone: displayWhatsapp || "",
    message: "Olá! Gostaria de saber mais informações sobre os serviços.",
    label: "Fale Conosco",
  };

  // Flatten all sections from all pages
  const allSections: AnySection[] = [];
  if (pages && pages.length > 0) {
    for (const page of pages) {
      const secs = Array.isArray(page.sections) ? (page.sections as AnySection[]) : [];
      allSections.push(...secs);
    }
  }

  if (allSections.length === 0 && site) {
    const backupSecs = content?.["sections"];
    if (Array.isArray(backupSecs) && backupSecs.length > 0) {
      allSections.push(...(backupSecs as AnySection[]));
    }
  }

  const activeSections = allSections.filter((s) => s.enabled !== false);
  const hasContent = activeSections.length > 0;
  const theme = getVisualStyle(site.style);

  return (
    <div style={{ fontFamily: font }} className={`min-h-screen flex flex-col relative ${theme.wrapperClass}`}>
      {/* Preview banner */}
      <div className="sticky top-0 z-50 flex items-center justify-between gap-4 bg-gray-900 px-4 py-2 text-xs text-white">
        <div className="flex items-center gap-2">
          <Eye className="h-3.5 w-3.5 text-yellow-400" />
          <span className="font-mono font-bold uppercase tracking-widest text-yellow-400">
            Modo Preview
          </span>
          <span className="hidden text-gray-400 sm:inline">
            — {hasContent ? `${activeSections.length} seções ativas` : "Conteúdo padrão"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-gray-400 sm:inline">{subdomainFor(site.slug)}</span>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 rounded bg-white/10 px-2.5 py-1 font-bold transition-colors hover:bg-white/20"
          >
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <a
            href={`https://${subdomainFor(site.slug)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded px-2.5 py-1 font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: primary }}
          >
            <ExternalLink className="h-3 w-3" /> Domínio
          </a>
        </div>
      </div>

      {/* Site header */}
      <header className={`px-6 sticky top-8 z-40 ${theme.headerClass}`} style={{ borderColor: primary + "25" }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between">
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
              className={`text-lg font-extrabold tracking-tight ${theme.headingClass}`}
              style={{ fontFamily: font, color: primary }}
            >
              {displayName}
            </span>
          </div>

          {/* Dynamic Navigation Links based on active sections */}
          {(() => {
            const navLinks: { href: string; label: string }[] = [];
            const types = new Set(activeSections.map((s) => s.type));
            if (types.has("about")) navLinks.push({ href: "#sobre", label: "Quem Somos" });
            if (types.has("mission")) navLinks.push({ href: "#missao", label: "Missão" });
            if (types.has("features")) navLinks.push({ href: "#diferenciais", label: "Diferenciais" });
            if (types.has("company_services") || types.has("services")) navLinks.push({ href: "#servicos", label: "Serviços" });
            if (types.has("steps")) navLinks.push({ href: "#como-funciona", label: "Como Funciona" });
            if (types.has("menu_highlight")) navLinks.push({ href: "#cardapio", label: "Cardápio" });
            if (types.has("categories") || types.has("specialties")) navLinks.push({ href: "#especialidades", label: "Especialidades" });
            if (types.has("company_info")) navLinks.push({ href: "#informacoes", label: "Empresa" });
            if (types.has("location")) navLinks.push({ href: "#localizacao", label: "Onde Estamos" });
            if (types.has("faq")) navLinks.push({ href: "#faq", label: "Dúvidas" });
            if (types.has("contact")) navLinks.push({ href: "#contato", label: "Contato" });

            return (
              <>
                {navLinks.length > 0 && (
                  <nav className={`hidden items-center gap-8 text-sm font-medium md:flex ${theme.isDark ? "text-gray-300" : "text-gray-500"}`}>
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
                      className={`hidden items-center gap-2 px-4 py-2 text-xs font-bold text-white sm:inline-flex ${theme.buttonPrimaryClass}`}
                      style={{ backgroundColor: primary }}
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                  )}

                  {navLinks.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      className="p-2 rounded-lg border border-border md:hidden text-foreground"
                      aria-label="Menu"
                    >
                      {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                  )}
                </div>
              </>
            );
          })()}
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border mt-2 pt-3 pb-3 space-y-2 flex flex-col bg-background px-4">
            {activeSections.some((s) => s.type === "about") && (
              <a href="#sobre" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-medium border-b border-border/50">
                Quem Somos
              </a>
            )}
            {activeSections.some((s) => s.type === "mission") && (
              <a href="#missao" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-medium border-b border-border/50">
                Nossa Missão
              </a>
            )}
            {activeSections.some((s) => s.type === "features") && (
              <a href="#diferenciais" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-medium border-b border-border/50">
                Diferenciais
              </a>
            )}
            {activeSections.some((s) => s.type === "company_services" || s.type === "services") && (
              <a href="#servicos" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-medium border-b border-border/50">
                Serviços
              </a>
            )}
            {activeSections.some((s) => s.type === "steps") && (
              <a href="#como-funciona" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-medium border-b border-border/50">
                Como Funciona
              </a>
            )}
            {activeSections.some((s) => s.type === "menu_highlight") && (
              <a href="#cardapio" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-medium border-b border-border/50">
                Cardápio
              </a>
            )}
            {activeSections.some((s) => s.type === "categories" || s.type === "specialties") && (
              <a href="#especialidades" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-medium border-b border-border/50">
                Especialidades
              </a>
            )}
            {activeSections.some((s) => s.type === "company_info") && (
              <a href="#informacoes" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-medium border-b border-border/50">
                Informações da Empresa
              </a>
            )}
            {activeSections.some((s) => s.type === "location") && (
              <a href="#localizacao" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-medium border-b border-border/50">
                Onde Estamos
              </a>
            )}
            {activeSections.some((s) => s.type === "faq") && (
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-medium border-b border-border/50">
                Dúvidas
              </a>
            )}
            {activeSections.some((s) => s.type === "contact") && (
              <a href="#contato" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-medium">
                Contato
              </a>
            )}
          </div>
        )}
      </header>

      {/* Sections */}
      {hasContent ? (
        <>
          {activeSections.map((block, idx) => renderSection(block, site, idx, theme, company))}
          {!activeSections.some((s) => s.type === "privacy_policy" || s.type === "privacy") &&
            renderSection(
              {
                type: "privacy_policy",
                title: "Política de Privacidade e Termos",
                subtitle: "Compromisso com a sua privacidade e conformidade com a LGPD.",
                body: company?.privacy?.policy_text || `A ${displayName} preza pela segurança, confidencialidade e transparência no tratamento dos dados pessoais.`,
                items: [
                  { title: "Coleta e Finalidade", description: "Utilizamos informações de contato exclusivamente para responder suas dúvidas." },
                  { title: "Segurança das Informações", description: "Seus dados são protegidos com padrões rígidos e nunca comercializados com terceiros." },
                  { title: "Seus Direitos (LGPD)", description: "Você pode solicitar acesso, alteração ou exclusão dos seus dados a qualquer momento." },
                ],
              },
              site,
              9999,
              theme,
              company
            )}
        </>
      ) : (
        <div className="mx-auto max-w-4xl px-6 py-32 text-center">
          <h1 className="text-4xl font-extrabold" style={{ color: primary }}>{displayName}</h1>
          <p className="mt-4 text-gray-500">{site.business_name || displayName}</p>
        </div>
      )}

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

      {/* Footer */}
      <footer className={`py-12 text-center text-xs ${theme.footerClass}`} style={{ borderColor: primary + "25" }}>
        <p className={`font-semibold ${theme.isDark ? "text-gray-200" : "text-gray-600"}`}>
          © {new Date().getFullYear()} {company?.legal_name || site.business_name || displayName}
          {(company?.address_city || site.city || site.state) && (
            <span> · {[company?.address_city || site.city, company?.address_state || site.state].filter(Boolean).join(" — ")}</span>
          )}
        </p>
        {cnpj && (
          <p className="mt-2 font-mono text-[11px] opacity-80">CNPJ: {cnpj}</p>
        )}
        {(company?.email || site.email) && (
          <p className="mt-1">
            <a href={`mailto:${company?.email || site.email}`} className="hover:underline">{company?.email || site.email}</a>
          </p>
        )}
        <div className="pt-4 border-t border-current/10 mt-4 flex flex-col sm:flex-row items-center justify-between opacity-70 text-[10px] gap-2 px-6">
          <a href="#privacidade" className="hover:underline">
            Política de Privacidade & Termos (LGPD)
          </a>
          <span className="font-mono opacity-60">Criado com ADSPainel</span>
        </div>
      </footer>
    </div>
  );
}
