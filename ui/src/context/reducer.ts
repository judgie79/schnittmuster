import type { GlobalAction, GlobalState } from './types'

export const defaultFilters = {
  query: '',
  zielgruppe: [],
  kleidungsart: [],
  hersteller: [],
  lizenz: [],
  groesse: [],
  status: [],
  favoriteOnly: false,
}

export const initialState: GlobalState = {
  auth: {
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
  },
  patterns: {
    items: [],
    isLoading: false,
    error: null,
    pagination: null,
    filters: defaultFilters,
  },
  tags: {
    categories: [],
    items: [],
    isLoading: false,
  },
  ui: {
    theme: 'auto',
    textSize: 'normal',
    language: 'de',
    toasts: [],
  },
}

export const globalReducer = (state: GlobalState, action: GlobalAction): GlobalState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        auth: {
          user: action.payload,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
      }
    case 'LOGIN_ERROR':
      return {
        ...state,
        auth: {
          ...state.auth,
          error: action.payload,
          isAuthenticated: false,
          user: null,
        },
      }
    case 'LOGOUT':
      return { ...state, auth: { user: null, isAuthenticated: false, isLoading: false, error: null } }
    case 'FETCH_PATTERNS_START':
      return { ...state, patterns: { ...state.patterns, isLoading: true, error: null } }
    case 'FETCH_PATTERNS_SUCCESS':
      return {
        ...state,
        patterns: {
          ...state.patterns,
          isLoading: false,
          items: action.payload.items,
          pagination: action.payload.pagination,
        },
      }
    case 'FETCH_PATTERNS_ERROR':
      return {
        ...state,
        patterns: { ...state.patterns, isLoading: false, error: action.payload },
      }
    case 'SET_FILTERS':
      return {
        ...state,
        patterns: {
          ...state.patterns,
          filters: { ...state.patterns.filters, ...action.payload },
        },
      }
    case 'FETCH_TAGS_SUCCESS':
      return {
        ...state,
        tags: {
          categories: action.payload,
          items: action.payload.flatMap((category) => category.tags),
          isLoading: false,
        },
      }
    case 'SET_THEME':
      return { ...state, ui: { ...state.ui, theme: action.payload } }
    case 'SET_TEXT_SIZE':
      return { ...state, ui: { ...state.ui, textSize: action.payload } }
    case 'SET_LANGUAGE':
      return { ...state, ui: { ...state.ui, language: action.payload } }
    case 'ADD_TOAST':
      return { ...state, ui: { ...state.ui, toasts: [...state.ui.toasts, action.payload] } }
    case 'REMOVE_TOAST':
      return {
        ...state,
        ui: {
          ...state.ui,
          toasts: state.ui.toasts.filter((toast) => toast.id !== action.payload),
        },
      }
    default:
      return state
  }
}
