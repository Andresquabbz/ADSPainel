import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  FileText,
  Briefcase,
  Phone,
  Share2,
  MapPin,
  Palette,
  ShieldCheck,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import type { CompanyData, CompanyServiceItem } from "@/lib/templates/institutional-template";
import { SITE_FONTS } from "@/config/app";

interface InstitutionalEditorTabsProps {
  companyData: CompanyData;
  onChangeCompanyData: (updater: (prev: CompanyData) => CompanyData) => void;
  primaryColor: string;
  onChangePrimaryColor: (color: string) => void;
  fontFamily: string;
  onChangeFontFamily: (font: string) => void;
  style: string;
  onChangeStyle: (style: string) => void;
  activeSubTab?: string;
}

const AVAILABLE_ICONS = [
  { value: "Briefcase", label: "Maleta / Gestão" },
  { value: "FileText", label: "Documento / Contrato" },
  { value: "Building", label: "Prédio / Empresa" },
  { value: "TrendingUp", label: "Gráfico / Crescimento" },
  { value: "ShieldCheck", label: "Escudo / Segurança" },
  { value: "Scale", label: "Balança / Jurídico" },
  { value: "Users", label: "Equipe / Pessoas" },
  { value: "CheckCircle2", label: "Check / Qualidade" },
  { value: "Headphones", label: "Suporte / Atendimento" },
  { value: "Globe", label: "Globo / Internacional" },
  { value: "Award", label: "Troféu / Excelência" },
  { value: "Clock", label: "Relógio / Agilidade" },
];

export function InstitutionalEditorTabs({
  companyData,
  onChangeCompanyData,
  primaryColor,
  onChangePrimaryColor,
  fontFamily,
  onChangeFontFamily,
  style,
  onChangeStyle,
}: InstitutionalEditorTabsProps) {
  const [sectionTab, setSectionTab] = useState<
    "empresa" | "institucional" | "servicos" | "contato" | "endereco" | "aparencia" | "privacidade"
  >("empresa");

  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  function setField<K extends keyof CompanyData>(key: K, value: CompanyData[K]) {
    onChangeCompanyData((prev) => ({ ...prev, [key]: value }));
  }

  // ─── CRUD de Serviços ───────────────────────────────────────────────────────
  const services = companyData.services || [];

  function handleAddService() {
    const newService: CompanyServiceItem = {
      id: `srv-${Date.now()}`,
      name: "Novo Serviço",
      description: "Descrição detalhada do serviço oferecido com qualidade e excelência.",
      icon: "Briefcase",
      category: "Geral",
      link: "#contato",
      status: "active",
    };
    onChangeCompanyData((prev) => ({
      ...prev,
      services: [...(prev.services || []), newService],
    }));
    setEditingServiceId(newService.id);
  }

  function handleUpdateService(id: string, updates: Partial<CompanyServiceItem>) {
    onChangeCompanyData((prev) => ({
      ...prev,
      services: (prev.services || []).map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }

  function handleDeleteService(id: string) {
    onChangeCompanyData((prev) => ({
      ...prev,
      services: (prev.services || []).filter((s) => s.id !== id),
    }));
    if (editingServiceId === id) setEditingServiceId(null);
  }

  function handleDuplicateService(id: string) {
    const srv = services.find((s) => s.id === id);
    if (!srv) return;
    const duplicated: CompanyServiceItem = {
      ...srv,
      id: `srv-${Date.now()}`,
      name: `${srv.name} (Cópia)`,
    };
    const index = services.findIndex((s) => s.id === id);
    const updated = [...services];
    updated.splice(index + 1, 0, duplicated);
    onChangeCompanyData((prev) => ({ ...prev, services: updated }));
    setEditingServiceId(duplicated.id);
  }

  function handleMoveService(index: number, direction: "up" | "down") {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === services.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const nextServices = [...services];
    const item = nextServices[index];
    nextServices[index] = nextServices[targetIndex];
    nextServices[targetIndex] = item;
    onChangeCompanyData((prev) => ({ ...prev, services: nextServices }));
  }

  return (
    <div className="space-y-4">
      {/* Category selection bar */}
      <div className="flex flex-wrap gap-1 border-b border-border pb-2">
        {[
          { id: "empresa", label: "Empresa", icon: Building2 },
          { id: "institucional", label: "Institucional", icon: FileText },
          { id: "servicos", label: "Serviços", icon: Briefcase },
          { id: "contato", label: "Contato", icon: Phone },
          { id: "endereco", label: "Localização", icon: MapPin },
          { id: "aparencia", label: "Aparência", icon: Palette },
          { id: "privacidade", label: "Privacidade", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = sectionTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSectionTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 1. EMPRESA & DADOS CADASTRAIS ────────────────────────────────────── */}
      {sectionTab === "empresa" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
            <p className="font-semibold text-primary">Identidade & Ficha Cadastral</p>
            <p className="text-muted-foreground mt-0.5">
              Estes dados alimentam dinamicamente a Ficha Cadastral e todas as menções à empresa na Landing Page.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Identidade</h4>
            <div className="space-y-1.5">
              <Label className="label-mono text-muted-foreground">Nome Comercial / Marca *</Label>
              <Input
                value={companyData.name || ""}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Ex: Atlas Soluções"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="label-mono text-muted-foreground">Nome Fantasia</Label>
              <Input
                value={companyData.fantasy_name || ""}
                onChange={(e) => setField("fantasy_name", e.target.value)}
                placeholder="Ex: Atlas Corporativo"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="label-mono text-muted-foreground">Razão Social *</Label>
              <Input
                value={companyData.legal_name || ""}
                onChange={(e) => setField("legal_name", e.target.value)}
                placeholder="Ex: Atlas Consultoria Ltda."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="label-mono text-muted-foreground">CNPJ *</Label>
                <Input
                  value={companyData.cnpj || ""}
                  onChange={(e) => setField("cnpj", e.target.value)}
                  placeholder="00.000.000/0001-00"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="label-mono text-muted-foreground">Data de Abertura</Label>
                <Input
                  value={companyData.opening_date || ""}
                  onChange={(e) => setField("opening_date", e.target.value)}
                  placeholder="Ex: 15/03/2018"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="label-mono text-muted-foreground">URL do Logotipo</Label>
              <Input
                value={companyData.logo_url || ""}
                onChange={(e) => setField("logo_url", e.target.value)}
                placeholder="https://exemplo.com/logo.png"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Informações Cadastrais (Ficha Oficial)</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="label-mono text-muted-foreground">Porte</Label>
                <Input
                  value={companyData.company_size || ""}
                  onChange={(e) => setField("company_size", e.target.value)}
                  placeholder="Ex: Demais / EPP / ME"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="label-mono text-muted-foreground">Situação Cadastral</Label>
                <Input
                  value={companyData.registration_status || ""}
                  onChange={(e) => setField("registration_status", e.target.value)}
                  placeholder="Ex: Ativa"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="label-mono text-muted-foreground">Natureza Jurídica</Label>
              <Input
                value={companyData.legal_nature || ""}
                onChange={(e) => setField("legal_nature", e.target.value)}
                placeholder="Ex: 206-2 - Sociedade Empresária Limitada"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="label-mono text-muted-foreground">Tipo de Empresa</Label>
                <Input
                  value={companyData.company_type || ""}
                  onChange={(e) => setField("company_type", e.target.value)}
                  placeholder="Ex: Matriz / Filial"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="label-mono text-muted-foreground">Capital Social</Label>
                <Input
                  value={companyData.share_capital || ""}
                  onChange={(e) => setField("share_capital", e.target.value)}
                  placeholder="Ex: R$ 150.000,00"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. INSTITUCIONAL (MISSÃO E QUEM SOMOS) ────────────────────────────── */}
      {sectionTab === "institucional" && (
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nossa Missão</h4>
            <div className="space-y-1.5">
              <Label className="label-mono text-muted-foreground">Título da Missão</Label>
              <Input
                value={companyData.mission_title || ""}
                onChange={(e) => setField("mission_title", e.target.value)}
                placeholder="Ex: Nossa Missão"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="label-mono text-muted-foreground">Descrição da Missão</Label>
              <Textarea
                value={companyData.mission_description || ""}
                onChange={(e) => setField("mission_description", e.target.value)}
                placeholder="Texto livre descrevendo a missão e os valores da organização..."
                rows={3}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quem Somos</h4>
            <div className="space-y-1.5">
              <Label className="label-mono text-muted-foreground">Título da Seção</Label>
              <Input
                value={companyData.about_title || ""}
                onChange={(e) => setField("about_title", e.target.value)}
                placeholder="Ex: Tradição, Excelência e Resultados"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="label-mono text-muted-foreground">Ano de Fundação</Label>
                <Input
                  value={companyData.foundation_year || ""}
                  onChange={(e) => setField("foundation_year", e.target.value)}
                  placeholder="Ex: 2018"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="label-mono text-muted-foreground">Área de Atuação</Label>
                <Input
                  value={companyData.activity_area || ""}
                  onChange={(e) => setField("activity_area", e.target.value)}
                  placeholder="Ex: Serviços Empresariais"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="label-mono text-muted-foreground">Descrição Institucional Completa</Label>
              <Textarea
                value={companyData.about_description || ""}
                onChange={(e) => setField("about_description", e.target.value)}
                placeholder="História da empresa, diferenciais de mercado, trajetória e princípios operacionais..."
                rows={5}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 3. SERVIÇOS DINÂMICOS ────────────────────────────────────────────── */}
      {sectionTab === "servicos" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Serviços Cadastrados</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">Adicione, edite, ordene e duplique seus serviços.</p>
            </div>
            <Button size="sm" variant="hero" onClick={handleAddService} className="h-8 gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" /> Adicionar Serviço
            </Button>
          </div>

          <div className="space-y-2">
            {services.map((srv, idx) => {
              const isExpanded = editingServiceId === srv.id;
              return (
                <div
                  key={srv.id}
                  className={`rounded-lg border transition-all ${
                    isExpanded ? "border-primary bg-card shadow-sm" : "border-border bg-card/60 hover:border-border"
                  }`}
                >
                  <div className="p-3 flex items-center justify-between gap-2">
                    <div
                      className="flex-1 cursor-pointer flex items-center gap-2 overflow-hidden"
                      onClick={() => setEditingServiceId(isExpanded ? null : srv.id)}
                    >
                      <span className="font-mono text-xs font-bold text-muted-foreground">#{idx + 1}</span>
                      <span className="font-semibold text-xs truncate">{srv.name || "Serviço sem nome"}</span>
                      {srv.status === "inactive" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Inativo</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        disabled={idx === 0}
                        onClick={() => handleMoveService(idx, "up")}
                        title="Subir"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        disabled={idx === services.length - 1}
                        onClick={() => handleMoveService(idx, "down")}
                        title="Descer"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => handleDuplicateService(srv.id)}
                        title="Duplicar"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteService(srv.id)}
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Edit Form */}
                  {isExpanded && (
                    <div className="p-3 pt-0 border-t border-border mt-2 space-y-3">
                      <div className="space-y-1.5">
                        <Label className="label-mono text-[11px] text-muted-foreground">Nome do Serviço *</Label>
                        <Input
                          value={srv.name}
                          onChange={(e) => handleUpdateService(srv.id, { name: e.target.value })}
                          placeholder="Ex: Apoio Administrativo"
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <Label className="label-mono text-[11px] text-muted-foreground">Ícone</Label>
                          <Select
                            value={srv.icon}
                            onValueChange={(val) => handleUpdateService(srv.id, { icon: val })}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {AVAILABLE_ICONS.map((ic) => (
                                <SelectItem key={ic.value} value={ic.value} className="text-xs">
                                  {ic.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="label-mono text-[11px] text-muted-foreground">Categoria</Label>
                          <Input
                            value={srv.category || ""}
                            onChange={(e) => handleUpdateService(srv.id, { category: e.target.value })}
                            placeholder="Ex: Gestão"
                            className="h-9 text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="label-mono text-[11px] text-muted-foreground">Descrição do Serviço</Label>
                        <Textarea
                          value={srv.description}
                          onChange={(e) => handleUpdateService(srv.id, { description: e.target.value })}
                          placeholder="Explique o que inclui este serviço..."
                          rows={2}
                          className="text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 items-center">
                        <div className="space-y-1.5">
                          <Label className="label-mono text-[11px] text-muted-foreground">Link Opcional</Label>
                          <Input
                            value={srv.link || ""}
                            onChange={(e) => handleUpdateService(srv.id, { link: e.target.value })}
                            placeholder="#contato"
                            className="h-9 text-xs"
                          />
                        </div>
                        <div className="flex items-center justify-between pt-4">
                          <Label className="label-mono text-[11px] text-muted-foreground">Status Ativo</Label>
                          <Switch
                            checked={srv.status === "active"}
                            onCheckedChange={(c) =>
                              handleUpdateService(srv.id, { status: c ? "active" : "inactive" })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 4. CONTATO & REDES SOCIAIS & WHATSAPP FLUTUANTE ───────────────────── */}
      {sectionTab === "contato" && (
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Canais de Atendimento</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="label-mono text-muted-foreground">Telefone</Label>
                <Input
                  value={companyData.phone || ""}
                  onChange={(e) => setField("phone", e.target.value)}
                  placeholder="(11) 3210-4000"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="label-mono text-muted-foreground">WhatsApp Principal *</Label>
                <Input
                  value={companyData.whatsapp || ""}
                  onChange={(e) => setField("whatsapp", e.target.value)}
                  placeholder="(11) 98765-4321"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="label-mono text-muted-foreground">E-mail Corporativo</Label>
                <Input
                  value={companyData.email || ""}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="contato@empresa.com.br"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="label-mono text-muted-foreground">Site Oficial</Label>
                <Input
                  value={companyData.website || ""}
                  onChange={(e) => setField("website", e.target.value)}
                  placeholder="https://empresa.com.br"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Redes Sociais (Apenas preenchidas aparecerão)</h4>
            <div className="space-y-1.5">
              <Label className="label-mono text-muted-foreground">Instagram</Label>
              <Input
                value={companyData.instagram || ""}
                onChange={(e) => setField("instagram", e.target.value)}
                placeholder="https://instagram.com/suaempresa"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="label-mono text-muted-foreground">LinkedIn</Label>
              <Input
                value={companyData.linkedin || ""}
                onChange={(e) => setField("linkedin", e.target.value)}
                placeholder="https://linkedin.com/company/suaempresa"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="label-mono text-muted-foreground">Facebook</Label>
              <Input
                value={companyData.facebook || ""}
                onChange={(e) => setField("facebook", e.target.value)}
                placeholder="https://facebook.com/suaempresa"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="label-mono text-muted-foreground">YouTube</Label>
                <Input
                  value={companyData.youtube || ""}
                  onChange={(e) => setField("youtube", e.target.value)}
                  placeholder="https://youtube.com/@suaempresa"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="label-mono text-muted-foreground">TikTok</Label>
                <Input
                  value={companyData.tiktok || ""}
                  onChange={(e) => setField("tiktok", e.target.value)}
                  placeholder="https://tiktok.com/@suaempresa"
                />
              </div>
            </div>
          </div>

          {/* Botão Flutuante de WhatsApp */}
          <div className="pt-3 border-t border-border space-y-3 bg-muted/30 p-3 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-[#25d366]" />
                <Label className="font-bold text-xs">Botão WhatsApp Flutuante</Label>
              </div>
              <Switch
                checked={companyData.floating_whatsapp?.enabled !== false}
                onCheckedChange={(c) =>
                  onChangeCompanyData((prev) => ({
                    ...prev,
                    floating_whatsapp: {
                      ...(prev.floating_whatsapp || { phone: "", message: "", label: "WhatsApp" }),
                      enabled: c,
                    },
                  }))
                }
              />
            </div>

            {companyData.floating_whatsapp?.enabled !== false && (
              <div className="space-y-2 pt-2">
                <div className="space-y-1">
                  <Label className="label-mono text-[11px] text-muted-foreground">Texto do Botão / Tooltip</Label>
                  <Input
                    value={companyData.floating_whatsapp?.label || "Fale Conosco"}
                    onChange={(e) =>
                      onChangeCompanyData((prev) => ({
                        ...prev,
                        floating_whatsapp: {
                          ...(prev.floating_whatsapp || { enabled: true, phone: "", message: "" }),
                          label: e.target.value,
                        },
                      }))
                    }
                    placeholder="Fale Conosco"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="label-mono text-[11px] text-muted-foreground">Mensagem Inicial Pré-configurada</Label>
                  <Input
                    value={
                      companyData.floating_whatsapp?.message ||
                      "Olá! Gostaria de saber mais informações sobre os serviços."
                    }
                    onChange={(e) =>
                      onChangeCompanyData((prev) => ({
                        ...prev,
                        floating_whatsapp: {
                          ...(prev.floating_whatsapp || { enabled: true, phone: "", label: "" }),
                          message: e.target.value,
                        },
                      }))
                    }
                    placeholder="Olá! Gostaria de saber mais informações..."
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 5. LOCALIZAÇÃO (ONDE ESTAMOS & MAPA) ──────────────────────────────── */}
      {sectionTab === "endereco" && (
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Endereço da Empresa</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="label-mono text-muted-foreground">Logradouro / Rua *</Label>
                <Input
                  value={companyData.address_street || ""}
                  onChange={(e) => setField("address_street", e.target.value)}
                  placeholder="Ex: Avenida Paulista"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="label-mono text-muted-foreground">Número</Label>
                <Input
                  value={companyData.address_number || ""}
                  onChange={(e) => setField("address_number", e.target.value)}
                  placeholder="1000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="label-mono text-muted-foreground">Complemento</Label>
                <Input
                  value={companyData.address_complement || ""}
                  onChange={(e) => setField("address_complement", e.target.value)}
                  placeholder="Conjunto 1402"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="label-mono text-muted-foreground">Bairro</Label>
                <Input
                  value={companyData.address_neighborhood || ""}
                  onChange={(e) => setField("address_neighborhood", e.target.value)}
                  placeholder="Bela Vista"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1 space-y-1.5">
                <Label className="label-mono text-muted-foreground">CEP</Label>
                <Input
                  value={companyData.address_cep || ""}
                  onChange={(e) => setField("address_cep", e.target.value)}
                  placeholder="01310-100"
                />
              </div>
              <div className="col-span-1 space-y-1.5">
                <Label className="label-mono text-muted-foreground">Cidade</Label>
                <Input
                  value={companyData.address_city || ""}
                  onChange={(e) => setField("address_city", e.target.value)}
                  placeholder="São Paulo"
                />
              </div>
              <div className="col-span-1 space-y-1.5">
                <Label className="label-mono text-muted-foreground">Estado (UF)</Label>
                <Input
                  value={companyData.address_state || ""}
                  onChange={(e) => setField("address_state", e.target.value.toUpperCase())}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between p-3 rounded-lg bg-muted/40 border">
            <div>
              <Label className="font-bold text-xs">Exibir Mapa Interativo na Página</Label>
              <p className="text-[11px] text-muted-foreground mt-0.5">Mostra mapa dinâmico baseado no endereço cadastrado.</p>
            </div>
            <Switch
              checked={companyData.show_map !== false}
              onCheckedChange={(c) => setField("show_map", c)}
            />
          </div>
        </div>
      )}

      {/* ── 6. APARÊNCIA & PERSONALIZAÇÃO ────────────────────────────────────── */}
      {sectionTab === "aparencia" && (
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cores</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="label-mono text-muted-foreground">Cor Principal</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => {
                      onChangePrimaryColor(e.target.value);
                      setField("primary_color", e.target.value);
                    }}
                    className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent p-0.5"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => {
                      onChangePrimaryColor(e.target.value);
                      setField("primary_color", e.target.value);
                    }}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="label-mono text-muted-foreground">Cor dos Botões</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={companyData.button_color || primaryColor}
                    onChange={(e) => setField("button_color", e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent p-0.5"
                  />
                  <Input
                    value={companyData.button_color || primaryColor}
                    onChange={(e) => setField("button_color", e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tipografia</h4>
            <div className="space-y-1.5">
              <Label className="label-mono text-muted-foreground">Família de Fonte</Label>
              <Select
                value={fontFamily}
                onValueChange={(f) => {
                  onChangeFontFamily(f);
                  setField("font_family", f);
                }}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SITE_FONTS.map((font) => (
                    <SelectItem key={font} value={font} className="text-xs">
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-3 border-t border-border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estilo Visual</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="label-mono text-muted-foreground">Raio das Bordas</Label>
                <Select
                  value={companyData.border_radius || "md"}
                  onValueChange={(v) => setField("border_radius", v as any)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Reto (Sem curvas)</SelectItem>
                    <SelectItem value="sm">Suave (sm)</SelectItem>
                    <SelectItem value="md">Arredondado (md)</SelectItem>
                    <SelectItem value="lg">Elegante (lg)</SelectItem>
                    <SelectItem value="full">Pílula (full)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="label-mono text-muted-foreground">Estilo dos Botões</Label>
                <Select
                  value={companyData.button_style || "solid"}
                  onValueChange={(v) => setField("button_style", v as any)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Sólido</SelectItem>
                    <SelectItem value="outline">Borda com Contorno</SelectItem>
                    <SelectItem value="pill">Pílula Arredondada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. PRIVACIDADE & LGPD ────────────────────────────────────────────── */}
      {sectionTab === "privacidade" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <p className="font-semibold text-primary">Conformidade LGPD & Termos</p>
            </div>
            <p className="text-muted-foreground mt-1">
              Campos editáveis para a seção oficial de privacidade e links legais do rodapé.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="label-mono text-muted-foreground">Texto da Política de Privacidade</Label>
            <Textarea
              value={companyData.privacy?.policy_text || ""}
              onChange={(e) =>
                onChangeCompanyData((prev) => ({
                  ...prev,
                  privacy: { ...(prev.privacy || { terms_text: "", dpo_contact: "" }), policy_text: e.target.value },
                }))
              }
              rows={4}
              placeholder="Descreva a política de tratamento de dados pessoais..."
            />
          </div>

          <div className="space-y-1.5">
            <Label className="label-mono text-muted-foreground">Termos de Uso</Label>
            <Textarea
              value={companyData.privacy?.terms_text || ""}
              onChange={(e) =>
                onChangeCompanyData((prev) => ({
                  ...prev,
                  privacy: { ...(prev.privacy || { policy_text: "", dpo_contact: "" }), terms_text: e.target.value },
                }))
              }
              rows={3}
              placeholder="Condições de acesso e uso do site institucional..."
            />
          </div>

          <div className="space-y-1.5">
            <Label className="label-mono text-muted-foreground">Contato do Encarregado / DPO de Privacidade</Label>
            <Input
              value={companyData.privacy?.dpo_contact || ""}
              onChange={(e) =>
                onChangeCompanyData((prev) => ({
                  ...prev,
                  privacy: { ...(prev.privacy || { policy_text: "", terms_text: "" }), dpo_contact: e.target.value },
                }))
              }
              placeholder="privacidade@suaempresa.com.br"
            />
          </div>
        </div>
      )}
    </div>
  );
}
