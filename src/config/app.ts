/**
 * Central platform configuration.
 * Change the brand here and it propagates across the whole product.
 */
export const APP_CONFIG = {
  name: "ADSPainel",
  tagline: "Crie seu site profissional com inteligência artificial",
  subtitle:
    "Transforme sua ideia em um site completo, moderno e pronto para publicar em poucos minutos. Sem códigos, sem barreiras.",
  rootDomain: (typeof import.meta !== "undefined" && (import.meta as unknown as { env: Record<string, string> }).env?.VITE_ROOT_DOMAIN) || "adspainel.com",
  cnameTarget: (typeof import.meta !== "undefined" && (import.meta as unknown as { env: Record<string, string> }).env?.VITE_CNAME_TARGET) || "cname.adspainel.com",
  supportEmail: "suporte@adspainel.com",
  company: "ADSPAINEL TECNOLOGIA LTDA",
} as const;

export const subdomainFor = (slug: string) => `${slug}.${APP_CONFIG.rootDomain}`;

export const RESERVED_SLUGS = [
  "www",
  "app",
  "api",
  "admin",
  "dashboard",
  "login",
  "register",
  "adspainel",
  "siteai",
  "cdn",
  "mail",
  "static",
  "preview",
  "suporte",
  "support",
];

export const SITE_CATEGORIES = [
  "Restaurante",
  "Loja",
  "Serviços",
  "Imobiliária",
  "Advocacia",
  "Saúde",
  "Tecnologia",
  "Marketing",
  "Construção",
  "Profissional liberal",
];

export const SITE_GOALS = [
  "Captar clientes",
  "Vender produtos",
  "Gerar leads",
  "Apresentar serviços",
  "Portfólio",
  "Blog",
  "Landing page",
];

export const SITE_STYLES = [
  "Moderno",
  "Minimalista",
  "Elegante",
  "Corporativo",
  "Criativo",
  "Luxuoso",
  "Tecnológico",
];

export const SITE_FONTS = [
  "Hanken Grotesk",
  "JetBrains Mono",
  "Georgia",
  "Helvetica",
];

/** Token cost table — every AI operation debits the user balance. */
export const TOKEN_COSTS = {
  generateWebsite: 25,
  generatePage: 10,
  generateSection: 5,
  generateText: 2,
  generateSEO: 3,
} as const;

export const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
