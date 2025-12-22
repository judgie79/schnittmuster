import clsx from 'clsx'
import type { TagCategoryDTO, TagDTO } from '@schnittmuster/dtos'
import { getContrastColor } from '@schnittmuster/core'
import styles from './TagSelector.module.css'

interface TagSelectorProps {
  categories: TagCategoryDTO[]
  selected: TagDTO[]
  onToggle: (tag: TagDTO) => void
  isLoading?: boolean
}

export const TagSelector = ({ categories, selected, onToggle, isLoading = false }: TagSelectorProps) => {
  const isActive = (tagId: string) => selected.some((tag) => tag.id === tagId)
  const selectedLabel = selected.length
    ? `Ausgewählt (${selected.length}): ${selected.map((tag) => tag.name).join(', ')}`
    : 'Noch keine Tags ausgewählt.'

  if (isLoading) {
    return <p className={styles.helper}>Tags werden geladen ...</p>
  }

  if (!categories.length) {
    return <p className={styles.helper}>Noch keine Tags verfügbar.</p>
  }

  return (
    <div className={styles.selector}>
      <p className={styles.summary} aria-live="polite">
        {selectedLabel}
      </p>
      {categories.map((category) => (
        <section key={category.id} className={styles.categorySection}>
          <header className={styles.categoryHeader}>
            <h4>{category.name}</h4>
            <span className={styles.tagCount}>{category.tags.length} Tags</span>
          </header>
          <div className={styles.chips}>
            {category.tags.map((tag) => {
              const active = isActive(tag.id)
              const backgroundColor = active ? tag.colorHex ?? '#2563eb' : '#e2e8f0'
              const textColor = active ? getContrastColor(backgroundColor) : '#0f172a'
              return (
                <button
                  key={tag.id}
                  type="button"
                  className={clsx(styles.chip, active && styles.chipActive)}
                  style={{
                    backgroundColor,
                    color: textColor,
                    borderColor: active ? 'transparent' : undefined,
                  }}
                  aria-pressed={active}
                  onClick={() => onToggle(tag)}
                >
                  {tag.name}
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
