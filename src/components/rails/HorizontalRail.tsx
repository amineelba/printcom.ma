'use client'

import { useRef, useState, type ReactNode } from 'react'

/**
 * Native horizontal scroll with snap points, partial next-card preview,
 * and keyboard-operable prev/next controls. No autoplay, no infinite loop.
 */
export function HorizontalRail({ children, label }: { children: ReactNode[]; label: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const updateEdges = () => {
    const el = scrollerRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 4)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
  }

  const scrollByPage = (direction: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        role="group"
        aria-label={label}
        className="pc-rail"
        onScroll={updateEdges}
      >
        {children}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          aria-label="Précédent"
          disabled={atStart}
          onClick={() => scrollByPage(-1)}
          className="flex h-[var(--pc-rail-control-size)] w-[var(--pc-rail-control-size)] items-center justify-center rounded-full border border-border-default bg-canvas shadow-[var(--pc-rail-control-shadow)] disabled:opacity-[var(--pc-opacity-disabled)]"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <button
          type="button"
          aria-label="Suivant"
          disabled={atEnd}
          onClick={() => scrollByPage(1)}
          className="flex h-[var(--pc-rail-control-size)] w-[var(--pc-rail-control-size)] items-center justify-center rounded-full border border-border-default bg-canvas shadow-[var(--pc-rail-control-shadow)] disabled:opacity-[var(--pc-opacity-disabled)]"
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </div>
  )
}
