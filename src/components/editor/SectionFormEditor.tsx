import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, ArrowLeft } from "lucide-react";
import type { AnySection } from "./AddSectionModal";

interface SectionFormEditorProps {
  section: AnySection;
  onChange: (updated: AnySection) => void;
  onBack: () => void;
}

export function SectionFormEditor({ section, onChange, onBack }: SectionFormEditorProps) {
  function setProp(key: string, value: unknown) {
    onChange({ ...section, [key]: value });
  }

  // ── Items array helpers (for features, services, menu, etc.) ───────────────
  type ItemObject = Record<string, unknown>;

  const items = Array.isArray(section.items) ? (section.items as ItemObject[]) : [];

  function setItemProp(index: number, prop: string, value: unknown) {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [prop]: value } : item
    );
    onChange({ ...section, items: updated });
  }

  function addItem(defaultItem: ItemObject) {
    onChange({ ...section, items: [...items, defaultItem] });
  }

  function removeItem(index: number) {
    onChange({ ...section, items: items.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-6">
      {/* Header with Back button */}
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-8 px-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar às Seções
        </Button>
      </div>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      {section.type === "hero" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="label-mono text-muted-foreground">Badge / Tagline de Destaque</Label>
            <Input
              value={String(section.badge ?? "")}
              onChange={(e) => setProp("badge", e.target.value)}
              placeholder="Ex: Atendimento em São Paulo"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="label-mono text-muted-foreground">Título Principal *</Label>
            <Input
              value={String(section.title ?? "")}
              onChange={(e) => setProp("title", e.target.value)}
              placeholder="Ex: O melhor sabor da cidade"
              className="font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="label-mono text-muted-foreground">Subtítulo / Proposta de Valor</Label>
            <Textarea
              value={String(section.subtitle ?? "")}
              onChange={(e) => setProp("subtitle", e.target.value)}
              placeholder="Descreva de forma persuasiva em 1-2 frases o que sua empresa oferece."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="label-mono text-muted-foreground">Texto do Botão (CTA)</Label>
              <Input
                value={String(section.cta_label ?? "")}
                onChange={(e) => setProp("cta_label", e.target.value)}
                placeholder="Ex: Falar no WhatsApp"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="label-mono text-muted-foreground">Link / Destino</Label>
              <Input
                value={String(section.cta_href ?? "")}
                onChange={(e) => setProp("cta_href", e.target.value)}
                placeholder="Ex: #contato ou https://..."
              />
            </div>
          </div>
        </div>
      )}

      {/* ── FEATURES / DIFERENCIAIS ────────────────────────────────────────── */}
      {section.type === "features" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="label-mono text-muted-foreground">Título da Seção</Label>
            <Input
              value={String(section.title ?? "")}
              onChange={(e) => setProp("title", e.target.value)}
              placeholder="Ex: Por que nos escolher?"
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="label-mono text-muted-foreground">Itens / Diferenciais ({items.length})</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-primary hover:text-primary"
                onClick={() => addItem({ icon: "⭐", title: "Novo Diferencial", body: "Descrição do diferencial." })}
              >
                <Plus className="h-3 w-3 mr-1" /> Adicionar
              </Button>
            </div>

            {items.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-border bg-card/50 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={String(item.icon ?? "")}
                    onChange={(e) => setItemProp(idx, "icon", e.target.value)}
                    placeholder="Emoji"
                    className="w-16 text-center font-mono"
                  />
                  <Input
                    value={String(item.title ?? "")}
                    onChange={(e) => setItemProp(idx, "title", e.target.value)}
                    placeholder="Título do diferencial"
                    className="flex-1 font-medium"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10"
                    onClick={() => removeItem(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  value={String(item.body ?? "")}
                  onChange={(e) => setItemProp(idx, "body", e.target.value)}
                  placeholder="Descrição breve do diferencial..."
                  rows={2}
                  className="text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SERVICES / PRODUTOS ────────────────────────────────────────────── */}
      {section.type === "services" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="label-mono text-muted-foreground">Título da Seção</Label>
            <Input
              value={String(section.title ?? "")}
              onChange={(e) => setProp("title", e.target.value)}
              placeholder="Ex: Nossos Serviços"
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="label-mono text-muted-foreground">Serviços Oferecidos ({items.length})</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-primary"
                onClick={() => addItem({ icon: "💼", title: "Novo Serviço", body: "Descrição do serviço." })}
              >
                <Plus className="h-3 w-3 mr-1" /> Adicionar
              </Button>
            </div>

            {items.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-border bg-card/50 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={String(item.icon ?? "")}
                    onChange={(e) => setItemProp(idx, "icon", e.target.value)}
                    placeholder="Emoji"
                    className="w-16 text-center font-mono"
                  />
                  <Input
                    value={String(item.title ?? "")}
                    onChange={(e) => setItemProp(idx, "title", e.target.value)}
                    placeholder="Nome do serviço"
                    className="flex-1 font-medium"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-destructive"
                    onClick={() => removeItem(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  value={String(item.body ?? "")}
                  onChange={(e) => setItemProp(idx, "body", e.target.value)}
                  placeholder="Descrição do serviço..."
                  rows={2}
                  className="text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STEPS / COMO FUNCIONA ──────────────────────────────────────────── */}
      {section.type === "steps" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="label-mono text-muted-foreground">Título da Seção</Label>
            <Input
              value={String(section.title ?? "")}
              onChange={(e) => setProp("title", e.target.value)}
              placeholder="Ex: Como Funciona"
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="label-mono text-muted-foreground">Etapas ({items.length})</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-primary"
                onClick={() => addItem({ number: `0${items.length + 1}`, title: "Nova Etapa", description: "Descrição do passo." })}
              >
                <Plus className="h-3 w-3 mr-1" /> Adicionar
              </Button>
            </div>

            {items.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-border bg-card/50 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={String(item.number ?? "")}
                    onChange={(e) => setItemProp(idx, "number", e.target.value)}
                    placeholder="01"
                    className="w-16 text-center font-mono font-bold"
                  />
                  <Input
                    value={String(item.title ?? "")}
                    onChange={(e) => setItemProp(idx, "title", e.target.value)}
                    placeholder="Título do passo"
                    className="flex-1 font-medium"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-destructive"
                    onClick={() => removeItem(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  value={String(item.description ?? "")}
                  onChange={(e) => setItemProp(idx, "description", e.target.value)}
                  placeholder="Descrição da etapa..."
                  rows={2}
                  className="text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ABOUT / SOBRE NÓS ──────────────────────────────────────────────── */}
      {section.type === "about" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="label-mono text-muted-foreground">Título da Seção</Label>
            <Input
              value={String(section.title ?? "")}
              onChange={(e) => setProp("title", e.target.value)}
              placeholder="Ex: Sobre Nossa Empresa"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="label-mono text-muted-foreground">Frase de Destaque / Missão</Label>
            <Input
              value={String(section.highlight ?? "")}
              onChange={(e) => setProp("highlight", e.target.value)}
              placeholder="Ex: Excelência e compromisso em cada detalhe."
            />
          </div>

          <div className="space-y-1.5">
            <Label className="label-mono text-muted-foreground">História & Descrição Completa</Label>
            <Textarea
              value={String(section.body ?? "")}
              onChange={(e) => setProp("body", e.target.value)}
              placeholder="Conte a história, missão e diferenciais da empresa."
              rows={5}
            />
          </div>
        </div>
      )}

      {/* ── MENU HIGHLIGHT / CARDÁPIO ──────────────────────────────────────── */}
      {section.type === "menu_highlight" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="label-mono text-muted-foreground">Título da Seção</Label>
            <Input
              value={String(section.title ?? "")}
              onChange={(e) => setProp("title", e.target.value)}
              placeholder="Ex: Destaques do Cardápio"
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="label-mono text-muted-foreground">Itens do Cardápio ({items.length})</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-primary"
                onClick={() => addItem({ name: "Novo Prato / Produto", description: "Descrição dos ingredientes.", price: "R$ 0,00" })}
              >
                <Plus className="h-3 w-3 mr-1" /> Adicionar
              </Button>
            </div>

            {items.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-border bg-card/50 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={String(item.name ?? "")}
                    onChange={(e) => setItemProp(idx, "name", e.target.value)}
                    placeholder="Nome do item"
                    className="flex-1 font-medium"
                  />
                  <Input
                    value={String(item.price ?? "")}
                    onChange={(e) => setItemProp(idx, "price", e.target.value)}
                    placeholder="Preço"
                    className="w-24 font-mono font-bold"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-destructive"
                    onClick={() => removeItem(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  value={String(item.description ?? "")}
                  onChange={(e) => setItemProp(idx, "description", e.target.value)}
                  placeholder="Descrição do prato/produto..."
                  rows={2}
                  className="text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CATEGORIES / ESPECIALIDADES ────────────────────────────────────── */}
      {(section.type === "categories" || section.type === "specialties") && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="label-mono text-muted-foreground">Título da Seção</Label>
            <Input
              value={String(section.title ?? "")}
              onChange={(e) => setProp("title", e.target.value)}
              placeholder="Ex: Categorias em Destaque"
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="label-mono text-muted-foreground">Itens ({items.length})</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-primary"
                onClick={() => addItem({ name: "Nova Categoria", description: "Descrição do segmento." })}
              >
                <Plus className="h-3 w-3 mr-1" /> Adicionar
              </Button>
            </div>

            {items.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-border bg-card/50 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={String(item.name ?? "")}
                    onChange={(e) => setItemProp(idx, "name", e.target.value)}
                    placeholder="Nome da categoria"
                    className="flex-1 font-medium"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-destructive"
                    onClick={() => removeItem(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  value={String(item.description ?? "")}
                  onChange={(e) => setItemProp(idx, "description", e.target.value)}
                  placeholder="Descrição..."
                  rows={2}
                  className="text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      {section.type === "faq" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="label-mono text-muted-foreground">Título da Seção</Label>
            <Input
              value={String(section.title ?? "")}
              onChange={(e) => setProp("title", e.target.value)}
              placeholder="Ex: Dúvidas Frequentes"
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="label-mono text-muted-foreground">Perguntas & Respostas ({items.length})</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-primary"
                onClick={() => addItem({ question: "Nova Pergunta?", answer: "Resposta clara para o cliente." })}
              >
                <Plus className="h-3 w-3 mr-1" /> Adicionar
              </Button>
            </div>

            {items.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-border bg-card/50 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={String(item.question ?? "")}
                    onChange={(e) => setItemProp(idx, "question", e.target.value)}
                    placeholder="Pergunta"
                    className="flex-1 font-medium"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-destructive"
                    onClick={() => removeItem(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  value={String(item.answer ?? "")}
                  onChange={(e) => setItemProp(idx, "answer", e.target.value)}
                  placeholder="Resposta..."
                  rows={2}
                  className="text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CONTACT ────────────────────────────────────────────────────────── */}
      {section.type === "contact" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="label-mono text-muted-foreground">Título da Seção</Label>
            <Input
              value={String(section.title ?? "")}
              onChange={(e) => setProp("title", e.target.value)}
              placeholder="Ex: Fale Conosco"
            />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Os dados de telefone, WhatsApp, e-mail e endereço são configurados na aba <strong>"Contato"</strong> da barra lateral e atualizados automaticamente nesta seção.
          </p>
        </div>
      )}
    </div>
  );
}
