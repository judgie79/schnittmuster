import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { patternService } from '@/services'
import { useGlobalContext } from '@/context'
import type { FilterState } from '@/context/types'
import { defaultFilters } from '@/context/reducer'

const hasActiveFilters = (filters: FilterState) => {
  return (
    filters.favoriteOnly || filters.tagIds.length > 0
  )
}

const countActiveFilters = (filters: FilterState) => {
  const base = filters.favoriteOnly ? 1 : 0
  const arrayTotals = filters.tagIds.length;

  return base + arrayTotals
}

export const useSearch = () => {
  const { state, dispatch } = useGlobalContext()
  const filters = state.patterns.filters
  const timeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null)

  const setFilters = useCallback(
    (nextFilters: Partial<FilterState>) => {
      dispatch({ type: 'SET_FILTERS', payload: nextFilters })
    },
    [dispatch]
  )

  const debouncedSetQuery = useMemo(() => {
    return (value: string) => {
      window.clearTimeout(timeoutRef.current ?? undefined)
      timeoutRef.current = window.setTimeout(() => {
        setFilters({ query: value })
      }, 300)
    }
  }, [setFilters])

  const toggleFilter = useCallback(
    (value: string) => {
      const currentValues = filters.tagIds;
      const exists = currentValues.includes(value)
      const nextValues = exists
        ? currentValues.filter((entry) => entry !== value)
        : [...currentValues, value]

      setFilters({tagIds: nextValues})
    },
    [filters, setFilters]
  )

  const toggleFavoriteOnly = useCallback(() => {
    setFilters({ favoriteOnly: !filters.favoriteOnly })
  }, [filters.favoriteOnly, setFilters])

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [setFilters])

  const queryReady = filters.query.trim().length >= 2
  const filterReady = hasActiveFilters(filters)
  
  // Flatten all tag filter arrays into a single tagIds array
  const tagIds = useMemo(() => {
    const ids: string[] = []
    if (filters.tagIds?.length) ids.push(...filters.tagIds)
    return ids
  }, [filters.tagIds])
  
  const requestFilters = useMemo(() => {
    const params: Record<string, unknown> = {}
    if (filters.query) params.query = filters.query
    if (filters.favoriteOnly) params.favoriteOnly = filters.favoriteOnly
    if (filters.status?.length) params.status = filters.status
    if (tagIds.length) params.tagIds = tagIds
    return params
  }, [filters.query, filters.favoriteOnly, filters.status, tagIds])

  const searchQuery = useQuery({
    queryKey: ['patternSearch', requestFilters],
    queryFn: () => patternService.list({ filters: requestFilters }),
    enabled: queryReady || filterReady,
  })

  useEffect(() => {
    return () => {
      window.clearTimeout(timeoutRef.current ?? undefined)
    }
  }, [])

  return {
    setQuery: debouncedSetQuery,
    setFilters,
    toggleFilter,
    toggleFavoriteOnly,
    clearFilters,
    filters,
    hasActiveFilters: filterReady,
    activeFilterCount: countActiveFilters(filters),
    results: searchQuery.data?.data ?? [],
    pagination: searchQuery.data?.pagination,
    isLoading: searchQuery.isLoading,
    isPending: searchQuery.isPending,
    error: searchQuery.error,
  }
}
