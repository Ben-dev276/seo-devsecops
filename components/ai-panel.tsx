import { Sparkles, Tag, ArrowUpRight, Cpu } from "lucide-react"
import type { AiResult, SuggestionSource } from "@/lib/types"

const priorityStyle = {
  haute: "bg-destructive/10 text-destructive",
  moyenne: "bg-chart-3/15 text-chart-3",
  basse: "bg-muted text-muted-foreground",
} as const

export function AiPanel({ ai, source }: { ai: AiResult | null; source: SuggestionSource }) {
  // En théorie ai n'est jamais null (la route renvoie toujours un fallback),
  // mais on garde une garde de sécurité pour le typage.
  if (!ai) return null

  const isAi = source === "ia"

  return (
    <div className="flex flex-col gap-6">
      {/* Résumé */}
      <div
        className={`rounded-xl border p-6 ${
          isAi ? "border-primary/30 bg-primary/5" : "border-border bg-card"
        }`}
      >
        <div className={`mb-2 flex items-center gap-2 ${isAi ? "text-primary" : "text-muted-foreground"}`}>
          {isAi ? (
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Cpu className="h-4 w-4" aria-hidden="true" />
          )}
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            {isAi ? "Analyse IA" : "Analyse automatique"}
          </h2>
          {!isAi && (
            <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              sans IA
            </span>
          )}
        </div>
        <p className="text-pretty leading-relaxed">{ai.summary}</p>
      </div>

      {/* Mots-clés */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <h3 className="text-sm font-semibold uppercase tracking-wide">Mots-clés suggérés</h3>
        </div>
        <ul className="flex flex-col gap-3">
          {ai.keywords.map((kw, i) => (
            <li key={i} className="flex flex-col gap-1">
              <span className="inline-flex w-fit rounded-md bg-secondary px-2 py-1 font-mono text-sm text-secondary-foreground">
                {kw.keyword}
              </span>
              <span className="text-sm leading-relaxed text-muted-foreground">{kw.reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommandations */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <h3 className="text-sm font-semibold uppercase tracking-wide">Recommandations</h3>
        </div>
        <ol className="flex flex-col gap-4">
          {ai.suggestions.map((s, i) => (
            <li key={i} className="flex flex-col gap-1.5 border-l-2 border-border pl-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{s.title}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyle[s.priority]}`}>
                  {s.priority}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
