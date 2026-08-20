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

## Third-party plugin collections

`payload-invoicepdf` (added for staff-facing invoice/quote-PDF generation
— see `src/payload.config.ts`) ships its `invoices`/`quotes` collections
and `shop-info` global with **no `access` config of its own**, which
would default to Payload's public read/write. `secureInvoicePdfAccess`
runs immediately after the plugin in the `plugins` array and patches
`access` onto those three by slug (`isAdminOrSalesManager` for
read/create/update, `isAdmin` for delete/update-shop-info) — the same
treatment as any other collection holding client PII or commercial data.
If this plugin is ever upgraded and starts shipping its own `access`
default, double-check `secureInvoicePdfAccess` isn't silently
overriding a now-correct default with a more restrictive one (harmless)
or, worse, that a future version renames the collections and the patch
stops matching by slug (dangerous — would silently go back to public).
Covered by `tests/integration/accessControl.int.spec.ts`.

`@payloadcms/plugin-import-export` (added for bulk CSV/JSON import/export
of catalogue content — `importExportSlugs` in `src/payload.config.ts`,
deliberately scoped to structural content only, never quote-requests/
contact-requests/newsletter-subscribers/private-quote-files/users) has
the same gap: its `imports`/`exports` collections only set
`access.update: () => false`, leaving `read`/`create`/`delete` at
Payload's public default — meaning an anonymous caller could otherwise
`create` an import job (i.e. upload a CSV) that bulk-writes into
products/services/etc. `secureImportExportAccess`, run right after the
plugin, locks all three to `isAdminOrContentManager`. Same "double-check
after a plugin upgrade" caveat as above. Covered by
`tests/integration/accessControl.int.spec.ts`.

`@payloadcms/plugin-mcp` (added so an MCP client/AI agent can manage
catalogue/editorial content through the admin's own access rules — see
`mcpCollections` in `src/payload.config.ts`) is different from the two
plugins above: its `payload-mcp-api-keys` collection ships with a correct
`access` config out of the box (`create: isAuthenticated`,
`read`/`update`/`delete`/`unlock` scoped to the requesting user's own keys
via a query constraint — verified directly against the installed source,
not just its docs), so no `secure*Access` patch is needed for it. The real
gate is exposure, not the key collection's own access: a collection or
global is reachable over MCP only if its slug appears in `mcpCollections`
(or the `globals` allowlist next to it) **and** is `enabled: true` there —
`quote-requests`, `contact-requests`, `private-quote-files`,
`newsletter-subscribers`, `users`, `invoices`, `quotes`, `shop-info`,
`imports`, `exports` are deliberately absent and therefore unreachable via
`/api/mcp` no matter how a given key is configured. Every individual
find/create/update/delete checkbox on an API key document also defaults to
unchecked and must be opted in per key, per collection, by an admin in
**Collections → MCP → API Keys**. The plugin never sets `overrideAccess`
— every MCP tool call still runs through this project's normal
`access.ts` role functions for whichever `Users` doc the key is bound to,
and every request requires a valid `Authorization: Bearer <key>` header
(confirmed via a live smoke test: no header or a bogus token both return
401; the JSON-RPC handshake only proceeds with a real key).

**The one real gap this plugin introduces**, and the reason
`src/lib/payload/access.ts` changed alongside it: `payload-mcp-api-keys`
has its own native Payload API-key auth strategy
(`auth: { useAPIKey: true }`), so a valid key authenticates `req.user`
directly against the *plain* Payload REST/GraphQL/Local API — not only
the plugin's own `/api/mcp` endpoint — with a principal that has no
`role` field. Before this was caught, several access functions
(`isLoggedIn`, `publicReadPublished`, `internalOnly`, and
`Users`'s own `read`/`update`) only checked `Boolean(req.user)`, which an
MCP key — however narrowly scoped in the MCP tool config — would
satisfy, letting it read `private-quote-files`, list `users`, or see
draft catalogue content by calling the ordinary API directly, bypassing
the MCP allowlist entirely. Every role-checking function in `access.ts`
now goes through `isStaffUser(req)`, which only recognizes a genuine
`Users` document (narrowed by the presence of a `role` field) as staff;
an MCP API key principal always evaluates as "not logged in" for these
purposes. Covered by `tests/integration/accessControl.int.spec.ts`
("never treats an MCP API key principal as a staff user").

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
