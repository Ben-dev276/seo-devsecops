"use client"

import { useState } from "react"
import { Search, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReportView } from "@/components/report-view"
import type { AuditResponse } from "@/lib/types"

// Quelques exemples pour que l'utilisateur puisse tester en un clic.
const EXAMPLES = ["vercel.com", "wikipedia.org", "iut.fr"]

export function AuditForm() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<AuditResponse | null>(null)

  async function runAudit(target: string) {
    const value = target.trim()
    if (!value) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
      })

      const json = await res.json()

      if (!res.ok) {
        // La route renvoie { error: "..." } en cas de souci.
        setError(json?.error ?? "Une erreur est survenue.")
        setData(null)
        return
      }

      setData(json)
    } catch {
      setError("Impossible de contacter le serveur. Réessaie dans un instant.")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    runAudit(url)
  }

  return (
    <div className="flex flex-col gap-10">
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="text"
              inputMode="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="ex: exemple.com ou https://exemple.com/page"
              aria-label="URL à analyser"
              className="h-11 w-full rounded-lg border border-input bg-card pl-9 pr-3 font-mono text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <Button type="submit" disabled={loading} className="h-11 px-6">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Analyse...
              </>
            ) : (
              "Analyser"
            )}
          </Button>
        </div>

        {/* Exemples cliquables */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>Essaie :</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              disabled={loading}
              onClick={() => {
                setUrl(ex)
                runAudit(ex)
              }}
              className="rounded-md bg-secondary px-2 py-0.5 font-mono text-secondary-foreground transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              {ex}
            </button>
          ))}
        </div>
      </form>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {loading && !data && (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm">On récupère la page et on interroge l&apos;IA, quelques secondes...</p>
        </div>
      )}

      {data && !loading && <ReportView data={data} />}
    </div>
  )
}
