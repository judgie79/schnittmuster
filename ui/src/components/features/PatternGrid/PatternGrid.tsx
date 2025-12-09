import type { PatternDTO } from 'shared-dtos'
import { PatternCard } from '../PatternCard/PatternCard'

interface PatternGridProps {
  patterns: PatternDTO[]
  onFavoriteToggle?: (pattern: PatternDTO) => void
}

export const PatternGrid = ({ patterns, onFavoriteToggle }: PatternGridProps) => {
  if (!patterns.length) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p>Keine Schnittmuster gefunden.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {patterns.map((pattern) => (
        <PatternCard key={pattern.id} pattern={pattern} onFavoriteToggle={onFavoriteToggle} />
      ))}
    </div>
  )
}

