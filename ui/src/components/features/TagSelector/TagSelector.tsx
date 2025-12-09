import clsx from 'clsx'
import type { TagCategoryDTO, TagDTO } from 'shared-dtos'

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
    return <p className="text-sm text-text-muted">Tags werden geladen ...</p>
  }

  if (!categories.length) {
    return <p className="text-sm text-text-muted">Noch keine Tags verfügbar.</p>
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-text-muted" aria-live="polite">
        {selected.length ? `Ausgewählt: ${selectedLabel}` : 'Noch keine Tags ausgewählt.'}
      </div>
      {categories.map((category) => (
        <section key={category.id} className="space-y-2">
          <header className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-text">{category.name}</h4>
            <span className="text-xs text-text-muted">{category.tags.length} Tags</span>
          </header>
          <div className="flex flex-wrap gap-2">
            {category.tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className={clsx(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                  isActive(tag.id)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-text border-border hover:bg-surface"
                )}
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

