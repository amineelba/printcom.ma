import type { Breakpoint } from './types'

/**
 * Breakpoint values in px. Must stay in sync with the --pc-breakpoint-*
 * custom properties in src/styles/tokens/foundation.css — CSS custom
 * properties cannot be read inside @media queries, so the numbers are
 * duplicated here deliberately for JS-side responsive logic
 * (e.g. rail scroll-by-page amounts, viewport-aware effects).
 */
export const BREAKPOINTS: Record<Breakpoint, number> = {
  small: 0,
  medium: 735,
  large: 1069,
  wide: 1440,
  ultraWide: 2560,
}

export function mediaQuery(breakpoint: Breakpoint): string {
  const value = BREAKPOINTS[breakpoint]
  return `(min-width: ${value}px)`
}

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
export const REDUCED_TRANSPARENCY_QUERY = '(prefers-reduced-transparency: reduce)'
