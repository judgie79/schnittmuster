import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Loader } from '@/components/common/Loader'
import { useAdminSettings } from '@/hooks'
import styles from './AdminPage.module.css'

interface SettingsFormState {
  enable2fa: boolean
  requireHttps: boolean
  rateLimit: number
  maxUpload: number
}

export const AdminSettingsScreen = () => {
  const { settings, settingsQuery, updateSettings, isSaving } = useAdminSettings()
  const [formState, setFormState] = useState<SettingsFormState>({
    enable2fa: false,
    requireHttps: true,
    rateLimit: 120,
    maxUpload: 250,
  })

  useEffect(() => {
    if (!settings) return
    setFormState({
      enable2fa: settings.security.enable_2fa,
      requireHttps: settings.security.require_https,
      rateLimit: settings.server.rate_limit_requests_per_minute,
      maxUpload: settings.storage.upload_size_limit_mb,
    })
  }, [settings])

  if (settingsQuery.isLoading || !settings) {
    return <Loader />
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void updateSettings({
      security: {
        enable_2fa: formState.enable2fa,
        require_https: formState.requireHttps,
        ip_whitelist: settings.security.ip_whitelist,
        ip_blacklist: settings.security.ip_blacklist,
        hsts_max_age: settings.security.hsts_max_age,
        api_keys_enabled: settings.security.api_keys_enabled,
      },
      server: {
        ...settings.server,
        rate_limit_requests_per_minute: formState.rateLimit,
      },
      storage: {
        ...settings.storage,
        upload_size_limit_mb: formState.maxUpload,
      },
    })
  }

  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <div>
          <h2>Systemeinstellungen</h2>
          <p className={styles.notificationMeta}>Letztes Update durch Admin</p>
        </div>
        <Button form="admin-settings" type="submit" disabled={isSaving}>
          {isSaving ? 'Speichern …' : 'Änderungen speichern'}
        </Button>
      </header>

      <form id="admin-settings" onSubmit={handleSubmit}>
        <div className={styles.settingsGrid}>
          <Card>
            <h3>Server</h3>
            <div className={styles.toggleRow}>
              <label htmlFor="rate-limit">Rate Limit (Requests / Minute)</label>
              <input
                id="rate-limit"
                type="number"
                min={30}
                max={500}
                value={formState.rateLimit}
                onChange={(event) => setFormState((prev) => ({ ...prev, rateLimit: Number(event.target.value) }))}
              />
            </div>
            <div className={styles.toggleRow}>
              <label htmlFor="upload-limit">Upload Limit (MB)</label>
              <input
                id="upload-limit"
                type="number"
                min={50}
                max={1000}
                value={formState.maxUpload}
                onChange={(event) => setFormState((prev) => ({ ...prev, maxUpload: Number(event.target.value) }))}
              />
            </div>
          </Card>

          <Card>
            <h3>Sicherheit</h3>
            <div className={styles.toggleRow}>
              <label htmlFor="2fa-toggle">2FA Pflicht</label>
              <input
                id="2fa-toggle"
                type="checkbox"
                checked={formState.enable2fa}
                onChange={(event) => setFormState((prev) => ({ ...prev, enable2fa: event.target.checked }))}
              />
            </div>
            <div className={styles.toggleRow}>
              <label htmlFor="https-toggle">HTTPS erzwingen</label>
              <input
                id="https-toggle"
                type="checkbox"
                checked={formState.requireHttps}
                onChange={(event) => setFormState((prev) => ({ ...prev, requireHttps: event.target.checked }))}
              />
            </div>
          </Card>
        </div>
      </form>

      <Card>
        <h3>E-Mail & OAuth</h3>
        <p className={styles.notificationMeta}>SMTP: {settings.email.smtp_server}</p>
        <p className={styles.notificationMeta}>OAuth Callback: {settings.oauth.oauth_callback_url}</p>
        <p className={styles.notificationMeta}>Vorlagen: {settings.email.templates_enabled.join(', ')}</p>
      </Card>
    </section>
  )
}
