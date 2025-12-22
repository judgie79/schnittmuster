// Re-export core services
export { apiClient, authService, patternService, tagService } from '@schnittmuster/core'
export type { PatternRequestOptions } from '@schnittmuster/core'

// UI-specific services
export * from './fileService'
export * from './adminService'
export * from './patternPrinter'
