// Re-export core hooks (including usePatterns)
export { useAuth, usePattern, usePatterns, useTags, useAllTags } from '@schnittmuster/core'

// UI-specific hooks
export * from './useSearch'
export * from './useLocalStorage'
export * from './useInfiniteScroll'
export * from './useAdminDashboard'
export * from './useAdminUsers'
export * from './useAdminSettings'
export * from './useTagProposals'
export * from './useProtectedFile'
