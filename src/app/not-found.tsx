import Link from 'next/link'
import './(frontend)/globals.css'

/**
 * Root-level fallback for genuinely unmatched URLs (no page.tsx matches at
 * all). Next.js requires this to define its own <html>/<body> because,
 * with parallel root layouts per route group ((frontend) vs (payload)),
 * there is no single parent layout to inherit from at this level — see
 * https://nextjs.org/docs/app/api-reference/file-conventions/not-found.
 * src/app/(frontend)/not-found.tsx handles explicit notFound() calls from
 * within frontend pages and reuses the full site chrome; this one is only
 * the last-resort catch-all.
 */
export const metadata = {
  title: 'Page introuvable — Printcom',
  robots: { index: false, follow: false },
}

export default function RootNotFound() {
  return (
    <html lang="fr">
      <body>
        <div className="mx-auto flex min-h-dvh max-w-(--container-reading) flex-col items-center justify-center px-6 text-center">
          <p className="pc-text-eyebrow">Erreur 404</p>
          <h1 className="pc-text-page-title mt-2 text-primary">Cette page est introuvable.</h1>
          <p className="pc-text-intro mt-4">
            Le contenu que vous cherchez a peut-être été déplacé ou n’existe plus.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex h-[var(--pc-control-md)] items-center rounded-control bg-action px-6 text-[0.9375rem] font-medium text-action-content"
          >
            Retour à l’accueil
          </Link>
        </div>
      </body>
    </html>
  )
}
