import type { RouteObject } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { LoginScreen } from '@/pages/LoginScreen'
import { SignupScreen } from '@/pages/SignupScreen'
import { DashboardScreen } from '@/pages/DashboardScreen'
import { PatternDetailScreen } from '@/pages/PatternDetailScreen'
import { AddPatternScreen } from '@/pages/AddPatternScreen'
import { EditPatternScreen } from '@/pages/EditPatternScreen'
import { SearchScreen } from '@/pages/SearchScreen'
import { SettingsScreen } from '@/pages/SettingsScreen'
import { ProfileScreen } from '@/pages/ProfileScreen'
import { TagsScreen } from '@/pages/TagsScreen'
import { NotFoundScreen } from '@/pages/NotFoundScreen'
import { PrivateRoute } from './PrivateRoute'
import { AdminRoute } from './AdminRoute'
import { AdminDashboardScreen } from '@/pages/admin/AdminDashboardScreen'
import { AdminUsersScreen } from '@/pages/admin/AdminUsersScreen'
import { AdminSettingsScreen } from '@/pages/admin/AdminSettingsScreen'
import { AdminTagsScreen } from '@/pages/admin/AdminTagsScreen'

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <LoginScreen /> },
      { path: '/login', element: <LoginScreen /> },
      { path: '/signup', element: <SignupScreen /> },
      {
        element: <PrivateRoute />,
        children: [
          { path: '/dashboard', element: <DashboardScreen /> },
          { path: '/patterns/new', element: <AddPatternScreen /> },
          { path: '/patterns/:patternId', element: <PatternDetailScreen /> },
          { path: '/patterns/:patternId/edit', element: <EditPatternScreen /> },
          { path: '/patterns/search', element: <SearchScreen /> },
          { path: '/settings', element: <SettingsScreen /> },
          { path: '/profile', element: <ProfileScreen /> },
          { path: '/tags', element: <TagsScreen /> },
          {
            element: <AdminRoute />,
            children: [
              { path: '/admin', element: <AdminDashboardScreen /> },
              { path: '/admin/users', element: <AdminUsersScreen /> },
              { path: '/admin/settings', element: <AdminSettingsScreen /> },
              { path: '/admin/tags', element: <AdminTagsScreen /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundScreen /> },
    ],
  },
]
