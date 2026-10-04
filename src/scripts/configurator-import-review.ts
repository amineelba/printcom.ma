/**
 * pnpm configurator:import-review --file <path> [--write]
 *
 * Loads an edited review file (CSV or JSON, columns as exported). DRY-RUN by
 * default: validates every row, prints the diff, writes nothing. `--write`
 * applies the additive changes (local database only, unless
 * CONFIGURATOR_ALLOW_REMOTE_WRITE=1 is set after separate authorization).
 * Unknown products/dimensions/materials/finishes/values and conflicting
 * duplicates are rejected; nothing is ever deleted.
 */
import 'dotenv/config'
import fs from 'node:fs'
import { getPayload } from 'payload'
import config from '../payload.config'
import { assertWriteAllowed, describeDatabaseTarget, parseArgs } from '../lib/configurator-schema/cli'
import { applyImport, loadData, loadImportContext } from '../lib/configurator-schema/db'
import { parseReviewFile, planImport, renderImportDiff } from '../lib/configurator-schema/reviewWorkflow'

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const file = args.values.get('file')
  if (!file) throw new Error('Missing --file <path>.')
  const write = args.flags.has('write')
  if (write) assertWriteAllowed()

  const text = fs.readFileSync(file, 'utf8')
  const parsed = parseReviewFile(text, file.toLowerCase().endsWith('.json') ? 'json' : 'csv')
  if (parsed.errors.length) {
    for (const message of parsed.errors) console.error(`✖ ${message}`)
    process.exit(1)
  }

  const payload = await getPayload({ config })
  const data = await loadData(payload)
  const plan = planImport(parsed.rows, await loadImportContext(payload, data))

  const target = describeDatabaseTarget()
  console.log(`Database: ${target.host}/${target.database}  mode: ${write ? 'WRITE' : 'dry-run'}\n`)
  console.log(renderImportDiff(plan))
  if (plan.errors.length) {
    console.error('\nImport rejected: fix the errors above. Nothing was written.')
    process.exit(1)
  }

  const summary = await applyImport(payload, data, plan, { write })
  console.log(
    `\n${write ? 'Applied' : 'Would apply'}: ${summary.productsChanged} product(s), ${summary.rowsCreated} row(s) created, ${summary.rowsUpdated} updated, ${summary.optionsCreated} option(s) created, ${summary.optionsReused} reused.`,
  )
  if (!write) console.log('Dry-run: nothing was written. Re-run with --write to apply (local database only).')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
