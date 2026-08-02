import { Clock, FileText, ImageIcon, Link2 } from "lucide-react"
import { ScoreGauge } from "@/components/score-gauge"
import { CheckList } from "@/components/check-list"
import { AiPanel } from "@/components/ai-panel"
import type { AuditResponse } from "@/lib/types"

// Une petite carte de statistique réutilisable.
function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <span className="font-mono text-lg font-semibold tabular-nums">{value}</span>
    </div>
  )
}

export function ReportView({ data }: { data: AuditResponse }) {
  const { report, ai } = data

  return (
    <div className="flex flex-col gap-8">
      {/* En-tête du rapport : score + URL analysée */}
      <div className="flex flex-col items-center gap-6 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:gap-8">
        <ScoreGauge score={report.score} />
        <div className="flex min-w-0 flex-col gap-2 text-center sm:text-left">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Page analysée</span>
          <a
            href={report.finalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate font-mono text-sm text-primary hover:underline"
          >
            {report.finalUrl}
          </a>
          <p className="text-sm text-pretty text-muted-foreground">
            {report.meta.title ?? "Aucune balise title détectée sur cette page."}
          </p>
          <span className="mt-1 inline-flex w-fit items-center gap-1.5 self-center rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground sm:self-start">
            Code HTTP {report.statusCode}
          </span>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={Clock} label="Réponse" value={`${report.fetchMs} ms`} />
        <Stat icon={FileText} label="Mots" value={String(report.wordCount)} />
        <Stat
          icon={ImageIcon}
          label="Images / sans alt"
          value={`${report.images.total} / ${report.images.missingAlt}`}
        />
        <Stat
          icon={Link2}
          label="Liens int / ext"
          value={`${report.links.internal} / ${report.links.external}`}
        />
      </div>

      {/* Grille : checks techniques d'un côté, IA de l'autre */}
      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="checks-title" className="rounded-xl border border-border bg-card p-6">
          <h2 id="checks-title" className="mb-2 text-sm font-semibold uppercase tracking-wide">
            Contrôles techniques
          </h2>
          <CheckList checks={report.checks} />
        </section>

        <section aria-labelledby="ai-title">
          <h2 id="ai-title" className="sr-only">
            Suggestions générées par IA
          </h2>
          <AiPanel ai={ai} />
        </section>
      </div>
    </div>
  )
}
