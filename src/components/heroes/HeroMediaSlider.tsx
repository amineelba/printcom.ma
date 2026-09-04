'use client'

import { useEffect, useRef, useState } from 'react'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import type { Media } from '@/payload-types'

export interface HeroSlide {
  media: Media | number | null | undefined
  label?: string | null
}

const AUTOPLAY_MS = 6000

/**
 * "Hero media slider" (brief §4, anatomy item 6) — separate from the Hero
 * itself. Dots + desktop arrows, autoplay pauses on hover/focus and
 * respects prefers-reduced-motion, first slide gets image priority.
 */
export function HeroMediaSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const prefersReducedMotion = useRef(false)

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (isPaused || prefersReducedMotion.current || slides.length <= 1) return
    const timer = setInterval(() => setIndex((current) => (current + 1) % slides.length), AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [isPaused, slides.length])

  if (!slides.length) return null

  const goTo = (next: number) => setIndex(((next % slides.length) + slides.length) % slides.length)

  return (
    <section className="border-b border-(--pc-color-border-subtle) bg-canvas py-[var(--pc-space-section-small)]">
      <div className="mx-auto max-w-(--pc-width-content-wide) px-(--pc-page-gutter-small) md:px-(--pc-page-gutter-medium)">
        <div
          className="relative aspect-[16/7] w-full overflow-hidden rounded-card-large bg-alternate"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          {slides.map((slide, slideIndex) => (
            <div
              key={slideIndex}
              aria-hidden={slideIndex !== index}
              className={`absolute inset-0 transition-opacity duration-500 ${
                slideIndex === index ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              {slide.media ? (
                <ResponsiveImage
                  media={slide.media}
                  fill
                  sizes="(min-width: 1069px) 1200px, 100vw"
                  priority={slideIndex === 0}
                />
              ) : null}
              {slide.label ? (
                <p className="absolute bottom-6 left-6 rounded-control bg-canvas px-4 py-2 text-[0.9375rem] font-medium text-primary">
                  {slide.label}
                </p>
              ) : null}
            </div>
          ))}

          {slides.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Précédent"
                onClick={() => goTo(index - 1)}
                className="absolute top-1/2 left-4 hidden h-[var(--pc-rail-control-size)] w-[var(--pc-rail-control-size)] -translate-y-1/2 items-center justify-center rounded-full border border-border-default bg-canvas shadow-[var(--pc-rail-control-shadow)] md:flex"
              >
                <span aria-hidden="true">‹</span>
              </button>
              <button
                type="button"
                aria-label="Suivant"
                onClick={() => goTo(index + 1)}
                className="absolute top-1/2 right-4 hidden h-[var(--pc-rail-control-size)] w-[var(--pc-rail-control-size)] -translate-y-1/2 items-center justify-center rounded-full border border-border-default bg-canvas shadow-[var(--pc-rail-control-shadow)] md:flex"
              >
                <span aria-hidden="true">›</span>
              </button>
            </>
          ) : null}
        </div>

        {slides.length > 1 ? (
          <div role="tablist" aria-label="Sélection du visuel" className="mt-4 flex justify-center gap-2">
            {slides.map((_, slideIndex) => (
              <button
                key={slideIndex}
                type="button"
                role="tab"
                aria-selected={slideIndex === index}
                aria-label={`Visuel ${slideIndex + 1}`}
                onClick={() => goTo(slideIndex)}
                className={`h-2 rounded-full transition-all ${
                  slideIndex === index ? 'w-6 bg-action' : 'w-2 bg-border-default'
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
