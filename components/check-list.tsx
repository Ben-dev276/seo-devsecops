import { Check as CheckIcon, AlertTriangle, XCircle } from "lucide-react"
import type { SeoReport } from "@/lib/types"

const config = {
  ok: {
    Icon: CheckIcon,
    className: "text-chart-2",
    bg: "bg-chart-2/10",
  },
  warn: {
    Icon: AlertTriangle,
    className: "text-chart-3",
    bg: "bg-chart-3/10",
  },
  fail: {
    Icon: XCircle,
    className: "text-destructive",
    bg: "bg-destructive/10",
  },
} as const

export function CheckList({ checks }: { checks: SeoReport["checks"] }) {
  return (
    <ul className="flex flex-col divide-y divide-border">
      {checks.map((check) => {
        const { Icon, className, bg } = config[check.status]
        return (
          <li key={check.id} className="flex items-start gap-3 py-3">
            <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${bg}`}>
              <Icon className={`h-3.5 w-3.5 ${className}`} aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium leading-snug">{check.label}</span>
              <span className="text-sm leading-relaxed text-muted-foreground">{check.detail}</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
