import { useMemo } from 'react'
import { useSearch, useTags } from '@/hooks'
import { PatternGrid } from '@/components/features/PatternGrid/PatternGrid'
import { SearchBar } from '@/components/features/SearchBar/SearchBar'
import { FilterPanel } from '@/components/features/FilterPanel/FilterPanel'
import type { FilterState } from '@/context/types'
import type { PatternStatus } from 'shared-dtos'
import styles from './Page.module.css'

type SectionKey = Extract<keyof FilterState, 'zielgruppe' | 'kleidungsart' | 'hersteller' | 'lizenz' | 'groesse' | 'status'>

interface ComputedSection {
  id: SectionKey
  title: string
  description?: string
  options: { label: string; value: string }[]
  selectedValues: string[]
}

const TAG_SECTION_CONFIG: Array<{ id: SectionKey; title: string; categoryName: string; description?: string }> = [
  {
    id: 'zielgruppe',
    title: 'Zielgruppe',
    categoryName: 'Zielgruppe',
    description: 'Für wen ist das Schnittmuster gedacht?'
  },
  { id: 'kleidungsart', title: 'Kleidungsart', categoryName: 'Kleidungsart' },
  { id: 'hersteller', title: 'Designer:innen', categoryName: 'Hersteller' },
  { id: 'lizenz', title: 'Lizenz', categoryName: 'Lizenz' },
  { id: 'groesse', title: 'Größe', categoryName: 'Größe', description: 'Verfügbare Größenbereiche' },
]

const STATUS_LABELS: Record<PatternStatus, string> = {
  draft: 'Entwurf',
  geplant: 'Geplant',
  genaeht: 'Genäht',
  getestet: 'Getestet',
  archiviert: 'Archiviert',
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

  const filterSections = useMemo<ComputedSection[]>(() => {
    const sections = [...tagSections, statusSection]
    return sections
  }, [statusSection, tagSections])

  const handleClearSection = (sectionId: SectionKey) => {
    setFilters({ [sectionId]: [] } as Partial<FilterState>)
  }

  const canSearch = filters.query.trim().length >= 2 || hasActiveFilters
  const showInstruction = !canSearch
  const noResults = canSearch && !isLoading && results.length === 0

  return (
    <section className={styles.section}>
      <SearchBar placeholder="Nach Namen suchen" onChange={setQuery} />
      <div className={styles.searchLayout}>
        <div className={styles.filterColumn}>
          <FilterPanel
            sections={filterSections}
            onToggle={(sectionId, value) => toggleFilter(sectionId as SectionKey, value)}
            onClearSection={(sectionId) => handleClearSection(sectionId as SectionKey)}
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
