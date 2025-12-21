import styles from './FilterPanel.module.css'

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
    <aside className={styles.panel}>
      <header className={styles.header}>
        <div>
          <p className={styles.title}>Filter</p>
          <span className={styles.caption}>{formatActiveLabel(activeFilterCount)}</span>
        </div>
        {onClearAll && (
          <button type="button" className={styles.clearButton} onClick={onClearAll}>
            Zurücksetzen
          </button>
        )}
      </header>

      {sections.map((section) => (
        <div key={section.id} className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>{section.title}</h3>
            {onClearSection && section.selectedValues.length > 0 && (
              <button
                type="button"
                className={styles.clearChip}
                onClick={() => onClearSection(section.id)}
              >
                Löschen
              </button>
            )}
          </div>
          {section.description && <p className={styles.sectionDescription}>{section.description}</p>}
          <div className={styles.optionGrid}>
            {section.options.map((option) => {
              const isActive = section.selectedValues.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.option} ${isActive ? styles.optionActive : ''}`.trim()}
                  onClick={() => onToggle(section.id, option.value)}
                  aria-pressed={isActive}
                >
                  <span>
                    {option.label}
                    {option.hint && <small className={styles.hint}>{option.hint}</small>}
                  </span>
                  {typeof option.count === 'number' && <span className={styles.count}>{option.count}</span>}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {onFavoriteToggle && (
        <div className={styles.favoriteToggle}>
          <label>
            <input type="checkbox" checked={favoriteOnly} onChange={onFavoriteToggle} />
            Nur Favoriten anzeigen
          </label>
        </div>
      )}
    </aside>
  )
}
