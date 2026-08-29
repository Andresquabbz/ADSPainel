import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
}: ContactTabProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label className="label-mono text-muted-foreground">Nome Comercial (Fantasia) *</Label>
        <Input
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="Ex: Restaurante Nova"
          className="h-10"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="label-mono text-muted-foreground">Razão Social</Label>
        <Input
          value={businessName}
          onChange={(e) => onChangeBusinessName(e.target.value)}
          placeholder="Ex: Restaurante Nova Ltda."
          className="h-10"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="label-mono text-muted-foreground">CNPJ</Label>
        <Input
          value={cnpj}
          onChange={(e) => onChangeCnpj(e.target.value)}
          placeholder="00.000.000/0001-00"
          className="h-10 font-mono"
        />
        <p className="text-[11px] text-muted-foreground">
          Exibido automaticamente no rodapé do site para conformidade legal.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="label-mono text-muted-foreground">WhatsApp</Label>
          <Input
            value={whatsapp}
            onChange={(e) => onChangeWhatsapp(e.target.value)}
            placeholder="(11) 99999-9999"
            className="h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="label-mono text-muted-foreground">Telefone Fixo</Label>
          <Input
            value={phone}
            onChange={(e) => onChangePhone(e.target.value)}
            placeholder="(11) 3333-3333"
            className="h-10"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="label-mono text-muted-foreground">E-mail de Contato</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => onChangeEmail(e.target.value)}
          placeholder="contato@suaempresa.com.br"
          className="h-10"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label className="label-mono text-muted-foreground">Cidade</Label>
          <Input
            value={city}
            onChange={(e) => onChangeCity(e.target.value)}
            placeholder="São Paulo"
            className="h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="label-mono text-muted-foreground">UF</Label>
          <Input
            value={state}
            onChange={(e) => onChangeState(e.target.value.toUpperCase())}
            placeholder="SP"
            maxLength={2}
            className="h-10 text-center"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="label-mono text-muted-foreground">Endereço Completo</Label>
        <Input
          value={address}
          onChange={(e) => onChangeAddress(e.target.value)}
          placeholder="Av. Paulista, 1000 - Bela Vista"
          className="h-10"
        />
      </div>
    </div>
  );
}
