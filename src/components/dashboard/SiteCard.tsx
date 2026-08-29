import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal, ExternalLink, Pencil, Globe, GlobeLock, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { subdomainFor } from "@/config/app";
import { Link } from "@tanstack/react-router";
import { DomainSettingsDialog } from "./DomainSettingsDialog";

type SiteStatus = "draft" | "generating" | "building" | "published" | "failed";

interface Site {
  id: string;
  name: string;
  slug: string;
  status: SiteStatus;
  category: string | null;
  updated_at: string;
}

const STATUS_CONFIG: Record<SiteStatus, { label: string; className: string }> = {
  draft: { label: "Rascunho", className: "bg-muted text-muted-foreground" },
  generating: { label: "Gerando", className: "bg-warning/20 text-warning-foreground" },
  building: { label: "Construindo", className: "bg-primary/20 text-primary" },
  published: { label: "Publicado", className: "bg-success/20 text-success-foreground" },
  failed: { label: "Falhou", className: "bg-destructive/20 text-destructive-foreground" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  const days = Math.floor(hrs / 24);
  return `${days}d atrás`;
}

interface SiteCardProps {
  site: Site;
  userId: string;
}

export function SiteCard({ site, userId }: SiteCardProps) {
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [domainOpen, setDomainOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const statusConfig = STATUS_CONFIG[site.status] ?? STATUS_CONFIG.draft;
  const subdomain = subdomainFor(site.slug);

  async function handleTogglePublish() {
    const isPublished = site.status === "published";
    const newStatus: SiteStatus = isPublished ? "draft" : "published";
    setBusy(true);
    try {
      const { error } = await supabase
        .from("sites")
        .update({
          status: newStatus,
          ...(newStatus === "published" ? { published_at: new Date().toISOString() } : {}),
        })
        .eq("id", site.id)
        .eq("user_id", userId);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["sites"] });
      toast.success(isPublished ? "Site despublicado." : "Site publicado com sucesso!");
    } catch (e) {
      toast.error("Não foi possível atualizar o status.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      const { error } = await supabase
        .from("sites")
        .delete()
        .eq("id", site.id)
        .eq("user_id", userId);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["sites"] });
      toast.success("Site excluído.");
    } catch (e) {
      toast.error("Não foi possível excluir o site.");
    } finally {
      setBusy(false);
      setDeleteOpen(false);
    }
  }

  return (
    <>
      <li className="group border border-border bg-surface p-6 transition-colors hover:border-primary/40">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="truncate font-semibold">{site.name}</h3>
              <Badge className={`font-mono text-[10px] uppercase shrink-0 ${statusConfig.className}`}>
                {statusConfig.label}
              </Badge>
            </div>
            {site.category && (
              <p className="label-mono mt-1 text-muted-foreground">{site.category}</p>
            )}
            <a
              href={`/s/${site.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 truncate font-mono text-xs text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <span>adspainel.site/s/{site.slug}</span>
              <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
            </a>
            <p className="label-mono mt-2 text-muted-foreground">
              Atualizado {timeAgo(site.updated_at)}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 opacity-60 group-hover:opacity-100"
                disabled={busy}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Ações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link
                  to="/s/$siteSlug"
                  params={{ siteSlug: site.slug }}
                  target="_blank"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Ver site público
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/preview/$siteSlug"
                  params={{ siteSlug: site.slug }}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Preview local
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/editor/$siteId"
                  params={{ siteId: site.id }}
                  className="flex items-center gap-2"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={() => setDomainOpen(true)}
              >
                <Globe className="h-3.5 w-3.5" />
                Domínio & Deploy
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={handleTogglePublish}
                disabled={busy || site.status === "generating" || site.status === "building"}
              >
                {site.status === "published" ? (
                  <>
                    <GlobeLock className="h-3.5 w-3.5" />
                    Despublicar
                  </>
                ) : (
                  <>
                    <Globe className="h-3.5 w-3.5" />
                    Publicar
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center gap-2 text-destructive focus:text-destructive"
                onClick={() => setDeleteOpen(true)}
                disabled={busy}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </li>

      <DomainSettingsDialog
        open={domainOpen}
        onOpenChange={setDomainOpen}
        siteId={site.id}
        userId={userId}
        siteSlug={site.slug}
        siteName={site.name}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir &ldquo;{site.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é permanente. O site e todas as suas páginas serão
              removidos. Essa operação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busy ? "Excluindo..." : "Excluir site"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
