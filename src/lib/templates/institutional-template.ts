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

  // Oficina Mecânica, Automotivo, Autopeças, Funilaria, Lava-rápido, Pneus
  if (
    norm.includes("mecanic") ||
    norm.includes("automot") ||
    norm.includes("autopeca") ||
    norm.includes("auto peca") ||
    norm.includes("veiculo") ||
    norm.includes("funilaria") ||
    norm.includes("lataria") ||
    norm.includes("pintura automotiva") ||
    norm.includes("troca de oleo") ||
    norm.includes("lava rapido") ||
    norm.includes("lavajato") ||
    norm.includes("pneu") ||
    norm.includes("borracha") ||
    norm.includes("estetica automotiva")
  ) {
    return {
      hero_badge: "Excelência & Precisão Automotiva",
      hero_subtitle: `Manutenção preventiva e corretiva com diagnóstico computadorizado, peças de alta procedência e garantia total para o seu veículo.`,
      mission_title: "Nossa Missão",
      mission_description: `Proporcionar segurança e tranquilidade aos motoristas através de serviços automotivos de máxima qualidade, transparência nos diagnósticos e respeito aos prazos combinados.`,
      about_title: `Sobre a ${companyName || "Nossa Oficina"}`,
      about_description: `Com infraestrutura moderna e equipe de mecânicos e técnicos certificados, a ${companyName || "nossa oficina"} é referência em diagnóstico e reparo automotivo, oferecendo soluções precisas e duradouras para todas as marcas e modelos.`,
      about_highlight: "Diagnóstico avançado, transparência de orçamento e garantia em todas as peças e serviços.",
      services_title: "Soluções e Serviços Automotivos",
      services_subtitle: "Cuidado completo para o perfeito desempenho e segurança do seu automóvel.",
      services: [
        {
          id: "srv-1",
          name: "Revisão Geral e Diagnóstico Computadorizado",
          description: "Checagem minuciosa com scanner eletrônico de injeção, ignição, freios e suspensão.",
          icon: "ShieldCheck",
          category: "Revisão",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-2",
          name: "Mecânica de Precisão & Motor",
          description: "Reparo e retífica de motores, cabeçotes, câmbio, embreagem e sistemas de arrefecimento.",
          icon: "Briefcase",
          category: "Mecânica",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-3",
          name: "Freios, Suspensão e Direção",
          description: "Substituição de pastilhas, discos, amortecedores e alinhamento com balanceamento 3D.",
          icon: "CheckCircle2",
          category: "Segurança",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-4",
          name: "Troca de Óleo, Filtros e Lubrificação",
          description: "Lubrificantes homologados pelas montadoras com troca de filtros de óleo, ar, cabine e combustível.",
          icon: "Sparkles",
          category: "Manutenção",
          link: "#contato",
          status: "active" as const,
        },
      ],
    };
  }

  // Barbearia, Salão de Beleza, Estética, Manicure, Spa, Cosméticos
  if (
    norm.includes("barbea") ||
    norm.includes("barba") ||
    norm.includes("salao") ||
    norm.includes("cabel") ||
    norm.includes("estetic") ||
    norm.includes("manicur") ||
    norm.includes("pedicur") ||
    norm.includes("spa") ||
    norm.includes("cosmetic") ||
    norm.includes("depilac") ||
    norm.includes("sobrancelh") ||
    norm.includes("maquiagem") ||
    norm.includes("beleza")
  ) {
    return {
      hero_badge: "Beleza, Estilo & Bem-Estar",
      hero_subtitle: `Realce sua melhor versão com atendimento personalizado, profissionais especialistas e produtos de padrão premium.`,
      mission_title: "Nossa Missão",
      mission_description: `Valorizar a autoestima e o bem-estar de cada cliente, proporcionando experiências acolhedoras e resultados estéticos impecáveis com técnicas modernas e produtos selecionados.`,
      about_title: `Sobre o ${companyName || "Nosso Espaço"}`,
      about_description: `Criado para proporcionar conforto, relaxamento e excelência estética, o ${companyName || "nosso espaço"} une tendências internacionais a um atendimento cuidadoso e humanizado para atender você com o carinho e a precisão que você merece.`,
      about_highlight: "Profissionais especialistas, ambiente acolhedor e produtos premium.",
      services_title: "Nossos Procedimentos e Especialidades",
      services_subtitle: "Serviços sob medida para cuidar da sua imagem pessoal com harmonia e elegância.",
      services: [
        {
          id: "srv-1",
          name: "Cortes Estilizados & Visagismo",
          description: "Cortes modernos e clássicos adaptados ao formato do seu rosto e estilo de vida.",
          icon: "Scissors",
          category: "Cabelo",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-2",
          name: "Coloração, Mechas & Tratamentos Capilares",
          description: "Técnicas avançadas de clareamento, cobertura de fios e hidratação profunda de alta performance.",
          icon: "Sparkles",
          category: "Tratamentos",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-3",
          name: "Procedimentos de Estética Facial e Corporal",
          description: "Cuidados para revitalização da pele, limpeza facial profunda e protocolos de harmonização.",
          icon: "Award",
          category: "Estética",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-4",
          name: "Barba Terapia e Cuidados Masculinos / Nail Design",
          description: "Finalização impecável com toalha quente, navalha e design refinado para mãos e barba.",
          icon: "CheckCircle2",
          category: "Exclusivo",
          link: "#contato",
          status: "active" as const,
        },
      ],
    };
  }

  // Saúde, Medicina, Clínica Médica, Odontologia, Dentista, Fisioterapia, Psicologia, Farmácia
  if (
    norm.includes("saude") ||
    norm.includes("clinic") ||
    norm.includes("medic") ||
    norm.includes("odontol") ||
    norm.includes("dentis") ||
    norm.includes("fisioter") ||
    norm.includes("psicol") ||
    norm.includes("laborat") ||
    norm.includes("farmac") ||
    norm.includes("terapia") ||
    norm.includes("oftalm")
  ) {
    return {
      hero_badge: "Cuidado, Saúde & Humanização",
      hero_subtitle: `Atendimento multidisciplinar com tecnologia médica avançada, rigor técnico e atenção humanizada ao seu bem-estar.`,
      mission_title: "Nossa Missão",
      mission_description: `Cuidar da saúde e da qualidade de vida de nossos pacientes com excelência técnica, ética profissional irrepreensível e acolhimento em cada etapa do atendimento.`,
      about_title: `Sobre a ${companyName || "Nossa Clínica"}`,
      about_description: `Estruturada com instalações confortáveis e equipamentos diagnósticos de última geração, a ${companyName || "nossa clínica"} reúne especialistas qualificados comprometidos com tratamentos seguros, eficazes e individualizados.`,
      about_highlight: "Corpo clínico altamente capacitado, tecnologia avançada e cuidado humanizado.",
      services_title: "Especialidades e Atendimentos",
      services_subtitle: "Acompanhamento integral para a prevenção, diagnóstico e tratamento da sua saúde.",
      services: [
        {
          id: "srv-1",
          name: "Consultas Especializadas e Avaliação Clínica",
          description: "Atendimento minucioso com escuta ativa, histórico clínico e plano de tratamento personalizado.",
          icon: "ShieldCheck",
          category: "Consultas",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-2",
          name: "Exames Diagnósticos e Acompanhamento",
          description: "Procedimentos e laudos com rapidez, alta precisão e total conforto ao paciente.",
          icon: "FileCheck",
          category: "Diagnóstico",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-3",
          name: "Tratamentos Avançados e Procedimentos",
          description: "Protocolos terapêuticos modernos e seguros embasados nas melhores evidências científicas.",
          icon: "Sparkles",
          category: "Tratamentos",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-4",
          name: "Prevenção e Manutenção da Saúde",
          description: "Check-ups periódicos e orientações personalizadas para longevidade e qualidade de vida.",
          icon: "Award",
          category: "Prevenção",
          link: "#contato",
          status: "active" as const,
        },
      ],
    };
  }

  // Pet Shop, Clínica Veterinária, Banho e Tosa, Animais
  if (
    norm.includes("pet") ||
    norm.includes("veterin") ||
    norm.includes("tosa") ||
    norm.includes("banho e tosa") ||
    norm.includes("animal") ||
    norm.includes("racao") ||
    norm.includes("canil") ||
    norm.includes("adestram")
  ) {
    return {
      hero_badge: "Amor, Carinho & Cuidado Animal",
      hero_subtitle: `Tudo o que seu pet precisa em um só lugar: atendimento veterinário dedicado, estética animal com carinho e os melhores produtos.`,
      mission_title: "Nossa Missão",
      mission_description: `Proporcionar saúde, conforto e alegria para os pets e tranquilidade para seus tutores, tratando cada animalzinho com o respeito, paciência e amor que ele merece.`,
      about_title: `Sobre a ${companyName || "Nossa Casa Pet"}`,
      about_description: `Apaixonados pelo universo animal, a ${companyName || "nossa equipe"} foi criada com o objetivo de oferecer uma experiência acolhedora e segura, com profissionais que realmente entendem e respeitam as necessidades de cães, gatos e outros bichinhos.`,
      about_highlight: "Estrutura segura, profissionais apaixonados por animais e produtos de primeira linha.",
      services_title: "Serviços e Cuidados para seu Pet",
      services_subtitle: "Da higiene preventiva aos cuidados clínicos com todo o amor do mundo.",
      services: [
        {
          id: "srv-1",
          name: "Banho & Tosa Especializada",
          description: "Higiene completa com produtos hipoalergênicos, tosa na tesoura, desembaraço e hidratação.",
          icon: "Sparkles",
          category: "Estética Pet",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-2",
          name: "Consulta Clínica Veterinária e Vacinação",
          description: "Exames de rotina, aplicação de vacinas importadas, vermifugação e acompanhamento preventivo.",
          icon: "ShieldCheck",
          category: "Veterinária",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-3",
          name: "Farmácia Veterinária e Nutrição Especial",
          description: "Medicamentos confiáveis, rações super premium e suplementos indicados para cada fase da vida.",
          icon: "CheckCircle2",
          category: "Farmácia & Rações",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-4",
          name: "Acessórios, Brinquedos e Pet Care",
          description: "Coleiras, caminhas, brinquedos educativos e itens de conforto para o dia a dia do seu amigo.",
          icon: "Award",
          category: "Boutique",
          link: "#contato",
          status: "active" as const,
        },
      ],
    };
  }

  // Advocacia, Escritório Jurídico, Direito
  if (
    norm.includes("advog") ||
    norm.includes("juridic") ||
    norm.includes("direito") ||
    norm.includes("oab") ||
    norm.includes("contencioso")
  ) {
    return {
      hero_badge: "Assessoria Jurídica de Alto Padrão",
      hero_subtitle: `Defendendo seus direitos e interesses corporativos com rigor técnico, estratégia processual eficiente e discrição absoluta.`,
      mission_title: "Nossa Missão",
      mission_description: `Prestar assistência jurídica preventiva e contenciosa de excelência, assegurando segurança legal, transparência e proteção efetiva aos direitos de nossos clientes.`,
      about_title: `Sobre a ${companyName || "Nossa Sociedade de Advogados"}`,
      about_description: `Com atuação reconhecida pela sólida formação técnica e comprometimento ético, a ${companyName || "nossa banca"} oferece soluções jurídicas sob medida para pessoas físicas e empresas, antecipando riscos e construindo estratégias seguras.`,
      about_highlight: "Atuação ética, sigilo profissional absoluto e eficiência em resultados jurídicos.",
      services_title: "Áreas de Atuação Jurídica",
      services_subtitle: "Assessoria jurídica abrangente e especializada para cada desafio legal.",
      services: [
        {
          id: "srv-1",
          name: "Direito Civil, Contratos e Família",
          description: "Elaboração e análise contratual, indenizações, inventários, planejamento sucessório e divórcios.",
          icon: "Scale",
          category: "Cível",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-2",
          name: "Direito Trabalhista e Previdenciário",
          description: "Defesa dos direitos do trabalhador, compliance corporativo e concessão de benefícios previdenciários.",
          icon: "Briefcase",
          category: "Trabalhista",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-3",
          name: "Direito Empresarial e Tributário",
          description: "Consultoria societária, reorganização tributária, recuperação de crédito e mitigação de passivos.",
          icon: "Building",
          category: "Corporativo",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-4",
          name: "Assessoria Jurídica Preventiva & Consultoria",
          description: "Pareceres técnicos e acompanhamento preventivo para garantir total conformidade com a legislação.",
          icon: "FileText",
          category: "Consultivo",
          link: "#contato",
          status: "active" as const,
        },
      ],
    };
  }

  // Contabilidade, BPO Financeiro, Assessoria Fiscal
  if (
    norm.includes("contab") ||
    norm.includes("contabil") ||
    norm.includes("fiscal") ||
    norm.includes("tributar") ||
    norm.includes("bpo financeiro") ||
    norm.includes("auditoria") ||
    norm.includes("pericia")
  ) {
    return {
      hero_badge: "Gestão Contábil & Inteligência Fiscal",
      hero_subtitle: `Simplifique a gestão contábil, fiscal e financeira da sua empresa com precisão, tecnologia e redução legal de impostos.`,
      mission_title: "Nossa Missão",
      mission_description: `Impulsionar a sustentabilidade e o crescimento dos nossos clientes através de soluções contábeis seguras, precisão fiscal e suporte estratégico contínuo.`,
      about_title: `Sobre a ${companyName || "Nossa Contabilidade"}`,
      about_description: `Unindo experiência contábil e ferramentas digitais inovadoras, a ${companyName || "nossa empresa"} atua como parceira estratégica do empresário, garantindo conformidade com o fisco e clareza nos indicadores financeiros.`,
      about_highlight: "Conformidade fiscal irrepreensível, tecnologia contábil e atendimento ágil.",
      services_title: "Soluções Contábeis e Fiscais",
      services_subtitle: "Serviços especializados para empresas de todos os portes e regimes de tributação.",
      services: [
        {
          id: "srv-1",
          name: "Gestão Fiscal e Planejamento Tributário",
          description: "Apuração segura de tributos, entrega de obrigações acessórias e enquadramento tributário ideal.",
          icon: "TrendingUp",
          category: "Fiscal",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-2",
          name: "Contabilidade Societária e Balanços",
          description: "Escrituração contábil completa, relatórios de DRE, balancetes periódicos e demonstrações financeiras.",
          icon: "FileText",
          category: "Contábil",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-3",
          name: "Departamento Pessoal e Folha de Pagamento",
          description: "Processamento de folha, admissões, rescisões, eSocial e gestão de encargos trabalhistas.",
          icon: "Users",
          category: "Trabalhista",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-4",
          name: "Abertura, Alteração e Regularização de Empresas",
          description: "Assessoria completa para abertura rápida de CNPJ, obtenção de alvarás e alterações contratuais.",
          icon: "Building",
          category: "Societário",
          link: "#contato",
          status: "active" as const,
        },
      ],
    };
  }

  // Tecnologia, Software, TI, Informática, Suporte, Redes
  if (
    norm.includes("tecnolog") ||
    norm.includes("software") ||
    norm.includes("informat") ||
    norm.includes("desenvolvim") ||
    norm.includes("suporte ti") ||
    norm.includes("sistema") ||
    norm.includes("computad") ||
    norm.includes("redes") ||
    norm.includes("nuvem") ||
    norm.includes("cloud")
  ) {
    return {
      hero_badge: "Inovação, TI & Transformação Digital",
      hero_subtitle: `Soluções tecnológicas robustas, suporte especializado e infraestrutura moderna para acelerar o crescimento do seu negócio.`,
      mission_title: "Nossa Missão",
      mission_description: `Entregar tecnologias eficientes, seguras e inovadoras que otimizem rotinas operacionais, protejam dados críticos e aumentem a produtividade dos nossos parceiros.`,
      about_title: `Sobre a ${companyName || "Nossa Empresa de TI"}`,
      about_description: `Especializada em soluções tecnológicas inteligentes, a ${companyName || "nossa empresa"} combina expertise técnica de alto nível com metodologias ágeis, entregando estabilidade e performance para clientes corporativos.`,
      about_highlight: "Segurança de dados, alta disponibilidade e suporte técnico ágil e resolutivo.",
      services_title: "Soluções em Tecnologia da Informação",
      services_subtitle: "Infraestrutura completa e suporte de ponta a ponta para sua empresa.",
      services: [
        {
          id: "srv-1",
          name: "Suporte Técnico Corporativo (Help Desk)",
          description: "Monitoramento contínuo, manutenção preventiva e resolução rápida de incidentes de hardware e software.",
          icon: "Headphones",
          category: "Suporte",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-2",
          name: "Infraestrutura de Redes e Servidores Cloud",
          description: "Implementação de redes seguras, migração para a nuvem, roteamento profissional e redundância.",
          icon: "Globe",
          category: "Infraestrutura",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-3",
          name: "Segurança da Informação e Backup Automático",
          description: "Proteção contra ameaças virtuais, políticas de backup em nuvem e compliance com a LGPD.",
          icon: "ShieldCheck",
          category: "Segurança",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-4",
          name: "Desenvolvimento de Software e Integrações",
          description: "Criação de sistemas web, automações sob medida e integração de plataformas via APIs modernas.",
          icon: "Sparkles",
          category: "Desenvolvimento",
          link: "#contato",
          status: "active" as const,
        },
      ],
    };
  }

  // Imobiliária, Corretores, Imóveis
  if (
    norm.includes("imobili") ||
    norm.includes("imovel") ||
    norm.includes("imoveis") ||
    norm.includes("corretor") ||
    norm.includes("locacao de imov")
  ) {
    return {
      hero_badge: "Negócios Imobiliários & Patrimônio",
      hero_subtitle: `Encontre o imóvel ideal com assessoria jurídica completa, carteira selecionada e atendimento transparente e confiável.`,
      mission_title: "Nossa Missão",
      mission_description: `Facilitar a realização de sonhos e a concretização de negócios imobiliários seguros e rentáveis, conectando compradores, proprietários e investidores com ética e excelência.`,
      about_title: `Sobre a ${companyName || "Nossa Imobiliária"}`,
      about_description: `Com ampla experiência e profundo conhecimento do mercado regional, a ${companyName || "nossa imobiliária"} presta consultoria completa na compra, venda e administração de imóveis, cuidando de cada etapa documental com rigor e agilidade.`,
      about_highlight: "Transparência nas negociações, rigor documental e as melhores oportunidades imobiliárias.",
      services_title: "Serviços Imobiliários Especializados",
      services_subtitle: "Assessoria completa para você comprar, vender ou alugar com segurança total.",
      services: [
        {
          id: "srv-1",
          name: "Venda e Compra de Imóveis Selecionados",
          description: "Amplo portfólio de residenciais e comerciais com documentação checada e avaliação justa de mercado.",
          icon: "Building",
          category: "Vendas",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-2",
          name: "Locação e Administração de Imóveis",
          description: "Gestão rigorosa de contratos, cobrança garantida e vistoria fotográfica detalhada.",
          icon: "FileCheck",
          category: "Locação",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-3",
          name: "Avaliação Técnica de Imóveis e Perícia",
          description: "Laudos precisos de valor de mercado e potencial de valorização elaborados por corretores credenciados.",
          icon: "CheckCircle2",
          category: "Avaliação",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-4",
          name: "Assessoria em Financiamento e Regularização",
          description: "Apoio completo para aprovação de crédito imobiliário e regularização de matrículas e escrituras.",
          icon: "ShieldCheck",
          category: "Consultoria",
          link: "#contato",
          status: "active" as const,
        },
      ],
    };
  }

  // Academia, Fitness, Crossfit, Personal, Treinamento
  if (
    norm.includes("academ") ||
    norm.includes("fitness") ||
    norm.includes("crossfit") ||
    norm.includes("personal") ||
    norm.includes("musculac") ||
    norm.includes("pilates") ||
    norm.includes("treino") ||
    norm.includes("luta")
  ) {
    return {
      hero_badge: "Saúde, Treinamento & Alta Performance",
      hero_subtitle: `Estrutura moderna, equipamentos de ponta e acompanhamento profissional para você alcançar seus objetivos com saúde e energia.`,
      mission_title: "Nossa Missão",
      mission_description: `Inspirar e transformar a vida das pessoas através da prática de atividade física de qualidade, promovendo bem-estar, disciplina e longevidade.`,
      about_title: `Sobre a ${companyName || "Nossa Academia"}`,
      about_description: `Criada para proporcionar um ambiente estimulante e acolhedor, a ${companyName || "nossa unidade"} conta com professores capacitados e metodologia focada em resultados progressivos e seguros para alunos de todos os níveis.`,
      about_highlight: "Equipamentos modernos, acompanhamento técnico qualificado e ambiente motivador.",
      services_title: "Modalidades e Programas de Treino",
      services_subtitle: "Opções planejadas para o seu ritmo, condicionamento e estilo de vida.",
      services: [
        {
          id: "srv-1",
          name: "Musculação e Treinamento de Força",
          description: "Aparelhos modernos para hipertrofia, fortalecimento muscular e saúde articular.",
          icon: "Award",
          category: "Musculação",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-2",
          name: "Treinamento Funcional e Condicionamento",
          description: "Exercícios dinâmicos em grupo para queima calórica, agilidade, mobilidade e postura.",
          icon: "Sparkles",
          category: "Funcional",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-3",
          name: "Aulas Coletivas & Ritmos",
          description: "Grade variada de modalidades aeróbicas com aulas dinâmicas para animar seu treino.",
          icon: "Users",
          category: "Aulas",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-4",
          name: "Avaliação Física e Treino Personalizado",
          description: "Bioimpedância periódica e prescrição de rotinas adaptadas às suas metas individuais.",
          icon: "CheckCircle2",
          category: "Acompanhamento",
          link: "#contato",
          status: "active" as const,
        },
      ],
    };
  }

  // Educação, Cursos, Escola, Treinamentos, Idiomas
  if (
    norm.includes("educac") ||
    norm.includes("escola") ||
    norm.includes("curso") ||
    norm.includes("treinam") ||
    norm.includes("idioma") ||
    norm.includes("capacit") ||
    norm.includes("ensino")
  ) {
    return {
      hero_badge: "Educação, Conhecimento & Futuro",
      hero_subtitle: `Metodologia prática, professores experientes e formação qualificada para impulsionar seu potencial pessoal e profissional.`,
      mission_title: "Nossa Missão",
      mission_description: `Democratizar o acesso a uma educação transformadora de alto nível, preparando cidadãos e profissionais para os desafios do mercado contemporâneo.`,
      about_title: `Sobre a ${companyName || "Nossa Instituição de Ensino"}`,
      about_description: `Com tradição no desenvolvimento humano e intelectual, a ${companyName || "nossa instituição"} alia infraestrutura didática moderna a professores com vivência prática no mercado, garantindo aprendizado sólido e aplicável.`,
      about_highlight: "Professores especialistas, metodologia prática e foco no sucesso do aluno.",
      services_title: "Nossos Cursos e Programas Educacionais",
      services_subtitle: "Formação completa estruturada para alavancar sua carreira e competências.",
      services: [
        {
          id: "srv-1",
          name: "Cursos Profissionalizantes e Técnicos",
          description: "Formação direcionada com alto índice de empregabilidade e projetos práticos reais.",
          icon: "Briefcase",
          category: "Carreira",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-2",
          name: "Treinamentos Corporativos e In Company",
          description: "Capacitação sob demanda para equipes com foco em liderança, produtividade e inovação.",
          icon: "Building",
          category: "Corporativo",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-3",
          name: "Idiomas e Comunicação Prática",
          description: "Conversação fluente e aulas imersivas para expandir oportunidades globais.",
          icon: "Globe",
          category: "Idiomas",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-4",
          name: "Certificação e Acompanhamento Pedagógico",
          description: "Material didático atualizado, suporte direto com instrutores e certificado de conclusão.",
          icon: "Award",
          category: "Certificação",
          link: "#contato",
          status: "active" as const,
        },
      ],
    };
  }

  // Marketing, Publicidade, Design, Agência
  if (
    norm.includes("market") ||
    norm.includes("publicid") ||
    norm.includes("agencia") ||
    norm.includes("design") ||
    norm.includes("propagan") ||
    norm.includes("social media") ||
    norm.includes("trafego")
  ) {
    return {
      hero_badge: "Estratégia, Criatividade & Crescimento",
      hero_subtitle: `Conectamos sua marca ao público certo através de design marcante, campanhas de tráfego de alta conversão e presença digital memorável.`,
      mission_title: "Nossa Missão",
      mission_description: `Potencializar marcas e acelerar vendas através de estratégias digitais inteligentes, posicionamento autêntico e criatividade orientada a resultados mensuráveis.`,
      about_title: `Sobre a ${companyName || "Nossa Agência"}`,
      about_description: `Formada por estrategistas, designers e especialistas em performance, a ${companyName || "nossa equipe"} constrói soluções digitais sob medida para empresas que desejam se destacar no mercado e escalar suas vendas com consistência.`,
      about_highlight: "Estratégias orientadas a dados, criatividade autêntica e foco em retorno sobre investimento.",
      services_title: "Nossas Soluções em Marketing e Design",
      services_subtitle: "Presença digital completa para transformar visitantes em clientes fiéis.",
      services: [
        {
          id: "srv-1",
          name: "Gestão de Tráfego Pago & Anúncios",
          description: "Campanhas otimizadas no Google Ads e Meta Ads com foco em geração de leads e conversão.",
          icon: "TrendingUp",
          category: "Performance",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-2",
          name: "Identidade Visual e Branding Completo",
          description: "Criação de logotipos, manual de marca e design institucional profissional que transmite autoridade.",
          icon: "Sparkles",
          category: "Design",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-3",
          name: "Gestão Estratégica de Redes Sociais",
          description: "Planejamento editorial, redação de conteúdo, produção visual e engajamento da comunidade.",
          icon: "Users",
          category: "Social Media",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-4",
          name: "Sites Institucionais e Landing Pages",
          description: "Páginas modernas com carregamento ultrarrápido projetadas estrategicamente para converter contatos.",
          icon: "Globe",
          category: "Web",
          link: "#contato",
          status: "active" as const,
        },
      ],
    };
  }

  // Comércio Varejista / Loja / Distribuidora
  if (
    norm.includes("comercio") ||
    norm.includes("varejo") ||
    norm.includes("loja") ||
    norm.includes("distribuid") ||
    norm.includes("atacado") ||
    norm.includes("papelaria") ||
    norm.includes("bazar") ||
    norm.includes("otica") ||
    norm.includes("materiais")
  ) {
    return {
      hero_badge: "Variedade, Qualidade & Preço Justo",
      hero_subtitle: `Produtos selecionados das melhores marcas com pronta entrega, condições facilitadas de pagamento e atendimento de primeira.`,
      mission_title: "Nossa Missão",
      mission_description: `Oferecer um portfólio completo de produtos de qualidade com transparência, rapidez e preços competitivos, garantindo a plena satisfação de nossos clientes.`,
      about_title: `Sobre a ${companyName || "Nossa Loja"}`,
      about_description: `Com tradição no comércio e compromisso com o bom atendimento, a ${companyName || "nossa empresa"} trabalha com fornecedores homologados para garantir que você sempre encontre novidades, durabilidade e as melhores condições do mercado.`,
      about_highlight: "Grande variedade em estoque, procedência garantida e facilidade de pagamento.",
      services_title: "Produtos e Linhas em Destaque",
      services_subtitle: "As melhores opções selecionadas para atender você com eficiência e praticidade.",
      services: [
        {
          id: "srv-1",
          name: "Venda no Varejo e Atendimento Personalizado",
          description: "Equipe especializada pronta para orientar você na escolha dos melhores produtos e soluções.",
          icon: "CheckCircle2",
          category: "Atendimento",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-2",
          name: "Condições Especiais para Atacado e Empresas",
          description: "Preços diferenciados e faturamento facilitado para compras corporativas e pedidos em volume.",
          icon: "Briefcase",
          category: "Corporativo",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-3",
          name: "Pronta Entrega e Logística Ágil",
          description: "Estoque sempre abastecido com envio rápido e seguro até o seu endereço ou retirada imediata.",
          icon: "Truck",
          category: "Logística",
          link: "#contato",
          status: "active" as const,
        },
        {
          id: "srv-4",
          name: "Garantia de Fábrica e Suporte Pós-Venda",
          description: "Produtos com nota fiscal, procedência comprovada e assistência dedicada em caso de dúvidas.",
          icon: "ShieldCheck",
          category: "Garantia",
          link: "#contato",
          status: "active" as const,
        },
      ],
    };
  }

  // ─── SMART CONTEXTUAL FALLBACK ─────────────────────────────────────────────
  // Se o nicho não casou com os padrões acima, gera um template 100% contextualizado
  // usando o nome da empresa e o ramo de atuação real (CNAE ou descrição digitada),
  // NUNCA recorrendo a dados genéricos de "consultoria" ou "preparação de documentos"!
  const cleanActivity = (activityArea || "")
    .replace(/^(\d{2}\.\d{2}-\d-\d{2}\s*-\s*)/, "") // remove prefixo CNAE se houver
    .trim();

  const displayArea = cleanActivity || "Serviços e Soluções Especializadas";
  const displayName = companyName || "Nossa Empresa";

  return {
    hero_badge: `Excelência em ${displayArea}`,
    hero_subtitle: `Dedicados a oferecer as melhores soluções em ${displayArea.toLowerCase()} com alto padrão de qualidade, compromisso e atendimento personalizado.`,
    mission_title: "Nossa Missão",
    mission_description: `Prover soluções de excelência em ${displayArea.toLowerCase()}, atendendo às necessidades específicas de nossos clientes com ética, eficiência, pontualidade e inovação.`,
    about_title: `Sobre a ${displayName}`,
    about_description: `Com sólida atuação focada em ${displayArea.toLowerCase()}, a ${displayName} reúne profissionais qualificados e processos rigorosos para entregar resultados consistentes e superar as expectativas dos nossos clientes e parceiros.`,
    about_highlight: `Compromisso inegociável com a qualidade e satisfação plena em ${displayArea.toLowerCase()}.`,
    services_title: `Soluções Especializadas em ${displayArea}`,
    services_subtitle: `Serviços e produtos planejados com rigor técnico para atender às suas necessidades.`,
    services: [
      {
        id: "srv-1",
        name: `Atendimento Especializado em ${displayArea}`,
        description: `Diagnóstico detalhado e execução com alto padrão de qualidade e atenção a cada necessidade do cliente.`,
        icon: "Sparkles",
        category: "Especialidade",
        link: "#contato",
        status: "active" as const,
      },
      {
        id: "srv-2",
        name: "Soluções Sob Medida / Projetos Personalizados",
        description: "Planejamento e entrega adaptados às características e objetivos exclusivos de cada demanda.",
        icon: "CheckCircle2",
        category: "Personalizado",
        link: "#contato",
        status: "active" as const,
      },
      {
        id: "srv-3",
        name: "Garantia de Qualidade e Confiabilidade",
        description: "Processos certificados e rigor operacional para assegurar segurança, pontualidade e excelência.",
        icon: "ShieldCheck",
        category: "Garantia",
        link: "#contato",
        status: "active" as const,
      },
      {
        id: "srv-4",
        name: "Suporte Dedicado e Relacionamento Contínuo",
        description: "Equipe disponível para esclarecer dúvidas, orientar procedimentos e garantir satisfação pós-atendimento.",
        icon: "Award",
        category: "Suporte",
        link: "#contato",
        status: "active" as const,
      },
    ],
  };
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
