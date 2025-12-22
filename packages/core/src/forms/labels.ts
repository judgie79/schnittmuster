import type { PatternStatus } from '@schnittmuster/dtos'

// const STATUS_OPTIONS: Array<{ value: PatternStatus; label: string }> = [
//   { value: 'draft', label: 'Entwurf' },
//   { value: 'geplant', label: 'Geplant' },
//   { value: 'genaeht', label: 'Genäht' },
//   { value: 'getestet', label: 'Getestet' },
//   { value: 'archiviert', label: 'Archiviert' },
// ]

export const STATUS_LABELS: Record<PatternStatus, string> = {
  draft: 'Entwurf',
  geplant: 'Geplant',
  genaeht: 'Genäht',
  getestet: 'Getestet',
  archiviert: 'Archiviert',
}