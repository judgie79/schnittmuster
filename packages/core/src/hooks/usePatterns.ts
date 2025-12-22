import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { patternService } from '../services/patterns';
import type { PatternRequestOptions } from '../types/patterns';
import { usePatternStore } from '../store/patternStore';

const PATTERNS_QUERY_KEY = ['patterns'];

export const usePatterns = (page = 1) => {
  const { filters, setFilters, resetFilters } = usePatternStore();
  const queryClient = useQueryClient();

  const selectedTagIds = Object.values(filters.tagFilters ?? {}).flat();
  
  // Build clean request filters - only include defined values
  const requestFilters: Record<string, unknown> = {};
  if (filters.query) requestFilters.query = filters.query;
  if (filters.favoriteOnly) requestFilters.favoriteOnly = filters.favoriteOnly;
  if (filters.status.length) requestFilters.status = filters.status;
  if (selectedTagIds.length) requestFilters.tagIds = selectedTagIds;

  const query = useQuery({
    queryKey: [...PATTERNS_QUERY_KEY, page, requestFilters],
    queryFn: () =>
      patternService.list({
        page,
        filters: requestFilters,
      }),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const createMutation = useMutation({
    mutationFn: ({ formData, options }: { formData: FormData; options?: PatternRequestOptions }) =>
      patternService.create(formData, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATTERNS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
      options,
    }: {
      id: string;
      payload: FormData | Partial<any>;
      options?: PatternRequestOptions;
    }) => patternService.update(id, payload, options),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PATTERNS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['pattern', data.id] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => patternService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATTERNS_QUERY_KEY });
    },
  });

  return {
    ...query,
    filters,
    setFilters,
    resetFilters,
    mutate: {
      create: (formData: FormData, options?: PatternRequestOptions) =>
        createMutation.mutateAsync({ formData, options }),
      update: (id: string, payload: FormData | Partial<any>, options?: PatternRequestOptions) =>
        updateMutation.mutateAsync({ id, payload, options }),
      remove: (id: string) => removeMutation.mutateAsync(id),
    },
    mutations: {
      create: createMutation,
      update: updateMutation,
      remove: removeMutation,
    },
    items: query.data?.data ?? [],
    pagination: query.data?.pagination ?? null,
  };
};
