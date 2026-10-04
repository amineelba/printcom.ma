import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { QuoteRequestSummary } from '@/components/forms/QuoteRequestSummary'

afterEach(cleanup)

describe('QuoteRequestSummary', () => {
  const items = [
    { label: 'Produit', value: 'Cartes de visite' },
    { label: 'Format', value: 'A5' },
  ]

  it('renders the rows and a real "Modifier" link when a product exists', () => {
    render(<QuoteRequestSummary items={items} editHref="/produits/cartes-de-visite?cfg=1.abc" />)
    expect(screen.getByText('Cartes de visite')).toBeTruthy()
    const link = screen.getByRole('link', { name: 'Modifier ma configuration' })
    expect(link.getAttribute('href')).toBe('/produits/cartes-de-visite?cfg=1.abc')
  })

  it('omits "Modifier" when there is no valid product to return to', () => {
    render(<QuoteRequestSummary items={items} />)
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('renders nothing without rows', () => {
    const { container } = render(<QuoteRequestSummary items={[]} editHref="/produits/x" />)
    expect(container.innerHTML).toBe('')
  })
})
