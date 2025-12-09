import type { ChangeEvent } from 'react'
import { Button } from '@/components/common/Button'
import { useAuth } from '@/hooks'
import { useGlobalContext, type Language, type ThemeMode } from '@/context'

export const SettingsScreen = () => {
  const {
    state: { ui },
    dispatch,
  } = useGlobalContext()
  const { logout } = useAuth()

  const handleThemeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_THEME', payload: event.target.value as ThemeMode })
  }

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_LANGUAGE', payload: event.target.value as Language })
  }

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-text mb-6">Einstellungen</h1>
      
      <div className="bg-surface p-6 rounded-xl border border-border">
        <h3 className="text-lg font-bold text-text mb-4">Darstellung</h3>
        <select 
          value={ui.theme} 
          onChange={handleThemeChange}
          className="w-full p-3 rounded-xl border border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
        >
          <option value="light">Hell</option>
          <option value="dark">Dunkel</option>
          <option value="warm">Warm</option>
        </select>
      </div>

      <div className="bg-surface p-6 rounded-xl border border-border">
        <h3 className="text-lg font-bold text-text mb-4">Sprache</h3>
        <select 
          value={ui.language} 
          onChange={handleLanguageChange}
          className="w-full p-3 rounded-xl border border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
        >
          <option value="de">Deutsch</option>
          <option value="en">Englisch</option>
        </select>
      </div>

      <div className="pt-4">
        <Button variant="danger" onClick={() => logout()} className="w-full justify-center">
          Abmelden
        </Button>
      </div>
    </div>
  )
}
