import type { PatternDTO } from '@schnittmuster/dtos'
import { PatternCard } from '../PatternCard/PatternCard'
import styles from './PatternGrid.module.css'

interface PatternGridProps {
  patterns: PatternDTO[]
  onFavoriteToggle?: (pattern: PatternDTO) => void
}

export const PatternGrid = ({ patterns, onFavoriteToggle }: PatternGridProps) => {
  if (!patterns.length) {
    return <p>Keine Schnittmuster gefunden.</p>
  }

  return (
    <div className={styles.grid}>
      {patterns.map((pattern) => (
        <PatternCard key={pattern.id} pattern={pattern} onFavoriteToggle={onFavoriteToggle} />
      ))}
    </div>
  )
}
