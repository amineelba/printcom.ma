import type { Access, FieldAccess } from 'payload'
import type { User } from '@/payload-types'

export type Role = User['role']

/**
 * `@payloadcms/plugin-mcp` gives its `payload-mcp-api-keys` collection its
 * own native Payload API-key auth strategy (`auth.useAPIKey`), so a bearer
 * token scoped only to a few catalogue collections in the MCP tool config
 * can still authenticate `req.user` directly against the plain Payload
 * REST/GraphQL/Local API — completely outside the MCP plugin's own
 * per-collection/per-operation checkboxes. That principal has no `role`
 * field, so every check below must narrow to a genuine `Users` document
 * before trusting it — `Boolean(req.user)` alone is not "is staff".
 */
export const isStaffUser = (req: { user?: unknown }): User | null => {
  const user = req.user
  return user && typeof user === 'object' && 'role' in user ? (user as User) : null
}
const staffUser = isStaffUser

export const isAdmin: Access = ({ req }) => staffUser(req)?.role === 'admin'

export const isAdminFieldLevel: FieldAccess = ({ req }) => staffUser(req)?.role === 'admin'

export const isAdminOrContentManager: Access = ({ req }) => {
  const role = staffUser(req)?.role
  return Boolean(role && ['admin', 'content-manager'].includes(role))
}

export const isAdminOrContentManagerFieldLevel: FieldAccess = ({ req }) => {
  const role = staffUser(req)?.role
  return Boolean(role && ['admin', 'content-manager'].includes(role))
}

export const isAdminOrSalesManager: Access = ({ req }) => {
  const role = staffUser(req)?.role
  return Boolean(role && ['admin', 'sales-manager'].includes(role))
}

export const isSalesTeam: Access = ({ req }) => {
  const role = staffUser(req)?.role
  return Boolean(role && ['admin', 'sales-manager', 'sales-agent'].includes(role))
}

/** Sales agents may only read/update leads assigned to them; managers and admins see all. */
export const salesRecordAccess: Access = ({ req }) => {
  const user = staffUser(req)
  if (!user) return false
  if (['admin', 'sales-manager'].includes(user.role)) return true
  if (user.role === 'sales-agent') {
    return {
      assignedTo: {
        equals: user.id,
      },
    }
  }
  return false
}

export const isLoggedIn: Access = ({ req }) => Boolean(staffUser(req))

/**
 * Public catalogue/editorial read access: anonymous visitors only ever see
 * `status: published` documents. Authenticated admin-panel users see
 * everything (drafts included) so editors can preview their own work.
 */
export const publicReadPublished: Access = ({ req }) => {
  if (staffUser(req)) return true
  return {
    status: {
      equals: 'published',
    },
  }
}

/** Never exposed to the public API — internal/commercial data only. */
export const internalOnly: Access = ({ req }) => Boolean(staffUser(req))
