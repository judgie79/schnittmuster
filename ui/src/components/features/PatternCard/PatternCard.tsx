import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { useProtectedFile } from '@/hooks'
import type { PatternDTO } from '@schnittmuster/dtos'
import styles from './PatternCard.module.css'

interface PatternCardProps {
  pattern: PatternDTO
  onFavoriteToggle?: (pattern: PatternDTO) => void
}

export const PatternCard = ({ pattern, onFavoriteToggle }: PatternCardProps) => {
  const tags = pattern.tags.slice(0, 3)
  const { url: thumbnailBlobUrl } = useProtectedFile(pattern.thumbnailUrl)
  const handleFavoriteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    onFavoriteToggle?.(pattern)
  }

  return (
    <article className={styles.card}>
      <Link to={`/patterns/${pattern.id}`} className={styles.cardLink} aria-label={`${pattern.name} öffnen`}>
        <img
          src={thumbnailBlobUrl ?? pattern.thumbnailUrl ?? 'https://placehold.co/600x400?text=Schnittmuster'}
          alt={pattern.name}
          className={styles.thumbnail}
          loading="lazy"
        />
        <div className={styles.meta}>
          <span>{pattern.status.toUpperCase()}</span>
          <button type="button" className={styles.favoriteButton} onClick={handleFavoriteClick} aria-label="Favorit umschalten">
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
      </Link>
    </article>
  )
}
