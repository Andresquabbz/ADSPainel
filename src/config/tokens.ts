export interface TokenPackage {
  id: string;
  slug: string;
  name: string;
  tokens: number;
  price_cents: number;
  is_popular?: boolean;
  sort_order: number;
}

export const TOKEN_CONFIG = {
  /** Custo de cada geração de site com IA */
  tokensPerSite: 2.5,
  /** Quantidade mínima de tokens para liberar o botão de criar site */
  minTokensToCreate: 2.5,

  /**
   * Tabela oficial de pacotes de tokens:
   * Base: 10 tokens = R$ 50,00 (cada site consome 2,5 tokens = 4 sites)
   */
  packages: [
    {
      id: "pkg-starter-10",
      slug: "starter",
      name: "Starter",
      tokens: 10,
      price_cents: 4990, // R$ 49,90
      is_popular: false,
      sort_order: 1,
    },
    {
      id: "pkg-pro-25",
      slug: "pro",
      name: "Pro",
      tokens: 25,
      price_cents: 9990, // R$ 99,90
      is_popular: true,
      sort_order: 2,
    },
    {
      id: "pkg-business-50",
      slug: "business",
      name: "Business",
      tokens: 50,
      price_cents: 19990, // R$ 199,90
      is_popular: false,
      sort_order: 3,
    },
    {
      id: "pkg-agency-100",
      slug: "agency",
      name: "Agency",
      tokens: 100,
      price_cents: 37990, // R$ 379,90
      is_popular: false,
      sort_order: 4,
    },
  ],
} as const;

export function getPackageBySlugOrId(identifier: string) {
  return (
    TOKEN_CONFIG.packages.find(
      (p) => p.slug === identifier || p.id === identifier
    ) || null
  );
}
