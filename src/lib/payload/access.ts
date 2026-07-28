import type { Access, FieldAccess } from 'payload'
import type { User } from '@/payload-types'

export type Role = User['role']

export const isAdmin: Access = ({ req }) => Boolean(req.user && req.user.role === 'admin')

export const isAdminFieldLevel: FieldAccess = ({ req }) =>
  Boolean(req.user && req.user.role === 'admin')

export const isAdminOrContentManager: Access = ({ req }) =>
  Boolean(req.user && ['admin', 'content-manager'].includes(req.user.role))

export const isAdminOrContentManagerFieldLevel: FieldAccess = ({ req }) =>
  Boolean(req.user && ['admin', 'content-manager'].includes(req.user.role))

export const isAdminOrSalesManager: Access = ({ req }) =>
  Boolean(req.user && ['admin', 'sales-manager'].includes(req.user.role))

export const isSalesTeam: Access = ({ req }) =>
  Boolean(req.user && ['admin', 'sales-manager', 'sales-agent'].includes(req.user.role))

/** Sales agents may only read/update leads assigned to them; managers and admins see all. */
export const salesRecordAccess: Access = ({ req }) => {
  if (!req.user) return false
  if (['admin', 'sales-manager'].includes(req.user.role)) return true
  if (req.user.role === 'sales-agent') {
    return {
      assignedTo: {
        equals: req.user.id,
      },
    }
  }
  return false
}

export const isLoggedIn: Access = ({ req }) => Boolean(req.user)

/**
 * Public catalogue/editorial read access: anonymous visitors only ever see
 * `status: published` documents. Authenticated admin-panel users see
 * everything (drafts included) so editors can preview their own work.
 */
export const publicReadPublished: Access = ({ req }) => {
  if (req.user) return true
  return {
    status: {
      equals: 'published',
    },
  }
}

/** Never exposed to the public API — internal/commercial data only. */
export const internalOnly: Access = ({ req }) => Boolean(req.user)
