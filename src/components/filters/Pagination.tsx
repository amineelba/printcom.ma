import Link from 'next/link'

export function Pagination({
  currentPage,
  totalPages,
  buildHref,
}: {
  currentPage: number
  totalPages: number
  buildHref: (page: number) => string
}) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
      <Link
        href={buildHref(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        aria-label="Page précédente"
        className={`flex h-[var(--pc-control-md)] items-center rounded-control border border-border-default px-4 text-[0.9375rem] ${currentPage === 1 ? 'pointer-events-none opacity-[var(--pc-opacity-disabled)]' : 'hover:border-border-strong'}`}
      >
        Précédent
      </Link>
      <ul className="hidden items-center gap-1 sm:flex">
        {pages.map((page) => (
          <li key={page}>
            <Link
              href={buildHref(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              className={`flex h-[var(--pc-control-md)] w-[var(--pc-control-md)] items-center justify-center rounded-control text-[0.9375rem] ${
                page === currentPage ? 'bg-action text-action-content' : 'text-secondary hover:bg-alternate'
              }`}
            >
              {page}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        aria-label="Page suivante"
        className={`flex h-[var(--pc-control-md)] items-center rounded-control border border-border-default px-4 text-[0.9375rem] ${currentPage === totalPages ? 'pointer-events-none opacity-[var(--pc-opacity-disabled)]' : 'hover:border-border-strong'}`}
      >
        Suivant
      </Link>
    </nav>
  )
}
