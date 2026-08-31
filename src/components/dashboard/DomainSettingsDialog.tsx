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

  // ── 2. Save / Connect Custom Domain ─────────────────────────────────────
  async function handleSaveCustomDomain() {
    const raw = customDomainInput.trim().toLowerCase();
    // Clean protocol and trailing slashes
    const cleaned = raw.replace(/^https?:\/\//, "").replace(/\/+$/, "").trim();

    if (!cleaned || !cleaned.includes(".")) {
      toast.error("Informe um domínio válido (ex: www.minhaempresa.com.br)");
      return;
    }

    if (!siteId || !userId) {
      toast.error("Identificação do site ou usuário ausente.");
      return;
    }

    setSavingDomain(true);
    try {
      // 1. Save or update in domains table
      if (savedDomain?.id) {
        const { data, error } = await supabase
          .from("domains")
          .update({
            domain: cleaned,
            status: "pending",
            updated_at: new Date().toISOString(),
          })
          .eq("id", savedDomain.id)
          .select()
          .single();

        if (error) throw error;
        setSavedDomain(data as DomainRecord);
      } else {
        const { data, error } = await supabase
          .from("domains")
          .insert({
            user_id: userId,
            site_id: siteId,
            domain: cleaned,
            record_type: "CNAME",
            status: "pending",
            is_primary: true,
            ssl_active: false,
          })
          .select()
          .single();

        if (error) throw error;
        setSavedDomain(data as DomainRecord);
      }

      // 2. Also save into site.content for redundancy
      const { data: siteData } = await supabase
        .from("sites")
        .select("content")
        .eq("id", siteId)
        .single();

      const existingContent = (siteData?.content as Record<string, unknown>) || {};
      await supabase
        .from("sites")
        .update({
          content: {
            ...existingContent,
            custom_domain: cleaned,
          },
        })
        .eq("id", siteId);

      toast.success("Domínio salvo com sucesso!", {
        description:
          "Agora crie o apontamento CNAME no seu provedor de DNS para concluir a ativação.",
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao salvar domínio.";
      toast.error(msg);
    } finally {
      setSavingDomain(false);
    }
  }

  // ── 3. Check DNS Propagation via Google DNS DoH ─────────────────────────
  async function handleVerifyDns() {
    const domainToCheck = savedDomain?.domain || customDomainInput.trim().toLowerCase();
    if (!domainToCheck) return;

    setCheckingDns(true);
    try {
      const res = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(domainToCheck)}&type=CNAME`
      );

      if (!res.ok) throw new Error("Não foi possível consultar o DNS agora.");
      const json = await res.json() as {
        Answer?: { name: string; type: number; data: string }[];
        Status: number;
      };

      const cnameRecords = json.Answer?.map((a) => a.data.replace(/\.$/, "").toLowerCase()) || [];
      const expectedTarget = APP_CONFIG.cnameTarget.toLowerCase();

      const isPointing = cnameRecords.some((val) =>
        val.includes(expectedTarget) || val.includes("adspainel.site") || val.includes("adspainel.com")
      );

      if (isPointing) {
        if (savedDomain?.id) {
          await supabase
            .from("domains")
            .update({ status: "active", ssl_active: true })
            .eq("id", savedDomain.id);

          setSavedDomain((prev) =>
            prev ? { ...prev, status: "active" as any, ssl_active: true } : null
          );
        }
        toast.success("Apontamento DNS verificado com sucesso! 🎉", {
          description: `O domínio ${domainToCheck} está apontando corretamente.`,
        });
      } else {
        toast.warning("Apontamento CNAME ainda não detectado.", {
          description: `Aponte o CNAME para ${APP_CONFIG.cnameTarget}. Lembre-se de que a propagação de DNS pode levar até 24 horas.`,
        });
      }
    } catch {
      toast.info("Consulta realizada. Aguarde a propagação do seu provedor de DNS.");
    } finally {
      setCheckingDns(false);
    }
  }

  // ── 4. Remove / Disconnect Domain ───────────────────────────────────────
  async function handleRemoveDomain() {
    if (!savedDomain?.id) return;
    setSavingDomain(true);
    try {
      const { error } = await supabase.from("domains").delete().eq("id", savedDomain.id);
      if (error) throw error;

      if (siteId) {
        const { data: siteData } = await supabase
          .from("sites")
          .select("content")
          .eq("id", siteId)
          .single();

        const existingContent = (siteData?.content as Record<string, unknown>) || {};
        delete existingContent["custom_domain"];
        await supabase
          .from("sites")
          .update({ content: existingContent as any })
          .eq("id", siteId);
      }

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
