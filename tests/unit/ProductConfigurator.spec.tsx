import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { ProductConfigurator } from '@/components/configurator/ProductConfigurator'
import { buildProductConfiguratorData } from '@/lib/configurator/buildProductConfiguratorData'
import { makeFinish, makeFullProduct, makeMedia, makeProduct } from './helpers/configuratorFixtures'
import type { Product } from '@/payload-types'

afterEach(cleanup)

function renderConfigurator(product: Product) {
  return render(
    <ProductConfigurator
      data={buildProductConfiguratorData(product)}
      intro={<h1>{product.title}</h1>}
    />,
  )
}

const group = (name: string) => screen.getByRole('group', { name })

describe('ProductConfigurator — structure and semantics', () => {
  it('renders each group as a named fieldset', () => {
    renderConfigurator(makeFullProduct())
    for (const name of ['Format', 'Orientation', 'Nombre de pages', 'Impression', 'Couleur', 'Support', 'Grammage', 'Finition', 'Quantité']) {
      expect(group(name)).toBeTruthy()
    }
  })

  it('uses radios for single-choice groups and checkboxes for finishes', () => {
    renderConfigurator(makeFullProduct())
    expect(within(group('Orientation')).getAllByRole('radio').map((r) => r.getAttribute('type'))).toEqual(['radio', 'radio'])
    expect(within(group('Finition')).getAllByRole('checkbox')).toHaveLength(2)
    expect(within(group('Finition')).queryAllByRole('radio')).toHaveLength(0)
    expect(screen.getByText('Plusieurs choix possibles')).toBeTruthy()
  })

  it('names each option from its visible label and links the CMS description', () => {
    renderConfigurator(makeFullProduct())
    const couche = within(group('Support')).getByRole('radio', { name: 'Couché mat' })
    expect(couche.getAttribute('aria-describedby')).toBeTruthy()
    expect(document.getElementById(couche.getAttribute('aria-describedby')!)?.textContent).toBe('Surface lisse.')
  })

  it('shows option thumbnails when the CMS has them and plain cards otherwise', () => {
    renderConfigurator(makeFullProduct())
    const support = group('Support')
    expect(within(support).getAllByRole('img').length).toBe(1) // only "Couché mat" has an image
    expect(within(group('Orientation')).queryAllByRole('img')).toHaveLength(0)
  })

  it('has no price, stock, delivery or cart UI', () => {
    const { container } = renderConfigurator(makeFullProduct())
    expect(container.textContent).not.toMatch(/MAD|DH\b|€|\$|prix|panier|commander|payer|stock|disponibilit|livraison|à partir de/i)
  })
})

describe('ProductConfigurator — interaction', () => {
  it('starts with a singleton option selected and nothing else', () => {
    renderConfigurator(makeFullProduct())
    expect((within(group('Nombre de pages')).getByRole('radio') as HTMLInputElement).checked).toBe(true)
    for (const radio of within(group('Format')).getAllByRole('radio')) expect((radio as HTMLInputElement).checked).toBe(false)
  })

  it('selecting an option replaces the previous one in a single-choice group', () => {
    renderConfigurator(makeFullProduct())
    const [a4, a5] = within(group('Format')).getAllByRole('radio') as HTMLInputElement[]
    fireEvent.click(a4)
    expect(a4.checked).toBe(true)
    fireEvent.click(a5)
    expect(a5.checked).toBe(true)
    expect(a4.checked).toBe(false)
  })

  it('finishes can be combined and individually removed', () => {
    renderConfigurator(makeFullProduct())
    const [soft, uv] = within(group('Finition')).getAllByRole('checkbox') as HTMLInputElement[]
    fireEvent.click(soft)
    fireEvent.click(uv)
    expect([soft.checked, uv.checked]).toEqual([true, true])
    fireEvent.click(soft)
    expect([soft.checked, uv.checked]).toEqual([false, true])
  })

  it('updates the summary with selected labels only', () => {
    renderConfigurator(makeFullProduct())
    const summary = screen.getByRole('region', { name: 'Votre configuration' })
    expect(within(summary).queryByText('Orientation')).toBeNull()

    fireEvent.click(within(group('Format')).getByRole('radio', { name: 'A5' }))
    fireEvent.click(within(group('Orientation')).getByRole('radio', { name: 'Paysage' }))
    fireEvent.click(within(group('Support')).getByRole('radio', { name: 'Couché mat' }))
    fireEvent.click(within(group('Finition')).getByRole('checkbox', { name: 'Vernis UV' }))

    expect(within(summary).getByText('Cartes de visite')).toBeTruthy()
    for (const [label, value] of [
      ['Format', 'A5'],
      ['Orientation', 'Paysage'],
      ['Support', 'Couché mat'],
      ['Finition', 'Vernis UV'],
    ]) {
      const dt = within(summary).getByText(label)
      expect(dt.nextElementSibling?.textContent).toBe(value)
    }
    expect(within(summary).queryByText('Grammage')).toBeNull()
    expect(within(summary).queryByText('Landscape')).toBeNull()
    expect(summary.textContent).not.toMatch(/N\/A|Non renseigné|À confirmer/)
  })
})

describe('ProductConfigurator — custom format', () => {
  it('reveals labelled width/height/unit inputs only when "Sur mesure" is chosen', () => {
    renderConfigurator(makeFullProduct())
    expect(screen.queryByLabelText('Largeur')).toBeNull()

    fireEvent.click(within(group('Format')).getByRole('radio', { name: 'Sur mesure' }))
    const width = screen.getByLabelText('Largeur') as HTMLInputElement
    const height = screen.getByLabelText('Hauteur') as HTMLInputElement
    const unit = screen.getByLabelText('Unité') as HTMLSelectElement
    expect(width.getAttribute('inputmode')).toBe('decimal')
    expect(unit.value).toBe('mm')
    expect(screen.getByText('La faisabilité du format sera confirmée par notre équipe.')).toBeTruthy()
    expect(width.getAttribute('aria-describedby')).toBe('cfg-custom-helper')

    fireEvent.change(width, { target: { value: '120' } })
    fireEvent.change(height, { target: { value: '80' } })
    fireEvent.change(unit, { target: { value: 'cm' } })
    const summary = screen.getByRole('region', { name: 'Votre configuration' })
    expect(within(summary).getByText('Format').nextElementSibling?.textContent).toBe('120 × 80 cm')

    fireEvent.click(within(group('Format')).getByRole('radio', { name: 'A4' }))
    expect(screen.queryByLabelText('Largeur')).toBeNull()
  })

  it('offers no custom option when the product does not allow it', () => {
    renderConfigurator(makeFullProduct({ customFormatAvailable: false }))
    expect(within(group('Format')).queryByRole('radio', { name: 'Sur mesure' })).toBeNull()
  })
})

describe('ProductConfigurator — gallery', () => {
  it('shows keyboard-operable thumbnails for several images and switches the large preview', () => {
    renderConfigurator(makeFullProduct())
    const thumbs = within(screen.getByRole('list', { name: /Images de/ })).getAllByRole('button')
    expect(thumbs).toHaveLength(3)
    expect(thumbs.map((t) => t.getAttribute('aria-pressed'))).toEqual(['true', 'false', 'false'])
    fireEvent.click(thumbs[2])
    expect(thumbs.map((t) => t.getAttribute('aria-pressed'))).toEqual(['false', 'false', 'true'])
  })

  it('omits gallery controls when there is a single image', () => {
    renderConfigurator(makeFullProduct({ gallery: [], primaryImage: makeMedia(1) }))
    expect(screen.queryByRole('list', { name: /Images de/ })).toBeNull()
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('renders without broken images when the product has no media', () => {
    renderConfigurator(makeFullProduct({ gallery: [], primaryImage: null }))
    expect(screen.queryAllByRole('img').every((img) => Boolean(img.getAttribute('src')))).toBe(true)
  })
})

describe('ProductConfigurator — quote CTA', () => {
  it('links to the quote checkout with the product slug only', () => {
    renderConfigurator(makeFullProduct())
    const cta = screen.getByRole('link', { name: 'Obtenir mon devis' })
    expect(cta.getAttribute('href')).toBe('/demande-de-devis?produit=cartes-de-visite')
  })

  it('does not change the link when options are selected (no state hand-off yet)', () => {
    renderConfigurator(makeFullProduct())
    fireEvent.click(within(group('Format')).getByRole('radio', { name: 'A5' }))
    expect(screen.getByRole('link', { name: 'Obtenir mon devis' }).getAttribute('href')).toBe(
      '/demande-de-devis?produit=cartes-de-visite',
    )
  })

  it('a product with no configuration still shows the intro and a working CTA, and no empty box', () => {
    renderConfigurator(makeProduct())
    expect(screen.getByRole('heading', { name: 'Cartes de visite' })).toBeTruthy()
    expect(screen.queryAllByRole('group')).toHaveLength(0)
    expect(screen.queryByRole('region', { name: 'Votre configuration' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Obtenir mon devis' }).getAttribute('href')).toBe('/demande-de-devis?produit=cartes-de-visite')
  })

  it('product with few groups renders only those', () => {
    renderConfigurator(makeProduct({ quantities: [{ label: '100' }, { label: '500' }], finishes: [makeFinish(1, 'Vernis UV')] }))
    expect(screen.getAllByRole('group').map((g) => g.querySelector('legend')?.textContent)).toEqual(['Finition', 'Quantité'])
  })
})
