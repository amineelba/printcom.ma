import { permanentRedirect } from 'next/navigation'

/**
 * /solutions/[slug] is the canonical detail URL for a "solution par besoin".
 * This categorized path stays reachable (nav, search engines) but redirects
 * to avoid duplicate-content indexing of the same document under two URLs.
 */
export default async function SolutionByNeedRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  permanentRedirect(`/solutions/${slug}`)
}
