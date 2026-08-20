import type { Endpoint, PayloadRequest } from 'payload'
import type { QuoteRequest } from '@/payload-types'

/**
 * GET /api/quote-requests/:id/pdf — renders a single quote request as a
 * branded, printable PDF for the sales team. Deliberately reuses the
 * collection's own `access.read` (salesRecordAccess) via
 * `overrideAccess: false` rather than a bespoke role check, so a
 * sales-agent can only export requests assigned to them, exactly like
 * viewing the document in the admin UI — one access rule, not two to keep
 * in sync. This is an internal export only; nothing here is reachable by
 * an anonymous caller (verified in tests/integration/accessControl.int.spec.ts).
 */
const handler = async (req: PayloadRequest): Promise<Response> => {
  if (!req.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = req.routeParams?.id
  if (typeof id !== 'string' && typeof id !== 'number') {
    return Response.json({ error: 'Missing id' }, { status: 400 })
  }

  let quoteRequest: QuoteRequest
  try {
    quoteRequest = (await req.payload.findByID({
      collection: 'quote-requests',
      id,
      depth: 2,
      overrideAccess: false,
      req,
    })) as QuoteRequest
  } catch {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  const [{ renderToBuffer }, { QuoteRequestPdfDocument }, React] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/admin/pdf/QuoteRequestPdfDocument'),
    import('react'),
  ])

  const buffer = await renderToBuffer(
    React.createElement(QuoteRequestPdfDocument, { quoteRequest }) as Parameters<typeof renderToBuffer>[0],
  )

  return new Response(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${quoteRequest.reference}.pdf"`,
      'Content-Length': String(buffer.length),
    },
  })
}

export const quoteRequestPdfEndpoint: Endpoint = {
  path: '/:id/pdf',
  method: 'get',
  handler,
}
