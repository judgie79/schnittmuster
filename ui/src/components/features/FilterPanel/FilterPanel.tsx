import { clsx } from 'clsx'

interface FilterOption {
  label: string
  value: string
  hint?: string
  count?: number
}

interface FilterSection {
  id: string
  title: string
  description?: string
  options: FilterOption[]
  selectedValues: string[]
}

interface FilterPanelProps {
  sections: FilterSection[]
  onToggle: (sectionId: string, value: string) => void
  onClearSection?: (sectionId: string) => void
  onClearAll?: () => void
  favoriteOnly?: boolean
  onFavoriteToggle?: () => void
  activeFilterCount?: number
}

const formatActiveLabel = (count = 0) => {
  if (!count) return 'Keine aktiven Filter'
  if (count === 1) return '1 aktiver Filter'
  return `${count} aktive Filter`
}

export const FilterPanel = ({
  sections,
  onToggle,
  onClearSection,
  onClearAll,
  favoriteOnly = false,
  onFavoriteToggle,
  activeFilterCount = 0,
}: FilterPanelProps) => {
  return (
    <aside className="w-full bg-surface rounded-xl p-4 border border-border">
      <header className="flex justify-between items-center mb-6">
        <div>
          <p className="text-lg font-bold text-text">Filter</p>
          <span className="text-sm text-text-muted">{formatActiveLabel(activeFilterCount)}</span>
        </div>
        {onClearAll && (
          <button 
            type="button" 
            className="text-sm text-primary hover:text-primary-hover font-medium transition-colors" 
            onClick={onClearAll}
          >
            Zurücksetzen
          </button>
        )}
      </header>

      {sections.map((section) => (
        <div key={section.id} className="mb-6 last:mb-0">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-text">{section.title}</h3>
            {onClearSection && section.selectedValues.length > 0 && (
              <button
                type="button"
                className="text-xs text-text-muted hover:text-text transition-colors"
                onClick={() => onClearSection(section.id)}
              >
                Löschen
              </button>
            )}
          </div>
          {section.description && <p className="text-xs text-text-muted mb-3">{section.description}</p>}
          <div className="flex flex-wrap gap-2">
            {section.options.map((option) => {
              const isActive = section.selectedValues.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  className={clsx(
                    "px-3 py-1.5 rounded-full text-sm border transition-colors text-left flex items-center gap-2",
                    isActive 
                      ? "border-primary bg-primary/10 text-primary font-medium" 
                      : "border-border bg-background text-text hover:border-primary/50"
                  )}
                  onClick={() => onToggle(section.id, option.value)}
                  aria-pressed={isActive}
                >
                  <span>
                    {option.label}
                    {option.hint && <small className="block text-xs opacity-70">{option.hint}</small>}
                  </span>
                  {typeof option.count === 'number' && <span className="ml-auto text-xs opacity-70">{option.count}</span>}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {onFavoriteToggle && (
        <div className="mt-6 pt-6 border-t border-border">
          <label className="flex items-center gap-2 cursor-pointer text-text hover:text-primary transition-colors">
            <input 
              type="checkbox" 
              checked={favoriteOnly} 
              onChange={onFavoriteToggle}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium">Nur Favoriten anzeigen</span>
          </label>
        </div>
      )}
    </aside>
  )
}
