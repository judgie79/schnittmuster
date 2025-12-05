import clsx from 'clsx'
import type { TagCategoryDTO, TagDTO } from 'shared-dtos'
import styles from './TagSelector.module.css'

interface TagSelectorProps {
  categories: TagCategoryDTO[]
  selected: TagDTO[]
  onToggle: (tag: TagDTO) => void
  isLoading?: boolean
}

export const TagSelector = ({ categories, selected, onToggle, isLoading = false }: TagSelectorProps) => {
  const isActive = (tagId: string) => selected.some((tag) => tag.id === tagId)
  const selectedLabel = selected.map((tag) => tag.name).join(', ')

  if (isLoading) {
    return <p className={styles.helper}>Tags werden geladen ...</p>
  }

  if (!categories.length) {
    return <p className={styles.helper}>Noch keine Tags verfügbar.</p>
  }

  return (
    <div className={styles.selector}>
      <div className={styles.summary} aria-live="polite">
        {selected.length ? `Ausgewählt: ${selectedLabel}` : 'Noch keine Tags ausgewählt.'}
      </div>
      {categories.map((category) => (
        <section key={category.id} className={styles.categorySection}>
          <header className={styles.categoryHeader}>
            <h4>{category.name}</h4>
            <span className={styles.tagCount}>{category.tags.length} Tags</span>
          </header>
          <div className={styles.chips}>
            {category.tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className={clsx(styles.chip, isActive(tag.id) && styles.chipActive)}
                onClick={() => onToggle(tag)}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
