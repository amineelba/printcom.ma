'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { MegaMenu } from './MegaMenu'
import type { NavCategory } from '@/lib/payload/cachedCategories'

/**
 * Sticky category bar (brief §2, level 2) — the 9 top-level product
 * families, always visible under the main navbar. Horizontal scroll at
 * every breakpoint (brief: "Barre horizontale sticky/scrollable", and
 * explicitly a mobile bullet too — "catégorie rail horizontal"). Hovering
 * a category opens its MegaMenu; on touch devices there's no hover, so it
 * just behaves as a plain link list.
 */
export function CategoryBar({ categories }: { categories: NavCategory[] }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  if (!categories.length) return null

  const open = (slug: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenSlug(slug)
  }

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpenSlug(null), 120)
  }

  const activeCategory = categories.find((category) => category.slug === openSlug) ?? null

  return (
    <div
      className="sticky top-[var(--pc-nav-height)] z-(--pc-nav-z) border-b border-(--pc-color-border-subtle) bg-canvas"
      onMouseLeave={scheduleClose}
    >
      <nav
        aria-label="Catégories de produits"
        className="mx-auto flex h-[var(--pc-local-nav-height)] max-w-(--pc-nav-max-width) items-center gap-8 overflow-x-auto px-(--pc-page-gutter-small) md:px-(--pc-page-gutter-medium)"
      >
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/produits/${category.slug}`}
            onMouseEnter={() => open(category.slug)}
            onFocus={() => open(category.slug)}
            className={`shrink-0 whitespace-nowrap text-[0.9375rem] transition-colors ${
              openSlug === category.slug ? 'font-medium text-primary' : 'text-secondary hover:text-primary'
            }`}
          >
            {category.title}
          </Link>
        ))}
      </nav>
      {activeCategory ? (
        <div onMouseEnter={() => open(activeCategory.slug)} onMouseLeave={scheduleClose}>
          <MegaMenu category={activeCategory} />
        </div>
      ) : null}
    </div>
  )
}
