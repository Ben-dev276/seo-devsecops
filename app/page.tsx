import { Gauge, Sparkles, ShieldCheck } from "lucide-react"
import { AuditForm } from "@/components/audit-form"

export default function Page() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col px-4 py-12 sm:px-6 sm:py-16">
      {/* En-tête */}
      <header className="mb-12 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Gauge className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-mono text-lg font-semibold">SeoScope</span>
        </div>

        <h1 className="text-balance text-3xl font-bold leading-tight sm:text-4xl">
          Audit SEO on-page + suggestions par IA
        </h1>
        <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          Colle l&apos;URL d&apos;une page : SeoScope récupère le HTML, analyse les points clés du
          référencement (title, meta, structure Hn, images, vitesse, HTTPS...) et génère des
          recommandations concrètes grâce à l&apos;IA.
        </p>

        {/* Petites features en ligne */}
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <Gauge className="h-4 w-4 text-primary" aria-hidden="true" />
            Score technique /100
          </li>
          <li className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            12 contrôles on-page
          </li>
          <li className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            Mots-clés & conseils IA
          </li>
        </ul>
      </header>

      <AuditForm />

      <footer className="mt-16 border-t border-border pt-6 text-sm text-muted-foreground">
        <p>
          Projet perso — audit SEO technique côté serveur (Next.js) et recommandations via l&apos;AI
          Gateway de Vercel. Codé pour apprendre, pas pour remplacer un vrai outil pro.
        </p>
      </footer>
    </main>
  )
}
