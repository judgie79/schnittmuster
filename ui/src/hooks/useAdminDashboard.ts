import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { adminService, type AdminAnalyticsPeriod } from '@/services'

const METRICS_QUERY_KEY = ['admin', 'metrics'] as const
const ANALYTICS_QUERY_KEY = ['admin', 'analytics'] as const
const NOTIFICATIONS_QUERY_KEY = ['admin', 'notifications'] as const

export const useAdminDashboard = () => {
  const [period, setPeriod] = useState<AdminAnalyticsPeriod>('daily')
  const queryClient = useQueryClient()

  const metricsQuery = useQuery({
    queryKey: METRICS_QUERY_KEY,
    queryFn: () => adminService.getSystemMetrics(),
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  })

  const analyticsQuery = useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, period],
    queryFn: () => adminService.getAnalytics(period),
    staleTime: 60 * 1000,
  })

  const notificationsQuery = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () => adminService.getNotifications(),
    staleTime: 2 * 60 * 1000,
  })

  const markNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => adminService.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
    },
  })

  const refetchAll = () => {
    void metricsQuery.refetch()
    void analyticsQuery.refetch()
    void notificationsQuery.refetch()
  }

  return {
    period,
    setPeriod,
    metrics: metricsQuery.data,
    analytics: analyticsQuery.data,
    notifications: notificationsQuery.data ?? [],
    metricsQuery,
    analyticsQuery,
    notificationsQuery,
    markNotification: markNotificationMutation.mutateAsync,
    isMarkingNotification: markNotificationMutation.isPending,
    isLoading: metricsQuery.isLoading || analyticsQuery.isLoading,
    isRefreshing: metricsQuery.isFetching || analyticsQuery.isFetching,
    refetchAll,
  }
}
