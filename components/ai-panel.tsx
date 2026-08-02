import { Sparkles, Tag, ArrowUpRight } from "lucide-react"
import type { AiResult } from "@/lib/types"

const priorityStyle = {
  haute: "bg-destructive/10 text-destructive",
  moyenne: "bg-chart-3/15 text-chart-3",
  basse: "bg-muted text-muted-foreground",
} as const

export function AiPanel({ ai }: { ai: AiResult | null }) {
  // Si l'appel IA a échoué on prévient l'utilisateur, sans casser le reste.
  if (!ai) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-2 flex items-center gap-2 text-muted-foreground">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          <h2 className="text-sm font-semibold uppercase tracking-wide">Suggestions IA</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Les recommandations IA n&apos;ont pas pu être générées cette fois-ci. L&apos;analyse technique
          ci-dessus reste valable.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Résumé */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
        <div className="mb-2 flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          <h2 className="text-sm font-semibold uppercase tracking-wide">Analyse IA</h2>
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
