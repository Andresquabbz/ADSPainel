import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Copy,
  Plus,
  Pencil,
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
} from "lucide-react";
import type { AnySection } from "./AddSectionModal";
import { AddSectionModal } from "./AddSectionModal";
import { SectionFormEditor } from "./SectionFormEditor";

interface SectionListProps {
  sections: AnySection[];
  onChange: (updated: AnySection[]) => void;
  selectedSectionIndex: number | null;
  onSelectSection: (index: number | null) => void;
  businessName?: string;
  category?: string;
}

const SECTION_TYPE_LABELS: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  hero: { label: "Hero Principal", icon: Sparkles },
  features: { label: "Diferenciais", icon: CheckCircle2 },
  services: { label: "Serviços", icon: Briefcase },
  steps: { label: "Como Funciona", icon: ListOrdered },
  about: { label: "Sobre Nós", icon: BookOpen },
  menu_highlight: { label: "Cardápio / Itens", icon: UtensilsCrossed },
  categories: { label: "Categorias", icon: Grid },
  specialties: { label: "Especialidades", icon: Grid },
  faq: { label: "Perguntas Frequentes", icon: HelpCircle },
  contact: { label: "Contato & WhatsApp", icon: PhoneCall },
};

export function SectionList({
  sections,
  onChange,
  selectedSectionIndex,
  onSelectSection,
  businessName,
  category,
}: SectionListProps) {
  const [addModalOpen, setAddModalOpen] = useState(false);

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...sections];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    onChange(next);
    if (selectedSectionIndex === index) onSelectSection(index - 1);
  }

  function moveDown(index: number) {
    if (index === sections.length - 1) return;
    const next = [...sections];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    onChange(next);
    if (selectedSectionIndex === index) onSelectSection(index + 1);
  }

  function duplicateSection(index: number) {
    const target = sections[index];
    const cloned = JSON.parse(JSON.stringify(target)) as AnySection;
    if (typeof cloned.title === "string") {
      cloned.title = `${cloned.title} (Cópia)`;
    }
    const next = [...sections];
    next.splice(index + 1, 0, cloned);
    onChange(next);
    onSelectSection(index + 1);
  }

  function deleteSection(index: number) {
    const next = sections.filter((_, i) => i !== index);
    onChange(next);
    if (selectedSectionIndex === index) onSelectSection(null);
    else if (selectedSectionIndex !== null && selectedSectionIndex > index) {
      onSelectSection(selectedSectionIndex - 1);
    }
  }

  function handleSectionChange(updated: AnySection) {
    if (selectedSectionIndex === null) return;
    const next = [...sections];
    next[selectedSectionIndex] = updated;
    onChange(next);
  }

  function handleAddSection(newSection: AnySection) {
    const next = [...sections, newSection];
    onChange(next);
    onSelectSection(next.length - 1);
  }

  // If a section is selected for editing, show the detailed SectionFormEditor
  if (selectedSectionIndex !== null && sections[selectedSectionIndex]) {
    return (
      <SectionFormEditor
        section={sections[selectedSectionIndex]}
        onChange={handleSectionChange}
        onBack={() => onSelectSection(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-sm">Seções da Página</h4>
          <p className="text-xs text-muted-foreground">
            {sections.length} {sections.length === 1 ? "bloco ativo" : "blocos ativos"}
          </p>
        </div>
        <Button
          variant="hero"
          size="sm"
          onClick={() => setAddModalOpen(true)}
          className="h-8 gap-1 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar
        </Button>
      </div>

      {/* Sections list */}
      <div className="space-y-2">
        {sections.map((sec, idx) => {
          const typeInfo = SECTION_TYPE_LABELS[sec.type] || {
            label: sec.type,
            icon: Layout,
          };
          const Icon = typeInfo.icon;
          const isSelected = selectedSectionIndex === idx;

          return (
            <div
              key={idx}
              className={`group flex items-center justify-between p-3 rounded-lg border transition-all ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border bg-card hover:border-border/80 hover:bg-muted/40"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectSection(idx)}
                className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:text-foreground shrink-0">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="truncate">
                  <p className="font-semibold text-xs truncate">
                    {String(sec.title || typeInfo.label)}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase">
                    {typeInfo.label}
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  title="Mover para cima"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => moveDown(idx)}
                  disabled={idx === sections.length - 1}
                  title="Mover para baixo"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                  onClick={() => onSelectSection(idx)}
                  title="Editar bloco"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => duplicateSection(idx)}
                  title="Duplicar seção"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteSection(idx)}
                  title="Excluir seção"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <AddSectionModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAddSection={handleAddSection}
        businessName={businessName}
        category={category}
      />
    </div>
  );
}
