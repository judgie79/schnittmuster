import { useEffect, useMemo, useState } from 'react'
import { useSearch, useTags } from '@/hooks'
import { PatternGrid } from '@/components/features/PatternGrid/PatternGrid'
import { SearchBar } from '@/components/features/SearchBar/SearchBar'
import { FilterPanel } from '@/components/features/FilterPanel/FilterPanel'
import type { FilterState } from '@/context/types'
import type { PatternStatus } from 'shared-dtos'
import { STATUS_LABELS, TAG_SECTION_CONFIG, type TagFilterKey } from '@/constants/tagFilters'

interface ComputedSection {
  id: TagFilterKey
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
    return TAG_SECTION_CONFIG.reduce<ComputedSection[]>((acc, section) => {
      const category = categories.find(
        (entry) => entry.name.toLowerCase() === section.categoryName.toLowerCase()
      )
      if (!category) {
        return acc
      }
      acc.push({
        id: section.id,
        title: section.title,
        description: section.description,
        options: category.tags.map((tag) => ({ label: tag.name, value: tag.id })),
        selectedValues: filters[section.id],
      })
      return acc
    }, [])
  }, [categories, filters])

  const filterSections = useMemo<ComputedSection[]>(() => [...tagSections, statusSection], [statusSection, tagSections])

  const handleClearSection = (sectionId: TagFilterKey) => {
    setFilters({ [sectionId]: [] } as Partial<FilterState>)
  }

  const canSearch = filters.query.trim().length >= 2 || hasActiveFilters
  const showInstruction = !canSearch
  const noResults = canSearch && !isLoading && results.length === 0

  return (
    <div className="p-4 pb-24 max-w-7xl mx-auto">
      <SearchBar
        placeholder="Nach Namen suchen"
        value={queryValue}
        onChange={(value) => {
          setQueryValue(value)
          setQuery(value)
        }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <div className="lg:col-span-1">
          <FilterPanel
            sections={filterSections}
            onToggle={(sectionId, value) => toggleFilter(sectionId as TagFilterKey, value)}
            onClearSection={(sectionId) => handleClearSection(sectionId as TagFilterKey)}
            onClearAll={clearFilters}
            favoriteOnly={filters.favoriteOnly}
            onFavoriteToggle={toggleFavoriteOnly}
            activeFilterCount={activeFilterCount}
          />
          {isLoadingTags && <p className="text-center text-text-muted py-4">Filter werden geladen ...</p>}
        </div>
        <div className="lg:col-span-3">
          {showInstruction && <p className="text-center text-text-muted py-4">Gib mindestens zwei Buchstaben ein oder wähle Filter aus.</p>}
          {canSearch && isLoading && <p className="text-center text-text-muted py-4">Suchen ...</p>}
          {noResults && <p className="text-center text-text-muted py-4">Keine Schnittmuster gefunden.</p>}
          {canSearch && !isLoading && results.length > 0 && <PatternGrid patterns={results} />}
        </div>
      </div>
    </div>
  )
}
