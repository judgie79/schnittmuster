import { useQuery } from '@tanstack/react-query'
import { patternService } from '@/services'
import type { PatternDTO } from 'shared-dtos'

export const usePattern = (patternId: string | undefined) => {
  return useQuery<PatternDTO, Error>({
    queryKey: ['pattern', patternId],
    queryFn: () => {
      if (!patternId) {
        throw new Error('Pattern ID is missing')
      }
      return patternService.get(patternId)
    },
    enabled: Boolean(patternId),
  })
}
