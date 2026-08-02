import type { SeoReport } from "@/lib/seo"

// Ce que renvoie l'IA (doit matcher le schéma zod de la route API).
export type AiResult = {
  summary: string
  keywords: { keyword: string; reason: string }[]
  suggestions: { title: string; detail: string; priority: "haute" | "moyenne" | "basse" }[]
}

// D'où viennent les suggestions : vrai modèle IA ou fallback code.
export type SuggestionSource = "ia" | "heuristique"

// Réponse complète de /api/audit
export type AuditResponse = {
  report: SeoReport
  ai: AiResult | null
  source: SuggestionSource
}

export type { SeoReport }
