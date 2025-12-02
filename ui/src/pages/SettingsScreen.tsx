import type { ChangeEvent } from 'react'
import { Button } from '@/components/common/Button'
import { useAuth } from '@/hooks'
import { useGlobalContext, type Language, type ThemeMode } from '@/context'
import styles from './Page.module.css'

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
    <section className={styles.section}>
      <div>
        <h3>Darstellung</h3>
        <select value={ui.theme} onChange={handleThemeChange}>
          <option value="light">Hell</option>
          <option value="dark">Dunkel</option>
          <option value="auto">Auto</option>
        </select>
      </div>

      <div>
        <h3>Sprache</h3>
        <select value={ui.language} onChange={handleLanguageChange}>
          <option value="de">Deutsch</option>
          <option value="en">Englisch</option>
        </select>
      </div>

      <Button variant="danger" onClick={() => logout()}>
        Abmelden
      </Button>
    </section>
  )
}
