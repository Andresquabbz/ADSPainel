import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SITE_STYLES, SITE_FONTS } from "@/config/app";
import { VISUAL_STYLES } from "@/lib/visual-styles";

interface ThemeTabProps {
  primaryColor: string;
  onChangePrimaryColor: (color: string) => void;
  fontFamily: string;
  onChangeFontFamily: (font: string) => void;
  style: string;
  onChangeStyle: (style: string) => void;
}

const COLOR_PRESETS = [
  "#e2603a", // Ember / Orange
  "#3aa5e2", // Ocean / Blue
  "#4ac97e", // Emerald / Green
  "#c9a84c", // Gold / Amber
  "#6c7cff", // Indigo / Purple
  "#e24a7c", // Rose / Pink
  "#4ac9c9", // Cyan / Teal
  "#8a8fa3", // Slate / Neutral
];

export function ThemeTab({
  primaryColor,
  onChangePrimaryColor,
  fontFamily,
  onChangeFontFamily,
  style,
  onChangeStyle,
}: ThemeTabProps) {
  return (
    <div className="space-y-6">
      {/* Primary color */}
      <div className="space-y-3">
        <Label className="label-mono text-muted-foreground">Cor Principal da Marca</Label>
        <div className="flex flex-wrap items-center gap-2">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChangePrimaryColor(color)}
              className={`h-9 w-9 rounded-lg border-2 transition-all hover:scale-105 ${
                primaryColor.toLowerCase() === color.toLowerCase()
                  ? "border-foreground scale-105 shadow-md"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
          <div className="relative flex items-center">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => onChangePrimaryColor(e.target.value)}
              className="h-9 w-9 cursor-pointer rounded-lg border border-border bg-background p-0.5"
              title="Cor personalizada"
            />
          </div>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          Cor selecionada: <span className="font-bold text-foreground">{primaryColor}</span>
        </p>
      </div>

      {/* Typography */}
      <div className="space-y-3">
        <Label className="label-mono text-muted-foreground">Tipografia & Fonte Principal</Label>
        <Select value={fontFamily} onValueChange={onChangeFontFamily}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Selecione a fonte" />
          </SelectTrigger>
          <SelectContent>
            {SITE_FONTS.map((font) => (
              <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="p-4 rounded-lg border border-border bg-card/40 text-center" style={{ fontFamily }}>
          <p className="text-sm font-bold">Exemplo de Tipografia</p>
          <p className="text-xs text-muted-foreground mt-1">
            O rápido cachorro marrom salta sobre o cão preguiçoso.
          </p>
        </div>
      </div>

      {/* Visual Style */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="label-mono text-muted-foreground">Estilo Visual do Design</Label>
          <span className="text-[11px] font-mono text-primary font-bold">
            {style || "Moderno"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Cada estilo aplica automaticamente formato dos botões, cantos dos cards, sombras e paleta visual ao site.
        </p>
        <div className="grid grid-cols-1 gap-2.5">
          {SITE_STYLES.map((s) => {
            const config = VISUAL_STYLES[s];
            const isSelected = style === s;

            return (
              <button
                key={s}
                type="button"
                onClick={() => onChangeStyle(s)}
                className={`border p-3 rounded-xl transition-all text-left flex items-start gap-3 ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                    : "border-border bg-card/40 text-muted-foreground hover:border-primary/50 hover:bg-card/80 hover:text-foreground"
                }`}
              >
                <div
                  className={`h-7 w-7 shrink-0 flex items-center justify-center font-bold text-xs ${config?.cardRadius || "rounded-lg"} ${
                    isSelected
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  Aa
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                      {s}
                    </span>
                    {config?.isDark && (
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 font-bold">
                        Dark VIP
                      </span>
                    )}
                  </div>
                  {config?.description && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                      {config.description}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
