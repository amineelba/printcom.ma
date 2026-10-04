import { describe, expect, it } from 'vitest'
import { canonicalizeDimension, inferGroup, normalizeTerm, slugifyTerm } from '@/lib/configurator-schema/dimensionCatalog'

const key = (raw: string) => canonicalizeDimension(raw).definition.key
const confidence = (raw: string) => canonicalizeDimension(raw).confidence

describe('canonicalizeDimension — reviewed mapping', () => {
  it.each([
    ['format', 'format'],
    ['Formats', 'format'],
    ['orientation', 'orientation'],
    ['pagination', 'page-count'],
    ['nombre de pages', 'page-count'],
    ['recto-verso', 'print-sides'],
    ['support', 'material'],
    ['supports', 'material'],
    ['grammage', 'grammage'],
    ['finition', 'finish'],
    ['quantité', 'quantity'],
    ['dimensions', 'dimensions'],
  ])('maps %s → %s', (raw, expected) => {
    expect(key(raw)).toBe(expected)
    expect(confidence(raw)).toBe('mapped')
  })

  it.each(['papier', 'carton', 'matière', 'matériaux', 'impression', 'couleur', 'mesures', 'surface'])(
    'keeps the overlapping term "%s" separate and ambiguous',
    (raw) => {
      expect(confidence(raw)).toBe('ambiguous')
      expect(['material', 'print-sides', 'color-mode', 'dimensions']).not.toContain(key(raw))
    },
  )

  it('never collapses distinct concepts that only look alike', () => {
    expect(key('format fermé')).toBe('format-ferme')
    expect(key('format ouvert')).toBe('format-ouvert')
    expect(key('format de planche')).toBe('format-de-planche')
    expect(key('pelliculage')).toBe('pelliculage')
    expect(key('pelliculage')).not.toBe('finish')
    expect(key('tirage')).not.toBe('quantity')
    expect(key('support')).not.toBe(key('papier'))
  })

  it('flags compound wording as ambiguous', () => {
    for (const raw of ['carton ou rigide', 'intérieur/extérieur', 'gravure ou impression', 'pose intérieure/extérieure']) {
      expect(confidence(raw)).toBe('ambiguous')
    }
  })

  it('specialized terms get their own exact key (a pure transcription)', () => {
    for (const raw of ['fenêtre', 'fermeture', 'adhésif', 'rabats', 'encoche carte', 'sens d’enroulement', 'mandrin', 'œillets']) {
      const result = canonicalizeDimension(raw)
      expect(result.confidence).toBe('exact')
      expect(result.definition.key).toBe(slugifyTerm(raw))
    }
    expect(key('œillets')).toBe('oeillets')
    expect(key('sens d’enroulement')).toBe('sens-d-enroulement')
  })

  it('dimension keys are always valid registry keys', () => {
    for (const raw of ['Élastique éventuel', 'Conformité à confirmer', 'blanc de soutien éventuel']) {
      expect(key(raw)).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    }
  })

  it('infers a coarse group, defaulting to other', () => {
    expect(inferGroup('format-ferme')).toBe('size')
    expect(inferGroup('reliure')).toBe('construction')
    expect(inferGroup('adhesif')).toBe('application')
    expect(inferGroup('mot-inconnu')).toBe('other')
    expect(inferGroup('format')).toBe('size') // "format" must not hit a finishing keyword
  })

  it('normalizeTerm folds accents, case and trailing punctuation', () => {
    expect(normalizeTerm('  Quantité. ')).toBe('quantite')
    expect(normalizeTerm('Œillets')).toBe('oeillets')
  })
})
