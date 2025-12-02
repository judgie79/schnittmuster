import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useGlobalContext } from '@/context'
import { patternService, type PatternRequestOptions } from '@/services'

const PATTERNS_QUERY_KEY = ['patterns']

export const usePatterns = (page = 1) => {
  const { state, dispatch } = useGlobalContext()
  const queryClient = useQueryClient()

  const filters = state.patterns.filters
  const requestFilters = filters as unknown as Record<string, unknown>

  const query = useQuery({
    queryKey: [...PATTERNS_QUERY_KEY, page, filters],
    queryFn: () =>
      patternService.list({
        page,
        filters: requestFilters,
      }),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })

  const createMutation = useMutation({
    mutationFn: ({ formData, options }: { formData: FormData; options?: PatternRequestOptions }) =>
      patternService.create(formData, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATTERNS_QUERY_KEY })
    },
  })

  const setFilters = (nextFilters: Partial<typeof filters>) => {
    dispatch({ type: 'SET_FILTERS', payload: nextFilters })
  }

  return {
    ...query,
    filters,
    setFilters,
    mutate: {
      create: (formData: FormData, options?: PatternRequestOptions) =>
        createMutation.mutateAsync({ formData, options }),
    },
    mutations: {
      create: createMutation,
    },
    items: query.data?.data ?? [],
    pagination: query.data?.pagination ?? null,
  }
}
