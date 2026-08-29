/**
 * Template-based site content generator.
 * Produces niche-specific page sections in Portuguese,
 * populated with the real business data from the wizard.
 */

export interface SiteInfo {
  name: string;
  business_name: string;
  category: string | null;
  goal: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  style: string | null;
}

export interface Section {
  type: string;
  [key: string]: unknown;
}

// ─── Per-niche templates ─────────────────────────────────────────────────────

const TEMPLATES: Record<string, (s: SiteInfo) => Section[]> = {
  Restaurante: (s) => [
    {
      type: "hero",
      title: `O melhor sabor de ${s.city ?? "sua cidade"}`,
      subtitle: `${s.name} — onde cada prato é preparado com carinho, ingredientes frescos e muito amor pela gastronomia.`,
      cta_label: "Ver cardápio",
      cta_href: "#cardapio",
      badge: "Aberto hoje",
    },
    {
      type: "features",
      title: "Por que nos escolher?",
      items: [
        { icon: "🍽️", title: "Ingredientes frescos", body: "Selecionamos os melhores ingredientes diariamente para garantir sabor e qualidade em cada prato." },
        { icon: "👨‍🍳", title: "Chef especializado", body: "Nossa equipe de cozinha tem anos de experiência e paixão pela culinária." },
        { icon: "🏠", title: "Ambiente acolhedor", body: "Um espaço pensado para você relaxar e aproveitar momentos especiais com quem ama." },
        { icon: "🚚", title: "Delivery rápido", body: "Peça pelo WhatsApp e receba seu pedido em casa com agilidade e segurança." },
      ],
    },
    {
      type: "menu_highlight",
      title: "Destaques do cardápio",
      items: [
        { name: "Prato do Chef", description: "Receita exclusiva da casa, preparada com os melhores ingredientes da estação.", price: "Consulte" },
        { name: "Opção Vegetariana", description: "Sabor e saúde em perfeita harmonia, sem abrir mão do prazer.", price: "Consulte" },
        { name: "Sobremesa da Casa", description: "O toque final perfeito para sua refeição.", price: "Consulte" },
      ],
    },
    {
      type: "about",
      title: `Sobre o ${s.name}`,
      body: `Fundado com a missão de levar sabor e qualidade à mesa de nossos clientes, o ${s.name} é referência em gastronomia ${s.city ? `em ${s.city}` : ""}. Nossa história é construída dia a dia com dedicação, tradição e o carinho de quem realmente ama cozinhar.`,
      highlight: "Tradição e qualidade em cada prato.",
    },
    { type: "contact", title: "Reservas e pedidos" },
  ],

  Loja: (s) => [
    {
      type: "hero",
      title: `Tudo que você precisa em um só lugar`,
      subtitle: `${s.name} — qualidade, variedade e os melhores preços para você e sua família${s.city ? ` em ${s.city}` : ""}.`,
      cta_label: "Ver produtos",
      cta_href: "#produtos",
      badge: "Novidades disponíveis",
    },
    {
      type: "features",
      title: "Nossos diferenciais",
      items: [
        { icon: "✅", title: "Qualidade garantida", body: "Todos os nossos produtos passam por rigoroso controle de qualidade antes de chegar até você." },
        { icon: "💳", title: "Facilidade no pagamento", body: "Parcelamos em até 12x e aceitamos todas as formas de pagamento." },
        { icon: "🔄", title: "Troca fácil", body: "Política de troca descomplicada para sua total satisfação." },
        { icon: "📦", title: "Entrega rápida", body: "Enviamos para todo o Brasil com agilidade e segurança." },
      ],
    },
    {
      type: "categories",
      title: "Categorias em destaque",
      items: [
        { name: "Mais vendidos", description: "Os produtos favoritos dos nossos clientes." },
        { name: "Novidades", description: "Confira as últimas chegadas da nossa loja." },
        { name: "Ofertas", description: "Aproveite nossas promoções exclusivas." },
      ],
    },
    {
      type: "about",
      title: `Sobre a ${s.name}`,
      body: `A ${s.name} nasceu com a missão de oferecer produtos de qualidade com preço justo. Atendemos${s.city ? ` em ${s.city}` : ""} e em todo o Brasil, com atendimento personalizado e foco total na satisfação do cliente.`,
      highlight: "Qualidade e preço justo para todos.",
    },
    { type: "contact", title: "Fale com a gente" },
  ],

  Serviços: (s) => [
    {
      type: "hero",
      title: `Serviços profissionais que fazem a diferença`,
      subtitle: `${s.name} — soluções completas e personalizadas para atender às suas necessidades${s.city ? ` em ${s.city} e região` : ""}.`,
      cta_label: "Solicitar orçamento",
      cta_href: "#contato",
      badge: "Atendimento rápido",
    },
    {
      type: "services",
      title: "O que oferecemos",
      items: [
        { icon: "⚡", title: "Atendimento ágil", body: "Respondemos rapidamente e agendamos no horário mais conveniente para você." },
        { icon: "🏆", title: "Equipe especializada", body: "Profissionais experientes e certificados para garantir o melhor resultado." },
        { icon: "📋", title: "Orçamento gratuito", body: "Solicite seu orçamento sem compromisso e conheça nossas soluções." },
        { icon: "🔒", title: "Garantia de serviço", body: "Trabalhamos com seriedade e oferecemos garantia em todos os nossos serviços." },
      ],
    },
    {
      type: "steps",
      title: "Como funciona",
      items: [
        { number: "01", title: "Entre em contato", description: "Fale conosco pelo WhatsApp ou telefone para descrever sua necessidade." },
        { number: "02", title: "Receba o orçamento", description: "Enviamos uma proposta detalhada e transparente sem custo." },
        { number: "03", title: "Agendamos", description: "Definimos a melhor data e horário para atender você." },
        { number: "04", title: "Serviço realizado", description: "Executamos com qualidade e entregamos dentro do prazo." },
      ],
    },
    {
      type: "about",
      title: `Sobre a ${s.name}`,
      body: `A ${s.name} é uma empresa de serviços comprometida com a excelência e a satisfação total dos clientes. Com anos de experiência no mercado${s.city ? ` de ${s.city}` : ""}, nossa equipe está pronta para atender você com profissionalismo e agilidade.`,
      highlight: "Excelência em cada serviço prestado.",
    },
    { type: "contact", title: "Solicite seu orçamento" },
  ],

  Saúde: (s) => [
    {
      type: "hero",
      title: `Sua saúde em boas mãos`,
      subtitle: `${s.name} — cuidado humanizado, profissionais especializados e tecnologia para o seu bem-estar${s.city ? ` em ${s.city}` : ""}.`,
      cta_label: "Agendar consulta",
      cta_href: "#contato",
      badge: "Agendamento online",
    },
    {
      type: "features",
      title: "Nossos diferenciais",
      items: [
        { icon: "👨‍⚕️", title: "Equipe qualificada", body: "Médicos e especialistas com ampla experiência e constante atualização." },
        { icon: "🏥", title: "Estrutura moderna", body: "Equipamentos de última geração para diagnósticos precisos e tratamentos eficazes." },
        { icon: "💙", title: "Atendimento humanizado", body: "Tratamos cada paciente com atenção, respeito e cuidado individualizado." },
        { icon: "📅", title: "Agendamento fácil", body: "Agende sua consulta rapidamente pelo WhatsApp ou telefone." },
      ],
    },
    {
      type: "specialties",
      title: "Especialidades",
      items: [
        { name: "Consultas", description: "Atendimento clínico geral e especializado." },
        { name: "Exames", description: "Diagnósticos precisos com equipamentos modernos." },
        { name: "Procedimentos", description: "Realizamos procedimentos com segurança e conforto." },
      ],
    },
    {
      type: "about",
      title: `Sobre a ${s.name}`,
      body: `A ${s.name} é referência em saúde${s.city ? ` em ${s.city}` : ""}. Nossa missão é oferecer cuidados de saúde com qualidade, humanidade e eficiência, sempre colocando o bem-estar do paciente em primeiro lugar.`,
      highlight: "Saúde e bem-estar são nossa prioridade.",
    },
    { type: "contact", title: "Agende sua consulta" },
  ],

  Advocacia: (s) => [
    {
      type: "hero",
      title: `Defendendo seus direitos com excelência`,
      subtitle: `${s.name} — assessoria jurídica especializada, ética e comprometida com os melhores resultados para você${s.city ? ` em ${s.city}` : ""}.`,
      cta_label: "Consulta inicial",
      cta_href: "#contato",
      badge: "Consulta confidencial",
    },
    {
      type: "features",
      title: "Por que nos confiar seu caso",
      items: [
        { icon: "⚖️", title: "Experiência comprovada", body: "Anos de atuação em diversas áreas do direito com resultados sólidos." },
        { icon: "🔏", title: "Sigilo absoluto", body: "Total confidencialidade no atendimento e no tratamento das informações." },
        { icon: "📞", title: "Atendimento personalizado", body: "Cada caso recebe atenção individual e estratégia jurídica sob medida." },
        { icon: "🏛️", title: "Ética e transparência", body: "Orientação honesta sobre as melhores alternativas para o seu caso." },
      ],
    },
    {
      type: "services",
      title: "Áreas de atuação",
      items: [
        { icon: "👨‍👩‍👧", title: "Direito de Família", body: "Divórcio, guarda, pensão alimentícia e inventários." },
        { icon: "🏢", title: "Direito Empresarial", body: "Contratos, societário, recuperação judicial e compliance." },
        { icon: "👷", title: "Direito Trabalhista", body: "Ações trabalhistas, rescisões e acordos coletivos." },
        { icon: "🏠", title: "Direito Imobiliário", body: "Compra e venda, locação, regularização e usucapião." },
      ],
    },
    {
      type: "about",
      title: `Sobre o ${s.name}`,
      body: `O ${s.name} atua com dedicação e competência na defesa dos interesses de seus clientes. Fundado com os princípios de ética, transparência e excelência técnica, o escritório oferece assessoria jurídica completa${s.city ? ` em ${s.city}` : ""}.`,
      highlight: "Seu direito defendido com competência.",
    },
    { type: "contact", title: "Fale com um advogado" },
  ],

  Tecnologia: (s) => [
    {
      type: "hero",
      title: `Tecnologia que transforma o seu negócio`,
      subtitle: `${s.name} — soluções digitais inovadoras para empresas que querem crescer com eficiência e segurança${s.city ? ` em ${s.city}` : ""}.`,
      cta_label: "Conhecer soluções",
      cta_href: "#servicos",
      badge: "Inovação contínua",
    },
    {
      type: "features",
      title: "O que nos diferencia",
      items: [
        { icon: "🚀", title: "Soluções escaláveis", body: "Desenvolvemos sistemas que crescem junto com o seu negócio." },
        { icon: "🔒", title: "Segurança total", body: "Infraestrutura robusta e protocolos avançados de segurança de dados." },
        { icon: "⚙️", title: "Integração fácil", body: "Nossas soluções se integram facilmente com seus sistemas atuais." },
        { icon: "📊", title: "Relatórios e insights", body: "Dados em tempo real para decisões mais estratégicas e precisas." },
      ],
    },
    {
      type: "steps",
      title: "Como trabalhamos",
      items: [
        { number: "01", title: "Diagnóstico", description: "Entendemos profundamente as necessidades e desafios do seu negócio." },
        { number: "02", title: "Proposta", description: "Desenvolvemos uma solução personalizada com escopo e investimento claros." },
        { number: "03", title: "Desenvolvimento", description: "Implementamos com metodologia ágil, com entregas parciais e validações." },
        { number: "04", title: "Suporte", description: "Acompanhamento contínuo pós-entrega para garantir o sucesso." },
      ],
    },
    {
      type: "about",
      title: `Sobre a ${s.name}`,
      body: `A ${s.name} é uma empresa de tecnologia focada em criar soluções digitais que fazem a diferença. Com uma equipe apaixonada por inovação${s.city ? ` em ${s.city}` : ""}, ajudamos empresas a crescerem com tecnologia de ponta e atendimento de excelência.`,
      highlight: "Tecnologia a serviço do seu crescimento.",
    },
    { type: "contact", title: "Fale com nossos especialistas" },
  ],

  Imobiliária: (s) => [
    {
      type: "hero",
      title: `Encontre o imóvel dos seus sonhos`,
      subtitle: `${s.name} — conectamos pessoas aos melhores imóveis${s.city ? ` em ${s.city} e região` : ""}, com segurança, transparência e suporte completo.`,
      cta_label: "Ver imóveis",
      cta_href: "#imoveis",
      badge: "Novos imóveis disponíveis",
    },
    {
      type: "features",
      title: "Por que escolher a gente",
      items: [
        { icon: "🏠", title: "Portfólio completo", body: "Apartamentos, casas, comerciais e terrenos para todos os perfis." },
        { icon: "📋", title: "Assessoria jurídica", body: "Toda a documentação e processo de compra com segurança jurídica." },
        { icon: "💰", title: "Financiamento facilitado", body: "Ajudamos a encontrar as melhores condições de financiamento." },
        { icon: "🤝", title: "Atendimento personalizado", body: "Corretores dedicados para entender o que você realmente precisa." },
      ],
    },
    {
      type: "categories",
      title: "Tipos de imóveis",
      items: [
        { name: "Residencial", description: "Casas e apartamentos para morar com conforto e segurança." },
        { name: "Comercial", description: "Salas, lojas e galpões para o seu negócio." },
        { name: "Terrenos", description: "Lotes e terrenos para construção ou investimento." },
      ],
    },
    {
      type: "about",
      title: `Sobre a ${s.name}`,
      body: `A ${s.name} é uma imobiliária comprometida com a satisfação de quem compra, vende ou aluga imóveis${s.city ? ` em ${s.city}` : ""}. Nossa equipe de corretores experientes está pronta para ajudá-lo em cada etapa dessa importante decisão.`,
      highlight: "Seu lar ideal está aqui.",
    },
    { type: "contact", title: "Fale com um corretor" },
  ],

  Construção: (s) => [
    {
      type: "hero",
      title: `Construindo sonhos com qualidade e prazo`,
      subtitle: `${s.name} — obras residenciais e comerciais com materiais de primeira qualidade e equipe especializada${s.city ? ` em ${s.city}` : ""}.`,
      cta_label: "Solicitar orçamento",
      cta_href: "#contato",
      badge: "Orçamento gratuito",
    },
    {
      type: "services",
      title: "Nossos serviços",
      items: [
        { icon: "🏗️", title: "Construção", body: "Construção residencial e comercial do zero com toda a supervisão necessária." },
        { icon: "🔧", title: "Reforma", body: "Reformas completas ou parciais com acabamento impecável." },
        { icon: "🏠", title: "Projetos", body: "Desenvolvimento de projetos arquitetônicos e estruturais." },
        { icon: "🎨", title: "Acabamento", body: "Pintura, revestimentos, piso e toda parte de acabamento fino." },
      ],
    },
    {
      type: "steps",
      title: "Nosso processo",
      items: [
        { number: "01", title: "Visita técnica", description: "Nossa equipe visita o local para entender o escopo completo da obra." },
        { number: "02", title: "Orçamento detalhado", description: "Apresentamos um orçamento transparente com materiais e mão de obra." },
        { number: "03", title: "Execução", description: "Iniciamos a obra com cronograma definido e acompanhamento diário." },
        { number: "04", title: "Entrega", description: "Entregamos no prazo com garantia de qualidade e suporte pós-obra." },
      ],
    },
    {
      type: "about",
      title: `Sobre a ${s.name}`,
      body: `A ${s.name} é uma empresa de construção civil com sólida reputação${s.city ? ` em ${s.city}` : ""}. Realizamos obras com rigoroso controle de qualidade, respeitando prazos e o orçamento acordado. Cada obra é tratada como se fosse a nossa própria.`,
      highlight: "Sua obra entregue no prazo e com qualidade.",
    },
    { type: "contact", title: "Peça seu orçamento grátis" },
  ],

  Marketing: (s) => [
    {
      type: "hero",
      title: `Resultados reais para o seu negócio`,
      subtitle: `${s.name} — estratégias de marketing digital que geram leads, aumentam vendas e posicionam sua marca${s.city ? ` em ${s.city}` : ""}.`,
      cta_label: "Quero crescer",
      cta_href: "#contato",
      badge: "Cases de sucesso",
    },
    {
      type: "services",
      title: "Nossos serviços",
      items: [
        { icon: "📱", title: "Social Media", body: "Gestão profissional das suas redes sociais com conteúdo estratégico." },
        { icon: "🎯", title: "Tráfego pago", body: "Campanhas em Google Ads e Meta Ads com foco em ROI." },
        { icon: "✍️", title: "Criação de conteúdo", body: "Textos, imagens e vídeos que engajam e convertem." },
        { icon: "🔍", title: "SEO", body: "Otimização para mecanismos de busca e mais visibilidade orgânica." },
      ],
    },
    {
      type: "steps",
      title: "Como trabalhamos",
      items: [
        { number: "01", title: "Diagnóstico", description: "Analisamos sua presença digital e identificamos oportunidades." },
        { number: "02", title: "Estratégia", description: "Criamos um plano de marketing personalizado para seus objetivos." },
        { number: "03", title: "Execução", description: "Implementamos as ações com agilidade e criatividade." },
        { number: "04", title: "Resultados", description: "Acompanhamos métricas e otimizamos continuamente." },
      ],
    },
    {
      type: "about",
      title: `Sobre a ${s.name}`,
      body: `A ${s.name} é uma agência de marketing digital focada em resultado. Combinamos criatividade com análise de dados para criar estratégias que realmente funcionam${s.city ? ` para empresas em ${s.city} e` : " e"} em todo o Brasil.`,
      highlight: "Marketing que gera resultado de verdade.",
    },
    { type: "contact", title: "Vamos conversar?" },
  ],

  "Profissional liberal": (s) => [
    {
      type: "hero",
      title: `Especialista dedicado ao seu sucesso`,
      subtitle: `${s.name} — atendimento profissional personalizado com foco nos seus resultados${s.city ? ` em ${s.city}` : ""}.`,
      cta_label: "Agendar atendimento",
      cta_href: "#contato",
      badge: "Atendimento presencial e online",
    },
    {
      type: "features",
      title: "Por que me escolher",
      items: [
        { icon: "🎓", title: "Formação especializada", body: "Formação sólida e constante atualização para oferecer o melhor atendimento." },
        { icon: "🤝", title: "Atendimento personalizado", body: "Cada cliente é único e recebe atenção individualizada." },
        { icon: "📱", title: "Presencial e online", body: "Atendo presencialmente e também por videochamada com a mesma qualidade." },
        { icon: "📋", title: "Ética e transparência", body: "Trabalho com total clareza sobre processos, prazos e resultados." },
      ],
    },
    {
      type: "about",
      title: `Sobre ${s.name}`,
      body: `Sou um profissional apaixonado pelo que faço e comprometido com os resultados dos meus clientes. Com experiência e dedicação${s.city ? ` atendo em ${s.city}` : ""}, ofereço serviços de qualidade e atendimento que faz a diferença.`,
      highlight: "Profissionalismo e dedicação em cada atendimento.",
    },
    { type: "contact", title: "Agende seu atendimento" },
  ],
};

// ─── Fallback for unknown categories ─────────────────────────────────────────

const DEFAULT_TEMPLATE = (s: SiteInfo): Section[] => [
  {
    type: "hero",
    title: `Bem-vindo à ${s.name}`,
    subtitle: `Soluções profissionais de qualidade${s.city ? ` em ${s.city}` : ""}. Entre em contato e saiba como podemos ajudá-lo.`,
    cta_label: s.whatsapp ? "Falar no WhatsApp" : "Entre em contato",
    cta_href: "#contato",
    badge: "Atendimento profissional",
  },
  {
    type: "features",
    title: "Nossos diferenciais",
    items: [
      { icon: "✅", title: "Qualidade garantida", body: "Comprometidos com os melhores resultados para cada cliente." },
      { icon: "🤝", title: "Atendimento personalizado", body: "Cada cliente recebe atenção individualizada e dedicada." },
      { icon: "⚡", title: "Agilidade", body: "Respondemos rápido e resolvemos com eficiência." },
      { icon: "🔒", title: "Confiança", body: "Transparência e ética em tudo que fazemos." },
    ],
  },
  {
    type: "about",
    title: `Sobre a ${s.name}`,
    body: `A ${s.name} é uma empresa comprometida com a excelência e a satisfação dos seus clientes${s.city ? ` em ${s.city}` : ""}. Nossa equipe está pronta para atendê-lo com profissionalismo e qualidade.`,
    highlight: "Qualidade e confiança em tudo que fazemos.",
  },
  { type: "contact", title: "Entre em contato" },
];

// ─── Public API ───────────────────────────────────────────────────────────────

/** Generate sections for the home page based on business niche. */
export function generatePageSections(site: SiteInfo): Section[] {
  const template = TEMPLATES[site.category ?? ""] ?? DEFAULT_TEMPLATE;
  return template(site);
}
