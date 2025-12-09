import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Loader } from '@/components/common/Loader'
import { useAdminDashboard } from '@/hooks'

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
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader />
      </div>
    )
  }

  return (
    <div className="p-4 pb-24 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text">Systemzustand</h2>
          <p className="text-sm text-text-muted">Letztes Update: {formatDistanceToNow(new Date(metrics.timestamp), { addSuffix: true })}</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={period} 
            onChange={(event) => setPeriod(event.target.value as typeof period)}
            className="p-2 rounded-xl border border-border bg-surface text-text focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          >
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-text-muted mb-1">CPU-Auslastung</p>
          <p className="text-2xl font-bold text-text">{formatPercent(metrics.server.cpu_usage)}</p>
          <p className="text-sm text-text-muted">Uptime {secondsToHours(metrics.server.uptime_seconds)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-text-muted mb-1">RAM-Auslastung</p>
          <p className="text-2xl font-bold text-text">{formatPercent(metrics.server.memory_usage)}</p>
          <p className="text-sm text-text-muted">Letzter Check {new Date(metrics.server.last_health_check).toLocaleTimeString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-text-muted mb-1">Speicher</p>
          <p className="text-2xl font-bold text-text">
            {metrics.storage.used_storage_gb.toFixed(1)} / {metrics.storage.total_storage_gb} GB
          </p>
          <p className="text-sm text-text-muted">Ø Dateigröße {metrics.storage.avg_pattern_size_mb} MB</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-text-muted mb-1">Patterns gesamt</p>
          <p className="text-2xl font-bold text-text">{formatNumber(metrics.storage.patterns_count)}</p>
          <p className="text-sm text-text-muted">Top Nutzer: {metrics.storage.storage_by_user[0]?.user_id ?? '–'}</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-text">Nutzungsstatistiken ({PERIOD_OPTIONS.find((option) => option.value === period)?.label})</h3>
            <p className="text-sm text-text-muted">Aktive Nutzer letzten 24h: {formatNumber(analytics.users.active_users_today)}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-text-muted mb-1">Neue Nutzer</p>
            <p className="text-2xl font-bold text-text">{formatNumber(analytics.users.new_users_today)}</p>
            <p className="text-sm text-text-muted">Woche: {formatNumber(analytics.users.new_users_week)}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted mb-1">Aktiv Woche</p>
            <p className="text-2xl font-bold text-text">{formatNumber(analytics.users.active_users_week)}</p>
            <p className="text-sm text-text-muted">Aktiv Monat: {formatNumber(analytics.users.active_users_month)}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted mb-1">Patterns Woche</p>
            <p className="text-2xl font-bold text-text">{formatNumber(analytics.patterns.patterns_uploaded_week)}</p>
            <p className="text-sm text-text-muted">Heute: {formatNumber(analytics.patterns.patterns_uploaded_today)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <header className="mb-6">
          <div>
            <h3 className="text-lg font-bold text-text">Letzte Benachrichtigungen</h3>
            <p className="text-sm text-text-muted">
              {notifications.length ? `${notifications.length} offene Ereignisse` : 'Keine neuen Meldungen'}
            </p>
          </div>
        </header>
        <div className="divide-y divide-border">
          {notifications.slice(0, 4).map((notification) => (
            <div key={notification.id} className="py-4 flex justify-between items-start gap-4">
              <div>
                <strong className="block text-text">{notification.title}</strong>
                <p className="text-sm text-text-muted">{notification.message}</p>
                <p className="text-xs text-text-muted mt-1">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </p>
              </div>
              {!notification.read ? (
                <Button variant="secondary" onClick={() => markNotification(notification.id)}>
                  Gelesen
                </Button>
              ) : (
                <span className="text-xs text-text-muted bg-surface px-2 py-1 rounded-full border border-border">gelesen</span>
              )}
            </div>
          ))}
          {!notifications.length ? <p className="text-text-muted py-4">Alles ruhig – keine Admin-Aufgaben offen.</p> : null}
        </div>
      </Card>
    </div>
  )
}
