'use client'

import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'

export function SearchOverlay() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!isOpen) return
    inputRef.current?.focus()
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    const trigger = triggerRef.current
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      trigger?.focus()
    }
  }, [isOpen])

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!query.trim()) return
    setIsOpen(false)
    router.push(`/recherche?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Rechercher"
        className="flex h-[var(--pc-touch-target-min)] w-[var(--pc-touch-target-min)] items-center justify-center rounded-full"
        onClick={() => setIsOpen(true)}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 16L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {isOpen
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Recherche"
              className="fixed inset-0 z-(--pc-z-dropdown) flex flex-col items-center bg-(--pc-color-scrim) px-6 pt-24"
              onClick={(event) => {
                if (event.target === event.currentTarget) setIsOpen(false)
              }}
            >
              <form onSubmit={onSubmit} role="search" className="w-full max-w-(--container-reading) rounded-card bg-subtle p-2 shadow-modal">
                <label htmlFor="site-search-input" className="sr-only">
                  Rechercher sur le site Printcom
                </label>
                <div className="flex items-center gap-3 px-4">
                  <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="shrink-0 text-tertiary">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M16 16L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input
                    ref={inputRef}
                    id="site-search-input"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Produits, services, ressources…"
                    className="h-[var(--pc-control-xl)] flex-1 bg-transparent text-[1.3125rem] text-primary outline-none placeholder:text-tertiary"
                  />
                  <button type="button" onClick={() => setIsOpen(false)} className="pc-text-footnote shrink-0 text-secondary">
                    Fermer
                  </button>
                </div>
              </form>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
