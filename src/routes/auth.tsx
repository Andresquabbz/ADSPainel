import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_CONFIG } from "@/config/app";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type AuthSearch = { mode?: "signin" | "signup" };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    mode: search["mode"] === "signup" ? "signup" : "signin",
  }),
  head: () => ({
    meta: [
      { title: `Entrar ou criar conta — ${APP_CONFIG.name}` },
      {
        name: "description",
        content:
          "Acesse sua conta ADSPainel para criar, editar e publicar sites profissionais gerados por inteligência artificial.",
      },
      { property: "og:title", content: `Entrar ou criar conta — ${APP_CONFIG.name}` },
      {
        property: "og:description",
        content: "Crie sua conta e gere seu site profissional com IA em poucos minutos.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (isSignup) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: fullName },
          },
        });
        if (signUpError) throw signUpError;

        if (signUpData?.session) {
          toast.success("Conta criada com sucesso! Entrando...");
          navigate({ to: "/dashboard" });
          return;
        }

        // Try immediate login so user never has to click email link
        try {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (!signInError && signInData?.session) {
            toast.success("Conta criada com sucesso!");
            navigate({ to: "/dashboard" });
            return;
          }
        } catch {}

        toast.info("Conta criada com sucesso!", {
          description: "Verifique seu e-mail ou confirme o cadastro para acessar.",
          duration: 8000,
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo de volta.");
        navigate({ to: "/dashboard" });
      }
    } catch (error) {
      let msg = "Não foi possível continuar.";
      if (error instanceof Error) {
        msg = error.message;
        if (msg.includes("Invalid login credentials")) {
          msg = "E-mail ou senha incorretos. Se você acabou de criar a conta, desative a confirmação de e-mail no Supabase ou confirme pelo e-mail recebido.";
        } else if (msg.includes("User already registered")) {
          msg = "Este e-mail já possui cadastro. Por favor, clique em 'Entrar' logo abaixo.";
        } else if (msg.includes("Password is known to be weak")) {
          msg = "Senha considerada fraca. Crie uma senha com letras maiúsculas, números e símbolos.";
        }
      }
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between border-r border-border bg-surface p-12 lg:flex">
        <div className="absolute inset-0 grid-backdrop opacity-40" aria-hidden />
        <Link to="/" className="relative flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt={APP_CONFIG.name}
            className="h-8 md:h-9 w-auto max-w-[190px] object-contain"
          />
        </Link>
        <div className="relative max-w-sm">
          <p className="label-mono text-primary">Plataforma de criação</p>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight">
            Do briefing ao site publicado em minutos.
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">{APP_CONFIG.subtitle}</p>
        </div>
        <p className="relative label-mono text-muted-foreground">© {APP_CONFIG.company}</p>
      </section>

      <section className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 inline-block lg:hidden">
            <img
              src="/logo.png"
              alt={APP_CONFIG.name}
              className="h-8 w-auto max-w-[170px] object-contain"
            />
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {isSignup ? "Criar conta" : "Entrar"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSignup
              ? "Crie sua conta para começar a criar sites profissionais com IA."
              : "Acesse seu painel e continue de onde parou."}
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="label-mono text-muted-foreground">
                  Nome completo
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-11"
                  placeholder="Seu nome"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="label-mono text-muted-foreground">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
                placeholder="voce@empresa.com.br"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="label-mono text-muted-foreground">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-11"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
              {busy ? "Aguarde..." : isSignup ? "Criar conta grátis" : "Entrar"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setIsSignup((v) => !v)}
            className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            {isSignup ? "Já tem conta? Entrar" : "Não tem conta? Criar agora"}
          </button>
        </div>
      </section>
    </main>
  );
}
