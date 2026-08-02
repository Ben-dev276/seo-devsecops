// Petite jauge circulaire faite avec un SVG (stroke-dasharray).
// Rien de fou, mais ca rend le score tout de suite lisible.

type Props = {
  score: number
}

function scoreColor(score: number): string {
  if (score >= 80) return "var(--color-chart-2)" // vert
  if (score >= 50) return "var(--color-chart-3)" // orange
  return "var(--color-destructive)" // rouge
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Bon"
  if (score >= 50) return "À améliorer"
  return "Critique"
}

export function ScoreGauge({ score }: Props) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = scoreColor(score)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-32 w-32">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--color-muted)" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-bold tabular-nums" style={{ color }}>
            {score}
          </span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-medium" style={{ color }}>
        {scoreLabel(score)}
      </span>
    </div>
  )
}
