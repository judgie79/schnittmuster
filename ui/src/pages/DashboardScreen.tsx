import { useEffect, useMemo, useState } from 'react'
import type { TagCategoryDTO } from '@schnittmuster/dtos'
import { getContrastColor } from '@schnittmuster/core'
import { PatternGrid } from '@/components/features/PatternGrid/PatternGrid'
import { SearchBar } from '@/components/features/SearchBar/SearchBar'
import { Button } from '@/components/common/Button'
import { Loader } from '@/components/common/Loader'
import { usePatterns, useTags } from '@/hooks'
import styles from './Page.module.css'

const sortCategories = (categories: TagCategoryDTO[] = []) =>
  [...categories].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))

const countActiveTagFilters = (tagFilters: Record<string, string[]> = {}) =>
  Object.values(tagFilters).reduce((total, tagIds) => total + tagIds.length, 0)

export const DashboardScreen = () => {
  const { items, isLoading, error, setFilters, filters } = usePatterns()
  const { categories } = useTags()
  const [queryValue, setQueryValue] = useState(filters.query)
  const sortedCategories = useMemo(() => sortCategories(categories), [categories])
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const activeFilterCount = useMemo(
    () => countActiveTagFilters(filters.tagFilters || {}),
    [filters.tagFilters]
  )
  const activeCategory = useMemo(
    () => sortedCategories.find((category) => category.id === activeCategoryId),
    [sortedCategories, activeCategoryId]
  )

  useEffect(() => {
    setQueryValue(filters.query)
  }, [filters.query])

  useEffect(() => {
    if (!sortedCategories.length) {
      setActiveCategoryId(null)
      return
    }
    setActiveCategoryId((current) => {
      if (current && sortedCategories.some((category) => category.id === current)) {
        return current
      }
      const firstWithTags = sortedCategories.find((category) => category.tags?.length)
      return firstWithTags?.id ?? sortedCategories[0].id
    })
  }, [sortedCategories])

  const handleTagToggle = (categoryId: string, tagId: string) => {
    const currentTagFilters = filters.tagFilters || {}
    const currentCategoryTags = currentTagFilters[categoryId] || []
    const isActive = currentCategoryTags.includes(tagId)

    const nextCategoryTags = isActive
      ? currentCategoryTags.filter((id) => id !== tagId)
      : [...currentCategoryTags, tagId]

    const nextTagFilters = { ...currentTagFilters }
    if (nextCategoryTags.length) {
      nextTagFilters[categoryId] = nextCategoryTags
    } else {
      delete nextTagFilters[categoryId]
    }

    setFilters({ tagFilters: nextTagFilters })
  }

  const handleFavoriteToggle = () => {
    setFilters({ favoriteOnly: !filters.favoriteOnly })
  }

  const handleClearTagFilters = () => {
    if (!activeFilterCount) return
    setFilters({ tagFilters: {} })
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
      </div>

      <div className={styles.tagFilterPanel}>
        <div className={styles.tagFilterHeader}>
          <div>
            <p className={styles.tagFilterTitle}>Tag-Filter</p>
            <p className={styles.tagFilterSubtitle}>
              {activeFilterCount
                ? `${activeFilterCount} aktiv`
                : 'Wähle Tags aus einer Kategorie'}
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={!activeFilterCount}
            onClick={handleClearTagFilters}
          >
            Zurücksetzen
          </Button>
        </div>

        <div className={styles.tagFilterTabs}>
          {sortedCategories.map((category) => {
            const isActiveCategory = category.id === activeCategoryId
            const activeTagsInCategory = filters.tagFilters?.[category.id]?.length ?? 0
            return (
              <button
                key={category.id}
                type="button"
                className={`${styles.tagFilterTab} ${
                  isActiveCategory ? styles.tagFilterTabActive : ''
                }`}
                onClick={() => setActiveCategoryId(category.id)}
              >
                <span>{category.name}</span>
                {activeTagsInCategory ? (
                  <span className={styles.tagFilterTabBadge}>{activeTagsInCategory}</span>
                ) : null}
              </button>
            )
          })}
        </div>

        <div className={styles.tagFilterTags}>
          {!activeCategory || !(activeCategory.tags?.length) ? (
            <p className={styles.tagFilterEmpty}>Keine Tags für diese Kategorie.</p>
          ) : (
            activeCategory.tags.map((tag) => {
              const swatchColor = tag.colorHex || '#cbd5e1'
              const categoryId = activeCategory.id
              const isActive = filters.tagFilters?.[categoryId]?.includes(tag.id) ?? false
              const textColor = getContrastColor(swatchColor)
              return (
                <button
                  key={tag.id}
                  type="button"
                  className={`${styles.tagFilterTag} ${
                    isActive ? styles.tagFilterTagActive : ''
                  }`}
                  style={{
                    borderColor: swatchColor,
                    backgroundColor: isActive ? swatchColor : 'transparent',
                    color: isActive ? textColor : undefined,
                  }}
                  onClick={() => handleTagToggle(categoryId, tag.id)}
                >
                  <span
                    className={styles.tagFilterTagSwatch}
                    style={{ backgroundColor: swatchColor }}
                  />
                  {tag.name}
                </button>
              )
            })
          )}
        </div>
      </div>

      {isLoading ? <Loader /> : null}
      {error ? <p>Fehler beim Laden: {error.message}</p> : null}

      {!isLoading ? <PatternGrid patterns={items} /> : null}
    </section>
  )
}
