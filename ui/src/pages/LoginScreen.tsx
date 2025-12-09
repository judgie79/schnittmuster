import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks'
import { FaGoogle, FaEnvelope, FaLock } from 'react-icons/fa'

export const LoginScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const navigate = useNavigate()
  const { login, isLoading, state } = useAuth()

  useEffect(() => {
    if (state.isAuthenticated) {
      const destination = state.user?.adminRole ? '/admin' : '/dashboard'
      navigate(destination, { replace: true })
    }
  }, [state.isAuthenticated, state.user?.adminRole, navigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const user = await login({ email, password })
      const destination = user?.adminRole ? '/admin' : '/dashboard'
      navigate(destination, { replace: true })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Login fehlgeschlagen')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary">Willkommen zurück 👋</h2>
          <p className="mt-2 text-text-muted">Einfach einloggen und losnähen</p>
        </div>

        <form className="mt-8 space-y-6 bg-surface p-6 rounded-xl shadow-sm border border-border" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-muted mb-1">
                E-Mail-Adresse
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <FaEnvelope />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-border rounded-lg bg-background text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="maria@beispiel.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-muted mb-1">
                Passwort
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <FaLock />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-border rounded-lg bg-background text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="text-sm text-error bg-error/10 p-3 rounded-lg">
              {errorMessage}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Wird geladen...' : 'Einloggen'}
            </button>

            <button
              type="button"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-border rounded-lg shadow-sm text-sm font-medium text-text bg-surface hover:bg-background focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              <FaGoogle className="text-red-500" />
              Mit Google anmelden
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-text-muted">Noch kein Konto? </span>
            <Link to="/signup" className="font-medium text-primary hover:text-primary/80">
              Jetzt registrieren
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

