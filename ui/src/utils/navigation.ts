export const ROUTE_TITLES: Record<string, string> = {
  '/': 'Start',
  '/dashboard': 'Meine Schnittmuster',
  '/patterns/new': 'Neues Schnittmuster',
  '/patterns/search': 'Suche & Filter',
  '/settings': 'Einstellungen',
  '/profile': 'Profil',
}

export type NavItem = {
  path: string
  label: string
  icon: string
}

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Schnittmuster', icon: '📂' },
  { path: '/patterns/search', label: 'Suche', icon: '🔍' },
  { path: '/patterns/new', label: 'Neu', icon: '➕' },
  { path: '/settings', label: 'Einstellungen', icon: '⚙️' },
  { path: '/profile', label: 'Profil', icon: '👤' },
]
