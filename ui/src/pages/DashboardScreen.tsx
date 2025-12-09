import { useEffect, useMemo, useState } from 'react'
import { PatternGrid } from '@/components/features/PatternGrid/PatternGrid'
import { SearchBar } from '@/components/features/SearchBar/SearchBar'
import { Loader } from '@/components/common/Loader'
import { usePatterns, useTags } from '@/hooks'
import { getFilterKeyForCategory, type TagFilterKey } from '@/constants/tagFilters'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { clsx } from 'clsx'

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
    <div className="space-y-6 pb-20">
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm py-2 -mx-4 px-4 border-b border-border">
        <SearchBar
          placeholder="Schnittmuster suchen..."
          value={queryValue}
          onChange={(value) => {
            setQueryValue(value)
            setFilters({ query: value })
          }}
        />
        
        <div className="flex gap-2 overflow-x-auto pb-2 mt-3 no-scrollbar">
          <button
            type="button"
            onClick={handleFavoriteToggle}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
              filters.favoriteOnly
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-surface text-text border-border hover:bg-background"
            )}
          >
            {filters.favoriteOnly ? <FaHeart /> : <FaRegHeart />}
            Favoriten
          </button>
          
          {quickFilters.map((filter) => {
            const isActive = filters[filter.key]?.includes(filter.tagId)
            return (
              <button
                key={`${filter.key}-${filter.tagId}`}
                type="button"
                onClick={() => handleQuickFilterToggle(filter)}
                className={clsx(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-surface text-text border-border hover:bg-background"
                )}
              >
                {filter.label}
              </button>
            )
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      ) : null}
      
      {error ? (
        <div className="bg-error/10 text-error p-4 rounded-lg text-center">
          Fehler beim Laden: {error.message}
        </div>
      ) : null}

      {!isLoading && !error ? (
        <PatternGrid patterns={items} />
      ) : null}
    </div>
  )
}

