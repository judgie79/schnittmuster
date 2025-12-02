import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export const formatDate = (value: string | Date) => {
  const date = typeof value === 'string' ? new Date(value) : value
  return format(date, 'dd.MM.yyyy', { locale: de })
}
