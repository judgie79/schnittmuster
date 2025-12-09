import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks'
import { 
  FaHome, 
  FaSearch, 
  FaPlusCircle, 
  FaUser, 
  FaCog, 
  FaShieldAlt, 
  FaBars, 
  FaTimes,
  FaTags,
  FaUsers,
  FaServer
} from 'react-icons/fa'
import { clsx } from 'clsx'
import { createPortal } from 'react-dom'

export const BottomNav = () => {
  const { state } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isAdmin = Boolean(state.user?.adminRole)

  const mainNavItems = [
    { path: '/dashboard', icon: FaHome, label: 'Home' },
    { path: '/patterns/search', icon: FaSearch, label: 'Suche' },
    { path: '/patterns/new', icon: FaPlusCircle, label: 'Neu' },
  ]

  const menuItems = [
    {
      title: 'Mein Bereich',
      items: [
        { path: '/profile', icon: FaUser, label: 'Profil' },
        { path: '/settings', icon: FaCog, label: 'Einstellungen' },
      ]
    }
  ]

  if (isAdmin) {
    menuItems.push({
      title: 'Administration',
      items: [
        { path: '/admin', icon: FaShieldAlt, label: 'Dashboard' },
        { path: '/admin/users', icon: FaUsers, label: 'Benutzer' },
        { path: '/admin/tags', icon: FaTags, label: 'Tags' },
        { path: '/admin/settings', icon: FaServer, label: 'System' },
      ]
    })
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border pb-safe-area-inset-bottom z-50 shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200',
                  isActive && !isMenuOpen ? 'text-primary' : 'text-text-muted hover:text-text'
                )
              }
            >
              <item.icon size={24} />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
          
          <button
            type="button"
            onClick={toggleMenu}
            className={clsx(
              'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200',
              isMenuOpen ? 'text-primary' : 'text-text-muted hover:text-text'
            )}
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            <span className="text-xs font-medium">Menü</span>
          </button>
        </div>
      </nav>

      {isMenuOpen && createPortal(
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm animate-in fade-in duration-200 pb-20 overflow-y-auto">
          <div className="p-6 max-w-md mx-auto space-y-8 pt-12">
            {menuItems.map((section, idx) => (
              <div key={idx} className="space-y-4">
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider px-2">
                  {section.title}
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center gap-4 p-4 rounded-xl transition-all duration-200',
                          isActive 
                            ? 'bg-primary/10 text-primary font-medium' 
                            : 'bg-surface text-text hover:bg-surface/80 border border-border'
                        )
                      }
                    >
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

