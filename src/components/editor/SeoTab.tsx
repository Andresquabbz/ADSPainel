import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, ShieldCheck, AlertCircle } from "lucide-react";
import { subdomainFor } from "@/config/app";

interface SeoTabProps {
  seoTitle: string;
  onChangeSeoTitle: (val: string) => void;
  seoDescription: string;
  onChangeSeoDescription: (val: string) => void;
  metaVerificationTag: string;
  onChangeMetaVerificationTag: (val: string) => void;
  siteSlug: string;
}

export function SeoTab({
  seoTitle,
  onChangeSeoTitle,
  seoDescription,
  onChangeSeoDescription,
  metaVerificationTag,
  onChangeMetaVerificationTag,
  siteSlug,
}: SeoTabProps) {
  return (
    <div className="space-y-6">
      {/* ── Meta Title ── */}
      <div className="space-y-1.5">
        <Label className="label-mono text-muted-foreground">Título para o Google (Meta Title)</Label>
        <Input
          value={seoTitle}
          onChange={(e) => onChangeSeoTitle(e.target.value)}
          placeholder="Ex: Restaurante Nova — O Melhor Sabor de São Paulo"
          className="h-10"
        />
        <p className="text-[11px] text-muted-foreground flex justify-between">
          <span>Recomendado: até 60 caracteres</span>
          <span className={seoTitle.length > 60 ? "text-warning font-bold" : ""}>
            {seoTitle.length}/60
          </span>
        </p>
      </div>

      {/* ── Meta Description ── */}
      <div className="space-y-1.5">
        <Label className="label-mono text-muted-foreground">Descrição nos Buscadores (Meta Description)</Label>
        <Textarea
          value={seoDescription}
          onChange={(e) => onChangeSeoDescription(e.target.value)}
          placeholder="Ex: Conheça nosso cardápio exclusivo em São Paulo. Ingredientes frescos, ambiente acolhedor e entrega rápida pelo WhatsApp."
          rows={3}
        />
        <p className="text-[11px] text-muted-foreground flex justify-between">
          <span>Recomendado: até 160 caracteres</span>
          <span className={seoDescription.length > 160 ? "text-warning font-bold" : ""}>
            {seoDescription.length}/160
          </span>
        </p>
      </div>

      {/* ── Meta Tag de Verificação (Facebook / BM) ── */}
      <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
          <Label className="font-bold text-xs text-foreground">
            Verificação de Domínio Meta (Facebook BM)
          </Label>
        </div>

        <Textarea
          value={metaVerificationTag}
          onChange={(e) => onChangeMetaVerificationTag(e.target.value)}
          placeholder='Cole a tag completa ou apenas o código. Ex: <meta name="facebook-domain-verification" content="xxxxx" /> ou apenas xxxxx'
          rows={3}
          className="font-mono text-xs bg-background"
        />

        <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground leading-relaxed">
          <AlertCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <p>
            <strong>Instrução:</strong> Você só vai preencher aqui após criar o domínio no Facebook Business Manager (BM). Pegue a meta tag gerada pelo Facebook, cole aqui e clique em <strong>Salvar</strong>.
          </p>
        </div>
      </div>

      {/* ── Google Search Result Preview ── */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <Search className="h-3.5 w-3.5" />
          Preview nos Resultados de Busca (Google)
        </div>
        <div className="p-4 rounded-lg border border-border bg-card text-left space-y-1">
          <p className="text-xs text-muted-foreground truncate font-mono">
            https://{subdomainFor(siteSlug)}
          </p>
          <p className="text-sm font-semibold text-primary truncate hover:underline cursor-pointer">
            {seoTitle || "Título da Página — Nome da Empresa"}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {seoDescription || "Descrição do site como aparecerá nos resultados de busca do Google..."}
          </p>
        </div>
      </div>
    </div>
  );
}
