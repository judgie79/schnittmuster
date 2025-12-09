import { FaSearch } from 'react-icons/fa'

interface SearchBarProps {
  placeholder?: string
  value?: string
  onChange: (value: string) => void
}

export const SearchBar = ({ placeholder = 'Suche Schnittmuster...', value, onChange }: SearchBarProps) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
        <FaSearch />
      </div>
      <input
        className="block w-full pl-10 pr-3 py-3 border border-border rounded-lg bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors shadow-sm"
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

