import type { ReactNode } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { FaPalette } from 'react-icons/fa'

interface HeaderProps {
  title: string
  actions?: ReactNode
}

export const Header = ({ title, actions }: HeaderProps) => {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') setTheme('warm')
    else if (theme === 'warm') setTheme('dark')
    else setTheme('light')
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-surface border-b border-border shadow-sm h-16 flex items-center justify-between px-4 transition-colors duration-300">
      <h1 className="text-xl font-bold text-primary truncate">{title}</h1>
      <div className="flex items-center gap-2">
        {actions}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-background text-text-muted transition-colors"
          aria-label="Design ändern"
          title="Design ändern"
        >
          <FaPalette size={20} />
        </button>
      </div>
    </header>
  )
}

