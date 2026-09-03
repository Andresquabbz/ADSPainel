import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Globe,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Pencil,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { subdomainFor, APP_CONFIG } from "@/config/app";
import { supabase } from "@/integrations/supabase/client";
import { cleanSlug, validateSlug } from "@/lib/slug";
import {
  addCustomDomain,
  removeCustomDomain,
  verifyCustomDomain,
} from "@/functions/manage-custom-domain";

interface DomainSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteId?: string;
  userId?: string;
  siteSlug: string;
  siteName: string;
  onSlugUpdated?: (newSlug: string) => void;
}

interface DomainRecord {
  id: string;
  domain: string;
  record_type: string;
  status: "pending" | "verified" | "failed";
  ssl_active: boolean;
  is_primary: boolean;
  created_at: string;
}

export function DomainSettingsDialog({
  open,
  onOpenChange,
  siteId,
  userId,
  siteSlug,
  siteName,
  onSlugUpdated,
}: DomainSettingsDialogProps) {
  const queryClient = useQueryClient();
  const [currentSlug, setCurrentSlug] = useState(siteSlug);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [slugInput, setSlugInput] = useState(siteSlug);
  const [savingSlug, setSavingSlug] = useState(false);
  const [copiedSubdomain, setCopiedSubdomain] = useState(false);

  const [customDomainInput, setCustomDomainInput] = useState("");
  const [savedDomain, setSavedDomain] = useState<DomainRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingDns, setCheckingDns] = useState(false);
  const [savingDomain, setSavingDomain] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const publicPathUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/s/${currentSlug}`
      : `/s/${currentSlug}`;

  const fullSubdomain = subdomainFor(currentSlug);

  useEffect(() => {
    setCurrentSlug(siteSlug);
    setSlugInput(siteSlug);
    setIsEditingSlug(false);
  }, [siteSlug, open]);

  // ── 1. Fetch existing domain for this site on open ───────────────────────
  useEffect(() => {
    if (open && siteId) {
      loadDomain();
    }
  }, [open, siteId]);

  async function loadDomain() {
    if (!siteId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("domains")
        .select("*")
        .eq("site_id", siteId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSavedDomain(data as DomainRecord);
        setCustomDomainInput(data.domain);
      } else {
        setSavedDomain(null);
        setCustomDomainInput("");
      }
    } catch (e: unknown) {
      console.error("[DomainSettingsDialog] error loading domain:", e);
    } finally {
      setLoading(false);
    }
  }

  // ── 1.5. Save / Customize Subdomain Slug ───────────────────────────────
  async function handleSaveSubdomain() {
    const cleaned = cleanSlug(slugInput);
    const validationError = validateSlug(cleaned);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    if (cleaned === currentSlug) {
      setIsEditingSlug(false);
      return;
    }
    if (!siteId) {
      toast.error("ID do site ausente.");
      return;
    }

    setSavingSlug(true);
    try {
      // Check if taken by another site
      const { data: existing } = await supabase
        .from("sites")
        .select("id")
        .eq("slug", cleaned)
        .neq("id", siteId)
        .maybeSingle();

      if (existing) {
        toast.error(`O subdomínio "${cleaned}" já está em uso. Escolha outro.`);
        return;
      }

      // Update in sites table
      const { error: updateErr } = await supabase
        .from("sites")
        .update({ slug: cleaned })
        .eq("id", siteId);

      if (updateErr) throw updateErr;

      setCurrentSlug(cleaned);
      setIsEditingSlug(false);
      onSlugUpdated?.(cleaned);

      await queryClient.invalidateQueries({ queryKey: ["sites"] });
      await queryClient.invalidateQueries({ queryKey: ["editor-site", siteId] });

      toast.success(`Subdomínio atualizado com sucesso! 🎉`, {
        description: `Novo endereço: ${cleaned}.${APP_CONFIG.rootDomain}`,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao atualizar subdomínio.";
      toast.error(msg);
    } finally {
      setSavingSlug(false);
    }
  }

  // ── 2. Save / Connect Custom Domain (Automated Vercel API) ─────────────
  async function handleSaveCustomDomain() {
    const raw = customDomainInput.trim().toLowerCase();
    const cleaned = raw.replace(/^https?:\/\//, "").replace(/\/+$/, "").trim();

    if (!cleaned || !cleaned.includes(".")) {
      toast.error("Informe um domínio válido (ex: www.minhaempresa.com.br)");
      return;
    }

    if (!siteId) {
      toast.error("Identificação do site ausente.");
      return;
    }

    setSavingDomain(true);
    try {
      const res = await addCustomDomain({
        data: {
          siteId,
          domain: cleaned,
        },
      });

      await loadDomain();

      toast.success("Domínio configurado com sucesso! 🎉", {
        description: res?.verified
          ? "Domínio verificado e ativo na Vercel!"
          : "Domínio cadastrado na Vercel. Crie o apontamento CNAME para concluir.",
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao salvar domínio.";
      toast.error(msg);
    } finally {
      setSavingDomain(false);
    }
  }

  // ── 3. Check DNS Propagation & Vercel SSL ────────────────────────────────
  async function handleVerifyDns() {
    const domainToCheck = savedDomain?.domain || customDomainInput.trim().toLowerCase();
    if (!domainToCheck || !siteId) return;

    setCheckingDns(true);
    try {
      const res = await verifyCustomDomain({
        data: {
          siteId,
          domain: domainToCheck,
        },
      });

      await loadDomain();

      if (res?.verified) {
        toast.success("Apontamento DNS e SSL verificados com sucesso! 🎉", {
          description: `O domínio ${domainToCheck} está 100% online e seguro.`,
        });
      } else {
        toast.warning("Apontamento CNAME em propagação.", {
          description: `Aponte o CNAME para ${APP_CONFIG.cnameTarget}. A Vercel está emitindo o certificado SSL.`,
        });
      }
    } catch {
      toast.info("Consulta realizada. Aguarde a propagação do seu provedor de DNS.");
    } finally {
      setCheckingDns(false);
    }
  }

  // ── 4. Remove / Disconnect Domain (Vercel + Database) ───────────────────
  async function handleRemoveDomain() {
    if (!savedDomain?.domain || !siteId) return;
    setSavingDomain(true);
    try {
      await removeCustomDomain({
        data: {
          siteId,
          domain: savedDomain.domain,
        },
      });

      setSavedDomain(null);
      setCustomDomainInput("");
      toast.success("Domínio desconectado com sucesso.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro ao remover domínio.");
    } finally {
      setSavingDomain(false);
    }
  }

  function handleCopyPublicUrl() {
    navigator.clipboard.writeText(publicPathUrl);
    setCopiedLink(true);
    toast.success("Link público copiado!");
    setTimeout(() => setCopiedLink(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <Globe className="h-5 w-5 text-primary" />
            Publicação & Domínio
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Endereços de acesso e configuração DNS para <strong>{siteName}</strong>.
          </DialogDescription>
        </DialogHeader>

        {/* ── Option 1: Direct Clean Link ── */}
        <div className="p-4 rounded-lg border border-border bg-card space-y-2">
          <Label className="label-mono text-muted-foreground">Link Público Direto</Label>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={publicPathUrl}
              className="font-mono text-xs h-9 bg-muted/30"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyPublicUrl}
              className="h-9 px-3 shrink-0 gap-1 text-xs"
            >
              {copiedLink ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copiedLink ? "Copiado" : "Copiar"}
            </Button>
            <Button
              type="button"
              variant="hero"
              size="sm"
              asChild
              className="h-9 px-3 shrink-0"
            >
              <a href={publicPathUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Link público imediato e permanente, pronto para compartilhar.
          </p>
        </div>

        {/* ── Option 2: Automatic Subdomain (Editable) ── */}
        <div className="p-4 rounded-lg border border-border bg-card space-y-3">
          <div className="flex items-center justify-between">
            <Label className="label-mono text-muted-foreground">Subdomínio {APP_CONFIG.name}</Label>
            {!isEditingSlug && siteId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSlugInput(currentSlug);
                  setIsEditingSlug(true);
                }}
                className="h-6 px-2 text-xs text-primary gap-1 hover:bg-primary/10"
              >
                <Pencil className="h-3 w-3" />
                Personalizar
              </Button>
            )}
          </div>

          {isEditingSlug ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Input
                    value={slugInput}
                    onChange={(e) =>
                      setSlugInput(
                        e.target.value
                          .toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .replace(/[^a-z0-9-]/g, "")
                      )
                    }
                    placeholder="seu-subdominio"
                    className="font-mono text-xs h-9"
                    autoFocus
                  />
                </div>
                <span className="text-xs text-muted-foreground font-mono shrink-0">
                  .{APP_CONFIG.rootDomain}
                </span>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSlugInput(currentSlug);
                    setIsEditingSlug(false);
                  }}
                  disabled={savingSlug}
                  className="h-8 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveSubdomain}
                  disabled={savingSlug || !slugInput.trim()}
                  className="h-8 text-xs gap-1"
                >
                  {savingSlug && <Loader2 className="h-3 w-3 animate-spin" />}
                  Salvar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={`https://${fullSubdomain}`}
                className="font-mono text-xs h-9 bg-muted/30"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(`https://${fullSubdomain}`);
                  setCopiedSubdomain(true);
                  toast.success("Subdomínio copiado!");
                  setTimeout(() => setCopiedSubdomain(false), 2000);
                }}
                className="h-9 px-3 shrink-0 gap-1 text-xs"
              >
                {copiedSubdomain ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copiedSubdomain ? "Copiado" : "Copiar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                asChild
                className="h-9 px-3 shrink-0"
              >
                <a href={`https://${fullSubdomain}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          )}
          <p className="text-[11px] text-muted-foreground">
            Subdomínio exclusivo fornecido pela plataforma. Você pode personalizá-lo com o nome do seu negócio.
          </p>
        </div>

        {/* ── Option 3: Custom Domain (PERSISTED) ── */}
        <div className="p-4 rounded-lg border border-border bg-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="label-mono text-muted-foreground">
                Domínio Próprio (Personalizado)
              </Label>
              {savedDomain && (
                <Badge
                  variant="outline"
                  className={`text-[10px] uppercase font-mono ${
                    savedDomain.status === "verified"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                      : "border-amber-500/30 bg-amber-500/10 text-amber-500"
                  }`}
                >
                  {savedDomain.status === "verified" ? "Conectado" : "Pendente de DNS"}
                </Badge>
              )}
            </div>
            {savedDomain?.ssl_active && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-500">
                <ShieldCheck className="h-3.5 w-3.5" /> SSL Ativo
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Input
              placeholder="ex: www.minhaempresa.com.br"
              value={customDomainInput}
              onChange={(e) => setCustomDomainInput(e.target.value)}
              disabled={loading || savingDomain}
              className="font-mono text-xs h-9"
            />
            <Button
              type="button"
              variant="hero"
              size="sm"
              onClick={handleSaveCustomDomain}
              disabled={loading || savingDomain || !customDomainInput.trim()}
              className="h-9 px-3 shrink-0 text-xs gap-1"
            >
              {savingDomain && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {savedDomain ? "Salvar" : "Conectar"}
            </Button>
          </div>

          {/* Action buttons if domain is saved */}
          {savedDomain && (
            <div className="flex items-center justify-between pt-1 text-xs">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleVerifyDns}
                disabled={checkingDns}
                className="h-7 text-[11px] gap-1.5"
              >
                <RefreshCw className={`h-3 w-3 ${checkingDns ? "animate-spin" : ""}`} />
                Verificar Apontamento DNS
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveDomain}
                disabled={savingDomain}
                className="h-7 text-[11px] text-destructive hover:bg-destructive/10 gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Desconectar
              </Button>
            </div>
          )}

          {/* DNS CNAME Instructions Box */}
          <div className="p-3.5 rounded-lg bg-muted/60 border border-border/80 text-xs space-y-2.5">
            <p className="font-bold flex items-center gap-1.5 text-foreground text-xs">
              <HelpCircle className="h-4 w-4 text-primary shrink-0" />
              Como fazer o apontamento (Hostinger, Registro.br, Cloudflare ou GoDaddy):
            </p>

            <div className="font-mono text-[11px] text-muted-foreground bg-background p-3 rounded-md border border-border space-y-1.5">
              <p className="flex justify-between">
                <span className="font-bold text-foreground">Tipo de Registro:</span>
                <span className="text-primary font-bold">CNAME</span>
              </p>
              <p className="flex justify-between">
                <span className="font-bold text-foreground">Nome / Host / Entrada:</span>
                <span>{customDomainInput.split(".")[0] || "www"}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-bold text-foreground">Destino / Aponta para:</span>
                <span className="text-foreground font-semibold">{APP_CONFIG.cnameTarget}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-bold text-foreground">TTL:</span>
                <span>Padrão (ou 3600)</span>
              </p>
            </div>

            <div className="text-[11px] text-muted-foreground space-y-1.5 border-t border-border/50 pt-2 leading-relaxed">
              <p>
                🟣 <strong>Na Hostinger (hPanel):</strong> Acesse <em>Domínios</em> → Selecione seu domínio → <em>DNS / Servidores de Nomes</em> → Em <em>"Gerenciar registros DNS"</em>, selecione <strong>CNAME</strong>, no campo <em>Nome</em> preencha <strong>{customDomainInput.split(".")[0] || "www"}</strong> e em <em>Aponta para</em> cole <strong>{APP_CONFIG.cnameTarget}</strong>.
              </p>
              <p className="text-[10px] text-muted-foreground/80 pt-0.5">
                💡 Após salvar aqui, seu domínio fica registrado permanentemente. A propagação da Hostinger costuma levar de alguns minutos até poucas horas.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
