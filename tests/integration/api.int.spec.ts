import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('Payload Local API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('fetches users', async () => {
    const users = await payload.find({ collection: 'users' })
    expect(users).toBeDefined()
  })

  it('never exposes forbidden collections', async () => {
    const resolvedConfig = await config
    const slugs = resolvedConfig.collections.map((c) => c.slug)
    for (const forbidden of ['realisations', 'projects', 'portfolio', 'case-studies']) {
      expect(slugs).not.toContain(forbidden)
    }
  })
})
