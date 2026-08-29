import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Layout,
  CheckCircle2,
  Briefcase,
  ListOrdered,
  BookOpen,
  UtensilsCrossed,
  Grid,
  HelpCircle,
  PhoneCall,
  Plus,
} from "lucide-react";

export interface AnySection {
  type: string;
  [key: string]: unknown;
}

interface AddSectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSection: (section: AnySection) => void;
  businessName?: string;
  category?: string;
}

interface SectionTemplateOption {
  type: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultData: (name: string, cat: string) => AnySection;
}

const TEMPLATE_OPTIONS: SectionTemplateOption[] = [
  {
    type: "hero",
    title: "Hero Principal",
    description: "Capa do site com título impactante, subtítulo e botão de chamada para ação.",
    icon: Sparkles,
    defaultData: (name) => ({
      type: "hero",
      badge: "Destaque",
      title: `Bem-vindo à ${name}`,
      subtitle: "Soluções completas com qualidade, agilidade e excelência para você.",
      cta_label: "Falar no WhatsApp",
      cta_href: "#contato",
    }),
  },
  {
    type: "features",
    title: "Diferenciais",
    description: "Grade de 4 destaques com ícones e descrições curtas.",
    icon: CheckCircle2,
    defaultData: () => ({
      type: "features",
      title: "Nossos Diferenciais",
      items: [
        { icon: "⚡", title: "Atendimento Rápido", body: "Equipe pronta para responder suas dúvidas com rapidez." },
        { icon: "💎", title: "Alta Qualidade", body: "Padrão de excelência em todos os serviços e produtos." },
        { icon: "🤝", title: "Transparência", body: "Compromisso e ética em cada etapa do processo." },
        { icon: "🛡️", title: "Garantia Total", body: "Satisfação garantida ou suporte imediato." },
      ],
    }),
  },
  {
    type: "services",
    title: "Serviços",
    description: "Apresentação dos principais serviços ou soluções oferecidas.",
    icon: Briefcase,
    defaultData: () => ({
      type: "services",
      title: "Nossos Serviços",
      items: [
        { icon: "💼", title: "Consultoria Especializada", body: "Análise completa para as melhores decisões." },
        { icon: "🚀", title: "Implementação Ágil", body: "Execução rápida e sem burocracias." },
        { icon: "📈", title: "Gestão e Acompanhamento", body: "Monitoramento contínuo para os melhores resultados." },
        { icon: "🎯", title: "Suporte Personalizado", body: "Apoio dedicado para todas as suas necessidades." },
      ],
    }),
  },
  {
    type: "steps",
    title: "Como Funciona (Etapas)",
    description: "Passo a passo numerado (01, 02, 03, 04) do seu processo de atendimento.",
    icon: ListOrdered,
    defaultData: () => ({
      type: "steps",
      title: "Como Funciona Nosso Atendimento",
      items: [
        { number: "01", title: "Primeiro Contato", description: "Fale conosco pelo WhatsApp e conte sua necessidade." },
        { number: "02", title: "Orçamento Sob Medida", description: "Enviamos uma proposta personalizada e transparente." },
        { number: "03", title: "Execução do Serviço", description: "Realizamos o trabalho com qualidade e no prazo." },
        { number: "04", title: "Entrega e Satisfação", description: "Validação final e suporte pós-entrega." },
      ],
    }),
  },
  {
    type: "about",
    title: "Sobre Nós",
    description: "Seção institucional com história, valores e missão da empresa.",
    icon: BookOpen,
    defaultData: (name) => ({
      type: "about",
      title: `Sobre a ${name}`,
      highlight: "Compromisso com a satisfação de cada cliente.",
      body: `A ${name} é uma empresa dedicada a entregar soluções de alto nível. Com anos de dedicação e experiência no mercado, nossa missão é transformar desafios em resultados sólidos.`,
    }),
  },
  {
    type: "menu_highlight",
    title: "Cardápio / Itens em Destaque",
    description: "Ideal para restaurantes, cafeterias e lojas que destacam produtos e preços.",
    icon: UtensilsCrossed,
    defaultData: () => ({
      type: "menu_highlight",
      title: "Destaques do Cardápio",
      items: [
        { name: "Opção Especial da Casa", description: "Ingredientes selecionados com sabor inigualável.", price: "R$ 49,90" },
        { name: "Opção Tradicional", description: "A receita clássica favorita de nossos clientes.", price: "R$ 39,90" },
        { name: "Sobremesa Especial", description: "O toque doce perfeito para finalizar.", price: "R$ 19,90" },
      ],
    }),
  },
  {
    type: "categories",
    title: "Categorias / Catálogo",
    description: "Exibição de segmentos de produtos ou categorias de atuação.",
    icon: Grid,
    defaultData: () => ({
      type: "categories",
      title: "Categorias em Destaque",
      items: [
        { name: "Mais Procurados", description: "As principais opções recomendadas." },
        { name: "Lançamentos e Novidades", description: "Confira as últimas novidades adicionadas." },
        { name: "Condições Especiais", description: "Oportunidades exclusivas por tempo limitado." },
      ],
    }),
  },
  {
    type: "faq",
    title: "Perguntas Frequentes (FAQ)",
    description: "Respostas diretas para as dúvidas mais comuns dos seus clientes.",
    icon: HelpCircle,
    defaultData: () => ({
      type: "faq",
      title: "Dúvidas Frequentes",
      items: [
        { question: "Como faço para solicitar um orçamento?", answer: "Basta clicar no botão de WhatsApp ou preencher o formulário de contato abaixo." },
        { question: "Qual é o prazo médio de atendimento?", answer: "Respondemos em até poucas horas em horário comercial." },
        { question: "Quais são as formas de pagamento aceitas?", answer: "Aceitamos Pix, cartão de crédito e boleto bancário." },
      ],
    }),
  },
  {
    type: "contact",
    title: "Seção de Contato",
    description: "Canais de atendimento, telefones, endereço e botão do WhatsApp.",
    icon: PhoneCall,
    defaultData: () => ({
      type: "contact",
      title: "Entre em Contato Conosco",
    }),
  },
];

export function AddSectionModal({
  open,
  onOpenChange,
  onAddSection,
  businessName = "Empresa",
  category = "Serviços",
}: AddSectionModalProps) {
  function handleSelect(option: SectionTemplateOption) {
    const newSection = option.defaultData(businessName, category);
    onAddSection(newSection);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <Layout className="h-5 w-5 text-primary" />
            Adicionar Nova Seção
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Escolha um bloco estruturado para incluir na página do seu site.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {TEMPLATE_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.type}
                type="button"
                onClick={() => handleSelect(option)}
                className="flex flex-col text-left p-4 rounded-lg border border-border bg-card hover:border-primary hover:bg-primary/5 transition-all text-card-foreground group"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-sm tracking-tight">{option.title}</span>
                  </div>
                  <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
