import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import type { PatternDTO } from 'shared-dtos'
import { resolveAssetUrl } from '@/utils'
import { FaHeart, FaRegHeart } from 'react-icons/fa'

interface PatternCardProps {
  pattern: PatternDTO
  onFavoriteToggle?: (pattern: PatternDTO) => void
}

export const PatternCard = ({ pattern, onFavoriteToggle }: PatternCardProps) => {
  const tags = pattern.tags.slice(0, 3)
  const handleFavoriteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    onFavoriteToggle?.(pattern)
  }

  const thumbnailSrc = resolveAssetUrl(pattern.thumbnailUrl) ?? 'https://placehold.co/600x400?text=Schnittmuster'

  return (
    <article className="group relative bg-surface rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/patterns/${pattern.id}`} className="block" aria-label={`${pattern.name} öffnen`}>
        <div className="aspect-[4/3] w-full overflow-hidden bg-background">
          <img
            src={thumbnailSrc}
            alt={pattern.name}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-text truncate pr-2">{pattern.name}</h3>
            <button 
              type="button" 
              className="text-primary p-1 -mr-1 hover:bg-background rounded-full transition-colors" 
              onClick={handleFavoriteClick} 
              aria-label="Favorit umschalten"
            >
              {pattern.isFavorite ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((tag) => (
              <span 
                key={tag.id} 
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-background text-text-muted border border-border"
              >
                {tag.name}
              </span>
            ))}
            {pattern.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-background text-text-muted border border-border">
                +{pattern.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}

