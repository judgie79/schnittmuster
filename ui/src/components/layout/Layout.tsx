import { Outlet, useLocation } from 'react-router-dom'
import { ROUTE_TITLES } from '@/utils/navigation'
import { Container } from './Container'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

export const Layout = () => {
  const { pathname } = useLocation()
  const title = ROUTE_TITLES[pathname] ?? 'Schnittmuster'
  const isAuthRoute = pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/signup')

  return (
    <div className="flex flex-col min-h-screen bg-background text-text transition-colors duration-300">
      {!isAuthRoute && <Header title={title} />}
      <main className="flex-1 pb-20">
        <Container>
          <Outlet />
        </Container>
      </main>
      {!isAuthRoute && <BottomNav />}
    </div>
  )
}

