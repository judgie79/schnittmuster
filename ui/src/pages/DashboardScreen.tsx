import { useEffect, useMemo, useState } from 'react'
import { PatternGrid } from '@/components/features/PatternGrid/PatternGrid'
import { SearchBar } from '@/components/features/SearchBar/SearchBar'
import { Button } from '@/components/common/Button'
import { Loader } from '@/components/common/Loader'
import { usePatterns, useTags } from '@/hooks'
import { getFilterKeyForCategory, type TagFilterKey } from '@/constants/tagFilters'
import styles from './Page.module.css'

interface QuickFilter {
  label: string
  tagId: string
  key: TagFilterKey
}

export const DashboardScreen = () => {
  const { items, isLoading, error, setFilters, filters } = usePatterns()
  const { categories } = useTags()
  const [queryValue, setQueryValue] = useState(filters.query)

  useEffect(() => {
    setQueryValue(filters.query)
  }, [filters.query])

  const quickFilters = useMemo<QuickFilter[]>(() => {
    const entries: QuickFilter[] = []
    categories.forEach((category) => {
      const key = getFilterKeyForCategory(category.name)
      if (!key) return
      category.tags.slice(0, 3).forEach((tag) => {
        entries.push({ label: tag.name, tagId: tag.id, key })
      })
    })
    return entries.slice(0, 8)
  }, [categories])

  const handleQuickFilterToggle = (filter: QuickFilter) => {
    const current = filters[filter.key] ?? []
    const isActive = current.includes(filter.tagId)
    const nextValues = isActive ? current.filter((value) => value !== filter.tagId) : [filter.tagId]
    setFilters({ [filter.key]: nextValues })
  }

  const handleFavoriteToggle = () => {
    setFilters({ favoriteOnly: !filters.favoriteOnly })
  }

  return (
    <section className={styles.section}>
      <SearchBar
        placeholder="Schnittmuster durchsuchen"
        value={queryValue}
        onChange={(value) => {
          setQueryValue(value)
          setFilters({ query: value })
        }}
      />

      <div className={styles.quickFilters}>
        <Button
          type="button"
          variant={filters.favoriteOnly ? 'primary' : 'secondary'}
          onClick={handleFavoriteToggle}
        >
          {filters.favoriteOnly ? 'Favoriten aktiv' : 'Nur Favoriten'}
        </Button>
        {quickFilters.map((filter) => {
          const isActive = filters[filter.key]?.includes(filter.tagId)
          return (
            <Button
              key={`${filter.key}-${filter.tagId}`}
              type="button"
              variant={isActive ? 'primary' : 'secondary'}
              onClick={() => handleQuickFilterToggle(filter)}
            >
              {filter.label}
            </Button>
          )
        })}
      </div>

      {isLoading ? <Loader /> : null}
      {error ? <p>Fehler beim Laden: {error.message}</p> : null}

      {!isLoading ? <PatternGrid patterns={items} /> : null}
    </section>
  )
}
