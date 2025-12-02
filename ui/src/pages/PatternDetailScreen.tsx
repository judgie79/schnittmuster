import { useParams } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import { Loader } from '@/components/common/Loader'
import { Badge } from '@/components/common/Badge'
import { usePattern } from '@/hooks'
import styles from './Page.module.css'

export const PatternDetailScreen = () => {
  const { patternId } = useParams()
  const { data, isLoading, error } = usePattern(patternId)

  if (isLoading) {
    return <Loader />
  }

  if (error || !data) {
    return <p>Pattern konnte nicht geladen werden.</p>
  }

  return (
    <section className={styles.section}>
      <img src={data.thumbnailUrl} alt={data.name} style={{ width: '100%', borderRadius: 12 }} />
      <h2>{data.name}</h2>
      <p>{data.description}</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {data.tags.map((tag) => (
          <Badge key={tag.id}>{tag.name}</Badge>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        <Button>📥 Datei öffnen</Button>
        <Button variant="secondary">✓ Als genäht markieren</Button>
        <Button variant="ghost">★ Favorisieren</Button>
      </div>
    </section>
  )
}
