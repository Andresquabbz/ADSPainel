/**
 * Template de Landing Page Empresarial: Empresa Institucional
 * Categoria: Institucional / Serviços / Financeiro
 * 
 * Estrutura profissional baseada em dados dinâmicos da empresa,
 * com suporte a variáveis {{company.*}}, ficha cadastral, serviços dinâmicos,
 * localização com mapa, política de privacidade LGPD e botão WhatsApp flutuante.
 */

export interface CompanyServiceItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  link?: string;
  status: "active" | "inactive";
}

export interface FloatingWhatsappConfig {
  enabled: boolean;
  phone: string;
  message: string;
  label: string;
}

export interface PrivacyConfig {
  policy_text: string;
  terms_text: string;
  dpo_contact: string;
}

export interface CompanyData {
  // Identidade
  name: string;
  fantasy_name: string;
  legal_name: string;
  cnpj: string;
  logo_url?: string;
  favicon_url?: string;

  // Informações cadastrais
  opening_date: string;
  company_size: string;
  legal_nature: string;
  registration_status: string;
  company_type: string;
  share_capital: string;

  // Localização
  address_street: string;
  address_number: string;
  address_complement?: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  address_cep: string;
  show_map: boolean;

  // Contato
  phone: string;
  whatsapp: string;
  email: string;
  website?: string;

  // Redes sociais
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;

  // Institucional
  mission_title: string;
  mission_description: string;
  about_title: string;
  about_description: string;
  foundation_year: string;
  activity_area: string;
  about_highlight?: string;

  // Niche customizations
  hero_badge?: string;
  hero_subtitle?: string;
  services_title?: string;
  services_subtitle?: string;

  // Serviços
  services: CompanyServiceItem[];

  // Botão flutuante
  floating_whatsapp: FloatingWhatsappConfig;

  // Privacidade
  privacy: PrivacyConfig;

  // Aparência & Customização
  primary_color?: string;
  secondary_color?: string;
  button_color?: string;
  text_color?: string;
  bg_color?: string;
  font_family?: string;
  border_radius?: "none" | "sm" | "md" | "lg" | "full";
  button_style?: "solid" | "outline" | "pill";
  shadow_intensity?: "none" | "soft" | "medium" | "hard";
  section_spacing?: "compact" | "normal" | "spacious";
}

export interface TemplateSection {
  type: string;
  id?: string;
  enabled?: boolean;
  [key: string]: unknown;
}

/**
 * Dados fictícios para preview inicial sem referenciar marcas ou empresas reais.
 */
export const INITIAL_COMPANY_DATA: CompanyData = {
  name: "Atlas Soluções Corporativas",
  fantasy_name: "Atlas Corporativo",
  legal_name: "Atlas Consultoria e Serviços Empresariais Ltda.",
  cnpj: "00.000.000/0001-00",
  logo_url: "",
  favicon_url: "",

  opening_date: "15/03/2018",
  company_size: "Demais (Médio Porte)",
  legal_nature: "206-2 - Sociedade Empresária Limitada",
  registration_status: "Ativa",
  company_type: "Matriz",
  share_capital: "R$ 150.000,00",

  address_street: "Avenida Paulista",
  address_number: "1000",
  address_complement: "Conjunto 1402",
  address_neighborhood: "Bela Vista",
  address_city: "São Paulo",
  address_state: "SP",
  address_cep: "01310-100",
  show_map: true,

  phone: "(11) 3210-4000",
  whatsapp: "(11) 98765-4321",
  email: "contato@atlascorp.com.br",
  website: "https://atlascorp.com.br",

  instagram: "https://instagram.com/atlascorp",
  facebook: "https://facebook.com/atlascorp",
  linkedin: "https://linkedin.com/company/atlascorp",
  youtube: "",
  tiktok: "",

  mission_title: "Nossa Missão",
  mission_description:
    "Prover soluções estratégicas e apoio institucional com transparência, agilidade e excelência, capacitando nossos clientes para atingir novos patamares de governança e sustentabilidade corporativa.",

  about_title: "Tradição, Excelência e Resultados",
  about_description:
    "Com atuação consolidada no mercado, a Atlas Soluções Corporativas nasceu com o propósito de descomplicar processos burocráticos e potencializar a gestão empresarial. Nossa equipe multidisciplinar combina conhecimento técnico e compromisso ético para entregar serviços sob medida com alto padrão de qualidade e total conformidade com a legislação vigente.",
  foundation_year: "2018",
  activity_area: "Consultoria e Serviços Empresariais",

  services: [
    {
      id: "srv-1",
      name: "Preparação de Documentos",
      description: "Elaboração, revisão técnica e gestão de contratos e documentos corporativos em conformidade legal.",
      icon: "FileText",
      category: "Documental",
      link: "#contato",
      status: "active",
    },
    {
      id: "srv-2",
      name: "Apoio Administrativo",
      description: "Suporte operacional e consultoria para otimização de fluxos administrativos internos.",
      icon: "Briefcase",
      category: "Gestão",
      link: "#contato",
      status: "active",
    },
    {
      id: "srv-3",
      name: "Informações Cadastrais",
      description: "Diagnóstico, regularização e atualização de registros corporativos perante os órgãos competentes.",
      icon: "Building",
      category: "Cadastral",
      link: "#contato",
      status: "active",
    },
    {
      id: "srv-4",
      name: "Consultoria Estratégica",
      description: "Planejamento estruturado para expansão, governança e conformidade com órgãos reguladores.",
      icon: "TrendingUp",
      category: "Estratégia",
      link: "#contato",
      status: "active",
    },
  ],

  floating_whatsapp: {
    enabled: true,
    phone: "(11) 98765-4321",
    message: "Olá! Gostaria de saber mais informações sobre os serviços.",
    label: "Fale Conosco",
  },

  privacy: {
    policy_text:
      "Nossa instituição assume o compromisso rigoroso com a segurança, sigilo e proteção dos dados pessoais de nossos clientes, parceiros e usuários. Em conformidade integral com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018), coletamos apenas as informações estritamente necessárias para prestação dos serviços contratados, resposta a contatos e cumprimento de obrigações legais.",
    terms_text:
      "O acesso e a utilização dos serviços e canais desta plataforma estão condicionados à aceitação e cumprimento destes termos. As informações prestadas destinam-se exclusivamente a fins de relacionamento institucional e contratação de serviços.",
    dpo_contact: "privacidade@atlascorp.com.br",
  },

  primary_color: "#1e3a8a",
  secondary_color: "#0f172a",
  button_color: "#2563eb",
  text_color: "#0f172a",
  bg_color: "#ffffff",
  font_family: "Hanken Grotesk",
  border_radius: "md",
  button_style: "solid",
  shadow_intensity: "soft",
  section_spacing: "normal",
};

/**
 * Resolução dinâmica de variáveis {{company.*}}
 */
export function resolveCompanyVariables(text: string, data: Partial<CompanyData>): string {
  if (!text) return "";
  const addressFormatted = [
    data.address_street,
    data.address_number,
    data.address_neighborhood,
    data.address_city,
    data.address_state,
  ]
    .filter(Boolean)
    .join(", ");

  const replacements: Record<string, string> = {
    "{{company.name}}": data.name || "",
    "{{company.fantasyName}}": data.fantasy_name || data.name || "",
    "{{company.legalName}}": data.legal_name || data.name || "",
    "{{company.cnpj}}": data.cnpj || "",
    "{{company.phone}}": data.phone || "",
    "{{company.whatsapp}}": data.whatsapp || "",
    "{{company.email}}": data.email || "",
    "{{company.address}}": addressFormatted,
    "{{company.city}}": data.address_city || "",
    "{{company.state}}": data.address_state || "",
    "{{company.mission}}": data.mission_description || "",
    "{{company.about}}": data.about_description || "",
    "{{company.foundationYear}}": data.foundation_year || "",
    "{{company.activityArea}}": data.activity_area || "",
    "{{company.instagram}}": data.instagram || "",
    "{{company.website}}": data.website || "",
  };

  let result = text;
  for (const [token, value] of Object.entries(replacements)) {
    result = result.split(token).join(value);
  }
  return result;
}

/**
 * Heurística inteligente para identificação de nicho e geração de Missão, Quem Somos e Serviços especializados
 */
export function getNicheDefaults(activityArea: string = "", companyName: string = "") {
  const norm = (activityArea + " " + companyName)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Confecção, Roupas, Moda, Têxtil, Vestuário
  if (
    norm.includes("confeccao") ||
    norm.includes("roupa") ||
    norm.includes("vestuario") ||
    norm.includes("textil") ||
    norm.includes("moda")
  ) {
    return {
      hero_badge: "Qualidade Têxtil & Moda",
      hero_subtitle: `Especialistas em desenvolvimento, produção e comércio de artigos do vestuário com excelência em modelagem e acabamento.`,
      mission_title: "Nossa Missão",
      mission_description: `Desenvolver e produzir artigos de vestuário e moda com alto padrão de qualidade, durabilidade e conforto, valorizando o design têxtil e superando as expectativas dos nossos clientes e parceiros comerciais.`,
      about_title: `Sobre a ${companyName || "Nossa Confecção"}`,
      about_description: `Especializada na confecção e comercialização de artigos do vestuário, nossa empresa atua com foco em matérias-primas rigorosamente selecionadas, corte de precisão e processos de costura de alto padrão, entregando peças com caimento impecável e elegância.`,
      about_highlight: "Excelência têxtil, modelagem anatômica e acabamento de alto padrão.",
      services_title: "Soluções Especializadas em Vestuário",
      services_subtitle: "Produtos e serviços confeccionados com rigor técnico, pontualidade e estilo.",
      services: [
        {
          id: "srv-1",
          name: "Confecção e Produção Sob Medida / Private Label",
          description: "Desenvolvimento e fabricação com controle rigoroso de qualidade têxtil, corte computadorizado e costura reforçada.",
          icon: "Scissors",
          category: "Produção",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-2",
          name: "Coleções Prêt-à-Porter & Varejo",
          description: "Peças exclusivas e versáteis alinhadas às últimas tendências de moda, tecido de toque suave e alta durabilidade.",
          icon: "Shirt",
          category: "Coleções",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-3",
          name: "Modelagem e Engenharia de Moldes",
          description: "Desenvolvimento técnico de moldes, graduação e prototipagem para caimento perfeito em todos os tamanhos.",
          icon: "Layers",
          category: "Modelagem",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-4",
          name: "Acabamento, Estamparia & Aviamentos",
          description: "Processos refinados de estamparia, bordados, aplicação de etiquetas e passadoria industrial com padrão boutique.",
          icon: "Sparkles",
          category: "Acabamento",
          link: "#contato",
          status: "active" as const,
        },
      ],
    };
  }

  // Restaurante / Alimentos / Gastronomia
  if (
    norm.includes("restauran") ||
    norm.includes("aliment") ||
    norm.includes("gastronom") ||
    norm.includes("buffet") ||
    norm.includes("refeic") ||
    norm.includes("lanche") ||
    norm.includes("padaria")
  ) {
    return {
      hero_badge: "Sabor, Qualidade & Tradição",
      hero_subtitle: `Experiências gastronômicas inesquecíveis preparadas com ingredientes frescos, receitas exclusivas e atendimento acolhedor.`,
      mission_title: "Nossa Missão",
      mission_description: `Servir pratos e produtos saborosos com padrão impecável de higiene, ingredientes frescos selecionados e hospitalidade genuína.`,
      about_title: `Sobre a ${companyName || "Nossa Casa"}`,
      about_description: `Dedicados à arte da boa culinária, unimos ingredientes de procedência comprovada a receitas que encantam os mais exigentes paladares.`,
      about_highlight: "Ingredientes selecionados e paixão absoluta pela gastronomia.",
      services_title: "Nossas Especialidades",
      services_subtitle: "Pratos, cardápios e opções preparadas para surpreender seu paladar.",
      services: [
        {
          id: "srv-1",
          name: "Pratos Principais & Cardápio Especial",
          description: "Preparações refinadas elaboradas por chefs experientes com ingredientes frescos da estação.",
          icon: "UtensilsCrossed",
          category: "Cardápio",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-2",
          name: "Buffet & Confraternizações",
          description: "Estrutura gastronômica completa para eventos sociais e corporativos.",
          icon: "Award",
          category: "Eventos",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-3",
          name: "Delivery e Encomendas Especiais",
          description: "Embalagens térmicas seguras para levar o sabor e frescor direto até você.",
          icon: "Truck",
          category: "Delivery",
          link: "#contato",
          status: "active" as const,
        },
      ],
    };
  }

  // Construção, Engenharia, Obras
  if (
    norm.includes("constru") ||
    norm.includes("engenhar") ||
    norm.includes("obra") ||
    norm.includes("reforma") ||
    norm.includes("predial")
  ) {
    return {
      hero_badge: "Engenharia & Construção Civil",
      hero_subtitle: `Projetos e execuções estruturadas com rigor técnico, solidez construtiva e compromisso inegociável com prazos.`,
      mission_title: "Nossa Missão",
      mission_description: `Construir e transformar empreendimentos com máxima segurança estrutural, transparência na gestão e excelência em acabamento.`,
      about_title: `Sobre a ${companyName || "Nossa Construtora"}`,
      about_description: `Com sólida atuação no setor da construção civil, gerenciamos e executamos obras com acompanhamento de engenheiros qualificados e cumprimento rigoroso das normas técnicas.`,
      about_highlight: "Solidez construtiva, segurança técnica e respeito aos prazos.",
      services_title: "Soluções em Engenharia e Construção",
      services_subtitle: "Da fundação ao acabamento final com qualidade e durabilidade garantidas.",
      services: [
        {
          id: "srv-1",
          name: "Construção Comercial e Residencial",
          description: "Execução completa de edificações com gestão rigorosa de materiais e cronograma de obra.",
          icon: "Building2",
          category: "Obras",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-2",
          name: "Reformas e Retrofit Estrutural",
          description: "Modernização completa de instalações com reforço estrutural e acabamento contemporâneo.",
          icon: "Hammer",
          category: "Reformas",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-3",
          name: "Projetos de Engenharia & Gestão Técnica",
          description: "Elaboração de projetos estruturais, elétricos, hidráulicos e laudos técnicos.",
          icon: "FileCheck",
          category: "Engenharia",
          link: "#contato",
          status: "active" as const,
        },
      ],
    };
  }

  // Transporte, Logística, Fretes
  if (
    norm.includes("transpor") ||
    norm.includes("logist") ||
    norm.includes("frete") ||
    norm.includes("carga")
  ) {
    return {
      hero_badge: "Logística & Transporte de Cargas",
      hero_subtitle: `Movimentando sua carga com pontualidade, monitoramento 24h e segurança total de ponta a ponta.`,
      mission_title: "Nossa Missão",
      mission_description: `Garantir transporte ágil, seguro e eficiente de cargas, integrando rotas com confiabilidade operacional e excelência em atendimento.`,
      about_title: `Sobre a ${companyName || "Nossa Transportadora"}`,
      about_description: `Atuando no transporte rodoviário e logística com frota monitorada e equipe capacitada, asseguramos entregas no prazo estipulado com cobertura securitária completa.`,
      about_highlight: "Rastreamento em tempo real, segurança e pontualidade na entrega.",
      services_title: "Soluções Logísticas Especializadas",
      services_subtitle: "Serviços de transporte planejados para otimizar sua cadeia de suprimentos.",
      services: [
        {
          id: "srv-1",
          name: "Transporte de Cargas Dedicadas e Fracionadas",
          description: "Rotas inteligentes com flexibilidade para envio de lotes completos ou fracionados.",
          icon: "Truck",
          category: "Transporte",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-2",
          name: "Armazenagem e Gestão de Distribuição",
          description: "Estrutura para guarda segura, separação rápida e expedição de mercadorias.",
          icon: "Package",
          category: "Armazenagem",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-3",
          name: "Rastreamento e Telemetria em Tempo Real",
          description: "Monitoramento contínuo do percurso para total visibilidade e tranquilidade do contratante.",
          icon: "Navigation",
          category: "Segurança",
          link: "#contato",
          status: "active" as const,
        },
      ],
    };
  }

  return null;
}

/**
 * Gera a lista de seções completas para a Landing Page do Template Empresa Institucional
 */
export function generateInstitutionalSections(data: Partial<CompanyData>): TemplateSection[] {
  const niche = getNicheDefaults(data.activity_area || "", data.name || data.legal_name || "");

  const merged: CompanyData = {
    ...INITIAL_COMPANY_DATA,
    ...(niche
      ? {
          mission_title: niche.mission_title,
          mission_description: niche.mission_description,
          about_title: niche.about_title,
          about_description: niche.about_description,
          about_highlight: niche.about_highlight,
          hero_badge: niche.hero_badge,
          hero_subtitle: niche.hero_subtitle,
          services_title: niche.services_title,
          services_subtitle: niche.services_subtitle,
          services: niche.services,
        }
      : {}),
    ...data,
    services:
      data.services && data.services.length > 0 && data.services !== INITIAL_COMPANY_DATA.services
        ? data.services
        : niche?.services || data.services || INITIAL_COMPANY_DATA.services,
    floating_whatsapp: {
      ...INITIAL_COMPANY_DATA.floating_whatsapp,
      ...(data.floating_whatsapp || {}),
      phone: data.whatsapp || data.floating_whatsapp?.phone || INITIAL_COMPANY_DATA.floating_whatsapp.phone,
    },
    privacy: {
      ...INITIAL_COMPANY_DATA.privacy,
      ...(data.privacy || {}),
    },
  };

  return [
    // 1. Hero
    {
      type: "hero",
      id: "hero",
      enabled: true,
      badge: merged.hero_badge || "Institucional & Soluções",
      title: merged.name || "Sua Empresa",
      subtitle:
        merged.hero_subtitle ||
        (merged.activity_area
          ? `Especialistas em ${merged.activity_area}. Excelência, credibilidade e transparência para o seu negócio.`
          : "Soluções corporativas completas com alta qualidade, segurança e conformidade para sua empresa."),
      cta_label: "Fale conosco",
      cta_href: "#contato",
      secondary_cta_label: "Conheça nossos serviços",
      secondary_cta_href: "#servicos",
    },

    // 2. Nossa Missão
    {
      type: "mission",
      id: "missao",
      enabled: true,
      title: merged.mission_title || "Nossa Missão",
      description:
        merged.mission_description ||
        "Prestar serviços com ética, integridade e excelência, proporcionando segurança e valor real para clientes e parceiros.",
      pillars: [
        { title: "Segurança e Qualidade", description: "Rigor técnico e conformidade em todos os produtos e serviços." },
        { title: "Transparência Total", description: "Comunicação clara e relacionamento de mútua confiança." },
        { title: "Excelência Operacional", description: "Agilidade, pontualidade e precisão do início à entrega." },
      ],
    },

    // 3. Quem Somos
    {
      type: "about",
      id: "sobre",
      enabled: true,
      title: merged.about_title || "Quem Somos",
      highlight:
        merged.about_highlight ||
        (merged.activity_area
          ? `Referência em ${merged.activity_area}${merged.foundation_year ? ` desde ${merged.foundation_year}` : ""}.`
          : "Compromisso permanente com a sua satisfação e confiança."),
      body:
        merged.about_description ||
        "Nossa organização une sólida bagagem técnica a processos modernos e ágeis. Atendemos com dedicação, oferecendo suporte consultivo e operacional de alto nível.",
      foundation_year: merged.foundation_year || "",
      activity_area: merged.activity_area || "",
    },

    // 4. Serviços Dinâmicos
    {
      type: "company_services",
      id: "servicos",
      enabled: true,
      title: merged.services_title || "Nossas Soluções Especializadas",
      subtitle:
        merged.services_subtitle ||
        "Soluções planejadas para atender às necessidades específicas do seu negócio.",
      items: merged.services,
    },

    // 5. Informações da Empresa (Ficha Cadastral)
    {
      type: "company_info",
      id: "informacoes",
      enabled: true,
      title: "Informações da Empresa",
      subtitle: "Ficha cadastral e dados institucionais para sua total segurança e transparência.",
      legal_name: merged.legal_name,
      fantasy_name: merged.fantasy_name,
      cnpj: merged.cnpj,
      opening_date: merged.opening_date,
      company_size: merged.company_size,
      legal_nature: merged.legal_nature,
      registration_status: merged.registration_status,
      company_type: merged.company_type,
      share_capital: merged.share_capital,
    },

    // 6. Localização
    {
      type: "location",
      id: "localizacao",
      enabled: true,
      title: "Onde Estamos",
      subtitle: "Venha nos visitar ou entre em contato para agendar uma reunião.",
      address_street: merged.address_street,
      address_number: merged.address_number,
      address_complement: merged.address_complement,
      address_neighborhood: merged.address_neighborhood,
      address_city: merged.address_city,
      address_state: merged.address_state,
      address_cep: merged.address_cep,
      show_map: merged.show_map !== false,
    },

    // 7. Contato
    {
      type: "contact",
      id: "contato",
      enabled: true,
      title: "Fale Conosco",
      subtitle: "Nossa equipe está à disposição para atender você com agilidade e cordialidade.",
      phone: merged.phone,
      whatsapp: merged.whatsapp,
      email: merged.email,
      website: merged.website,
      instagram: merged.instagram,
      facebook: merged.facebook,
      linkedin: merged.linkedin,
      youtube: merged.youtube,
      tiktok: merged.tiktok,
    },

    // 8. Política de Privacidade
    {
      type: "privacy_policy",
      id: "privacidade",
      enabled: true,
      title: "Política de Privacidade e Termos",
      subtitle: "Seus dados estão protegidos em total conformidade com a LGPD (Lei nº 13.709/2018).",
      body: merged.privacy?.policy_text || INITIAL_COMPANY_DATA.privacy.policy_text,
      terms_text: merged.privacy?.terms_text || INITIAL_COMPANY_DATA.privacy.terms_text,
      dpo_contact: merged.privacy?.dpo_contact || merged.email || "",
      items: [
        { title: "Finalidade Específica", description: "Dados utilizados estritamente para atendimento e prestação dos serviços solicitados." },
        { title: "Segurança e Sigilo", description: "Medidas técnicas adequadas para proteção contra acessos não autorizados." },
        { title: "Direitos do Titular (LGPD)", description: "Você pode solicitar acesso, alteração ou exclusão dos seus dados a qualquer momento." },
      ],
    },
  ];
}
