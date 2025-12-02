import { Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Loader } from '@/components/common/Loader'
import { routes } from './routes'

const router = createBrowserRouter(routes)

export const AppRouter = () => (
  <Suspense fallback={<Loader />}>
    <RouterProvider router={router} />
  </Suspense>
)
