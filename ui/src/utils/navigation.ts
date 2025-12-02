export const ROUTE_TITLES: Record<string, string> = {
  '/': 'Start',
  '/dashboard': 'Meine Schnittmuster',
  '/patterns/new': 'Neues Schnittmuster',
  '/patterns/search': 'Suche & Filter',
  '/settings': 'Einstellungen',
  '/profile': 'Profil',
  '/admin': 'Admin Dashboard',
  '/admin/users': 'Admin Nutzerverwaltung',
  '/admin/settings': 'Systemeinstellungen',
}

export type NavItem = {
  path: string
  label: string
  icon: string
  requiresAdmin?: boolean
}

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Schnittmuster', icon: '📂' },
  { path: '/patterns/search', label: 'Suche', icon: '🔍' },
  { path: '/patterns/new', label: 'Neu', icon: '➕' },
  { path: '/settings', label: 'Einstellungen', icon: '⚙️' },
  { path: '/profile', label: 'Profil', icon: '👤' },
  { path: '/admin', label: 'Admin', icon: '🛡️', requiresAdmin: true },
]
