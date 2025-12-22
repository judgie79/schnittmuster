import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { patternService } from '@/services'
import { useGlobalContext } from '@/context'
import type { FilterState } from '@/context/types'
import { defaultFilters } from '@/context/reducer'

type MultiSelectFilterKey = 'zielgruppe' | 'kleidungsart' | 'hersteller' | 'lizenz' | 'groesse' | 'status'

const hasArrayValues = (values: string[]) => values.length > 0

const hasActiveFilters = (filters: FilterState) => {
  return (
    filters.favoriteOnly ||
      hasArrayValues(filters.zielgruppe) ||
      hasArrayValues(filters.kleidungsart) ||
      hasArrayValues(filters.hersteller) ||
      hasArrayValues(filters.lizenz) ||
      hasArrayValues(filters.groesse) ||
      hasArrayValues(filters.status)
  )
}

const countActiveFilters = (filters: FilterState) => {
  const base = filters.favoriteOnly ? 1 : 0
  const arrayTotals =
    filters.zielgruppe.length +
    filters.kleidungsart.length +
    filters.hersteller.length +
    filters.lizenz.length +
    filters.groesse.length +
    filters.status.length

  return base + arrayTotals
}

export const useSearch = () => {
  const { state, dispatch } = useGlobalContext()
  const filters = state.patterns.filters
  const timeoutRef = useRef<ReturnType<typeof window.setTimeout>>()

  const setFilters = useCallback(
    (nextFilters: Partial<FilterState>) => {
      dispatch({ type: 'SET_FILTERS', payload: nextFilters })
    },
    [dispatch]
  )

  const debouncedSetQuery = useMemo(() => {
    return (value: string) => {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => {
        setFilters({ query: value })
      }, 300)
    }
  }, [setFilters])

  const toggleFilter = useCallback(
    (key: MultiSelectFilterKey, value: string) => {
      const currentValues = filters[key]
      const exists = currentValues.includes(value)
      const nextValues = exists
        ? currentValues.filter((entry) => entry !== value)
        : [...currentValues, value]

      setFilters({ [key]: nextValues } as Partial<FilterState>)
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
    if (filters.zielgruppe?.length) ids.push(...filters.zielgruppe)
    if (filters.kleidungsart?.length) ids.push(...filters.kleidungsart)
    if (filters.hersteller?.length) ids.push(...filters.hersteller)
    if (filters.lizenz?.length) ids.push(...filters.lizenz)
    if (filters.groesse?.length) ids.push(...filters.groesse)
    return ids
  }, [filters.zielgruppe, filters.kleidungsart, filters.hersteller, filters.lizenz, filters.groesse])
  
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
      window.clearTimeout(timeoutRef.current)
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
