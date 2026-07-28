import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getPayload } from '@/lib/payload/client'

// Proxy (formerly "middleware") always runs on the Node.js runtime in
// Next.js 16, which is required here since the Postgres adapter needs a
// real `pg` connection — see docs/architecture.md.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const payload = await getPayload()
  const result = await payload.find({
    collection: 'redirects',
    where: { from: { equals: pathname } },
    limit: 1,
    depth: 0,
  })

  const redirect = result.docs[0]
  if (redirect) {
    const status = redirect.type === '302' ? 307 : 308
    return NextResponse.redirect(new URL(redirect.to, request.url), status)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|admin|api|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
}
