import type { AnySection } from "./AddSectionModal";
import type { ViewportMode } from "./EditorHeader";
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { getVisualStyle, type VisualStyle } from "@/lib/visual-styles";

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
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatPhone(raw: string): string {
  if (!raw) return "";
  const d = raw.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return raw;
}

function whatsappHref(raw: string): string {
  if (!raw) return "#";
  return `https://wa.me/55${raw.replace(/\D/g, "")}`;
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
}: LivePreviewCanvasProps) {
  const theme = getVisualStyle(style);
  const containerWidths: Record<ViewportMode, string> = {
    desktop: "w-full max-w-full",
    tablet: "w-[768px] max-w-[768px]",
    mobile: "w-[375px] max-w-[375px]",
  };

  return (
    <main className="flex-1 bg-muted/40 overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
      <div
        className={`shadow-xl transition-all duration-300 rounded-lg overflow-hidden border border-border min-h-[90vh] flex flex-col ${theme.wrapperClass} ${containerWidths[viewport]}`}
        style={{ fontFamily: fontFamily || "sans-serif" }}
      >
        {/* Site Header */}
        <header
          className={`px-6 py-4 flex items-center justify-between sticky top-0 z-10 ${theme.headerClass}`}
          style={{ borderColor: primaryColor + "25" }}
        >
          <span
            className={`text-lg font-extrabold tracking-tight truncate max-w-[200px] ${theme.headingClass}`}
            style={{ color: primaryColor }}
          >
            {name || businessName || "Nome do Site"}
          </span>

          <nav className={`hidden sm:flex items-center gap-6 text-xs font-semibold ${theme.isDark ? "text-gray-300" : "text-gray-500"}`}>
            <a href="#sobre" className="hover:opacity-80 transition-opacity">Sobre</a>
            <a href="#contato" className="hover:opacity-80 transition-opacity">Contato</a>
          </nav>

          {whatsapp && (
            <a
              href={whatsappHref(whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90 shrink-0 ${theme.buttonPrimaryClass}`}
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

            return (
              <div
                key={idx}
                onClick={() => onSelectSection(idx)}
                className={`relative group transition-all cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-primary ring-inset z-10"
                    : "hover:ring-1 hover:ring-primary/40 hover:ring-inset"
                }`}
              >
                {/* Floating section badge on hover/select */}
                <div
                  className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-opacity ${
                    isSelected
                      ? "bg-primary text-white opacity-100 shadow-sm"
                      : "bg-slate-900/80 text-white opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {section.type} {isSelected ? "(Editando)" : "— Clique para editar"}
                </div>

                {/* ── Render Block Content ── */}
                {renderSectionContent(section, {
                  primaryColor,
                  fontFamily,
                  theme,
                  name: name || businessName,
                  businessName,
                  whatsapp,
                  phone,
                  email,
                  city,
                  state,
                  address,
                })}
              </div>
            );
          })}

          {!sections.some((s) => s.type === "privacy_policy" || s.type === "privacy") && (
            <div className="relative group border-2 border-transparent">
              {renderSectionContent(
                {
                  type: "privacy_policy",
                  title: "Política de Privacidade",
                  subtitle: `Compromisso com a sua privacidade e conformidade com a LGPD.`,
                  body: `A ${businessName || name || "Empresa"} preza pela segurança, confidencialidade e transparência no tratamento dos dados pessoais de seus clientes e usuários, em conformidade com a Lei Geral de Proteção de Dados (LGPD).`,
                  items: [
                    { title: "Coleta e Finalidade", description: "Dados utilizados exclusivamente para atendimento e prestação dos serviços solicitados." },
                    { title: "Proteção de Dados", description: "Garantia de sigilo e não compartilhamento indevido com terceiros." },
                    { title: "Direitos do Titular", description: "Livre solicitação de exclusão ou atualização de dados pessoais." },
                  ],
                },
                {
                  primaryColor,
                  fontFamily,
                  theme,
                  name: name || businessName,
                  businessName,
                  whatsapp,
                  phone,
                  email,
                  city,
                  state,
                  address,
                }
              )}
            </div>
          )}

          {sections.length === 0 && (
            <div className="py-24 text-center px-4">
              <p className="text-gray-400 text-sm">Nenhuma seção adicionada ainda.</p>
              <p className="text-xs text-gray-400 mt-1">Use a barra lateral para adicionar blocos.</p>
            </div>
          )}
        </div>

        {/* Site Footer */}
        <footer
          className={`py-12 px-6 text-center text-xs ${theme.footerClass}`}
          style={{ borderColor: primaryColor + "25" }}
        >
          <p className={`font-semibold ${theme.isDark ? "text-gray-200" : "text-gray-700"}`}>
            © {new Date().getFullYear()} {businessName || name || "Empresa"}
            {(city || state) && <span> · {[city, state].filter(Boolean).join(" — ")}</span>}
          </p>

          {cnpj && (
            <p className="mt-1.5 font-mono text-[11px] opacity-80">
              CNPJ: {cnpj}
            </p>
          )}

          {email && (
            <p className="mt-1 opacity-80">
              <a href={`mailto:${email}`} className="hover:underline">{email}</a>
            </p>
          )}

          <div className="pt-4 border-t border-current/10 mt-4 flex flex-col sm:flex-row items-center justify-between opacity-70 text-[10px] gap-2">
            <a href="#privacidade" className="hover:underline transition-colors">
              Política de Privacidade (LGPD)
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
}

function renderSectionContent(s: AnySection, ctx: RenderContext) {
  const primary = ctx.primaryColor;
  const theme = ctx.theme;

  switch (s.type) {
    case "hero":
      return (
        <section className={`py-20 px-6 text-center ${theme.heroBgClass}`} style={{ backgroundColor: theme.isDark ? undefined : primary + "12" }}>
          <div className="max-w-3xl mx-auto space-y-4">
            {s.badge && (
              <span
                className={`inline-block px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-white ${theme.badgeRadius}`}
                style={{ backgroundColor: primary }}
              >
                {String(s.badge)}
              </span>
            )}
            <h1
              className={`text-4xl sm:text-5xl ${theme.headingClass} leading-tight`}
              style={{ color: primary }}
            >
              {String(s.title || "Título do Hero")}
            </h1>
            <p className={`text-base sm:text-lg ${theme.subheadingClass} max-w-xl mx-auto leading-relaxed`}>
              {String(s.subtitle || "Subtítulo com a proposta de valor do negócio.")}
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-3">
              {s.cta_label && (
                <a
                  href={String(s.cta_href || "#contato")}
                  className={`px-6 py-3 text-sm text-white ${theme.buttonPrimaryClass}`}
                  style={{ backgroundColor: primary }}
                >
                  {String(s.cta_label)}
                </a>
              )}
              {ctx.whatsapp && (
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

    case "features": {
      const items = (s.items as { icon?: string; title: string; body: string }[]) ?? [];
      return (
        <section className="py-16 px-6 max-w-5xl mx-auto">
          <h2 className={`text-2xl sm:text-3xl text-center ${theme.headingClass}`} style={{ color: primary }}>
            {String(s.title || "Diferenciais")}
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, i) => (
              <div key={i} className={`p-4 ${theme.cardClass}`} style={{ borderTopWidth: "4px", borderTopColor: primary }}>
                {item.icon && <span className="text-2xl">{item.icon}</span>}
                <h3 className={`font-bold text-sm mt-2 ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{item.title}</h3>
                <p className={`text-xs mt-1 leading-relaxed ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "services": {
      const items = (s.items as { icon?: string; title: string; body: string }[]) ?? [];
      return (
        <section className={`py-16 px-6 ${theme.altSectionBgClass}`}>
          <div className="max-w-5xl mx-auto">
            <h2 className={`text-2xl sm:text-3xl text-center ${theme.headingClass}`} style={{ color: primary }}>
              {String(s.title || "Nossos Serviços")}
            </h2>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {items.map((item, i) => (
                <div key={i} className={`p-5 ${theme.cardClass}`}>
                  {item.icon && <span className="text-2xl">{item.icon}</span>}
                  <h3 className={`font-bold text-sm mt-3 ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{item.title}</h3>
                  <p className={`text-xs mt-1.5 leading-relaxed ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{item.body}</p>
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
        <section className="py-16 px-6 max-w-5xl mx-auto">
          <h2 className={`text-2xl sm:text-3xl text-center ${theme.headingClass}`} style={{ color: primary }}>
            {String(s.title || "Como Funciona")}
          </h2>
          <ol className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, i) => (
              <li key={i} className={`border-t-2 pt-4`} style={{ borderColor: primary }}>
                <span className="font-mono text-2xl font-bold" style={{ color: primary }}>
                  {item.number}
                </span>
                <h3 className={`font-bold text-sm mt-2 ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{item.title}</h3>
                <p className={`text-xs mt-1 leading-relaxed ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{item.description}</p>
              </li>
            ))}
          </ol>
        </section>
      );
    }

    case "about":
      return (
        <section id="sobre" className={`py-16 px-6 ${theme.accentSectionBgClass}`}>
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className={`text-2xl sm:text-3xl ${theme.headingClass}`} style={{ color: primary }}>
              {String(s.title || "Sobre Nós")}
            </h2>
            {s.highlight && (
              <p className="font-semibold text-base" style={{ color: primary }}>
                {String(s.highlight)}
              </p>
            )}
            <p className={`text-sm leading-relaxed ${theme.isDark ? "text-gray-300" : "text-gray-600"}`}>
              {String(s.body || "História e missão da empresa.")}
            </p>
          </div>
        </section>
      );

    case "menu_highlight": {
      const items = (s.items as { name: string; description: string; price: string }[]) ?? [];
      return (
        <section className="py-16 px-6 max-w-5xl mx-auto">
          <h2 className={`text-2xl sm:text-3xl text-center ${theme.headingClass}`} style={{ color: primary }}>
            {String(s.title || "Cardápio em Destaque")}
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {items.map((item, i) => (
              <div key={i} className={`p-4 ${theme.cardClass}`}>
                <h3 className={`font-bold text-sm ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{item.name}</h3>
                <p className={`text-xs mt-1 ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{item.description}</p>
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
        <section className="py-16 px-6 max-w-5xl mx-auto">
          <h2 className={`text-2xl sm:text-3xl text-center ${theme.headingClass}`} style={{ color: primary }}>
            {String(s.title || "Categorias")}
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {items.map((item, i) => (
              <div key={i} className={`p-4 ${theme.cardClass} ${theme.cardBorderHighlight}`} style={{ borderLeftColor: primary }}>
                <h3 className={`font-bold text-sm ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{item.name}</h3>
                <p className={`text-xs mt-1 ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "faq": {
      const items = (s.items as { question: string; answer: string }[]) ?? [];
      return (
        <section className="py-16 px-6 max-w-3xl mx-auto">
          <h2 className={`text-2xl sm:text-3xl text-center ${theme.headingClass}`} style={{ color: primary }}>
            {String(s.title || "Dúvidas Frequentes")}
          </h2>
          <div className="mt-8 space-y-3">
            {items.map((item, i) => (
              <div key={i} className={`p-4 ${theme.cardClass}`}>
                <h3 className={`font-bold text-sm ${theme.isDark ? "text-gray-100" : "text-gray-900"}`}>{item.question}</h3>
                <p className={`text-xs mt-1.5 leading-relaxed ${theme.isDark ? "text-gray-400" : "text-gray-600"}`}>{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "contact":
      return (
        <section id="contato" className={`py-16 px-6 ${theme.altSectionBgClass}`}>
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className={`text-2xl sm:text-3xl ${theme.headingClass}`} style={{ color: primary }}>
              {String(s.title || "Fale Conosco")}
            </h2>
            <div className={`flex flex-wrap justify-center gap-6 text-xs font-medium ${theme.isDark ? "text-gray-300" : "text-gray-700"}`}>
              {ctx.phone && (
                <a href={`tel:${ctx.phone.replace(/\D/g, "")}`} className="inline-flex items-center gap-2 hover:underline">
                  <Phone className="h-4 w-4" style={{ color: primary }} />
                  {formatPhone(ctx.phone)}
                </a>
              )}
              {ctx.whatsapp && (
                <a href={whatsappHref(ctx.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:underline">
                  <MessageCircle className="h-4 w-4" style={{ color: "#25d366" }} />
                  {formatPhone(ctx.whatsapp)} (WhatsApp)
                </a>
              )}
              {ctx.email && (
                <a href={`mailto:${ctx.email}`} className="inline-flex items-center gap-2 hover:underline">
                  <Mail className="h-4 w-4" style={{ color: primary }} />
                  {ctx.email}
                </a>
              )}
              {(ctx.address || ctx.city) && (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" style={{ color: primary }} />
                  {[ctx.address, ctx.city, ctx.state].filter(Boolean).join(", ")}
                </span>
              )}
            </div>

            {ctx.whatsapp && (
              <div className="pt-2">
                <a
                  href={whatsappHref(ctx.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-6 py-3 text-sm text-white ${theme.buttonPrimaryClass}`}
                  style={{ backgroundColor: primary }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Enviar mensagem no WhatsApp
                </a>
              </div>
            )}
          </div>
        </section>
      );

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
              <h2 className={`text-2xl sm:text-3xl ${theme.headingClass}`}>
                {String(s.title || "Política de Privacidade")}
              </h2>
              {s.subtitle && (
                <p className={`text-xs mt-1.5 max-w-lg mx-auto leading-relaxed ${theme.subheadingClass}`}>
                  {String(s.subtitle)}
                </p>
              )}
            </div>

            {s.body && (
              <div className={`p-5 sm:p-6 text-xs leading-relaxed text-left ${theme.cardClass}`}>
                <p>{String(s.body)}</p>
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

    default:
      return (
        <div className="p-8 border border-dashed text-center text-xs text-gray-400">
          Bloco: <code>{s.type}</code>
        </div>
      );
  }
}
