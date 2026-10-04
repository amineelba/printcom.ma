import { describe, expect, it } from 'vitest'
import {
  parseConfigureLine,
  parseMasterContent,
  resolveProductSource,
  richTextLines,
  seedSources,
  sourceFromLongDescription,
  splitList,
} from '@/lib/configurator-schema/sources'
import { PRODUCTS } from '@/lib/seed/content/products'

describe('splitList / parseConfigureLine', () => {
  it('splits on commas and semicolons but not inside parentheses', () => {
    expect(splitList('format, support (papier, carton) ; finition.')).toEqual(['format', 'support (papier, carton)', 'finition'])
  })

  it('reads "À configurer : a, b, c." lines, bulleted or bold', () => {
    expect(parseConfigureLine('À configurer : format, orientation, support.')).toEqual(['format', 'orientation', 'support'])
    expect(parseConfigureLine('- **À configurer :** format, grammage')).toEqual(['format', 'grammage'])
    expect(parseConfigureLine('Les choix qui structurent le projet : dimensions ; carton')).toEqual(['dimensions', 'carton'])
  })

  it('ignores other labels, including the CMS-data block', () => {
    expect(parseConfigureLine('Usages fréquents : rendez-vous, prospection.')).toBeUndefined()
    expect(parseConfigureLine('Données CMS à afficher si confirmées : prix, délais')).toBeUndefined()
    expect(parseConfigureLine('Un paragraphe sans deux-points')).toBeUndefined()
  })
})

const SAMPLE = `# Bibliothèque produits

## Papeterie

### Cartes de visite

Une petite surface.

- **Usages fréquents :** rendez-vous
- **À configurer :** format, orientation, support, recto-verso
- **Données CMS à afficher si confirmées :** formats, grammages

### Enveloppes

Les choix qui structurent le projet

- format
- fenêtre
- fermeture, papier

Données CMS à afficher si confirmées

- formats

### Sans liste

Aucune dimension ici.

## Packaging

### Boîtes pliantes

**À configurer :** dimensions, carton, découpe
`

describe('parseMasterContent', () => {
  const sources = parseMasterContent(SAMPLE)

  it('finds one entry per product section, with section boundaries respected', () => {
    expect(sources.map((source) => source.title)).toEqual(['Cartes de visite', 'Enveloppes', 'Boîtes pliantes'])
    expect(sources.every((source) => source.kind === 'master-content')).toBe(true)
  })

  it('extracts inline and bulleted lists, never the CMS-data block', () => {
    expect(sources[0].dimensions).toEqual(['format', 'orientation', 'support', 'recto-verso'])
    expect(sources[1].dimensions).toEqual(['format', 'fenêtre', 'fermeture', 'papier'])
    expect(sources[2].dimensions).toEqual(['dimensions', 'carton', 'découpe'])
  })

  it('is deterministic and slugifies titles like the seed', () => {
    expect(parseMasterContent(SAMPLE)).toEqual(sources)
    expect(sources[2].slug).toBe('boites-pliantes')
  })

  it('does not leak one product’s list into the next section', () => {
    expect(sources[0].dimensions).not.toContain('fenêtre')
    expect(sources.find((source) => source.title === 'Sans liste')).toBeUndefined()
  })
})

describe('seed and long-description sources', () => {
  it('the seed transcription covers every one of the 79 catalogue products', () => {
    const seeds = seedSources()
    expect(seeds).toHaveLength(79)
    expect(seeds.every((source) => source.dimensions.length > 0)).toBe(true)
  })

  it('the stored long description carries the same list as the seed (same wording)', () => {
    for (const product of PRODUCTS.filter((candidate) => candidate.category !== 'goodies-objets-publicitaires')) {
      const fromDescription = sourceFromLongDescription(product.longDescription)
      const fromSeed = seedSources().find((source) => source.slug === product.slug)
      expect(fromDescription, product.slug).toEqual(fromSeed?.dimensions)
    }
  })

  it('richTextLines yields one line per paragraph / list item', () => {
    const lines = richTextLines({
      root: { children: [{ type: 'paragraph', children: [{ text: 'a ' }, { text: 'b' }] }, { type: 'listitem', children: [{ text: 'c' }] }] },
    })
    expect(lines).toEqual(['a b', 'c'])
  })

  it('resolveProductSource prefers master > seed > description and reports disagreement', () => {
    const master = [{ title: 'X', slug: 'x', dimensions: ['format'], kind: 'master-content' as const }]
    const seed = [{ title: 'X', slug: 'x', dimensions: ['format', 'support'], kind: 'seed-source' as const }]
    const chosen = resolveProductSource({ slug: 'x', title: 'X', master, seed })
    expect(chosen.source?.kind).toBe('master-content')
    expect(chosen.conflict).toEqual({ kind: 'seed-source', dimensions: ['format', 'support'] })

    const agreeing = resolveProductSource({ slug: 'x', title: 'X', seed: [{ ...seed[0], dimensions: ['format'] }], master })
    expect(agreeing.conflict).toBeUndefined()
    expect(resolveProductSource({ slug: 'none', title: 'None', seed }).source).toBeUndefined()
  })
})
