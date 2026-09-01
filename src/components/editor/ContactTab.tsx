import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

interface ContactTabProps {
  name: string;
  onChangeName: (val: string) => void;
  businessName: string;
  onChangeBusinessName: (val: string) => void;
  cnpj: string;
  onChangeCnpj: (val: string) => void;
  whatsapp: string;
  onChangeWhatsapp: (val: string) => void;
  phone: string;
  onChangePhone: (val: string) => void;
  email: string;
  onChangeEmail: (val: string) => void;
  city: string;
  onChangeCity: (val: string) => void;
  state: string;
  onChangeState: (val: string) => void;
  address: string;
  onChangeAddress: (val: string) => void;
  isRestricted?: boolean;
}

export function ContactTab({
  name,
  onChangeName,
  businessName,
  onChangeBusinessName,
  cnpj,
  onChangeCnpj,
  whatsapp,
  onChangeWhatsapp,
  phone,
  onChangePhone,
  email,
  onChangeEmail,
  city,
  onChangeCity,
  state,
  onChangeState,
  address,
  onChangeAddress,
  isRestricted = true,
}: ContactTabProps) {
  return (
    <div className="space-y-5">
      {isRestricted && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-foreground flex items-center gap-2.5">
          <Lock className="h-4 w-4 text-primary shrink-0" />
          <span className="leading-snug">
            Após a criação do site, <strong>apenas o telefone</strong> pode ser editado.
          </span>
        </div>
      )}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="label-mono text-muted-foreground">Nome Comercial (Fantasia) *</Label>
          {isRestricted && <span className="text-[10px] font-mono text-muted-foreground">Bloqueado</span>}
        </div>
        <Input
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="Ex: Restaurante Nova"
          disabled={isRestricted}
          className="h-10 disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="label-mono text-muted-foreground">Razão Social</Label>
          {isRestricted && <span className="text-[10px] font-mono text-muted-foreground">Bloqueado</span>}
        </div>
        <Input
          value={businessName}
          onChange={(e) => onChangeBusinessName(e.target.value)}
          placeholder="Ex: Restaurante Nova Ltda."
          disabled={isRestricted}
          className="h-10 disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="label-mono text-muted-foreground">CNPJ</Label>
          {isRestricted && <span className="text-[10px] font-mono text-muted-foreground">Bloqueado</span>}
        </div>
        <Input
          value={cnpj}
          onChange={(e) => onChangeCnpj(e.target.value)}
          placeholder="00.000.000/0001-00"
          disabled={isRestricted}
          className="h-10 font-mono disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <p className="text-[11px] text-muted-foreground">
          Exibido automaticamente no rodapé do site para conformidade legal.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="label-mono text-primary font-bold">WhatsApp</Label>
            <span className="text-[10px] font-mono text-primary font-semibold">Editável</span>
          </div>
          <Input
            value={whatsapp}
            onChange={(e) => onChangeWhatsapp(e.target.value)}
            placeholder="(11) 99999-9999"
            className="h-10 border-primary/40 focus-visible:ring-primary"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="label-mono text-primary font-bold">Telefone</Label>
            <span className="text-[10px] font-mono text-primary font-semibold">Editável</span>
          </div>
          <Input
            value={phone}
            onChange={(e) => onChangePhone(e.target.value)}
            placeholder="(11) 3333-3333"
            className="h-10 border-primary/40 focus-visible:ring-primary"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="label-mono text-muted-foreground">E-mail de Contato</Label>
          {isRestricted && <span className="text-[10px] font-mono text-muted-foreground">Bloqueado</span>}
        </div>
        <Input
          type="email"
          value={email}
          onChange={(e) => onChangeEmail(e.target.value)}
          placeholder="contato@suaempresa.com.br"
          disabled={isRestricted}
          className="h-10 disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="label-mono text-muted-foreground">Cidade</Label>
            {isRestricted && <span className="text-[10px] font-mono text-muted-foreground">Bloqueado</span>}
          </div>
          <Input
            value={city}
            onChange={(e) => onChangeCity(e.target.value)}
            placeholder="São Paulo"
            disabled={isRestricted}
            className="h-10 disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="label-mono text-muted-foreground">UF</Label>
            {isRestricted && <span className="text-[10px] font-mono text-muted-foreground">Bloqueado</span>}
          </div>
          <Input
            value={state}
            onChange={(e) => onChangeState(e.target.value.toUpperCase())}
            placeholder="SP"
            maxLength={2}
            disabled={isRestricted}
            className="h-10 text-center disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="label-mono text-muted-foreground">Endereço Completo</Label>
          {isRestricted && <span className="text-[10px] font-mono text-muted-foreground">Bloqueado</span>}
        </div>
        <Input
          value={address}
          onChange={(e) => onChangeAddress(e.target.value)}
          placeholder="Av. Paulista, 1000 - Bela Vista"
          disabled={isRestricted}
          className="h-10 disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}
