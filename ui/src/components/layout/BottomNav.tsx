import { NavLink } from 'react-router-dom'
import { BOTTOM_NAV_ITEMS } from '@/utils/navigation'
import styles from './BottomNav.module.css'

export const BottomNav = () => {
  return (
    <nav className={styles.nav} aria-label="Hauptnavigation">
      {BOTTOM_NAV_ITEMS.map((item) => (
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
