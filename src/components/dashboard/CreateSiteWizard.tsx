import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, Check, Search, Loader2, Building2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SITE_CATEGORIES, SITE_GOALS, SITE_STYLES, SITE_FONTS } from "@/config/app";
import { generateSite } from "@/functions/generate-site";
import { GeneratingScreen } from "./GeneratingScreen";
import { supabase } from "@/integrations/supabase/client";
import { cleanBusinessName } from "@/lib/slug";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreateSiteWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onOpenBuyTokens?: () => void;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type WizardData = {
  name: string;
  business_name: string;
  category: string;
  goal: string;
  style: string;
  primary_color: string;
  font_family: string;
  phone: string;
  whatsapp: string;
  email: string;
  city: string;
  state: string;
};

interface CnpjResult {
  razao_social: string;
  estabelecimento: {
    nome_fantasia: string | null;
    telefone1: string | null;
    ddd1: string | null;
    email: string | null;
    cidade: { nome: string } | null;
    estado: { sigla: string } | null;
    atividade_principal: { descricao: string } | null;
    situacao_cadastral: string;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_DATA: WizardData = {
  name: "",
  business_name: "",
  category: "",
  goal: "",
  style: "",
  primary_color: "#e2603a",
  font_family: "Hanken Grotesk",
  phone: "",
  whatsapp: "",
  email: "",
  city: "",
  state: "",
};

const COLOR_PRESETS = [
  "#e2603a", "#3aa5e2", "#4ac97e", "#c9a84c",
  "#8a8fa3", "#6c7cff", "#e24a7c", "#4ac9c9",
];

const STEPS = ["Negócio", "Visual", "Contato"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cleanCnpj(raw: string): string {
  return raw.replace(/\D/g, "");
}

function formatPhone(ddd: string | null, tel: string | null): string {
  if (!ddd || !tel) return "";
  return `(${ddd}) ${tel.replace(/(\d{4})(\d{4})/, "$1-$2")}`;
}

function guessCategory(descricao: string | null): string {
  if (!descricao) return "";
  const d = descricao.toLowerCase();
  if (d.includes("restaurante") || d.includes("alimenta") || d.includes("bar") || d.includes("café")) return "Restaurante";
  if (d.includes("loja") || d.includes("comércio") || d.includes("varejo") || d.includes("venda")) return "Loja";
  if (d.includes("saúde") || d.includes("clínica") || d.includes("médic") || d.includes("odont") || d.includes("farmácia")) return "Saúde";
  if (d.includes("imóv") || d.includes("imobil")) return "Imobiliária";
  if (d.includes("advogad") || d.includes("jurídic")) return "Advocacia";
  if (d.includes("tecnolog") || d.includes("softwar") || d.includes("inform")) return "Tecnologia";
  if (d.includes("constru") || d.includes("engenharia") || d.includes("reforma")) return "Construção";
  if (d.includes("market") || d.includes("publicidad") || d.includes("propaganda")) return "Marketing";
  return "Serviços";
}

// ─── Wizard component ─────────────────────────────────────────────────────────

export function CreateSiteWizard({
  open,
  onOpenChange,
  userId,
  onOpenBuyTokens,
}: CreateSiteWizardProps) {
  // step: -1 = CNPJ screen, 0/1/2 = form steps, "generating" = loading
  const [step, setStep] = useState<-1 | 0 | 1 | 2 | "generating">(-1);

  // CNPJ
  const [cnpj, setCnpj] = useState("");
  const [cnpjFormatted, setCnpjFormatted] = useState("");
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjResult, setCnpjResult] = useState<CnpjResult | null>(null);

  // Form data
  const [data, setData] = useState<WizardData>(INITIAL_DATA);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  function setField<K extends keyof WizardData>(key: K, value: WizardData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  // ── CNPJ lookup ────────────────────────────────────────────────────
  async function handleCnpjLookup() {
    const cleaned = cleanCnpj(cnpj);
    if (cleaned.length !== 14) {
      toast.error("CNPJ inválido. Digite os 14 dígitos.");
      return;
    }
    setCnpjLoading(true);
    try {
      const res = await fetch(`https://publica.cnpj.ws/cnpj/${cleaned}`);
      if (!res.ok) throw new Error("CNPJ não encontrado.");
      const json: CnpjResult = await res.json();

      if (json.estabelecimento.situacao_cadastral !== "Ativa") {
        toast.warning("Atenção: situação cadastral diferente de Ativa.", {
          description: `Situação: ${json.estabelecimento.situacao_cadastral}`,
        });
      }

      setCnpjResult(json);

      const formatted = cleaned.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        "$1.$2.$3/$4-$5"
      );
      setCnpjFormatted(formatted);

      const fantasia = json.estabelecimento.nome_fantasia;
      const razao = json.razao_social;
      const tel = formatPhone(json.estabelecimento.ddd1, json.estabelecimento.telefone1);
      const categoria = guessCategory(json.estabelecimento.atividade_principal?.descricao ?? null);

      const cleanedRazao = cleanBusinessName(razao);
      const suggestedName = fantasia?.trim() ? fantasia.trim() : (cleanedRazao || razao.trim());

      setData({
        ...INITIAL_DATA,
        name: suggestedName,
        business_name: cleanedRazao || razao.trim(),
        category: categoria,
        goal: "Captar clientes",
        phone: tel,
        whatsapp: tel,
        email: json.estabelecimento.email?.toLowerCase() ?? "",
        city: json.estabelecimento.cidade?.nome ?? "",
        state: json.estabelecimento.estado?.sigla ?? "",
      });

      toast.success("Dados importados com sucesso!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro ao consultar CNPJ.");
    } finally {
      setCnpjLoading(false);
    }
  }

  // ── Validation ─────────────────────────────────────────────────────
  function isStep0Valid() {
    return data.name.trim().length >= 2 && data.business_name.trim().length >= 2 && !!data.category && !!data.goal;
  }

  function isStep1Valid() {
    return !!data.style && !!data.font_family;
  }

  function canProceed(): boolean {
    if (step === 0) return isStep0Valid();
    if (step === 1) return isStep1Valid();
    return true;
  }

  // ── Generate (calls server fn) ─────────────────────────────────────
  async function handleGenerate() {
    setStep("generating");
    try {
      const result = await generateSite({
        data: {
          name: data.name.trim(),
          business_name: data.business_name.trim(),
          cnpj: cnpjFormatted || null,
          category: data.category || null,
          goal: data.goal || null,
          style: data.style || null,
          primary_color: data.primary_color,
          font_family: data.font_family,
          phone: data.phone.trim() || null,
          whatsapp: data.whatsapp.trim() || null,
          email: data.email.trim() || null,
          city: data.city.trim() || null,
          state: data.state.trim() || null,
        },
      });

      const SUPER_ADMIN_EMAILS = ["andre.jesus.rocha@gmail.com"];
      const { data: curProf } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .maybeSingle();

      const isSuperAdmin = SUPER_ADMIN_EMAILS.includes((curProf?.email || "").toLowerCase());

      if (!isSuperAdmin) {
        queryClient.setQueryData(["profile", userId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            token_balance: Math.max(0, (Number(old.token_balance) || 0) - 2.5),
          };
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["sites"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await queryClient.invalidateQueries({ queryKey: ["token_transactions"] });

      toast.success("Site gerado com sucesso! 🎉", {
        description: isSuperAdmin
          ? `${result.sectionsCount} seções criadas${result.usedAI ? " com IA" : " por template"} (Super Admin: tokens infinitos).`
          : `${result.sectionsCount} seções criadas${result.usedAI ? " com IA" : " por template"}. Foram debitados 2,5 tokens.`,
      });
      handleClose();
      navigate({ to: "/editor/$siteId", params: { siteId: result.siteId } });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao gerar o site.";
      toast.error(msg);
      if (msg.toLowerCase().includes("saldo insuficiente")) {
        handleClose();
        onOpenBuyTokens?.();
      } else {
        // Return to the last form step so user can retry
        setStep(2);
      }
    }
  }

  function handleClose() {
    if (step === "generating") return; // don't allow closing during generation
    onOpenChange(false);
    setTimeout(() => {
      setStep(-1);
      setCnpj("");
      setCnpjFormatted("");
      setCnpjResult(null);
      setData(INITIAL_DATA);
    }, 300);
  }

  const stepperIndex = typeof step === "number" && step >= 0 ? step : -1;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-lg"
        // Prevent closing via backdrop click while generating
        onInteractOutside={(e) => step === "generating" && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold tracking-tight">
            {step === "generating" ? "Gerando seu site..." : "Criar novo site"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === -1
              ? "Consulte um CNPJ para preencher os dados automaticamente."
              : step === "generating"
                ? "Nossa IA está criando o conteúdo personalizado do seu site."
                : "Preencha as informações para configurar seu site."}
          </DialogDescription>
        </DialogHeader>

        {/* ── Generating screen ──────────────────────────────────── */}
        {step === "generating" && (
          <GeneratingScreen
            siteName={data.name || data.business_name}
            category={data.category || null}
          />
        )}

        {/* ── CNPJ screen ────────────────────────────────────────── */}
        {step === -1 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="label-mono text-muted-foreground">CNPJ da empresa</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="00.000.000/0001-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !cnpjLoading && handleCnpjLookup()}
                  className="h-11 font-mono"
                  maxLength={18}
                />
                <Button
                  variant="hero"
                  className="h-11 shrink-0"
                  onClick={handleCnpjLookup}
                  disabled={cnpjLoading || cleanCnpj(cnpj).length !== 14}
                >
                  {cnpjLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
              <p className="font-mono text-[11px] text-muted-foreground">
                Dados via Receita Federal — gratuito e sem cadastro.
              </p>
            </div>

            {cnpjResult && (
              <div className="border border-primary/40 bg-primary/5 p-4 space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary shrink-0" />
                  <p className="font-semibold truncate">
                    {cnpjResult.estabelecimento.nome_fantasia || cnpjResult.razao_social}
                  </p>
                </div>
                <p className="font-mono text-xs text-muted-foreground">{cnpjResult.razao_social}</p>
                {cnpjResult.estabelecimento.atividade_principal && (
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {cnpjResult.estabelecimento.atividade_principal.descricao}
                  </p>
                )}
                <p className="font-mono text-[11px] text-muted-foreground">
                  {cnpjResult.estabelecimento.cidade?.nome}
                  {cnpjResult.estabelecimento.estado ? ` — ${cnpjResult.estabelecimento.estado.sigla}` : ""}
                </p>
                <span className="label-mono text-xs text-primary">
                  {cnpjResult.estabelecimento.situacao_cadastral}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="label-mono text-muted-foreground hover:text-foreground transition-colors text-xs"
              >
                Preencher manualmente →
              </button>
              <Button variant="hero" onClick={() => setStep(0)} disabled={!cnpjResult}>
                Continuar
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Main form steps (0/1/2) ────────────────────────────── */}
        {typeof step === "number" && step >= 0 && (
          <>
            {/* Stepper */}
            <div className="flex items-center gap-0 border border-border">
              {STEPS.map((label, i) => (
                <div
                  key={label}
                  className={`flex flex-1 items-center justify-center gap-1.5 border-r border-border py-2.5 last:border-r-0 ${
                    i === stepperIndex
                      ? "bg-primary text-primary-foreground"
                      : i < stepperIndex
                        ? "bg-primary/20 text-primary"
                        : "bg-background text-muted-foreground"
                  }`}
                >
                  {i < stepperIndex ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <span className="font-mono text-xs font-bold">{i + 1}</span>
                  )}
                  <span className="font-mono text-[11px] uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </div>

            {/* Step 0 — Negócio */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="label-mono text-muted-foreground">Nome do site *</Label>
                  <Input
                    placeholder="Ex: Bistrô Nova"
                    value={data.name}
                    onChange={(e) => setField("name", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="label-mono text-muted-foreground">Razão social *</Label>
                  <Input
                    placeholder="Ex: Bistrô Nova Ltda."
                    value={data.business_name}
                    onChange={(e) => setField("business_name", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="label-mono text-muted-foreground">Segmento *</Label>
                    <Select value={data.category} onValueChange={(v) => setField("category", v)}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {SITE_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="label-mono text-muted-foreground">Objetivo *</Label>
                    <Select value={data.goal} onValueChange={(v) => setField("goal", v)}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {SITE_GOALS.map((g) => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1 — Visual */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="label-mono text-muted-foreground">Estilo visual *</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {SITE_STYLES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setField("style", s)}
                        className={`border px-3 py-2 font-mono text-xs transition-colors ${
                          data.style === s
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="label-mono text-muted-foreground">Cor principal</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setField("primary_color", color)}
                        className={`h-8 w-8 border-2 transition-transform hover:scale-110 ${
                          data.primary_color === color ? "border-foreground scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                    <input
                      type="color"
                      value={data.primary_color}
                      onChange={(e) => setField("primary_color", e.target.value)}
                      className="h-8 w-8 cursor-pointer border border-border bg-background p-0.5"
                      title="Cor personalizada"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="label-mono text-muted-foreground">Fonte *</Label>
                  <Select value={data.font_family} onValueChange={(v) => setField("font_family", v)}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SITE_FONTS.map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2 — Contato */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="label-mono text-muted-foreground">Telefone</Label>
                    <Input
                      placeholder="(11) 9 9999-9999"
                      value={data.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="label-mono text-muted-foreground">WhatsApp</Label>
                    <Input
                      placeholder="(11) 9 9999-9999"
                      value={data.whatsapp}
                      onChange={(e) => setField("whatsapp", e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="label-mono text-muted-foreground">E-mail do negócio</Label>
                  <Input
                    type="email"
                    placeholder="contato@empresa.com.br"
                    value={data.email}
                    onChange={(e) => setField("email", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="label-mono text-muted-foreground">Cidade</Label>
                    <Input
                      placeholder="São Paulo"
                      value={data.city}
                      onChange={(e) => setField("city", e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="label-mono text-muted-foreground">Estado</Label>
                    <Input
                      placeholder="SP"
                      maxLength={2}
                      value={data.state}
                      onChange={(e) => setField("state", e.target.value.toUpperCase())}
                      className="h-11"
                    />
                  </div>
                </div>
                <p className="font-mono text-[11px] text-muted-foreground">
                  Campos de contato são opcionais mas melhoram o site gerado.
                </p>
              </div>
            )}

            {/* Footer navigation */}
            <div className="flex justify-between gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() =>
                  step === 0 ? setStep(-1) : setStep((s) => (typeof s === "number" ? (s - 1) as 0 | 1 | 2 : s))
                }
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Voltar
              </Button>

              {step < 2 ? (
                <Button
                  variant="hero"
                  onClick={() => setStep((s) => (typeof s === "number" ? (s + 1) as 1 | 2 : s))}
                  disabled={!canProceed()}
                >
                  Próximo
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button variant="hero" onClick={handleGenerate} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Gerar com IA
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
