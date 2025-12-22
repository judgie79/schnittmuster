import type { PatternDTO, PaginationInfo, TagCategoryDTO, TagDTO, UserDTO } from 'shared-dtos'

export type ThemeMode = 'light' | 'dark' | 'auto'
export type TextSize = 'normal' | 'large'
export type Language = 'de' | 'en'

export interface ToastItem {
  id: string
  message: string
  tone: 'success' | 'error' | 'info'
}

export interface FilterState {
  query: string
  status: string[],
  tagIds: string[],
  favoriteOnly: boolean
}

export interface AuthSlice {
  user: UserDTO | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

export interface PatternSlice {
  items: PatternDTO[]
  isLoading: boolean
  error: string | null
  pagination: PaginationInfo | null
  filters: FilterState
}

export interface TagSlice {
  categories: TagCategoryDTO[]
  items: TagDTO[]
  isLoading: boolean
}

export interface UISlice {
  theme: ThemeMode
  textSize: TextSize
  language: Language
  toasts: ToastItem[]
}

export interface GlobalState {
  auth: AuthSlice
  patterns: PatternSlice
  tags: TagSlice
  ui: UISlice
}

export type GlobalAction =
  | { type: 'LOGIN_SUCCESS'; payload: UserDTO }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'FETCH_PATTERNS_START' }
  | { type: 'FETCH_PATTERNS_SUCCESS'; payload: { items: PatternDTO[]; pagination: PaginationInfo } }
  | { type: 'FETCH_PATTERNS_ERROR'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<FilterState> }
  | { type: 'FETCH_TAGS_SUCCESS'; payload: TagCategoryDTO[] }
  | { type: 'SET_THEME'; payload: ThemeMode }
  | { type: 'SET_TEXT_SIZE'; payload: TextSize }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'ADD_TOAST'; payload: ToastItem }
  | { type: 'REMOVE_TOAST'; payload: string }
