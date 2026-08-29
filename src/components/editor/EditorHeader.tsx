import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Save,
  Loader2,
  Globe,
  GlobeLock,
  ExternalLink,
} from "lucide-react";

export type ViewportMode = "desktop" | "tablet" | "mobile";

interface EditorHeaderProps {
  siteName: string;
  siteSlug: string;
  status: string;
  viewport: ViewportMode;
  onChangeViewport: (mode: ViewportMode) => void;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  isPublishing: boolean;
  onTogglePublish: () => void;
}

export function EditorHeader({
  siteName,
  siteSlug,
  status,
  viewport,
  onChangeViewport,
  hasUnsavedChanges,
  isSaving,
  onSave,
  isPublishing,
  onTogglePublish,
}: EditorHeaderProps) {
  const isPublished = status === "published";

  return (
    <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between shrink-0 z-30">
      {/* Left: Back + Site Title */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-muted-foreground hover:text-foreground">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Dashboard
          </Link>
        </Button>

        <div className="h-4 w-px bg-border hidden sm:block" />

        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm tracking-tight truncate max-w-[180px] sm:max-w-xs">
            {siteName}
          </span>
          <Badge
            variant="outline"
            className={`font-mono text-[10px] uppercase tracking-wider ${
              isPublished
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-muted-foreground/30 text-muted-foreground"
            }`}
          >
            {isPublished ? "Publicado" : "Rascunho"}
          </Badge>
          {hasUnsavedChanges && (
            <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-amber-500 font-semibold animate-pulse">
              ● Não salvo
            </span>
          )}
        </div>
      </div>

      {/* Center: Device Viewport Switcher */}
      <div className="hidden md:flex items-center gap-1 p-1 rounded-lg border border-border bg-muted/40">
        <Button
          type="button"
          variant={viewport === "desktop" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onChangeViewport("desktop")}
          className="h-7 px-2.5 text-xs gap-1.5"
          title="Visualização Desktop (100%)"
        >
          <Monitor className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Desktop</span>
        </Button>
        <Button
          type="button"
          variant={viewport === "tablet" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onChangeViewport("tablet")}
          className="h-7 px-2.5 text-xs gap-1.5"
          title="Visualização Tablet (768px)"
        >
          <Tablet className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Tablet</span>
        </Button>
        <Button
          type="button"
          variant={viewport === "mobile" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onChangeViewport("mobile")}
          className="h-7 px-2.5 text-xs gap-1.5"
          title="Visualização Mobile (375px)"
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Mobile</span>
        </Button>
      </div>

      {/* Right: Preview + Save + Publish */}
      <div className="flex items-center gap-2">
        {isPublished && (
          <Button variant="ghost" size="sm" asChild className="h-8 px-2.5 text-xs gap-1.5 text-emerald-600 dark:text-emerald-400">
            <Link to="/s/$siteSlug" params={{ siteSlug }} target="_blank">
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ver no ar</span>
            </Link>
          </Button>
        )}

        <Button variant="ghost" size="sm" asChild className="h-8 px-2.5 text-xs gap-1.5">
          <Link to="/preview/$siteSlug" params={{ siteSlug }} target="_blank">
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </Link>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={isSaving || !hasUnsavedChanges}
          className="h-8 px-3 text-xs gap-1.5"
          title="Salvar alterações (Ctrl+S)"
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          <span>{isSaving ? "Salvando..." : "Salvar"}</span>
        </Button>

        <Button
          variant={isPublished ? "outline" : "hero"}
          size="sm"
          onClick={onTogglePublish}
          disabled={isPublishing}
          className="h-8 px-3 text-xs gap-1.5"
        >
          {isPublishing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isPublished ? (
            <GlobeLock className="h-3.5 w-3.5" />
          ) : (
            <Globe className="h-3.5 w-3.5" />
          )}
          <span>{isPublished ? "Despublicar" : "Publicar"}</span>
        </Button>
      </div>
    </header>
  );
}
