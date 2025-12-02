import { PatternGrid } from '@/components/features/PatternGrid/PatternGrid'
import { SearchBar } from '@/components/features/SearchBar/SearchBar'
import { Button } from '@/components/common/Button'
import { Loader } from '@/components/common/Loader'
import { usePatterns } from '@/hooks'
import styles from './Page.module.css'

const QUICK_FILTERS = ['Damen', 'Herren', 'Shirts', 'Favoriten', 'Filter']

export const DashboardScreen = () => {
  const { items, isLoading, error, setFilters } = usePatterns()

  return (
    <section className={styles.section}>
      <SearchBar onChange={(value) => setFilters({ query: value })} />

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
        {QUICK_FILTERS.map((filter) => (
          <Button key={filter} variant="secondary">
            {filter}
          </Button>
        ))}
      </div>

      {isLoading ? <Loader /> : null}
      {error ? <p>Fehler beim Laden: {error.message}</p> : null}

      {!isLoading ? <PatternGrid patterns={items} /> : null}
    </section>
  )
}
