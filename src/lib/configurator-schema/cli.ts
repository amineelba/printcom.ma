import fs from 'node:fs'
import path from 'node:path'

/** Small helpers shared by the configurator:* command-line scripts. */

export interface CliArgs {
  flags: Set<string>
  values: Map<string, string>
}

export function parseArgs(argv: string[]): CliArgs {
  const flags = new Set<string>()
  const values = new Map<string, string>()
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (!arg.startsWith('--')) continue
    const name = arg.slice(2)
    const next = argv[index + 1]
    if (next !== undefined && !next.startsWith('--')) {
      values.set(name, next)
      index += 1
    } else flags.add(name)
  }
  return { flags, values }
}

export const OUTPUT_DIR_DEFAULT = 'data/configurator'

/** Sanitized database identity: host + database name only, never credentials. */
export function describeDatabaseTarget(url = process.env.DATABASE_URL): { host: string; database: string; local: boolean } {
  if (!url) return { host: 'unknown', database: 'unknown', local: false }
  try {
    const parsed = new URL(url)
    const host = parsed.hostname || 'unknown'
    return {
      host,
      database: parsed.pathname.replace(/^\//, '') || 'unknown',
      local: ['localhost', '127.0.0.1', '::1', '[::1]'].includes(host),
    }
  } catch {
    return { host: 'unparseable', database: 'unknown', local: false }
  }
}

/**
 * Writes are refused against any non-local database unless explicitly
 * overridden. Production is never a default and never an accident.
 */
export function assertWriteAllowed(): void {
  const target = describeDatabaseTarget()
  if (target.local || process.env.CONFIGURATOR_ALLOW_REMOTE_WRITE === '1') return
  throw new Error(
    `Refusing to write: database host "${target.host}" is not local. ` +
      'Run against a local database, or set CONFIGURATOR_ALLOW_REMOTE_WRITE=1 after an explicit, separate authorization.',
  )
}

/** Master content markdown, when supplied (never committed to this repository). */
export function resolveMasterContentPath(args: CliArgs): string | undefined {
  const explicit = args.values.get('master') ?? process.env.PRINTCOM_MASTER_CONTENT_PATH
  if (explicit) {
    if (!fs.existsSync(explicit)) throw new Error(`Master content file not found: ${explicit}`)
    return explicit
  }
  const conventional = path.join(process.cwd(), 'docs', 'source', 'PRINTCOM-MASTER-WEBSITE-CONTENT-FR.md')
  return fs.existsSync(conventional) ? conventional : undefined
}

export function writeOutput(dir: string, name: string, content: string): string {
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, name)
  fs.writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`)
  return file
}
