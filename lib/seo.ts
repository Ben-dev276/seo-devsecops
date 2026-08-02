// Logique d'analyse SEO on-page.
// J'ai volontairement séparé ça de la route API pour pouvoir tester/réutiliser
// la fonction sans dépendre de Next. C'est juste plus propre a gerer.

import { parse, type HTMLElement } from "node-html-parser"

// Un "check" = un point de contrôle SEO, avec un verdict.
export type CheckStatus = "ok" | "warn" | "fail"

export type Check = {
  id: string
  label: string
  status: CheckStatus
  detail: string
  // poids du check dans le score final (plus c'est important, plus ca pese)
  weight: number
}

export type SeoReport = {
  url: string
  finalUrl: string
  statusCode: number
  fetchMs: number
  score: number
  meta: {
    title: string | null
    titleLength: number
    description: string | null
    descriptionLength: number
    canonical: string | null
    robots: string | null
    lang: string | null
    hasViewport: boolean
    ogTitle: string | null
    ogImage: string | null
    hasFavicon: boolean
  }
  headings: {
    h1: string[]
    h2Count: number
    h3Count: number
  }
  images: {
    total: number
    missingAlt: number
  }
  links: {
    internal: number
    external: number
  }
  wordCount: number
  // On garde le texte visible pour le donner a l'IA (tronqué pour pas exploser les tokens)
  textSample: string
  checks: Check[]
}

// Petit helper: on recupere le contenu d'une balise meta par name ou property.
function getMeta(root: HTMLElement, key: "name" | "property", value: string): string | null {
  const el = root.querySelector(`meta[${key}="${value}"]`)
  const content = el?.getAttribute("content")
  return content ? content.trim() : null
}

// Extrait le texte visible en virant script/style/nav bruités.
function extractText(root: HTMLElement): string {
  root.querySelectorAll("script, style, noscript, svg").forEach((el) => el.remove())
  const body = root.querySelector("body") ?? root
  return body.text.replace(/\s+/g, " ").trim()
}

// Va chercher la page et construit le rapport complet.
export async function analyze(inputUrl: string): Promise<SeoReport> {
  // On tolere que l'utilisateur oublie le https://
  let target = inputUrl.trim()
  if (!/^https?:\/\//i.test(target)) {
    target = "https://" + target
  }

  const parsed = new URL(target) // lance une erreur si l'URL est vraiment pourrie

  const started = Date.now()
  const res = await fetch(parsed.toString(), {
    redirect: "follow",
    headers: {
      // Certains sites bloquent les requetes sans user-agent "normal"
      "User-Agent":
        "Mozilla/5.0 (compatible; SeoScope/1.0; +https://vercel.com) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
  })
  const fetchMs = Date.now() - started

  const html = await res.text()
  const root = parse(html)

  const finalUrl = res.url || parsed.toString()
  const origin = new URL(finalUrl).origin

  // --- Meta ---
  const title = root.querySelector("title")?.text?.trim() || null
  const description = getMeta(root, "name", "description")
  const canonical = root.querySelector('link[rel="canonical"]')?.getAttribute("href") || null
  const robots = getMeta(root, "name", "robots")
  const lang = root.querySelector("html")?.getAttribute("lang") || null
  const hasViewport = !!getMeta(root, "name", "viewport")
  const ogTitle = getMeta(root, "property", "og:title")
  const ogImage = getMeta(root, "property", "og:image")
  const hasFavicon = !!root.querySelector('link[rel~="icon"]')

  // --- Titres ---
  const h1 = root.querySelectorAll("h1").map((el) => el.text.trim()).filter(Boolean)
  const h2Count = root.querySelectorAll("h2").length
  const h3Count = root.querySelectorAll("h3").length

  // --- Images ---
  const imgs = root.querySelectorAll("img")
  const missingAlt = imgs.filter((el) => {
    const alt = el.getAttribute("alt")
    return alt === undefined || alt === null || alt.trim() === ""
  }).length

  // --- Liens ---
  let internal = 0
  let external = 0
  for (const a of root.querySelectorAll("a[href]")) {
    const href = a.getAttribute("href") || ""
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue
    try {
      const abs = new URL(href, finalUrl)
      if (abs.origin === origin) internal++
      else external++
    } catch {
      // href bizarre, on ignore
    }
  }

  const text = extractText(root)
  const wordCount = text ? text.split(/\s+/).length : 0

  // On construit tous les points de controle avec leur verdict.
  const checks: Check[] = []

  // Balise title
  const titleLen = title?.length ?? 0
  checks.push({
    id: "title",
    label: "Balise <title>",
    weight: 3,
    status: !title ? "fail" : titleLen >= 30 && titleLen <= 60 ? "ok" : "warn",
    detail: !title
      ? "Aucune balise title trouvée, c'est le premier signal envoyé à Google."
      : `${titleLen} caractères. L'idéal se situe entre 30 et 60.`,
  })

  // Meta description
  const descLen = description?.length ?? 0
  checks.push({
    id: "description",
    label: "Meta description",
    weight: 2,
    status: !description ? "fail" : descLen >= 70 && descLen <= 160 ? "ok" : "warn",
    detail: !description
      ? "Pas de meta description : Google génère un extrait au hasard."
      : `${descLen} caractères. Visez 70 à 160 pour un affichage complet.`,
  })

  // H1 unique
  checks.push({
    id: "h1",
    label: "Titre H1 unique",
    weight: 2,
    status: h1.length === 1 ? "ok" : h1.length === 0 ? "fail" : "warn",
    detail:
      h1.length === 0
        ? "Aucun H1 : la page n'a pas de titre principal clair."
        : h1.length === 1
          ? `H1 détecté : "${h1[0].slice(0, 60)}"`
          : `${h1.length} balises H1 trouvées. Une seule est recommandée.`,
  })

  // Structure Hn
  checks.push({
    id: "headings",
    label: "Structure des titres (Hn)",
    weight: 1,
    status: h2Count > 0 ? "ok" : "warn",
    detail: `${h2Count} H2 et ${h3Count} H3. Une bonne hiérarchie aide au crawl.`,
  })

  // Images alt
  checks.push({
    id: "alt",
    label: "Attributs alt des images",
    weight: 2,
    status: imgs.length === 0 ? "warn" : missingAlt === 0 ? "ok" : missingAlt <= 2 ? "warn" : "fail",
    detail:
      imgs.length === 0
        ? "Aucune image sur la page."
        : `${missingAlt} image(s) sans alt sur ${imgs.length}. L'alt sert au SEO image et à l'accessibilité.`,
  })

  // HTTPS
  checks.push({
    id: "https",
    label: "Connexion sécurisée (HTTPS)",
    weight: 2,
    status: finalUrl.startsWith("https://") ? "ok" : "fail",
    detail: finalUrl.startsWith("https://")
      ? "Le site répond en HTTPS."
      : "Pas de HTTPS : facteur de classement et de confiance négatif.",
  })

  // Viewport (mobile)
  checks.push({
    id: "viewport",
    label: "Balise viewport (mobile)",
    weight: 1,
    status: hasViewport ? "ok" : "fail",
    detail: hasViewport
      ? "La page déclare un viewport, bon point pour le mobile-first."
      : "Pas de viewport : rendu mobile probablement cassé.",
  })

  // Langue
  checks.push({
    id: "lang",
    label: "Attribut lang",
    weight: 1,
    status: lang ? "ok" : "warn",
    detail: lang ? `Langue déclarée : "${lang}".` : "Attribut lang manquant sur <html>.",
  })

  // Canonical
  checks.push({
    id: "canonical",
    label: "URL canonique",
    weight: 1,
    status: canonical ? "ok" : "warn",
    detail: canonical ? "Balise canonical présente (évite le contenu dupliqué)." : "Pas de canonical déclarée.",
  })

  // Open Graph
  checks.push({
    id: "og",
    label: "Open Graph (partage social)",
    weight: 1,
    status: ogTitle && ogImage ? "ok" : ogTitle || ogImage ? "warn" : "warn",
    detail:
      ogTitle && ogImage
        ? "og:title et og:image présents, partages sociaux soignés."
        : "Open Graph incomplet : les partages sur les réseaux seront moins jolis.",
  })

  // Contenu
  checks.push({
    id: "content",
    label: "Volume de contenu",
    weight: 1,
    status: wordCount >= 300 ? "ok" : wordCount >= 100 ? "warn" : "fail",
    detail: `Environ ${wordCount} mots. En dessous de 300, le contenu est souvent jugé trop léger.`,
  })

  // Temps de réponse
  checks.push({
    id: "speed",
    label: "Temps de réponse serveur",
    weight: 1,
    status: fetchMs < 800 ? "ok" : fetchMs < 2000 ? "warn" : "fail",
    detail: `Réponse en ${fetchMs} ms. Un TTFB rapide améliore l'expérience et le crawl.`,
  })

  // Score pondéré : on somme les points obtenus / points max.
  // ok = 100% du poids, warn = 50%, fail = 0%.
  let gained = 0
  let max = 0
  for (const c of checks) {
    max += c.weight
    if (c.status === "ok") gained += c.weight
    else if (c.status === "warn") gained += c.weight * 0.5
  }
  const score = Math.round((gained / max) * 100)

  return {
    url: target,
    finalUrl,
    statusCode: res.status,
    fetchMs,
    score,
    meta: {
      title,
      titleLength: titleLen,
      description,
      descriptionLength: descLen,
      canonical,
      robots,
      lang,
      hasViewport,
      ogTitle,
      ogImage,
      hasFavicon,
    },
    headings: { h1, h2Count, h3Count },
    images: { total: imgs.length, missingAlt },
    links: { internal, external },
    wordCount,
    textSample: text.slice(0, 4000),
    checks,
  }
}
