'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { Header } from '@/payload-types'

type Menu = NonNullable<Header['menus']>[number]

export function MobileNavigation({
  menus,
  quoteCTA,
}: {
  menus: Menu[]
  quoteCTA?: { label?: string | null; href?: string | null } | null
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    const focusable = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])',
    )
    focusable?.[0]?.focus()

    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        return
      }
      if (event.key !== 'Tab' || !focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      previouslyFocused?.focus()
    }
  }, [isOpen])

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls="mobile-nav-panel"
        aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        className="flex h-[var(--pc-touch-target-min)] w-[var(--pc-touch-target-min)] items-center justify-center rounded-full"
        onClick={() => setIsOpen((v) => !v)}
      >
        <span className="sr-only">{isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          {isOpen ? (
            <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          ) : (
            <path d="M2 5H18M2 10H18M2 15H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {isOpen ? (
        <div
          id="mobile-nav-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu principal"
          className="fixed inset-0 z-(--pc-z-drawer) flex flex-col bg-canvas pt-[var(--pc-global-nav-height)]"
        >
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <ul className="flex flex-col divide-y divide-(--pc-color-border-subtle)">
              {menus.map((menu, index) => {
                const hasColumns = Boolean(menu.columns?.length)
                if (!hasColumns && menu.href) {
                  return (
                    <li key={menu.id ?? menu.label} className="py-4">
                      <Link href={menu.href} className="text-[1.0625rem] font-medium text-primary" onClick={() => setIsOpen(false)}>
                        {menu.label}
                      </Link>
                    </li>
                  )
                }

                const isExpanded = expandedIndex === index

                return (
                  <li key={menu.id ?? menu.label} className="py-2">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={`mobile-nav-group-${index}`}
                      className="flex w-full items-center justify-between py-2 text-[1.0625rem] font-medium text-primary"
                      onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    >
                      {menu.label}
                      <span aria-hidden="true" className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        ⌄
                      </span>
                    </button>
                    {isExpanded ? (
                      <div id={`mobile-nav-group-${index}`} className="flex flex-col gap-5 pb-4 pl-2">
                        {menu.columns?.map((column, columnIndex) => (
                          <div key={column.id ?? columnIndex}>
                            {column.heading ? (
                              <p className="pc-text-footnote mb-2 font-semibold uppercase tracking-wide text-tertiary">
                                {column.heading}
                              </p>
                            ) : null}
                            <ul className="flex flex-col gap-3">
                              {column.links?.map((link) => (
                                <li key={link.id ?? link.label}>
                                  <Link href={link.href} className="text-secondary" onClick={() => setIsOpen(false)}>
                                    {link.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </div>
          {quoteCTA?.href ? (
            <div className="border-t border-border-subtle p-6">
              <Link
                href={quoteCTA.href}
                onClick={() => setIsOpen(false)}
                className="flex h-[var(--pc-control-lg)] w-full items-center justify-center rounded-control bg-action text-action-content font-medium"
              >
                {quoteCTA.label || 'Demander un devis'}
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
