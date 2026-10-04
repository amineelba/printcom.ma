/**
 * pnpm configurator:backfill [--write] [--master <path>] [--product <slug>]
 *
 * Builds each product's own `configurationSchema` from (1) the product's
 * authoritative dimension source and (2) the values already stored in its
 * legacy configuration fields. DRY-RUN by default: prints the plan and
 * writes nothing. `--write` applies it (local database only, unless
 * CONFIGURATOR_ALLOW_REMOTE_WRITE=1 is set after separate authorization).
 *
 * Idempotent and additive: nothing is deleted, manually reviewed rows are
 * never overwritten, no option value is invented.
 */
import 'dotenv/config'
import fs from 'node:fs'
import { getPayload } from 'payload'
import config from '../payload.config'
import { planProducts } from '../lib/configurator-schema/backfillPlan'
import { assertWriteAllowed, describeDatabaseTarget, parseArgs, resolveMasterContentPath } from '../lib/configurator-schema/cli'
import { applyBackfill, ensureBuiltInDimensions, loadData } from '../lib/configurator-schema/db'
import { parseMasterContent } from '../lib/configurator-schema/sources'

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const write = args.flags.has('write')
  if (write) assertWriteAllowed()

  const masterPath = resolveMasterContentPath(args)
  const master = masterPath ? parseMasterContent(fs.readFileSync(masterPath, 'utf8')) : undefined
  const only = args.values.get('product')

  const payload = await getPayload({ config })
  const data = await loadData(payload)
  const snapshots = only ? data.snapshots.filter((snapshot) => snapshot.slug === only) : data.snapshots
  if (only && !snapshots.length) throw new Error(`Unknown product slug "${only}".`)

  const target = describeDatabaseTarget()
  console.log(`Database: ${target.host}/${target.database}  mode: ${write ? 'WRITE' : 'dry-run'}`)

  if (write) await ensureBuiltInDimensions(payload, data.registry, true)
  const plans = planProducts(snapshots, { master })
  const summary = await applyBackfill(payload, data, plans, { write })

  console.log('\nBackfill summary')
  console.log(`  products scanned:          ${summary.productsScanned}`)
  console.log(`  products ${write ? 'changed' : 'to change'}:        ${summary.productsChanged}`)
  console.log(`  rows ${write ? 'created' : 'to create'}:            ${summary.rowsCreated}`)
  console.log(`  empty rows ${write ? 'filled' : 'to fill'}:        ${summary.rowsFilled}`)
  console.log(`  legacy values migrated:    ${summary.legacyValuesMigrated}`)
  console.log(`  dimensions ${write ? 'created' : 'to create'}:      ${summary.dimensionsCreated.length}${summary.dimensionsCreated.length ? ` (${summary.dimensionsCreated.join(', ')})` : ''}`)
  console.log(`  dimensions reused:         ${summary.dimensionsReused}`)
  console.log(`  shared options ${write ? 'created' : 'to create'}:  ${summary.optionsCreated}`)
  console.log(`  shared options reused:     ${summary.optionsReused}`)
  console.log(`  review items:              ${summary.reviewItems}`)
  if (write) for (const slug of summary.changedProducts) console.log(`  updated ${slug}`)
  if (!write) console.log('\nDry-run: nothing was written. Re-run with --write to apply (local database only).')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
