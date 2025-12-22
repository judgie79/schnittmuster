import { useQuery } from '@tanstack/react-query';
import { tagService } from '../services/tags';
import type { TagCategoryDTO } from 'schnittmuster-manager-dtos';

export const useTags = () => {
  const query = useQuery<TagCategoryDTO[], Error>({
    queryKey: ['tagCategories'],
    queryFn: () => tagService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    categories: query.data ?? [],
  };
};
