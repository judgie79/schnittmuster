import { useMemo } from 'react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Loader } from '@/components/common/Loader'
import { useAdminUsers } from '@/hooks'
import styles from './AdminPage.module.css'
import type { AdminUserDTO } from '@schnittmuster/dtos'

const ROLE_OPTIONS: Array<{ label: string; value: AdminUserDTO['admin_role'] | 'all' }> = [
  { label: 'Alle Rollen', value: 'all' },
  { label: 'Super Admin', value: 'super_admin' },
  { label: 'Admin', value: 'admin' },
  { label: 'Moderator', value: 'moderator' },
]

const STATUS_OPTIONS: Array<{ label: string; value: AdminUserDTO['status'] | 'all' }> = [
  { label: 'Alle Stati', value: 'all' },
  { label: 'Aktiv', value: 'active' },
  { label: 'Gesperrt', value: 'suspended' },
  { label: 'Gelöscht', value: 'deleted' },
]

const formatDate = (value?: string | Date) => (value ? new Date(value).toLocaleString('de-DE') : '–')

export const AdminUsersScreen = () => {
  const { users, pagination, filters, setFilters, page, setPage, isLoading, isFetching, changeRole, suspendUser, activateUser } =
    useAdminUsers()

  const totalPages = useMemo(() => {
    if (!pagination) return 1
    return Math.max(1, pagination.totalPages)
  }, [pagination])

  const totalItems = pagination?.totalItems ?? users.length

  if (isLoading) {
    return <Loader />
  }

  const handleRoleChange = (userId: string, value: string) => {
    if (value === 'all') return
    void changeRole(userId, value as AdminUserDTO['admin_role'])
  }

  const handleStatusToggle = (user: AdminUserDTO) => {
    if (user.status === 'suspended') {
      void activateUser(user.id)
    } else {
      void suspendUser(user.id)
    }
  }

  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <div>
          <h2>Admin · Nutzerverwaltung</h2>
          <p className={styles.notificationMeta}>{totalItems} Nutzer gesamt</p>
        </div>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => setFilters({ search: '', role: 'all', status: 'all' })}>
            Filter zurücksetzen
          </Button>
        </div>
      </header>

      <Card>
        <div className={styles.filters}>
          <label>
            Suche
            <input
              type="search"
              placeholder="Name oder E-Mail"
              value={filters.search}
              onChange={(event) => setFilters({ search: event.target.value })}
            />
          </label>
          <label>
            Status
            <select value={filters.status} onChange={(event) => setFilters({ status: event.target.value as typeof filters.status })}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Rolle
            <select value={filters.role} onChange={(event) => setFilters({ role: event.target.value as typeof filters.role })}>
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nutzer</th>
              <th>E-Mail</th>
              <th>Rolle</th>
              <th>Status</th>
              <th>Patterns</th>
              <th>Storage</th>
              <th>Letzter Login</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: AdminUserDTO) => (
              <tr key={user.id}>
                <td>
                  <strong>{user.username}</strong>
                  <div className={styles.notificationMeta}>{user.login_count} Logins</div>
                </td>
                <td>{user.email}</td>
                <td>
                  <select value={user.admin_role} onChange={(event) => handleRoleChange(user.id, event.target.value)}>
                    {ROLE_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <span className={styles.inlineTag}>{user.status}</span>
                </td>
                <td>{user.patterns_count}</td>
                <td>{user.storage_used_mb.toFixed(1)} MB</td>
                <td>{formatDate(user.last_login)}</td>
                <td className={styles.actions}>
                  <Button variant="secondary" onClick={() => handleStatusToggle(user)}>
                    {user.status === 'suspended' ? 'Aktivieren' : 'Sperren'}
                  </Button>
                </td>
              </tr>
            ))}
            {!users.length ? (
              <tr>
                <td colSpan={8}>Keine Nutzer für die aktuellen Filter gefunden.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Zurück
        </Button>
        <span>
          Seite {page} / {totalPages}
        </span>
        <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
          Weiter
        </Button>
        {isFetching ? <span className={styles.notificationMeta}>Aktualisiere …</span> : null}
      </div>
    </section>
  )
}
