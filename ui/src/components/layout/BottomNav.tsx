import { NavLink } from 'react-router-dom'
import { BOTTOM_NAV_ITEMS } from '@/utils/navigation'
import { useAuth } from '@/hooks'
import styles from './BottomNav.module.css'

export const BottomNav = () => {
  const { user } = useAuth()
  const isAdmin = Boolean(user?.adminRole)
  const items = BOTTOM_NAV_ITEMS.filter((item) => (item.requiresAdmin ? isAdmin : true))

  return (
    <nav className={styles.nav} aria-label="Hauptnavigation">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            [styles.button, isActive ? styles.active : null].filter(Boolean).join(' ')
          }
        >
          <span aria-hidden>{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
