import type { PatternDTO } from 'shared-dtos'
import styles from './PatternCard.module.css'

interface PatternCardProps {
  pattern: PatternDTO
  onFavoriteToggle?: (pattern: PatternDTO) => void
}

export const PatternCard = ({ pattern, onFavoriteToggle }: PatternCardProps) => {
  const tags = pattern.tags.slice(0, 3)

  return (
    <article className={styles.card}>
      <img
        src={pattern.thumbnailUrl ?? 'https://placehold.co/600x400?text=Schnittmuster'}
        alt={pattern.name}
        className={styles.thumbnail}
        loading="lazy"
      />
      <div className={styles.meta}>
        <span>{pattern.status.toUpperCase()}</span>
        <button type="button" onClick={() => onFavoriteToggle?.(pattern)}>
          {pattern.isFavorite ? '★' : '☆'}
        </button>
      </div>
      <h3>{pattern.name}</h3>
      <div className={styles.tagList}>
        {tags.map((tag) => (
          <span key={tag.id} className={styles.tag}>
            {tag.name}
          </span>
        ))}
      </div>
    </article>
  )
}
