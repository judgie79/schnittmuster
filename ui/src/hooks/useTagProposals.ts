import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { PatternTagProposalDTO } from 'shared-dtos'
import { tagService } from '@/services'

const TAG_PROPOSALS_QUERY_KEY = ['tagProposals'] as const

export const useTagProposals = () => {
  const queryClient = useQueryClient()

  const query = useQuery<PatternTagProposalDTO[], Error>({
    queryKey: TAG_PROPOSALS_QUERY_KEY,
    queryFn: () => tagService.listProposals(),
    staleTime: 30 * 1000,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: TAG_PROPOSALS_QUERY_KEY })
    queryClient.invalidateQueries({ queryKey: ['tagCategories'] })
  }

  const approveMutation = useMutation({
    mutationFn: (proposalId: string) => tagService.approveProposal(proposalId),
    onSuccess: invalidate,
  })

  const rejectMutation = useMutation({
    mutationFn: (proposalId: string) => tagService.rejectProposal(proposalId),
    onSuccess: invalidate,
  })

  return {
    ...query,
    approve: (proposalId: string) => approveMutation.mutateAsync(proposalId),
    reject: (proposalId: string) => rejectMutation.mutateAsync(proposalId),
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
  }
}
