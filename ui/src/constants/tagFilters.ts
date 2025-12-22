import type { PatternStatus } from 'shared-dtos'

export const STATUS_LABELS: Record<PatternStatus, string> = {
  draft: 'Entwurf',
  geplant: 'Geplant',
  genaeht: 'Genäht',
  getestet: 'Getestet',
  archiviert: 'Archiviert',
}
