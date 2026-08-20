import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminFieldLevel, isStaffUser } from '@/lib/payload/access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'name'],
    description: 'Comptes de l’administration Printcom.',
  },
  auth: {
    tokenExpiration: 60 * 60 * 8,
  },
  access: {
    read: ({ req }) => Boolean(isStaffUser(req)),
    create: isAdmin,
    update: ({ req, id }) => {
      const user = isStaffUser(req)
      if (!user) return false
      if (user.role === 'admin') return true
      // Users may edit their own profile, but not their own role.
      return user.id === id
    },
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'content-manager',
      access: {
        update: isAdminFieldLevel,
      },
      options: [
        { label: 'Administrateur', value: 'admin' },
        { label: 'Responsable de contenu', value: 'content-manager' },
        { label: 'Responsable commercial', value: 'sales-manager' },
        { label: 'Agent commercial', value: 'sales-agent' },
      ],
      admin: {
        description:
          'Détermine les permissions : catalogue public, demandes commerciales, ou accès complet.',
      },
    },
  ],
  versions: false,
}
