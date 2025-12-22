import { useEffect, useMemo, useState } from 'react'
import { useSearch, useTags } from '@/hooks'
import { PatternGrid } from '@/components/features/PatternGrid/PatternGrid'
import { SearchBar } from '@/components/features/SearchBar/SearchBar'
import { FilterPanel } from '@/components/features/FilterPanel/FilterPanel'
import type { FilterState } from '@/context/types'
import type { PatternStatus } from '@schnittmuster/dtos'
import { STATUS_LABELS } from '@/constants/tagFilters'
import styles from './Page.module.css'

interface ComputedSection {
  id: string
  title: string
  description?: string
  options: { label: string; value: string }[]
  selectedValues: string[]
}

export const SearchScreen = () => {
  const {
    setQuery,
    toggleFilter,
    toggleFavoriteOnly,
    clearFilters,
    setFilters,
    filters,
    hasActiveFilters,
    activeFilterCount,
    results,
    isLoading,
  } = useSearch()
  const { categories, isLoading: isLoadingTags } = useTags()
  const [queryValue, setQueryValue] = useState(filters.query)

  useEffect(() => {
    setQueryValue(filters.query)
  }, [filters.query])

  const statusSection = useMemo<ComputedSection>(
    () => ({
      id: 'status',
      title: 'Status',
      description: 'Wo befindet sich das Projekt gerade?',
      options: (Object.entries(STATUS_LABELS) as Array<[PatternStatus, string]>).map(([value, label]) => ({
        value,
        label,
      })),
      selectedValues: filters.status,
    }),
    [filters.status]
  )

  const tagSections = useMemo<ComputedSection[]>(() => {
    return categories.reduce<ComputedSection[]>((acc, category) => {
      acc.push({
        id: category.id,
        title: category.name,
        options: category.tags.map((tag) => ({ label: tag.name, value: tag.id })),
        selectedValues: filters.tagIds,
      })
      return acc
    }, [])
  }, [categories, filters])

  const filterSections = useMemo<ComputedSection[]>(() => [...tagSections, statusSection], [statusSection, tagSections])

  const handleClearSection = () => {
    setFilters({ tagIds: [] } as Partial<FilterState>)
  }

  const canSearch = filters.query.trim().length >= 2 || hasActiveFilters
  const showInstruction = !canSearch
  const noResults = canSearch && !isLoading && results.length === 0

  return (
    <section className={styles.section}>
      <SearchBar
        placeholder="Nach Namen suchen"
        value={queryValue}
        onChange={(value) => {
          setQueryValue(value)
          setQuery(value)
        }}
      />
      <div className={styles.searchLayout}>
        <div className={styles.filterColumn}>
          <FilterPanel
            sections={filterSections}
            onToggle={(value) => toggleFilter(value)}
            onClearSection={() => handleClearSection()}
            onClearAll={clearFilters}
            favoriteOnly={filters.favoriteOnly}
            onFavoriteToggle={toggleFavoriteOnly}
            activeFilterCount={activeFilterCount}
          />
          {isLoadingTags && <p className={styles.helperText}>Filter werden geladen ...</p>}
        </div>
        <div className={styles.resultsColumn}>
          {showInstruction && <p className={styles.helperText}>Gib mindestens zwei Buchstaben ein oder wähle Filter aus.</p>}
          {canSearch && isLoading && <p className={styles.helperText}>Suchen ...</p>}
          {noResults && <p className={styles.helperText}>Keine Schnittmuster gefunden.</p>}
          {canSearch && !isLoading && results.length > 0 && <PatternGrid patterns={results} />}
        </div>
      </div>
    </section>
  )
}
