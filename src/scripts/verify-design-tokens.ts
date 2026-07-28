/**
 * Static check that the highest-priority pc- design tokens are actually
 * defined in styles/tokens/*.css. Run in CI to catch an accidental
 * deletion/rename of a foundational token before it reaches production.
 */
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const tokensDir = path.resolve(dirname, '../styles/tokens')

const REQUIRED_TOKENS = [
  '--pc-color-gray-900',
  '--pc-color-gray-600',
  '--pc-color-gray-50',
  '--pc-color-brand-500',
  '--pc-color-brand-600',
  '--pc-font-family-text',
  '--pc-space-4',
  '--pc-space-section',
  '--pc-radius-card',
  '--pc-radius-control',
  '--pc-duration-standard',
  '--pc-easing-standard',
  '--pc-breakpoint-medium-min',
  '--pc-breakpoint-large-min',
  '--pc-color-text-primary',
  '--pc-color-text-secondary',
  '--pc-color-background-canvas',
  '--pc-color-action-primary-background',
  '--pc-material-nav-background',
  '--pc-touch-target-min',
]

function readAllTokenCss(): string {
  const files = ['foundation.css', 'semantic.css', 'components.css', 'templates.css']
  return files.map((file) => readFileSync(path.join(tokensDir, file), 'utf8')).join('\n')
}

function main() {
  const css = readAllTokenCss()
  const missing = REQUIRED_TOKENS.filter((token) => !css.includes(`${token}:`))

  if (missing.length) {
    console.error(`Missing ${missing.length} required design token(s):`)
    for (const token of missing) console.error(` - ${token}`)
    process.exit(1)
  }

  console.log(`Design token verification passed — all ${REQUIRED_TOKENS.length} required tokens present.`)
}

main()
