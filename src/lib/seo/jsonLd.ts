export function organizationJsonLd({
  name,
  url,
  logoUrl,
}: {
  name: string
  url: string
  logoUrl?: string
}) {
  return {
    '@type': 'Organization',
    name,
    url,
    ...(logoUrl ? { logo: logoUrl } : {}),
  }
}

export function websiteJsonLd({ name, url }: { name: string; url: string }) {
  return {
    '@type': 'WebSite',
    name,
    url,
  }
}

export function breadcrumbJsonLd(items: { label: string; href?: string }[], baseUrl: string) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${baseUrl}${item.href}` } : {}),
    })),
  }
}

export function productJsonLd({
  name,
  description,
  url,
  imageUrl,
}: {
  name: string
  description?: string
  url: string
  imageUrl?: string
}) {
  // Deliberately omits offers/price/aggregateRating: Printcom sells on
  // quote only, and no price/stock/review data is ever fabricated.
  return {
    '@type': 'Product',
    name,
    description,
    url,
    ...(imageUrl ? { image: imageUrl } : {}),
  }
}

export function serviceJsonLd({
  name,
  description,
  url,
  providerName,
}: {
  name: string
  description?: string
  url: string
  providerName: string
}) {
  return {
    '@type': 'Service',
    name,
    description,
    url,
    provider: { '@type': 'Organization', name: providerName },
  }
}

export function faqPageJsonLd(items: { question: string; answerText: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answerText },
    })),
  }
}
