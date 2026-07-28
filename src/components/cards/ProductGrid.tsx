import { ProductCard } from './ProductCard'
import { EmptyState } from '@/components/feedback/EmptyState'
import type { Product } from '@/payload-types'

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <EmptyState
        title="Aucun produit ne correspond à ces critères"
        description="Essayez d’élargir votre recherche ou de réinitialiser les filtres."
      />
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
