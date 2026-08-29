import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SITE_STYLES, SITE_FONTS } from "@/config/app";

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
        <Label className="label-mono text-muted-foreground">Estilo Visual do Design</Label>
        <div className="grid grid-cols-2 gap-2">
          {SITE_STYLES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChangeStyle(s)}
              className={`border p-2.5 rounded-lg font-mono text-xs transition-all text-left ${
                style === s
                  ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
