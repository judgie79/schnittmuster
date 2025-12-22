import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services'
import type { SystemSettingsDTO } from '@schnittmuster/dtos'

const SETTINGS_QUERY_KEY = ['admin', 'settings'] as const

export const useAdminSettings = () => {
  const queryClient = useQueryClient()

  const settingsQuery = useQuery<SystemSettingsDTO>({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: () => adminService.getSettings(),
    staleTime: 5 * 60 * 1000,
  })

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<SystemSettingsDTO>) => adminService.updateSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY })
    },
  })

  return {
    settings: settingsQuery.data,
    settingsQuery,
    updateSettings: updateMutation.mutateAsync,
    isSaving: updateMutation.isPending,
  }
}
