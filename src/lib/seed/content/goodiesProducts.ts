import { richText } from './richText'
import { FILE_PREP_INSTRUCTIONS, type ProductSeed } from './products'

/**
 * Goodies & objets publicitaires — real catalogue products (like every
 * other entry in products.ts), not a second-level taxonomy. Each item's
 * `primaryCategory` resolves to "Goodies & objets publicitaires"; see
 * runSeed.ts where `category` below is mapped through `categoryIds`.
 *
 * Slugs are the known legacy identifiers this content migrated from (they
 * previously existed as `product-categories` documents, children of
 * "Goodies & objets publicitaires" — see the architecture migration this
 * file is part of). Keeping the same slugs means any legacy Product
 * relationship or bookmark pointing at these identifiers still resolves.
 */
const GOODIES_ITEMS: { slug: string; title: string; shortDescription: string }[] = [
  { slug: 'stylos-personnalises', title: 'Stylos personnalisés', shortDescription: 'Stylos marqués au nom ou au logo de votre entreprise.' },
  { slug: 'carnets-notebooks', title: 'Carnets & notebooks', shortDescription: 'Carnets et notebooks personnalisés pour un usage professionnel ou événementiel.' },
  { slug: 'mugs-tasses', title: 'Mugs & tasses', shortDescription: 'Mugs et tasses personnalisés pour le bureau ou l’offre cadeau.' },
  { slug: 'gourdes-bouteilles', title: 'Gourdes & bouteilles', shortDescription: 'Gourdes et bouteilles réutilisables personnalisées.' },
  { slug: 'tote-bags', title: 'Tote bags', shortDescription: 'Sacs en toile personnalisés, réutilisables au quotidien.' },
  { slug: 'sacs-personnalises', title: 'Sacs personnalisés', shortDescription: 'Sacs personnalisés pour la distribution, l’événementiel ou la vente.' },
  { slug: 'textile-personnalise', title: 'Textile personnalisé', shortDescription: 'Vêtements et textiles marqués à votre identité.' },
  { slug: 'casquettes', title: 'Casquettes', shortDescription: 'Casquettes personnalisées pour équipes, événements ou distribution.' },
  { slug: 'tours-de-cou-badges', title: 'Tours de cou & badges', shortDescription: 'Tours de cou et badges personnalisés pour équipes ou événements.' },
  { slug: 'cles-usb', title: 'Clés USB', shortDescription: 'Clés USB personnalisées au nom ou au logo de votre entreprise.' },
  { slug: 'accessoires-technologiques', title: 'Accessoires technologiques', shortDescription: 'Accessoires technologiques personnalisés (chargeurs, supports, étuis…).' },
  { slug: 'porte-cles', title: 'Porte-clés', shortDescription: 'Porte-clés personnalisés au nom ou au logo de votre entreprise.' },
  { slug: 'parapluies', title: 'Parapluies', shortDescription: 'Parapluies personnalisés pour la distribution ou l’offre cadeau.' },
  { slug: 'cadeaux-affaires', title: 'Cadeaux d’affaires', shortDescription: 'Cadeaux d’affaires personnalisés pour clients et partenaires.' },
  { slug: 'coffrets-personnalises', title: 'Coffrets personnalisés', shortDescription: 'Coffrets personnalisés regroupant plusieurs objets publicitaires.' },
]

export const GOODIES_PRODUCTS: ProductSeed[] = GOODIES_ITEMS.map((item) => ({
  slug: item.slug,
  title: item.title,
  category: 'goodies-objets-publicitaires',
  shortDescription: item.shortDescription,
  longDescription: richText([{ p: item.shortDescription }]),
  filePreparationInstructions: FILE_PREP_INSTRUCTIONS,
  seo: {
    metaTitle: `${item.title} personnalisés | Printcom`,
    metaDescription: `${item.shortDescription} Demandez un devis pour votre projet ${item.title.toLowerCase()}.`,
  },
  status: 'draft',
  quoteOnly: true,
  indicativePriceEnabled: false,
}))
