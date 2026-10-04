import { afterEach, describe, expect, it } from 'vitest'
import { assertWriteAllowed, describeDatabaseTarget, parseArgs } from '@/lib/configurator-schema/cli'

const original = { url: process.env.DATABASE_URL, allow: process.env.CONFIGURATOR_ALLOW_REMOTE_WRITE }
afterEach(() => {
  process.env.DATABASE_URL = original.url
  if (original.allow === undefined) delete process.env.CONFIGURATOR_ALLOW_REMOTE_WRITE
  else process.env.CONFIGURATOR_ALLOW_REMOTE_WRITE = original.allow
})

describe('configurator CLI safety', () => {
  it('parses flags and valued options', () => {
    const args = parseArgs(['--write', '--file', 'a.csv', '--master', '/tmp/x.md'])
    expect(args.flags.has('write')).toBe(true)
    expect(args.values.get('file')).toBe('a.csv')
    expect(args.values.get('master')).toBe('/tmp/x.md')
  })

  it('describes the target without ever exposing credentials', () => {
    const target = describeDatabaseTarget('postgres://admin:s3cret@ep-cool-123.neon.tech/neondb?sslmode=require')
    expect(target).toEqual({ host: 'ep-cool-123.neon.tech', database: 'neondb', local: false })
    expect(JSON.stringify(target)).not.toMatch(/admin|s3cret/)
    expect(describeDatabaseTarget('postgres://u:p@localhost:5432/printcom').local).toBe(true)
    expect(describeDatabaseTarget('not a url')).toMatchObject({ host: 'unparseable', local: false })
    delete process.env.DATABASE_URL
    expect(describeDatabaseTarget()).toMatchObject({ host: 'unknown', local: false })
  })

  it('refuses writes against a non-local database unless explicitly overridden', () => {
    process.env.DATABASE_URL = 'postgres://u:p@ep-prod.neon.tech/neondb'
    delete process.env.CONFIGURATOR_ALLOW_REMOTE_WRITE
    expect(() => assertWriteAllowed()).toThrow(/not local/)
    process.env.CONFIGURATOR_ALLOW_REMOTE_WRITE = '1'
    expect(() => assertWriteAllowed()).not.toThrow()
  })

  it('allows writes against a local database', () => {
    process.env.DATABASE_URL = 'postgres://u:p@127.0.0.1:5432/printcom'
    delete process.env.CONFIGURATOR_ALLOW_REMOTE_WRITE
    expect(() => assertWriteAllowed()).not.toThrow()
  })
})
