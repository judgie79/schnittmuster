import clsx from 'clsx'
import type { TagCategoryDTO, TagDTO } from 'shared-dtos'
import styles from './TagSelector.module.css'

interface TagSelectorProps {
  categories: TagCategoryDTO[]
  selected: TagDTO[]
  onToggle: (tag: TagDTO) => void
}

export const TagSelector = ({ categories, selected, onToggle }: TagSelectorProps) => {
  const isActive = (tagId: string) => selected.some((tag) => tag.id === tagId)

  return (
    <div className={styles.selector}>
      {categories.map((category) => (
        <section key={category.id}>
          <h4>{category.name}</h4>
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
