import { generateObject } from "ai"
import { z } from "zod"
import { analyze } from "@/lib/seo"

// On laisse un peu de marge, l'analyse + l'appel IA peuvent prendre du temps.
export const maxDuration = 60

// Schéma de ce que l'IA doit nous renvoyer. Le fait de forcer une structure
// evite d'avoir a parser du texte libre cote front, c'est beaucoup plus fiable.
const aiSchema = z.object({
  summary: z.string().describe("Un résumé en 2 phrases de l'état SEO de la page, en français."),
  keywords: z
    .array(
      z.object({
        keyword: z.string(),
        reason: z.string().describe("Pourquoi ce mot-clé est pertinent pour cette page."),
      }),
    )
    .describe("5 mots-clés ou expressions sur lesquels la page pourrait se positionner."),
  suggestions: z
    .array(
      z.object({
        title: z.string(),
        detail: z.string(),
        priority: z.enum(["haute", "moyenne", "basse"]),
      }),
    )
    .describe("Recommandations concrètes d'optimisation, triées par priorité."),
})

export async function POST(req: Request) {
  let url: string
  try {
    const body = await req.json()
    url = body?.url
  } catch {
    return Response.json({ error: "Corps de requête invalide." }, { status: 400 })
  }

  if (!url || typeof url !== "string") {
    return Response.json({ error: "Merci de fournir une URL." }, { status: 400 })
  }

  // 1) Analyse technique de la page
  let report
  try {
    report = await analyze(url)
  } catch (err) {
    console.log("[v0] Erreur analyse:", err instanceof Error ? err.message : err)
    return Response.json(
      { error: "Impossible de récupérer cette page. Vérifie l'URL (le site est-il en ligne ?)." },
      { status: 422 },
    )
  }

  // 2) Suggestions IA. Si ca plante (quota, réseau...), on renvoie quand meme
  // l'analyse technique : mieux vaut un rapport partiel qu'une page d'erreur.
  let ai = null
  try {
    const { object } = await generateObject({
      model: "openai/gpt-4.1-mini",
      schema: aiSchema,
      instructions:
        "Tu es un consultant SEO senior. Tu analyses des pages web et donnes des conseils " +
        "concrets, actionnables et en français. Pas de blabla générique, sois précis.",
      prompt: buildPrompt(report),
    })
    ai = object
  } catch (err) {
    console.log("[v0] Erreur IA:", err instanceof Error ? err.message : err)
  }

  return Response.json({ report, ai })
}

// On résume le rapport technique pour l'IA, en gardant l'essentiel.
function buildPrompt(report: Awaited<ReturnType<typeof analyze>>): string {
  return [
    `URL analysée : ${report.finalUrl}`,
    `Score technique calculé : ${report.score}/100`,
    `Title : ${report.meta.title ?? "(absent)"}`,
    `Meta description : ${report.meta.description ?? "(absente)"}`,
    `H1 : ${report.headings.h1.join(" | ") || "(absent)"}`,
    `Nombre de H2 : ${report.headings.h2Count}`,
    `Images sans alt : ${report.images.missingAlt}/${report.images.total}`,
    `Nombre de mots : ${report.wordCount}`,
    "",
    "Extrait du contenu de la page :",
    report.textSample || "(contenu vide)",
    "",
    "À partir de ces données, propose des mots-clés pertinents et des optimisations concrètes.",
  ].join("\n")
}
