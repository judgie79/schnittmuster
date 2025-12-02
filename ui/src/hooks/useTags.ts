import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { tagService } from '@/services'
import { useGlobalContext } from '@/context'
import type { TagCategoryDTO } from 'shared-dtos'

export const useTags = () => {
  const { state, dispatch } = useGlobalContext()

  const query = useQuery<TagCategoryDTO[], Error>({
    queryKey: ['tagCategories'],
    queryFn: () => tagService.getCategories(),
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (query.data) {
      dispatch({ type: 'FETCH_TAGS_SUCCESS', payload: query.data })
    }
  }, [dispatch, query.data])

  return {
    ...query,
    categories: query.data ?? state.tags.categories,
  }
}
