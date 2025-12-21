import { Avatar } from '@/components/common/Avatar'
import { Button } from '@/components/common/Button'
import { useAuth } from '@/hooks'
import styles from './Page.module.css'

export const ProfileScreen = () => {
  const { state } = useAuth()
  const user = state.user

  if (!user) {
    return <p>Bitte einloggen.</p>
  }

  return (
    <section className={styles.section}>
      <Avatar alt={user.username} src={user.photoUrl} />
      <h2>{user.username}</h2>
      <p>{user.email}</p>
      <p>Anbieter: {user.authProvider === 'google' ? 'Google' : 'E-Mail'}</p>
      <Button variant="secondary">Profil bearbeiten</Button>
    </section>
  )
}
