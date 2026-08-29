import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, Coins, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { APP_CONFIG } from "@/config/app";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteCard } from "@/components/dashboard/SiteCard";
import { CreateSiteWizard } from "@/components/dashboard/CreateSiteWizard";
import { BuyTokensDialog } from "@/components/dashboard/BuyTokensDialog";
import { creditPurchasedTokens } from "@/functions/credit-purchased-tokens";
import { TOKEN_CONFIG } from "@/config/tokens";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: `Dashboard — ${APP_CONFIG.name}` },
      {
        name: "description",
        content: `Gerencie seus sites, tokens e publicações na plataforma ${APP_CONFIG.name}.`,
      },
      { property: "og:title", content: `Dashboard — ${APP_CONFIG.name}` },
      { property: "og:description", content: "Gerencie seus sites gerados por IA." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

const PLAN_LIMITS: Record<string, number> = {
  free: 50,
  starter: 300,
  pro: 1000,
  agency: 3000,
};

const PLAN_MAX_SITES: Record<string, number> = {
  free: 1,
  starter: 5,
  pro: 15,
  agency: 999,
};

const TX_TYPE_LABEL: Record<string, string> = {
  purchase: "Compra",
  generation: "Geração",
  refund: "Reembolso",
  bonus: "Bônus",
  admin: "Ajuste",
};

const ADMIN_EMAILS = ["andre.jesus.rocha@gmail.com"];

function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [buyTokensOpen, setBuyTokensOpen] = useState(false);
  const [showTxHistory, setShowTxHistory] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  // Handle Mercado Pago return (success or failure)
  useEffect(() => {
    if (typeof window === "undefined" || !user) return;
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const tokens = params.get("tokens");
    const pkgSlug = params.get("pkg");
    const paymentId = params.get("payment_id") || params.get("collection_id");

    if (payment === "success" && tokens) {
      const numTokens = parseInt(tokens, 10);
      if (!isNaN(numTokens) && numTokens > 0) {
        creditPurchasedTokens({
          data: {
            tokens: numTokens,
            pkgSlug: pkgSlug || "custom",
            paymentId: paymentId || undefined,
          },
        })
          .then(() => {
            toast.success("Pagamento Confirmado! 🎉", {
              description: `${numTokens} tokens adicionados com sucesso ao seu saldo.`,
              duration: 5000,
            });
            profile.refetch();
          })
          .catch((e) => {
            console.error("Erro ao creditar tokens:", e);
          });
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (payment === "failure") {
      toast.error("Pagamento não concluído.", {
        description: "Você pode tentar novamente quando desejar.",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user]);

  const profile = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, token_balance, plan_slug")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;

      // Auto-sanitize: If user is not admin and has unpurchased bonus tokens, zero them out immediately
      const isAdminUser = ADMIN_EMAILS.includes((user!.email || "").toLowerCase());
      if (!isAdminUser) {
        const { data: purchases } = await supabase
          .from("token_transactions")
          .select("id")
          .eq("user_id", user!.id)
          .eq("type", "purchase")
          .limit(1);

        if ((!purchases || purchases.length === 0) && data.token_balance > 0) {
          await supabase
            .from("profiles")
            .update({
              token_balance: 0,
              plan_slug: data.plan_slug === "free" ? "avulso" : data.plan_slug,
            })
            .eq("id", user!.id);

          await supabase
            .from("token_transactions")
            .delete()
            .eq("user_id", user!.id)
            .eq("type", "bonus");

          data.token_balance = 0;
          if (data.plan_slug === "free") data.plan_slug = "avulso";
        }
      }

      return data;
    },
  });

  const sites = useQuery({
    queryKey: ["sites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sites")
        .select("id, name, slug, status, category, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const transactions = useQuery({
    queryKey: ["token_transactions", user?.id],
    enabled: !!user && showTxHistory,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("token_transactions")
        .select("id, type, amount, balance_after, description, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="label-mono text-muted-foreground">Carregando painel...</p>
      </div>
    );
  }

  const userEmail = (user.email || "").toLowerCase();
  const isAdmin = ADMIN_EMAILS.includes(userEmail);

  const rawPlanSlug = profile.data?.plan_slug ?? "avulso";
  const planSlug = isAdmin
    ? "Admin (Ilimitado)"
    : (rawPlanSlug === "free" || rawPlanSlug === "avulso" ? "Sem Plano Ativo" : rawPlanSlug);
  const tokenBalance = profile.data?.token_balance ?? 0;
  const siteCount = sites.data?.length ?? 0;
  const tokenPct = isAdmin ? 100 : Math.min(100, Math.round((tokenBalance / 50) * 100));

  // Members can create unlimited sites as long as they have tokens (2.5 tokens per site)
  const canCreateSite = isAdmin || tokenBalance >= TOKEN_CONFIG.minTokensToCreate;

  const formattedTokenBalance = isAdmin
    ? "∞ Tokens (Ilimitado)"
    : `${tokenBalance.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 1 })} tokens`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt={APP_CONFIG.name}
              className="h-7 md:h-8 w-auto max-w-[170px] object-contain"
            />
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => !isAdmin && setBuyTokensOpen(true)}
              className="label-mono hidden items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              <Coins className="h-3 w-3 text-primary" />
              {formattedTokenBalance}
            </button>
            {!isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBuyTokensOpen(true)}
                className="gap-1.5 font-bold text-xs h-8 border-primary/40 text-primary hover:bg-primary/10 hidden sm:inline-flex"
              >
                <Zap className="h-3.5 w-3.5 text-primary" />
                Adicionar Saldo
              </Button>
            )}
            <Badge
              variant={isAdmin ? "default" : "secondary"}
              className="hidden font-mono text-[10px] uppercase tracking-widest sm:inline-flex"
            >
              {isAdmin ? "ADMIN" : planSlug}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Page title + CTA */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-mono text-primary">
              {isAdmin ? "Painel Administrativo" : "Painel"}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
              Olá, {profile.data?.full_name || user.email?.split("@")[0]}
              {isAdmin && (
                <span className="ml-2 text-xs font-mono font-bold text-primary border border-primary/40 px-2 py-0.5 rounded-full align-middle">
                  ADMINISTRADOR
                </span>
              )}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isAdmin
                ? "Acesso com tokens infinitos e criação liberada sem restrições."
                : "Crie, edite e publique quantos sites quiser enquanto tiver tokens disponíveis."}
            </p>
          </div>
          <Button
            variant="hero"
            size="lg"
            onClick={() => setWizardOpen(true)}
            disabled={!canCreateSite}
            title={
              !canCreateSite
                ? `Saldo insuficiente (mínimo ${TOKEN_CONFIG.minTokensToCreate.toString().replace(".", ",")} tokens por site). Adquira mais tokens para continuar criando.`
                : undefined
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Criar novo site
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-3">
          {/* Tokens */}
          <div className="bg-surface p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <p className="label-mono text-muted-foreground">Tokens disponíveis</p>
                {!isAdmin && (
                  <span className="font-mono text-[11px] text-primary/80 font-bold">
                    2,5 tokens / site
                  </span>
                )}
              </div>
              <p className="mt-2 text-2xl font-extrabold tracking-tight">
                {isAdmin ? (
                  <span className="text-primary font-mono text-3xl">∞</span>
                ) : (
                  <span>
                    {tokenBalance.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 1 })}
                    <span className="ml-1.5 text-sm font-normal text-muted-foreground">tokens</span>
                  </span>
                )}
              </p>
              <div className="mt-3 h-1.5 w-full bg-muted overflow-hidden">
                <div
                  className={`h-full transition-all ${tokenBalance >= 2.5 || isAdmin ? "bg-primary" : "bg-muted-foreground/30"}`}
                  style={{ width: `${tokenPct}%` }}
                />
              </div>
            </div>
            {isAdmin ? (
              <p className="label-mono mt-3 text-emerald-500 text-xs font-bold">
                Tokens Infinitos Ativos
              </p>
            ) : (
              <button
                onClick={() => setBuyTokensOpen(true)}
                className="label-mono mt-3 text-primary hover:underline text-xs text-left inline-block"
              >
                Comprar tokens →
              </button>
            )}
          </div>

          {/* Sites */}
          <div className="bg-surface p-5">
            <p className="label-mono text-muted-foreground">Sites criados</p>
            <p className="mt-2 text-2xl font-extrabold tracking-tight">
              {siteCount}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                {siteCount === 1 ? "site ativo" : "sites ativos"}
              </span>
            </p>
            <div className="mt-3 h-1.5 w-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: "100%" }}
              />
            </div>
            {canCreateSite ? (
              <p className="label-mono mt-3 text-emerald-500 text-xs">
                {isAdmin ? "Criação ilimitada liberada" : "Criação liberada por tokens"}
              </p>
            ) : (
              <p className="label-mono mt-3 text-amber-500 text-xs font-bold">
                Saldo insuficiente (Mín. 2,5 tokens)
              </p>
            )}
          </div>

          {/* Plano */}
          <div className="bg-surface p-5">
            <p className="label-mono text-muted-foreground">Plano da conta</p>
            <p className="mt-2 text-2xl font-extrabold tracking-tight">
              {planSlug}
            </p>
            <div className="mt-3 h-1.5 w-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: isAdmin ? "100%" : (rawPlanSlug === "free" || rawPlanSlug === "avulso" ? "0%" : "100%") }}
              />
            </div>
            {isAdmin ? (
              <p className="label-mono mt-3 text-emerald-500 text-xs font-bold">
                Acesso Total Super Admin
              </p>
            ) : (
              <Link
                to="/"
                hash="planos"
                className="label-mono mt-3 block text-primary hover:underline text-xs"
              >
                {rawPlanSlug === "free" || rawPlanSlug === "avulso" ? "Contratar um plano →" : "Ver outros planos →"}
              </Link>
            )}
          </div>
        </div>

        {/* Sites list */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="label-mono text-muted-foreground">Meus sites</h2>
            {sites.data && sites.data.length > 0 && (
              <span className="label-mono text-muted-foreground">
                {siteCount} site{siteCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {sites.isLoading ? (
            <p className="mt-6 text-sm text-muted-foreground">Carregando sites...</p>
          ) : siteCount === 0 ? (
            <div className="mt-6 border border-dashed border-border p-12 text-center">
              <p className="text-sm text-muted-foreground">
                Você ainda não criou nenhum site.
              </p>
              <Button
                variant="monoOutline"
                className="mt-4"
                onClick={() => setWizardOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar meu primeiro site
              </Button>
            </div>
          ) : (
            <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sites.data!.map((site) => (
                <SiteCard key={site.id} site={site} userId={user.id} />
              ))}
            </ul>
          )}
        </section>

        {/* Token history */}
        <section className="mt-10">
          <button
            onClick={() => setShowTxHistory((v) => !v)}
            className="flex items-center gap-2 label-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            {showTxHistory ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            Histórico de tokens
          </button>

          {showTxHistory && (
            <div className="mt-4 border border-border">
              {transactions.isLoading ? (
                <p className="p-6 text-sm text-muted-foreground">Carregando...</p>
              ) : (transactions.data?.length ?? 0) === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">Nenhuma transação ainda.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="label-mono px-4 py-3 text-left text-muted-foreground">Tipo</th>
                      <th className="label-mono px-4 py-3 text-left text-muted-foreground">Descrição</th>
                      <th className="label-mono px-4 py-3 text-right text-muted-foreground">Tokens</th>
                      <th className="label-mono px-4 py-3 text-right text-muted-foreground">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.data!.map((tx) => (
                      <tr key={tx.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3">
                          <Badge
                            variant="secondary"
                            className="font-mono text-[10px] uppercase"
                          >
                            {TX_TYPE_LABEL[tx.type] ?? tx.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{tx.description}</td>
                        <td
                          className={`px-4 py-3 text-right font-mono font-bold ${
                            tx.amount > 0 ? "text-success-foreground" : "text-destructive"
                          }`}
                        >
                          {tx.amount > 0 ? "+" : ""}
                          {tx.amount}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                          {tx.balance_after}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Dialogs */}
      <CreateSiteWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        userId={user.id}
      />
      <BuyTokensDialog open={buyTokensOpen} onOpenChange={setBuyTokensOpen} />
    </div>
  );
}
