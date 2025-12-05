import type { FilterState } from '@/context/types'
import type { PatternStatus } from 'shared-dtos'

export type TagFilterKey = Extract<keyof FilterState, 'zielgruppe' | 'kleidungsart' | 'hersteller' | 'lizenz' | 'groesse' | 'status'>

export interface TagFilterSectionConfig {
  id: TagFilterKey
  title: string
  categoryName: string
  description?: string
}

export const TAG_SECTION_CONFIG: TagFilterSectionConfig[] = [
  {
    id: 'zielgruppe',
    title: 'Zielgruppe',
    categoryName: 'Zielgruppe',
    description: 'Für wen ist das Schnittmuster gedacht?',
  },
  { id: 'kleidungsart', title: 'Kleidungsart', categoryName: 'Kleidungsart' },
  { id: 'hersteller', title: 'Designer:innen', categoryName: 'Hersteller' },
  { id: 'lizenz', title: 'Lizenz', categoryName: 'Lizenz' },
  { id: 'groesse', title: 'Größe', categoryName: 'Größe', description: 'Verfügbare Größenbereiche' },
]

export const STATUS_LABELS: Record<PatternStatus, string> = {
  draft: 'Entwurf',
  geplant: 'Geplant',
  genaeht: 'Genäht',
  getestet: 'Getestet',
  archiviert: 'Archiviert',
}

export const getFilterKeyForCategory = (categoryName: string): TagFilterKey | undefined => {
  const normalized = categoryName.toLowerCase()
  const match = TAG_SECTION_CONFIG.find((entry) => entry.categoryName.toLowerCase() === normalized)
  return match?.id
}
