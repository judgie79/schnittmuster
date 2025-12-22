import type { ChangeEvent, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '@/components/common/Button'
import { useAuth } from '@/hooks'
import styles from './AuthScreen.module.css'

export const SignupScreen = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { signup } = useAuth()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await signup(form)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Registrierung fehlgeschlagen')
    }
  }

  return (
    <section className={styles.screen}>
      <div>
        <p className={styles.helper}>Neu hier?</p>
        <h2>Account anlegen und Schnittmuster speichern</h2>
      </div>

      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            className={styles.input}
            type="text"
            placeholder="Maria Mustermann"
            required
            value={form.name}
            onChange={handleChange}
          />
        </div>


        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="name">
            Name
          </label>
          <input
            id="username"
            name="username"
            className={styles.input}
            type="text"
            placeholder="Benutzername"
            required
            value={form.username}
            onChange={handleChange}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="email">
            E-Mail-Adresse
          </label>
          <input
            id="email"
            name="email"
            className={styles.input}
            type="email"
            autoComplete="email"
            placeholder="maria@beispiel.de"
            required
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="password">
            Passwort
          </label>
          <input
            id="password"
            name="password"
            className={styles.input}
            type="password"
            autoComplete="new-password"
            placeholder="Mindestens 8 Zeichen"
            required
            value={form.password}
            onChange={handleChange}
          />
          <span className={styles.helper}>• Mindestens 8 Zeichen • 1 Zahl • 1 Großbuchstabe</span>
        </div>

        {errorMessage ? <p className={styles.helper}>{errorMessage}</p> : null}

        <div className={styles.actions}>
          <Button type="submit">Registrieren</Button>
          <Button type="button" variant="secondary">
            Mit Google registrieren
          </Button>
        </div>

        <p className={styles.altAction}>
          Bereits ein Konto? <Link to="/login">Einloggen</Link>
        </p>
      </form>
    </section>
  )
}
