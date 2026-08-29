import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/config/app";
import { TOKEN_CONFIG } from "@/config/tokens";
import { createMercadoPagoCheckout } from "@/functions/create-mercadopago-checkout";
import { Loader2, Zap, QrCode } from "lucide-react";

interface BuyTokensDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BuyTokensDialog({ open, onOpenChange }: BuyTokensDialogProps) {
  const [loadingPkgId, setLoadingPkgId] = useState<string | null>(null);
  const packagesList = TOKEN_CONFIG.packages;

  async function handleCheckout(pkgId: string, pkgSlug: string) {
    setLoadingPkgId(pkgId);
    try {
      const origin = window.location.origin;
      const res = await createMercadoPagoCheckout({
        data: {
          packageId: pkgId,
          packageSlug: pkgSlug,
          origin,
        },
      });

      if (res.checkoutUrl) {
        toast.loading("Redirecionando para o Mercado Pago...", { duration: 2500 });
        window.location.href = res.checkoutUrl;
      } else if (res.isSandbox && res.demoSuccessUrl) {
        // Mercado Pago token not yet in .env - provide testing flow
        toast.info("Modo Demonstração / Teste", {
          description:
            "Para pagamentos reais via Pix/Cartão, adicione MERCADO_PAGO_ACCESS_TOKEN no .env. Redirecionando para simulação de aprovação...",
          duration: 4000,
        });
        setTimeout(() => {
          window.location.href = res.demoSuccessUrl!;
        }, 1800);
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao iniciar checkout Mercado Pago."
      );
    } finally {
      setLoadingPkgId(null);
    }
  }

  const POPULAR_SLUG = "pro";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-extrabold tracking-tight flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Adicionar Saldo de Tokens
            </DialogTitle>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
              <QrCode className="h-3.5 w-3.5 text-emerald-600" />
              Pix Instantâneo (Mercado Pago)
            </span>
          </div>
          <DialogDescription className="text-muted-foreground">
            Adicione saldo para criar sites com IA. Pagamento exclusivo via Pix com liberação automática instantânea.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {packagesList.map((pkg) => {
            const isPopular = pkg.is_popular;
            const isLoading = loadingPkgId === pkg.id;
            const sitesCount = Math.floor(pkg.tokens / TOKEN_CONFIG.tokensPerSite);
            const unitPrice = (pkg.price_cents / 100 / pkg.tokens)
              .toFixed(2)
              .replace(".", ",");

            return (
              <div
                key={pkg.id}
                className={`relative rounded-lg border p-5 transition-all flex flex-col justify-between ${
                  isPopular
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-background hover:border-primary/40"
                }`}
              >
                {isPopular && (
                  <Badge className="absolute right-4 top-4 font-mono text-[10px] uppercase tracking-widest bg-primary text-primary-foreground">
                    Mais Escolhido
                  </Badge>
                )}

                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
                    {pkg.name}
                  </p>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight">
                    {pkg.tokens}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      tokens
                    </span>
                  </p>
                  <p className="mt-1 text-base font-bold text-foreground">
                    {formatBRL(pkg.price_cents)}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    R$ {unitPrice} / token
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Permite gerar até ~{sitesCount} sites completos ({TOKEN_CONFIG.tokensPerSite.toString().replace(".", ",")} tokens por site).
                  </p>
                </div>

                <Button
                  variant="hero"
                  className="mt-5 w-full gap-2 font-bold shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={!!loadingPkgId}
                  onClick={() => handleCheckout(pkg.id, pkg.slug)}
                >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Gerando Pix...
                      </>
                    ) : (
                      <>
                        <QrCode className="h-4 w-4" />
                        Pagar com Pix (Mercado Pago)
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

        {/* Payment badges */}
        <div className="mt-3 p-3 rounded-lg border border-border/80 bg-muted/40 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
              <QrCode className="h-4 w-4 text-emerald-600" />
              QR Code & Pix Copia e Cola
            </span>
          </div>
          <span className="font-mono text-[10px]">Aprovação imediata · Saldo na hora</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
