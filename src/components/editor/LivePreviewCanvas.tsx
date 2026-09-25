import type { AnySection } from "./AddSectionModal";
import type { ViewportMode } from "./EditorHeader";
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
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
  ExternalLink,
  ChevronRight,
  EyeOff,
} from "lucide-react";
import { getVisualStyle, type VisualStyle } from "@/lib/visual-styles";
import type { CompanyData } from "@/lib/templates/institutional-template";
import { resolveCompanyVariables } from "@/lib/templates/institutional-template";

function isRealLink(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const lower = url.trim().toLowerCase();
  if (!lower || lower === "#" || lower.includes("atlascorp") || lower.includes("example.com")) {
    return false;
  }
  return true;
}

interface LivePreviewCanvasProps {
  sections: AnySection[];
  viewport: ViewportMode;
  primaryColor: string;
  fontFamily: string;
  style?: string;
  name: string;
  businessName: string;
  cnpj: string;
  whatsapp: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  address: string;
  selectedSectionIndex: number | null;
  onSelectSection: (index: number) => void;
  companyData?: CompanyData;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatPhone(raw: string): string {
  if (!raw) return "";
  const d = raw.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return raw;
}

function whatsappHref(raw: string, customMessage?: string): string {
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

export function LivePreviewCanvas({
  sections,
  viewport,
  primaryColor,
  fontFamily,
  style,
  name,
  businessName,
  cnpj,
  whatsapp,
  phone,
  email,
  city,
  state,
  address,
  selectedSectionIndex,
  onSelectSection,
  companyData,
}: LivePreviewCanvasProps) {
  const theme = getVisualStyle(style);
  const containerWidths: Record<ViewportMode, string> = {
    desktop: "w-full max-w-full",
    tablet: "w-[768px] max-w-[768px]",
    mobile: "w-[375px] max-w-[375px]",
  };

  const displayName = companyData?.name || name || businessName || "Empresa Institucional";
  const displayWhatsapp = companyData?.whatsapp || whatsapp;
  const floatingConfig = companyData?.floating_whatsapp || {
    enabled: true,
    phone: displayWhatsapp,
    message: "Olá! Gostaria de saber mais informações sobre os serviços.",
    label: "Fale Conosco",
  };

  return (
    <main className="flex-1 bg-muted/40 overflow-y-auto p-4 sm:p-6 flex justify-center items-start relative">
      <div
        className={`shadow-xl transition-all duration-300 rounded-lg overflow-hidden border border-border min-h-[90vh] flex flex-col relative ${theme.wrapperClass} ${containerWidths[viewport]}`}
        style={{ fontFamily: fontFamily || "sans-serif" }}
      >
        {/* Site Header */}
        <header
          className={`px-6 py-4 flex items-center justify-between sticky top-0 z-20 ${theme.headerClass}`}
          style={{ borderColor: primaryColor + "25" }}
        >
          <div className="flex items-center gap-3">
            {companyData?.logo_url ? (
              <img
                src={companyData.logo_url}
                alt={displayName}
                className="h-8 max-h-8 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : null}
            <span
              className={`text-lg font-extrabold tracking-tight truncate max-w-[240px] ${theme.headingClass}`}
              style={{ color: primaryColor }}
            >
              {displayName}
            </span>
          </div>

          {/* Dynamic Navigation Links based on active sections */}
          <nav className={`hidden sm:flex items-center gap-6 text-xs font-semibold ${theme.isDark ? "text-gray-300" : "text-gray-500"}`}>
            {sections.filter((sec) => sec.enabled !== false).some((sec) => sec.type === "about") && (
              <a href="#sobre" className="hover:opacity-80 transition-opacity">Quem Somos</a>
            )}
            {sections.filter((sec) => sec.enabled !== false).some((sec) => sec.type === "mission") && (
              <a href="#missao" className="hover:opacity-80 transition-opacity">Missão</a>
            )}
            {sections.filter((sec) => sec.enabled !== false).some((sec) => sec.type === "features") && (
              <a href="#diferenciais" className="hover:opacity-80 transition-opacity">Diferenciais</a>
            )}
            {sections.filter((sec) => sec.enabled !== false).some((sec) => sec.type === "company_services" || sec.type === "services") && (
              <a href="#servicos" className="hover:opacity-80 transition-opacity">Serviços</a>
            )}
            {sections.filter((sec) => sec.enabled !== false).some((sec) => sec.type === "steps") && (
              <a href="#como-funciona" className="hover:opacity-80 transition-opacity">Como Funciona</a>
            )}
            {sections.filter((sec) => sec.enabled !== false).some((sec) => sec.type === "menu_highlight") && (
              <a href="#cardapio" className="hover:opacity-80 transition-opacity">Cardápio</a>
            )}
            {sections.filter((sec) => sec.enabled !== false).some((sec) => sec.type === "categories" || sec.type === "specialties") && (
              <a href="#especialidades" className="hover:opacity-80 transition-opacity">Especialidades</a>
            )}
            {sections.filter((sec) => sec.enabled !== false).some((sec) => sec.type === "company_info") && (
              <a href="#informacoes" className="hover:opacity-80 transition-opacity">Empresa</a>
            )}
            {sections.filter((sec) => sec.enabled !== false).some((sec) => sec.type === "location") && (
              <a href="#localizacao" className="hover:opacity-80 transition-opacity">Onde Estamos</a>
            )}
            {sections.filter((sec) => sec.enabled !== false).some((sec) => sec.type === "faq") && (
              <a href="#faq" className="hover:opacity-80 transition-opacity">Dúvidas</a>
            )}
            {sections.filter((sec) => sec.enabled !== false).some((sec) => sec.type === "contact") && (
              <a href="#contato" className="hover:opacity-80 transition-opacity">Contato</a>
            )}
          </nav>

          {displayWhatsapp && (
            <a
              href={whatsappHref(displayWhatsapp, floatingConfig.message)}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90 shrink-0 ${theme.buttonPrimaryClass}`}
              style={{ backgroundColor: primaryColor }}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}
        </header>

        {/* Dynamic Sections */}
        <div className="flex-1 flex flex-col">
          {sections.map((section, idx) => {
            const isSelected = selectedSectionIndex === idx;
            const isSectionHidden = section.enabled === false;

            return (
              <div
                key={idx}
                onClick={() => onSelectSection(idx)}
                className={`relative group transition-all cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-primary ring-inset z-10"
                    : "hover:ring-1 hover:ring-primary/40 hover:ring-inset"
                } ${isSectionHidden ? "opacity-40 grayscale" : ""}`}
              >
                {/* Floating section badge on hover/select */}
                <div
                  className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-opacity flex items-center gap-1 ${
                    isSelected
                      ? "bg-primary text-white opacity-100 shadow-sm"
                      : "bg-slate-900/80 text-white opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {isSectionHidden && <EyeOff className="h-3 w-3 mr-0.5" />}
                  {section.type} {isSectionHidden ? "(Oculta)" : isSelected ? "(Editando)" : "— Clique para editar"}
                </div>

                {/* ── Render Block Content ── */}
                {renderSectionContent(section, {
                  primaryColor,
                  fontFamily,
                  theme,
                  name: displayName,
                  businessName: companyData?.legal_name || businessName || displayName,
                  whatsapp: displayWhatsapp,
                  phone: companyData?.phone || phone,
                  email: companyData?.email || email,
                  city: companyData?.address_city || city,
                  state: companyData?.address_state || state,
                  address: companyData?.address_street
                    ? `${companyData.address_street}, ${companyData.address_number || ""}`
                    : address,
                  companyData,
                })}
              </div>
            );
          })}

          {sections.length === 0 && (
            <div className="py-24 text-center px-4">
              <p className="text-gray-400 text-sm">Nenhuma seção adicionada ainda.</p>
              <p className="text-xs text-gray-400 mt-1">Use a barra lateral para adicionar blocos ao template.</p>
            </div>
          )}
        </div>

        {/* Floating WhatsApp Button */}
        {floatingConfig.enabled !== false && displayWhatsapp && (
          <aside className="sticky bottom-6 right-6 z-30 self-end mr-6 mb-6">
            <a
              href={whatsappHref(floatingConfig.phone || displayWhatsapp, floatingConfig.message)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#25d366] text-white font-bold text-xs shadow-2xl hover:scale-105 transition-transform group"
              title="Fale conosco no WhatsApp"
            >
              <MessageCircle className="h-5 w-5 fill-current animate-pulse" />
              <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300">
                {floatingConfig.label || "Fale Conosco"}
              </span>
            </a>
          </aside>
        )}

        {/* Site Footer */}
        <footer
          className={`py-12 px-6 text-center text-xs ${theme.footerClass}`}
          style={{ borderColor: primaryColor + "25" }}
        >
          <p className={`font-semibold ${theme.isDark ? "text-gray-200" : "text-gray-700"}`}>
            © {new Date().getFullYear()} {companyData?.legal_name || businessName || displayName}
            {(city || state || companyData?.address_city) && (
              <span> · {[companyData?.address_city || city, companyData?.address_state || state].filter(Boolean).join(" — ")}</span>
            )}
          </p>

          {(companyData?.cnpj || cnpj) && (
            <p className="mt-1.5 font-mono text-[11px] opacity-80">
              CNPJ: {companyData?.cnpj || cnpj}
            </p>
          )}

          {(companyData?.email || email) && (
            <p className="mt-1 opacity-80">
              <a href={`mailto:${companyData?.email || email}`} className="hover:underline">
                {companyData?.email || email}
              </a>
            </p>
          )}

          <div className="pt-4 border-t border-current/10 mt-4 flex flex-col sm:flex-row items-center justify-between opacity-70 text-[10px] gap-2">
            <a href="#privacidade" className="hover:underline transition-colors">
              Política de Privacidade & Termos (LGPD)
            </a>
            <span className="font-mono opacity-60">Criado com ADSPainel</span>
          </div>
        </footer>
      </div>
    </main>
  );
}

// ─── Section Content Renderers ───────────────────────────────────────────────

interface RenderContext {
  primaryColor: string;
  fontFamily: string;
  theme: VisualStyle;
  name: string;
  businessName: string;
  whatsapp: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  address: string;
  companyData?: CompanyData;
}

function renderSectionContent(s: AnySection, ctx: RenderContext) {
  const primary = ctx.primaryColor;
  const theme = ctx.theme;
  const company = ctx.companyData;

  function t(text: string | unknown) {
    if (typeof text !== "string") return "";
    return company ? resolveCompanyVariables(text, company) : text;
  }

  switch (s.type) {
    // ── 1. HERO ─────────────────────────────────────────────────────────────
    case "hero":
      return (
        <section
          className={`py-20 px-6 text-center ${theme.heroBgClass}`}
          style={{ backgroundColor: theme.isDark ? undefined : primary + "12" }}
        >
          <div className="max-w-3xl mx-auto space-y-4">
            {(company?.hero_badge || s.badge) && (
              <span
                className={`inline-block px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-white ${theme.badgeRadius}`}
                style={{ backgroundColor: primary }}
              >
                {t(company?.hero_badge || s.badge)}
              </span>
            )}
            <h1
              className={`text-4xl sm:text-5xl ${theme.headingClass} leading-tight font-extrabold`}
              style={{ color: primary }}
            >
              {t(company?.fantasy_name || company?.name || s.title || ctx.name)}
            </h1>
            <p className={`text-base sm:text-lg ${theme.subheadingClass} max-w-xl mx-auto leading-relaxed`}>
              {t(company?.hero_subtitle || s.subtitle || "Soluções corporativas completas com alta qualidade e excelência.")}
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-3">
              {s.cta_label && (
                <a
                  href={String(s.cta_href || "#contato")}
                  className={`px-6 py-3 text-sm font-bold text-white shadow-sm ${theme.buttonPrimaryClass}`}
                  style={{ backgroundColor: primary }}
                >
                  {t(s.cta_label)}
                </a>
              )}
              {s.secondary_cta_label && (
                <a
                  href={String(s.secondary_cta_href || "#servicos")}
                  className={`px-6 py-3 text-sm font-bold border transition-colors ${theme.buttonSecondaryClass}`}
                  style={{ borderColor: primary, color: primary }}
                >
                  {t(s.secondary_cta_label)}
                </a>
              )}
              {ctx.whatsapp && !s.cta_label && (
                <a
                  href={whatsappHref(ctx.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-6 py-3 text-sm ${theme.buttonSecondaryClass}`}
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

    // ── 2. MISSION / NOSSA MISSÃO ───────────────────────────────────────────
    case "mission": {
      const pillars = (company?.pillars && Array.isArray(company.pillars) && company.pillars.length > 0 ? company.pillars : (s.pillars as { title: string; description: string }[])) || [];
      return (
        <section id="missao" className={`py-16 px-6 ${theme.accentSectionBgClass}`}>
          <div className="max-w-4xl mx-auto space-y-8 text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-full mb-1" style={{ backgroundColor: primary + "15" }}>
              <ShieldCheck className="h-7 w-7" style={{ color: primary }} />
            </div>
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>
                Propósito Institucional
              </p>
              <h2 className={`text-2xl sm:text-3xl mt-2 font-extrabold ${theme.headingClass}`} style={{ color: primary }}>
                {t(company?.mission_title || s.title || "Nossa Missão")}
              </h2>
              <p className={`mt-4 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto ${theme.isDark ? "text-gray-300" : "text-gray-700"}`}>
                {t(company?.mission_description || s.description || "Compromisso permanente com a ética, conformidade e geração de valor.")}
              </p>
            </div>

            {pillars.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
                {pillars.map((pillar, i) => (
                  <div key={i} className={`p-5 rounded-xl border ${theme.cardClass}`} style={{ borderTopWidth: "3px", borderTopColor: primary }}>
                    <h3 className={`font-bold text-sm ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{pillar.title}</h3>
                    <p className={`text-xs mt-2 leading-relaxed ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{pillar.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      );
    }

    // ── 3. ABOUT / QUEM SOMOS ───────────────────────────────────────────────
    case "about":
      return (
        <section id="sobre" className={`py-16 px-6 ${theme.altSectionBgClass}`}>
          <div className="max-w-4xl mx-auto text-center space-y-5">
            <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>
              Institucional
            </p>
            <h2 className={`text-2xl sm:text-3xl font-extrabold ${theme.headingClass}`} style={{ color: primary }}>
              {t(company?.about_title || s.title || "Quem Somos")}
            </h2>
            {(company?.foundation_year || s.foundation_year || company?.activity_area || s.activity_area) && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium" style={{ borderColor: primary + "40", color: primary }}>
                {(company?.foundation_year || s.foundation_year) && <span>Fundada em {String(company?.foundation_year || s.foundation_year)}</span>}
                {(company?.foundation_year || s.foundation_year) && (company?.activity_area || s.activity_area) && <span>•</span>}
                {(company?.activity_area || s.activity_area) && <span>{String(company?.activity_area || s.activity_area)}</span>}
              </div>
            )}
            {(company?.about_highlight || s.highlight) && (
              <p className="font-semibold text-base" style={{ color: primary }}>
                {t(company?.about_highlight || s.highlight)}
              </p>
            )}
            <p className={`text-sm leading-relaxed max-w-2xl mx-auto ${theme.isDark ? "text-gray-300" : "text-gray-600"}`}>
              {t(company?.about_description || s.body || "História e trajetória corporativa.")}
            </p>
          </div>
        </section>
      );

    // ── 4. COMPANY SERVICES / SERVIÇOS DINÂMICOS ────────────────────────────
    case "company_services": {
      const items = (Array.isArray(company?.services) && company.services.length > 0 ? company.services : (s.items as any[])) || [];
      const activeServices = items.filter((item) => item.status !== "inactive");
      return (
        <section id="servicos" className="py-16 px-6 max-w-5xl mx-auto">
          <div className="text-center space-y-2">
            <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>
              Soluções Especializadas
            </p>
            <h2 className={`text-2xl sm:text-3xl font-extrabold ${theme.headingClass}`} style={{ color: primary }}>
              {t(company?.services_title || s.title || "Nossos Serviços")}
            </h2>
            {(company?.services_subtitle || s.subtitle) && (
              <p className={`text-xs max-w-md mx-auto ${theme.subheadingClass}`}>{t(company?.services_subtitle || s.subtitle)}</p>
            )}
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {activeServices.map((srv, i) => (
              <div
                key={srv.id || i}
                className={`p-5 rounded-xl border flex flex-col justify-between transition-all hover:shadow-md ${theme.cardClass}`}
                style={{ borderTopWidth: "3px", borderTopColor: primary }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {renderServiceIcon(srv.icon, primary)}
                    </div>
                    {srv.category && (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase font-bold">
                        {srv.category}
                      </span>
                    )}
                  </div>
                  <h3 className={`font-bold text-sm tracking-tight ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>
                    {srv.name}
                  </h3>
                  <p className={`text-xs mt-2 leading-relaxed ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {srv.description}
                  </p>
                </div>
                {srv.link && (
                  <a
                    href={srv.link}
                    className="mt-4 inline-flex items-center gap-1 text-xs font-bold hover:underline"
                    style={{ color: primary }}
                  >
                    Saiba mais <ChevronRight className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    }

    // ── 5. COMPANY INFO / FICHA CADASTRAL ───────────────────────────────────
    case "company_info":
      return (
        <section id="informacoes" className={`py-16 px-6 ${theme.altSectionBgClass}`}>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>
                Transparência Corporativa
              </p>
              <h2 className={`text-2xl sm:text-3xl font-extrabold ${theme.headingClass}`} style={{ color: primary }}>
                {t(s.title || "Informações da Empresa")}
              </h2>
              <p className={`text-xs max-w-lg mx-auto ${theme.subheadingClass}`}>
                {t(s.subtitle || "Ficha cadastral e registros institucionais.")}
              </p>
            </div>

            <div className={`p-6 sm:p-8 rounded-2xl border shadow-sm ${theme.cardClass}`}>
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <Building2 className="h-6 w-6" style={{ color: primary }} />
                <div>
                  <h3 className="font-bold text-sm">{company?.fantasy_name || s.fantasy_name || ctx.name}</h3>
                  <p className="text-xs text-muted-foreground">{company?.legal_name || s.legal_name || ctx.businessName}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-6 text-xs">
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase">CNPJ</p>
                  <p className="font-mono font-bold mt-1 text-sm">{company?.cnpj || s.cnpj || "00.000.000/0001-00"}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase">Data de Abertura</p>
                  <p className="font-semibold mt-1">{company?.opening_date || s.opening_date || "—"}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase">Situação Cadastral</p>
                  <span className="inline-block mt-1 font-semibold px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-600 font-mono">
                    {company?.registration_status || s.registration_status || "Ativa"}
                  </span>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase">Porte</p>
                  <p className="font-semibold mt-1">{company?.company_size || s.company_size || "Demais"}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase">Tipo</p>
                  <p className="font-semibold mt-1">{company?.company_type || s.company_type || "Matriz"}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase">Capital Social</p>
                  <p className="font-semibold mt-1">{company?.share_capital || s.share_capital || "—"}</p>
                </div>
                <div className="sm:col-span-2 lg:col-span-3 pt-2 border-t border-border">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase">Natureza Jurídica</p>
                  <p className="font-semibold mt-1">{company?.legal_nature || s.legal_nature || "206-2 - Sociedade Empresária Limitada"}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      );

    // ── 6. LOCATION / ONDE ESTAMOS ──────────────────────────────────────────
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
        <section id="localizacao" className="py-16 px-6 max-w-5xl mx-auto">
          <div className="text-center space-y-2 mb-8">
            <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>
              Nossa Sede
            </p>
            <h2 className={`text-2xl sm:text-3xl font-extrabold ${theme.headingClass}`} style={{ color: primary }}>
              {t(s.title || "Onde Estamos")}
            </h2>
            <p className={`text-xs max-w-md mx-auto ${theme.subheadingClass}`}>
              {t(s.subtitle || "Venha tomar um café conosco ou agende um atendimento presencial.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            <div className={`p-6 rounded-2xl border flex flex-col justify-center space-y-4 ${theme.cardClass}`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <MapPin className="h-5 w-5" style={{ color: primary }} />
                </div>
                <h3 className="font-bold text-sm">Endereço Completo</h3>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {fullAddress || "Endereço corporativo cadastrado."}
              </p>
              {s.address_cep && (
                <p className="font-mono text-[11px] text-muted-foreground">
                  CEP: {s.address_cep}
                </p>
              )}
            </div>

            {s.show_map !== false && (
              <div className="md:col-span-2 rounded-2xl overflow-hidden border border-border h-64 shadow-sm">
                <iframe
                  title="Mapa de Localização"
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

    // ── 7. CONTACT / FALE CONOSCO ───────────────────────────────────────────
    case "contact": {
      const displayWpp = s.whatsapp || ctx.whatsapp;
      const displayPhone = s.phone || ctx.phone;
      const displayEmail = s.email || ctx.email;

      return (
        <section id="contato" className={`py-16 px-6 ${theme.altSectionBgClass}`}>
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>
                Canais de Atendimento
              </p>
              <h2 className={`text-2xl sm:text-3xl font-extrabold mt-1 ${theme.headingClass}`} style={{ color: primary }}>
                {t(s.title || "Fale Conosco")}
              </h2>
              <p className={`text-xs mt-1.5 ${theme.subheadingClass}`}>
                {t(s.subtitle || "Entre em contato através de nossos canais oficiais.")}
              </p>
            </div>

            <div className={`flex flex-wrap justify-center gap-6 text-xs font-medium ${theme.isDark ? "text-gray-300" : "text-gray-700"}`}>
              {displayPhone && (
                <a href={`tel:${displayPhone.replace(/\D/g, "")}`} className="inline-flex items-center gap-2 hover:underline">
                  <Phone className="h-4 w-4" style={{ color: primary }} />
                  {formatPhone(displayPhone)}
                </a>
              )}
              {displayWpp && (
                <a href={whatsappHref(displayWpp)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:underline">
                  <MessageCircle className="h-4 w-4" style={{ color: "#25d366" }} />
                  {formatPhone(displayWpp)} (WhatsApp)
                </a>
              )}
              {displayEmail && (
                <a href={`mailto:${displayEmail}`} className="inline-flex items-center gap-2 hover:underline">
                  <Mail className="h-4 w-4" style={{ color: primary }} />
                  {displayEmail}
                </a>
              )}
            </div>

            {/* Social Networks (Only rendered when filled) */}
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {isRealLink(s.instagram) && (
                <a href={s.instagram} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full border border-border bg-card hover:text-primary transition-colors" title="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {isRealLink(s.linkedin) && (
                <a href={s.linkedin} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full border border-border bg-card hover:text-primary transition-colors" title="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {isRealLink(s.facebook) && (
                <a href={s.facebook} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full border border-border bg-card hover:text-primary transition-colors" title="Facebook">
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {isRealLink(s.youtube) && (
                <a href={s.youtube} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full border border-border bg-card hover:text-primary transition-colors" title="YouTube">
                  <Youtube className="h-4 w-4" />
                </a>
              )}
              {isRealLink(s.website) && (
                <a href={s.website} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full border border-border bg-card hover:text-primary transition-colors" title="Website">
                  <Globe className="h-4 w-4" />
                </a>
              )}
            </div>

            {displayWpp && (
              <div className="pt-2">
                <a
                  href={whatsappHref(displayWpp, "Olá! Gostaria de saber mais informações sobre os serviços.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-105 ${theme.buttonPrimaryClass}`}
                  style={{ backgroundColor: primary }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Fale Conosco no WhatsApp
                </a>
              </div>
            )}
          </div>
        </section>
      );
    }

    // ── 8. PRIVACY POLICY / LGPD ────────────────────────────────────────────
    case "privacy_policy":
    case "privacy": {
      const items = (s.items as { title: string; description: string }[]) ?? [];
      return (
        <section id="privacidade" className={`py-16 px-6 ${theme.privacySectionBgClass}`}>
          <div className="max-w-3xl mx-auto space-y-6 text-center">
            <div className="inline-flex items-center justify-center p-2.5 rounded-full mb-1" style={{ backgroundColor: primary + "15" }}>
              <ShieldCheck className="h-6 w-6" style={{ color: primary }} />
            </div>
            <div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold ${theme.headingClass}`}>
                {t(s.title || "Política de Privacidade")}
              </h2>
              {s.subtitle && (
                <p className={`text-xs mt-1.5 max-w-lg mx-auto leading-relaxed ${theme.subheadingClass}`}>
                  {t(s.subtitle)}
                </p>
              )}
            </div>

            {s.body && (
              <div className={`p-5 sm:p-6 text-xs leading-relaxed text-left ${theme.cardClass}`}>
                <p>{t(s.body)}</p>
              </div>
            )}

            {items.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {items.map((item, i) => (
                  <div key={i} className={`p-4 space-y-1 ${theme.cardClass}`}>
                    <h3 className={`font-bold text-xs flex items-center gap-1.5 ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: primary }} />
                      {item.title}
                    </h3>
                    <p className={`text-[11px] leading-relaxed ${theme.isDark ? "text-gray-400" : "text-gray-500"}`}>{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      );
    }

    // Fallbacks
    case "features": {
      const items = (s.items as { icon?: string; title: string; body: string }[]) ?? [];
      return (
        <section id="diferenciais" className="py-16 px-6 max-w-5xl mx-auto">
          <h2 className={`text-2xl sm:text-3xl text-center ${theme.headingClass}`} style={{ color: primary }}>
            {t(s.title || "Diferenciais")}
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, i) => (
              <div key={i} className={`p-4 ${theme.cardClass}`} style={{ borderTopWidth: "4px", borderTopColor: primary }}>
                {item.icon && <span className="text-2xl">{item.icon}</span>}
                <h3 className={`font-bold text-sm mt-2 ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{t(item.title)}</h3>
                <p className={`text-xs mt-1 leading-relaxed ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{t(item.body)}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "services": {
      const items = (s.items as { icon?: string; title: string; body: string }[]) ?? [];
      return (
        <section id="servicos" className={`py-16 px-6 ${theme.altSectionBgClass}`}>
          <div className="max-w-5xl mx-auto">
            <h2 className={`text-2xl sm:text-3xl text-center ${theme.headingClass}`} style={{ color: primary }}>
              {t(s.title || "Nossos Serviços")}
            </h2>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {items.map((item, i) => (
                <div key={i} className={`p-5 ${theme.cardClass}`}>
                  {item.icon && <span className="text-2xl">{item.icon}</span>}
                  <h3 className={`font-bold text-sm mt-3 ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{t(item.title)}</h3>
                  <p className={`text-xs mt-1.5 leading-relaxed ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{t(item.body)}</p>
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
        <section id="como-funciona" className="py-16 px-6 max-w-5xl mx-auto">
          <h2 className={`text-2xl sm:text-3xl text-center ${theme.headingClass}`} style={{ color: primary }}>
            {t(s.title || "Como Funciona")}
          </h2>
          <ol className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, i) => (
              <li key={i} className={`p-5 ${theme.cardClass} flex flex-col justify-between`}>
                <span className={`font-mono text-xl font-extrabold ${theme.stepNumberClass}`} style={{ color: primary }}>
                  {item.number}
                </span>
                <h3 className={`font-bold text-sm mt-2 ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{t(item.title)}</h3>
                <p className={`text-xs mt-1 leading-relaxed ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{t(item.description)}</p>
              </li>
            ))}
          </ol>
        </section>
      );
    }

    case "menu_highlight": {
      const items = (s.items as { name: string; description: string; price: string }[]) ?? [];
      return (
        <section id="cardapio" className="py-16 px-6 max-w-5xl mx-auto">
          <h2 className={`text-2xl sm:text-3xl text-center ${theme.headingClass}`} style={{ color: primary }}>
            {t(s.title || "Cardápio em Destaque")}
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {items.map((item, i) => (
              <div key={i} className={`p-5 ${theme.cardClass}`}>
                <h3 className={`font-bold text-sm ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{t(item.name)}</h3>
                <p className={`text-xs mt-1.5 ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{t(item.description)}</p>
                <p className="font-mono font-bold text-sm mt-3" style={{ color: primary }}>{item.price}</p>
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
        <section id="especialidades" className="py-16 px-6 max-w-5xl mx-auto">
          <h2 className={`text-2xl sm:text-3xl text-center ${theme.headingClass}`} style={{ color: primary }}>
            {t(s.title || "Especialidades")}
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {items.map((item, i) => (
              <div key={i} className={`p-5 ${theme.cardClass} ${theme.cardBorderHighlight}`} style={{ borderLeftColor: primary }}>
                <h3 className={`font-bold text-sm ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{t(item.name)}</h3>
                <p className={`text-xs mt-1.5 ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{t(item.description)}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "faq": {
      const items = (s.items as { question: string; answer: string }[]) ?? [];
      return (
        <section id="faq" className="py-16 px-6 max-w-3xl mx-auto">
          <h2 className={`text-2xl sm:text-3xl text-center ${theme.headingClass}`} style={{ color: primary }}>
            {t(s.title || "Dúvidas Frequentes")}
          </h2>
          <div className="mt-8 space-y-3">
            {items.map((item, i) => (
              <div key={i} className={`p-4 ${theme.cardClass}`}>
                <h3 className={`font-bold text-sm ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{t(item.question)}</h3>
                <p className={`text-xs mt-1.5 leading-relaxed ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{t(item.answer)}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    default:
      return (
        <div className="p-8 border border-dashed text-center text-xs text-gray-400">
          Bloco: <code>{s.type}</code>
        </div>
      );
  }
}
