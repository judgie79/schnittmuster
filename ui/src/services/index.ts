// Re-export core services
export { 
  apiClient, 
  authService, 
  patternService, 
  tagService, 
  measurementService 
} from '@schnittmuster/core'
export type { PatternRequestOptions } from '@schnittmuster/core'

// UI-specific services
export * from './adminService'
export * from './patternPrinter'
