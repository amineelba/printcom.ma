# Access control

## Roles (`users.role`)

| Role | Scope |
|---|---|
| `admin` | Full access to everything, including internal commercial fields, user role changes, and legal document publishing |
| `content-manager` | Public catalogue/editorial content, media, SEO. **No** access to quote-requests, contact-requests, or internal commercial notes |
| `sales-manager` | Full access to quote-requests and contact-requests (all leads), can assign leads to sales-agents |
| `sales-agent` | Only leads assigned to them (`assignedTo === self`); can update status on those |

Implemented in `src/lib/payload/access.ts`:

- `isAdmin`, `isAdminOrContentManager`, `isAdminOrSalesManager`,
  `isSalesTeam` — simple role-membership checks.
- `salesRecordAccess` — the interesting one: returns `true` for
  admin/sales-manager (see everything), returns a **query constraint**
  `{ assignedTo: { equals: req.user.id } }` for sales-agent (row-level
  filtering — Payload applies this as a `WHERE` clause, so a sales-agent's
  `find` only ever returns their own leads), and `false` for anyone else
  (including anonymous).
- `publicReadPublished` — `true` for any authenticated admin-panel user
  (so editors can preview drafts), otherwise a query constraint
  `{ status: { equals: 'published' } }` for anonymous requests. This is
  the collection-level access rule for every public content collection.
- `internalOnly` — `Boolean(req.user)`, used for `private-quote-files`.

## What `false` vs. a query-constraint access function means in practice

This matters and was verified with a real integration test
(`tests/integration/accessControl.int.spec.ts`): when an access function
returns a literal `false`, Payload's `find` operation **throws** a
Forbidden error for an anonymous/unauthorized caller (unless the caller
passes `disableErrors: true`) — it does not silently return an empty
page. When an access function returns a query constraint object (like
`publicReadPublished` does), `find` instead **filters** the result set
transparently — an anonymous caller gets a valid response with only the
rows matching that constraint (e.g. only published documents), no error.

Both behaviors are correct for their respective use cases:
`quote-requests`/`private-quote-files` (returns `false` — no anonymous
access should be possible at all, and a hard failure is more legible than
a silently-empty page for something that should never be queried
anonymously) vs. `products`/`services`/etc. (returns a constraint —
anonymous visitors are supposed to see the published subset).

## Never-public collections

`quote-requests`, `contact-requests`, `private-quote-files`,
`newsletter-subscribers` have **no** `read` access path for anonymous
users, full stop — verified in
`tests/integration/accessControl.int.spec.ts`. The public quote/contact
forms never call the public API at all; they go through server actions
using the Payload **Local API with `overrideAccess: true`**, which is a
deliberate, narrow bypass scoped to exactly two mutations
(`submitQuoteRequest`, `submitContactForm`, `uploadQuoteFile`) — not a
general access-control hole. Every other Local API call in the frontend
(all the `payload.find()` calls in page components) uses the **default**
`overrideAccess: true` behavior of the Local API for read convenience,
which is safe specifically because every one of those calls also
includes an explicit `status: 'published'` filter in its `where` clause
(see `docs/architecture.md`) — the actual enforcement boundary for an
anonymous HTTP client hitting `/api/quote-requests` directly is the
collection's `access.read` function, which returns `false`.

## Field-level access

`src/lib/payload/fields.ts` → `adminOnlyField()` wraps a field with
`access: { read: () => true, update: isAdminFieldLevel }` — used for
`products.indicativePrice`, so even a content-manager who can otherwise
edit a product cannot set a price value (they can see it if one exists,
but not change it). Field-level `Access` functions have a different
signature than collection-level `Access` functions in Payload (a
`FieldAccess` doesn't receive the same `id` typing) — this tripped up the
initial build (`isAdminOrContentManager` used where
`isAdminOrContentManagerFieldLevel` was needed) and is worth knowing if
you add a new field-level restriction: use the `*FieldLevel` variants
from `access.ts`, not the collection-level ones.

## Editorial workflow status is not the same axis as access control

`workflowFields.status` (draft/review/approved/published/archived)
gates **public visibility**. `verificationField.verificationStatus`
(unverified/confirmed/unavailable) gates **factual confidence** and is
checked in addition to status for `technologies`/`machines`. Neither of
these is a Payload `access` rule by itself — they're plain `select`
fields that the frontend's `where` clauses filter on explicitly. Don't
confuse "an editor can see this in the admin" (access control) with
"this is safe to show a website visitor" (workflow status +
verification status) — a document can be fully readable by a
content-manager and still correctly invisible to the public.
