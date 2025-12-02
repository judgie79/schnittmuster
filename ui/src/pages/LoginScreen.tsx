import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { useAuth } from '@/hooks'
import styles from './AuthScreen.module.css'

export const LoginScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { login, isLoading } = useAuth()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await login({ email, password })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Login fehlgeschlagen')
    }
  }

  return (
    <section className={styles.screen}>
      <div>
        <p className={styles.helper}>Willkommen zurück 👋</p>
        <h2>Einfach einloggen und losnähen</h2>
      </div>

      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="email">
            E-Mail-Adresse
          </label>
          <input
            id="email"
            className={styles.input}
            type="email"
            autoComplete="email"
            placeholder="maria@beispiel.de"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="password">
            Passwort
          </label>
          <input
            id="password"
            className={styles.input}
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {errorMessage ? <p className={styles.helper}>{errorMessage}</p> : null}

        <div className={styles.actions}>
          <Button type="submit" disabled={isLoading}>
            Einloggen
          </Button>
          <Button type="button" variant="secondary">
            Mit Google anmelden
          </Button>
        </div>

        <p className={styles.altAction}>
          Noch kein Konto? <Link to="/signup">Jetzt registrieren</Link>
        </p>
      </form>
    </section>
  )
}
