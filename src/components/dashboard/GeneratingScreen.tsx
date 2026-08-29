import { useEffect, useState } from "react";
import { Sparkles, Globe, FileText, Search, Check } from "lucide-react";

interface GeneratingScreenProps {
  siteName: string;
  category: string | null;
}

const STEPS = [
  { icon: Search, label: "Analisando seu negócio..." },
  { icon: FileText, label: "Criando estrutura do site..." },
  { icon: Sparkles, label: "Gerando textos com IA..." },
  { icon: Search, label: "Configurando SEO..." },
  { icon: Globe, label: "Finalizando publicação..." },
];

export function GeneratingScreen({ siteName, category }: GeneratingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Advance steps every ~2.5s — total ~12.5s which covers Gemini latency
    const stepInterval = setInterval(() => {
      setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 2500);

    // Progress bar advances smoothly up to 90% (real completion closes the modal)
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        // Decelerate as we approach 90
        const remaining = 90 - p;
        return p + remaining * 0.04;
      });
    }, 200);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-8 text-center">
      {/* Animated icon cluster */}
      <div className="relative flex items-center justify-center">
        <div
          className="absolute h-28 w-28 rounded-full opacity-20 animate-ping"
          style={{ backgroundColor: "var(--primary)" }}
        />
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <Sparkles className="h-9 w-9 text-white" />
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <h3 className="text-xl font-extrabold tracking-tight">
          Gerando seu site com IA
        </h3>
        <p className="font-mono text-sm text-muted-foreground">
          {siteName}
          {category ? ` · ${category}` : ""}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full space-y-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              backgroundColor: "var(--primary)",
            }}
          />
        </div>
        <p className="font-mono text-[11px] text-muted-foreground">
          {Math.round(progress)}%
        </p>
      </div>

      {/* Steps list */}
      <div className="w-full space-y-2 text-left">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isDone = i < currentStep;
          const isActive = i === currentStep;

          return (
            <div
              key={i}
              className={`flex items-center gap-3 transition-opacity ${
                i > currentStep ? "opacity-30" : "opacity-100"
              }`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  isDone
                    ? "border-transparent bg-primary text-primary-foreground"
                    : isActive
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground"
                }`}
              >
                {isDone ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Icon className={`h-3 w-3 ${isActive ? "animate-pulse" : ""}`} />
                )}
              </div>
              <span
                className={`font-mono text-xs ${
                  isDone
                    ? "text-muted-foreground line-through"
                    : isActive
                      ? "font-bold text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="font-mono text-[11px] text-muted-foreground">
        Isso pode levar alguns segundos…
      </p>
    </div>
  );
}
