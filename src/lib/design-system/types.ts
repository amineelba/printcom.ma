export type Breakpoint = 'small' | 'medium' | 'large' | 'wide' | 'ultraWide'

export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'compact' | 'icon' | 'destructive'

export type ButtonSize = 'small' | 'medium' | 'large'

export type SurfaceTone = 'canvas' | 'alternate' | 'subtle' | 'elevated' | 'inverse'

export type CardRadius = 'small' | 'default' | 'large'

export interface DesignToken {
  readonly cssVar: string
  readonly description: string
}
