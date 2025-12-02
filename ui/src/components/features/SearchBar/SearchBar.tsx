import styles from './SearchBar.module.css'

interface SearchBarProps {
  placeholder?: string
  onChange: (value: string) => void
}

export const SearchBar = ({ placeholder = 'Suche Schnittmuster...', onChange }: SearchBarProps) => {
  return (
    <label className={styles.wrapper}>
      <span aria-hidden>🔍</span>
      <input
        className={styles.input}
        type="search"
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
