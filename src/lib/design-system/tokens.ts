/**
 * Typed accessors for the pc- design tokens defined in
 * src/styles/tokens/*.css. Use these when a token value is needed inside
 * JS/TS (inline SVG, canvas, computed layout) — components should
 * otherwise prefer CSS custom properties or Tailwind utilities directly.
 */

export const colorToken = {
  textPrimary: 'var(--pc-color-text-primary)',
  textSecondary: 'var(--pc-color-text-secondary)',
  textTertiary: 'var(--pc-color-text-tertiary)',
  backgroundCanvas: 'var(--pc-color-background-canvas)',
  backgroundAlternate: 'var(--pc-color-background-alternate)',
  borderDefault: 'var(--pc-color-border-default)',
  actionPrimaryBackground: 'var(--pc-color-action-primary-background)',
  focus: 'var(--pc-color-focus)',
} as const

export const radiusToken = {
  card: 'var(--pc-radius-card)',
  cardSmall: 'var(--pc-radius-card-small)',
  cardLarge: 'var(--pc-radius-card-large)',
  control: 'var(--pc-radius-control)',
  media: 'var(--pc-radius-media)',
} as const

export const spaceToken = {
  section: 'var(--pc-space-section)',
  sectionSmall: 'var(--pc-space-section-small)',
  sectionLarge: 'var(--pc-space-section-large)',
  card: 'var(--pc-space-card)',
} as const

export const motionToken = {
  interaction: 'var(--pc-motion-interaction-duration) var(--pc-motion-interaction-easing)',
  menuEnter: 'var(--pc-motion-menu-enter-duration) var(--pc-motion-menu-enter-easing)',
  menuExit: 'var(--pc-motion-menu-exit-duration) var(--pc-motion-menu-exit-easing)',
} as const
