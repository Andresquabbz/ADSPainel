/**
 * Design System de Estilos Visuais para Sites do ADSPainel.
 * Cada opção define um conjunto consistente de formatações:
 * - Formato dos cantos (cards, botões, badges)
 * - Sombras e relevos
 * - Cores e fundos das seções alternadas
 * - Estilo de cabeçalho e rodapé
 * - Tipografia e espaçamento dos títulos
 */

export interface VisualStyle {
  id: string;
  name: string;
  description: string;
  isDark: boolean;
  wrapperClass: string;
  headerClass: string;
  footerClass: string;
  
  // Element roundness
  cardRadius: string;
  buttonRadius: string;
  badgeRadius: string;
  
  // Card styles
  cardClass: string;
  cardHighlightClass: string;
  
  // Button styles
  buttonPrimaryClass: string;
  buttonSecondaryClass: string;
  
  // Headings
  headingClass: string;
  subheadingClass: string;
  
  // Section background styles
  heroBgClass: string;
  altSectionBgClass: string;
  accentSectionBgClass: string;
  privacySectionBgClass: string;
  
  // Decorative touches
  cardBorderHighlight: string;
}

const STYLE_MODERNO: VisualStyle = {
  id: "moderno",
  name: "Moderno",
  description: "Design arrojado com cantos suaves, sombras limpas e visual arejado.",
  isDark: false,
  wrapperClass: "bg-white text-slate-900",
  headerClass: "bg-white/95 backdrop-blur-md border-b border-gray-100",
  footerClass: "bg-gray-50 border-t border-gray-100 text-gray-500",
  cardRadius: "rounded-2xl",
  buttonRadius: "rounded-xl",
  badgeRadius: "rounded-full",
  cardClass: "bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all rounded-2xl",
  cardHighlightClass: "bg-white border-2 shadow-md rounded-2xl",
  buttonPrimaryClass: "rounded-xl font-bold shadow-sm hover:shadow transition-all hover:opacity-95 active:scale-95",
  buttonSecondaryClass: "rounded-xl font-bold border transition-all hover:bg-gray-50 active:scale-95",
  headingClass: "font-extrabold tracking-tight text-gray-900",
  subheadingClass: "text-gray-600",
  heroBgClass: "relative overflow-hidden",
  altSectionBgClass: "bg-slate-50/70 border-y border-gray-100/80",
  accentSectionBgClass: "bg-gray-50/50",
  privacySectionBgClass: "bg-gray-50/80 border-t border-gray-100",
  cardBorderHighlight: "border-l-4",
};

const STYLE_MINIMALISTA: VisualStyle = {
  id: "minimalista",
  name: "Minimalista",
  description: "Linhas retas suíças (0px), sem sombras, foco em contraste puro e espaço.",
  isDark: false,
  wrapperClass: "bg-white text-black",
  headerClass: "bg-white border-b-2 border-black",
  footerClass: "bg-white border-t-2 border-black text-black",
  cardRadius: "rounded-none",
  buttonRadius: "rounded-none",
  badgeRadius: "rounded-none",
  cardClass: "bg-white border-2 border-black shadow-none rounded-none transition-transform hover:-translate-y-0.5",
  cardHighlightClass: "bg-black text-white border-2 border-black rounded-none",
  buttonPrimaryClass: "rounded-none font-mono uppercase tracking-wider font-bold shadow-none hover:bg-black hover:text-white transition-all",
  buttonSecondaryClass: "rounded-none font-mono uppercase tracking-wider font-bold border-2 border-black hover:bg-black hover:text-white transition-all",
  headingClass: "font-bold uppercase tracking-wider text-black",
  subheadingClass: "text-gray-700",
  heroBgClass: "border-b-2 border-black",
  altSectionBgClass: "bg-white border-b-2 border-black",
  accentSectionBgClass: "bg-gray-50 border-y-2 border-black",
  privacySectionBgClass: "bg-white border-t-2 border-black",
  cardBorderHighlight: "border-l-8 border-black",
};

const STYLE_ELEGANTE: VisualStyle = {
  id: "elegante",
  name: "Elegante",
  description: "Sofisticação clássica, fundos linho/creme e toques editoriais refinados.",
  isDark: false,
  wrapperClass: "bg-[#FAF8F5] text-stone-900",
  headerClass: "bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200",
  footerClass: "bg-[#F3EFEA] border-t border-stone-200 text-stone-600",
  cardRadius: "rounded-lg",
  buttonRadius: "rounded-md",
  badgeRadius: "rounded-full",
  cardClass: "bg-white border border-stone-200/80 shadow-sm hover:shadow-md transition-all rounded-lg",
  cardHighlightClass: "bg-white border border-stone-400 shadow-md rounded-lg",
  buttonPrimaryClass: "rounded-md font-medium tracking-wide shadow-sm hover:shadow transition-all hover:opacity-95",
  buttonSecondaryClass: "rounded-md font-medium tracking-wide border border-stone-300 hover:bg-stone-50 transition-all",
  headingClass: "font-serif font-normal tracking-normal text-stone-900",
  subheadingClass: "text-stone-600 font-serif italic",
  heroBgClass: "bg-gradient-to-b from-[#FAF8F5] to-[#F5EFE6]",
  altSectionBgClass: "bg-[#F5EFE6]/60 border-y border-stone-200/60",
  accentSectionBgClass: "bg-[#EFE7DC]/50",
  privacySectionBgClass: "bg-[#F3EFEA] border-t border-stone-200",
  cardBorderHighlight: "border-l-2 border-stone-400",
};

const STYLE_CORPORATIVO: VisualStyle = {
  id: "corporativo",
  name: "Corporativo",
  description: "Estrutura sólida institucional, azul/ardósia, transmitindo autoridade e segurança.",
  isDark: false,
  wrapperClass: "bg-slate-50 text-slate-900",
  headerClass: "bg-white border-b border-slate-200 shadow-sm",
  footerClass: "bg-slate-900 text-slate-400 border-t border-slate-800",
  cardRadius: "rounded-md",
  buttonRadius: "rounded-md",
  badgeRadius: "rounded",
  cardClass: "bg-white border border-slate-200 shadow-sm hover:shadow transition-all rounded-md",
  cardHighlightClass: "bg-white border-2 border-slate-400 shadow rounded-md",
  buttonPrimaryClass: "rounded-md font-bold tracking-tight shadow-sm hover:opacity-95 active:scale-95 transition-all",
  buttonSecondaryClass: "rounded-md font-bold border border-slate-300 hover:bg-slate-100 transition-all",
  headingClass: "font-bold tracking-tight text-slate-900",
  subheadingClass: "text-slate-600",
  heroBgClass: "bg-white border-b border-slate-200",
  altSectionBgClass: "bg-slate-100/70 border-y border-slate-200/80",
  accentSectionBgClass: "bg-slate-50",
  privacySectionBgClass: "bg-slate-100 border-t border-slate-200",
  cardBorderHighlight: "border-l-4 border-slate-600",
};

const STYLE_CRIATIVO: VisualStyle = {
  id: "criativo",
  name: "Criativo",
  description: "Energético e jovem com cantos super arredondados (3xl), botões pill e gradientes.",
  isDark: false,
  wrapperClass: "bg-white text-slate-900",
  headerClass: "bg-white/90 backdrop-blur-lg border-b border-purple-100 shadow-sm",
  footerClass: "bg-gradient-to-br from-purple-50/50 to-pink-50/50 border-t border-purple-100 text-slate-600",
  cardRadius: "rounded-3xl",
  buttonRadius: "rounded-full",
  badgeRadius: "rounded-full",
  cardClass: "bg-white border-2 border-purple-50 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all rounded-3xl",
  cardHighlightClass: "bg-white border-2 border-purple-300 shadow-lg rounded-3xl",
  buttonPrimaryClass: "rounded-full font-extrabold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all",
  buttonSecondaryClass: "rounded-full font-extrabold border-2 border-purple-200 hover:bg-purple-50 hover:scale-105 active:scale-95 transition-all",
  headingClass: "font-black tracking-tight text-slate-900",
  subheadingClass: "text-slate-600 font-medium",
  heroBgClass: "bg-gradient-to-br from-purple-50/60 via-pink-50/30 to-amber-50/40",
  altSectionBgClass: "bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-blue-50/30 border-y border-purple-50",
  accentSectionBgClass: "bg-purple-50/30",
  privacySectionBgClass: "bg-purple-50/40 border-t border-purple-100",
  cardBorderHighlight: "border-l-4 border-purple-400",
};

const STYLE_LUXUOSO: VisualStyle = {
  id: "luxuoso",
  name: "Luxuoso",
  description: "Tema VIP Dark Obsidian com detalhes dourados, bordas refinadas e alto padrão.",
  isDark: true,
  wrapperClass: "bg-[#0c0c0e] text-gray-100",
  headerClass: "bg-[#0c0c0e]/95 backdrop-blur-md border-b border-amber-500/20 text-gray-100",
  footerClass: "bg-[#08080a] border-t border-amber-500/20 text-gray-400",
  cardRadius: "rounded-xl",
  buttonRadius: "rounded-md",
  badgeRadius: "rounded-full",
  cardClass: "bg-[#141418] border border-amber-500/20 shadow-xl hover:border-amber-500/40 transition-all rounded-xl",
  cardHighlightClass: "bg-[#18181f] border-2 border-amber-400/50 shadow-2xl rounded-xl",
  buttonPrimaryClass: "rounded-md font-bold tracking-widest uppercase text-xs shadow-lg hover:shadow-amber-500/20 transition-all hover:opacity-95 active:scale-95",
  buttonSecondaryClass: "rounded-md font-bold tracking-widest uppercase text-xs border border-amber-500/30 hover:bg-amber-500/10 text-amber-300 transition-all",
  headingClass: "font-light tracking-[0.15em] uppercase text-amber-100",
  subheadingClass: "text-gray-400 font-light",
  heroBgClass: "bg-gradient-to-b from-[#0c0c0e] via-[#141418] to-[#0c0c0e]",
  altSectionBgClass: "bg-[#121216] border-y border-amber-500/10",
  accentSectionBgClass: "bg-[#18181f]",
  privacySectionBgClass: "bg-[#0f0f13] border-t border-amber-500/20",
  cardBorderHighlight: "border-l-2 border-amber-400",
};

const STYLE_TECNOLOGICO: VisualStyle = {
  id: "tecnologico",
  name: "Tecnológico",
  description: "Tema Cyber Dark Tech, grid futurista, bordas neon e badges em fonte mono.",
  isDark: true,
  wrapperClass: "bg-[#080b11] text-slate-100",
  headerClass: "bg-[#080b11]/95 backdrop-blur-md border-b border-cyan-500/20 text-slate-100",
  footerClass: "bg-[#05070a] border-t border-cyan-500/20 text-slate-400",
  cardRadius: "rounded-lg",
  buttonRadius: "rounded-md",
  badgeRadius: "rounded-sm",
  cardClass: "bg-[#0d121d] border border-cyan-500/20 hover:border-cyan-500/60 shadow-lg hover:shadow-cyan-500/10 transition-all rounded-lg",
  cardHighlightClass: "bg-[#111726] border-2 border-cyan-400 shadow-cyan-500/20 shadow-lg rounded-lg",
  buttonPrimaryClass: "rounded-md font-mono text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-cyan-500/30 transition-all hover:opacity-95 active:scale-95",
  buttonSecondaryClass: "rounded-md font-mono text-xs font-bold uppercase tracking-wider border border-cyan-500/40 hover:bg-cyan-500/10 text-cyan-400 transition-all",
  headingClass: "font-mono font-bold tracking-tight text-white",
  subheadingClass: "text-slate-400 font-mono text-xs",
  heroBgClass: "bg-gradient-to-b from-[#080b11] via-[#0d121d] to-[#080b11]",
  altSectionBgClass: "bg-[#0b0e17] border-y border-slate-800",
  accentSectionBgClass: "bg-[#0d121d]",
  privacySectionBgClass: "bg-[#07090e] border-t border-cyan-500/20",
  cardBorderHighlight: "border-l-4 border-cyan-400",
};

export const VISUAL_STYLES: Record<string, VisualStyle> = {
  Moderno: STYLE_MODERNO,
  Minimalista: STYLE_MINIMALISTA,
  Elegante: STYLE_ELEGANTE,
  Corporativo: STYLE_CORPORATIVO,
  Criativo: STYLE_CRIATIVO,
  Luxuoso: STYLE_LUXUOSO,
  Tecnológico: STYLE_TECNOLOGICO,
};

/**
 * Retorna o tema visual correspondente. Caso não seja informado ou não exista,
 * retorna o estilo "Moderno" por padrão.
 */
export function getVisualStyle(styleName?: string | null): VisualStyle {
  if (!styleName) return STYLE_MODERNO;
  
  // Normalização caso haja variações de acentuação
  const normalized = styleName.trim();
  const match = VISUAL_STYLES[normalized];
  if (match) {
    return match;
  }
  
  const lower = normalized.toLowerCase();
  if (lower.includes("minimal")) return STYLE_MINIMALISTA;
  if (lower.includes("elegan")) return STYLE_ELEGANTE;
  if (lower.includes("corporat")) return STYLE_CORPORATIVO;
  if (lower.includes("criativ")) return STYLE_CRIATIVO;
  if (lower.includes("luxu")) return STYLE_LUXUOSO;
  if (lower.includes("tecnol")) return STYLE_TECNOLOGICO;

  return STYLE_MODERNO;
}
