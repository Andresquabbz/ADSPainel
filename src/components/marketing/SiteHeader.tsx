import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/config/app";
import { useAuth } from "@/hooks/useAuth";

export function SiteHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt={APP_CONFIG.name}
            className="h-8 md:h-9 w-auto max-w-[180px] object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="/#recursos" className="label-mono text-muted-foreground hover:text-foreground">
            Recursos
          </a>
          <a href="/#templates" className="label-mono text-muted-foreground hover:text-foreground">
            Templates
          </a>
          <a href="/#planos" className="label-mono text-muted-foreground hover:text-foreground">
            Planos
          </a>
          <a href="/#faq" className="label-mono text-muted-foreground hover:text-foreground">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild variant="mono" size="sm">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/auth">Entrar</Link>
              </Button>
              <Button asChild variant="hero" size="sm" className="font-bold">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Começar agora
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
