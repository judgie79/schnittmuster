import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Loader } from '@/components/common/Loader'
import { useAdminDashboard } from '@/hooks'
import styles from './AdminPage.module.css'

const PERIOD_OPTIONS = [
  { value: 'daily', label: 'Heute' },
  { value: 'weekly', label: 'Woche' },
  { value: 'monthly', label: 'Monat' },
] as const

const formatPercent = (value: number) => `${Math.min(100, Math.max(0, Number(value.toFixed(1))))}%`
const formatNumber = (value: number) => value.toLocaleString('de-DE')
const secondsToHours = (value: number) => `${Math.round(value / 3600)} h`

export const AdminDashboardScreen = () => {
  const { metrics, analytics, notifications, period, setPeriod, isLoading, isRefreshing, refetchAll, markNotification } =
    useAdminDashboard()

  if (isLoading || !metrics || !analytics) {
    return <Loader />
  }

  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <div>
          <h2>Systemzustand</h2>
          <p className={styles.notificationMeta}>Letztes Update: {formatDistanceToNow(new Date(metrics.timestamp), { addSuffix: true })}</p>
        </div>
        <div className={styles.actions}>
          <select value={period} onChange={(event) => setPeriod(event.target.value as typeof period)}>
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button variant="secondary" onClick={refetchAll} disabled={isRefreshing}>
            Aktualisieren
          </Button>
        </div>
      </header>

      <div className={styles.grid}>
        <Card>
          <p className={styles.statLabel}>CPU-Auslastung</p>
          <p className={styles.statValue}>{formatPercent(metrics.server.cpu_usage)}</p>
          <p className={styles.notificationMeta}>Uptime {secondsToHours(metrics.server.uptime_seconds)}</p>
        </Card>
        <Card>
          <p className={styles.statLabel}>RAM-Auslastung</p>
          <p className={styles.statValue}>{formatPercent(metrics.server.memory_usage)}</p>
          <p className={styles.notificationMeta}>Letzter Check {new Date(metrics.server.last_health_check).toLocaleTimeString()}</p>
        </Card>
        <Card>
          <p className={styles.statLabel}>Speicher</p>
          <p className={styles.statValue}>
            {metrics.storage.used_storage_gb.toFixed(1)} / {metrics.storage.total_storage_gb} GB
          </p>
          <p className={styles.notificationMeta}>Ø Dateigröße {metrics.storage.avg_pattern_size_mb} MB</p>
        </Card>
        <Card>
          <p className={styles.statLabel}>Patterns gesamt</p>
          <p className={styles.statValue}>{formatNumber(metrics.storage.patterns_count)}</p>
          <p className={styles.notificationMeta}>Top Nutzer: {metrics.storage.storage_by_user[0]?.user_id ?? '–'}</p>
        </Card>
      </div>

      <Card>
        <div className={styles.sectionHeader}>
          <div>
            <h3>Nutzungsstatistiken ({PERIOD_OPTIONS.find((option) => option.value === period)?.label})</h3>
            <p className={styles.notificationMeta}>Aktive Nutzer letzten 24h: {formatNumber(analytics.users.active_users_today)}</p>
          </div>
        </div>
        <div className={styles.grid} style={{ marginTop: 'var(--space-2)' }}>
          <div>
            <p className={styles.statLabel}>Neue Nutzer</p>
            <p className={styles.statValue}>{formatNumber(analytics.users.new_users_today)}</p>
            <p className={styles.notificationMeta}>Woche: {formatNumber(analytics.users.new_users_week)}</p>
          </div>
          <div>
            <p className={styles.statLabel}>Aktiv Woche</p>
            <p className={styles.statValue}>{formatNumber(analytics.users.active_users_week)}</p>
            <p className={styles.notificationMeta}>Aktiv Monat: {formatNumber(analytics.users.active_users_month)}</p>
          </div>
          <div>
            <p className={styles.statLabel}>Patterns Woche</p>
            <p className={styles.statValue}>{formatNumber(analytics.patterns.patterns_uploaded_week)}</p>
            <p className={styles.notificationMeta}>Heute: {formatNumber(analytics.patterns.patterns_uploaded_today)}</p>
          </div>
        </div>
      </Card>

      <Card>
        <header className={styles.sectionHeader}>
          <div>
            <h3>Letzte Benachrichtigungen</h3>
            <p className={styles.notificationMeta}>
              {notifications.length ? `${notifications.length} offene Ereignisse` : 'Keine neuen Meldungen'}
            </p>
          </div>
        </header>
        <div className={styles.notificationList}>
          {notifications.slice(0, 4).map((notification) => (
            <div key={notification.id} className={styles.notificationItem}>
              <div>
                <strong>{notification.title}</strong>
                <p className={styles.notificationMeta}>{notification.message}</p>
                <p className={styles.notificationMeta}>
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </p>
              </div>
              {!notification.read ? (
                <Button variant="secondary" onClick={() => markNotification(notification.id)}>
                  Gelesen
                </Button>
              ) : (
                <span className={styles.inlineTag}>gelesen</span>
              )}
            </div>
          ))}
          {!notifications.length ? <p>Alles ruhig – keine Admin-Aufgaben offen.</p> : null}
        </div>
      </Card>
    </section>
  )
}
