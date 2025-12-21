import { Outlet, useLocation } from 'react-router-dom'
import { ROUTE_TITLES } from '@/utils/navigation'
import { Container } from './Container'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import styles from './Layout.module.css'

export const Layout = () => {
  const { pathname } = useLocation()
  const title = ROUTE_TITLES[pathname] ?? 'Schnittmuster'
  const isAuthRoute = pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/signup')

  return (
    <div className={styles.appShell}>
      {!isAuthRoute && <Header title={title} />}
      <main className={styles.main}>
        <Container>
          <Outlet />
        </Container>
      </main>
      {!isAuthRoute && <BottomNav />}
    </div>
  )
}
