import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader } from '@/components/common/Loader'
import { usePattern, useTags } from '@/hooks'
import { useGlobalContext } from '@/context'
import { patternService, tagService } from '@/services'
import { createToast, printAssetFromUrl, resolveAssetUrl } from '@/utils'
import type { TagProposalStatus } from 'shared-dtos'
import { FaEdit, FaPrint, FaTag, FaCheck, FaTimes } from 'react-icons/fa'

const DEFAULT_PROPOSAL_COLOR = '#2F6FED'

export const PatternDetailScreen = () => {
  const { patternId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { state, dispatch } = useGlobalContext()
  const { categories } = useTags()
  const { data, isLoading, error, refetch } = usePattern(patternId)
  const [proposalName, setProposalName] = useState('')
  const [proposalCategoryId, setProposalCategoryId] = useState('')
  const [proposalColor, setProposalColor] = useState(DEFAULT_PROPOSAL_COLOR)
  const [proposalError, setProposalError] = useState<string | null>(null)

  const userId = state.auth.user?.id
  const isAdmin = Boolean(state.auth.user?.adminRole)
  const isOwner = data?.ownerId === userId
  const canEditPattern = Boolean(patternId) && (isOwner || isAdmin)

  useEffect(() => {
    if (!proposalCategoryId && categories.length) {
      setProposalCategoryId(categories[0].id)
    }
  }, [categories, proposalCategoryId])

  const proposals = data?.proposedTags ?? []
  const pendingProposals = proposals.filter((proposal) => proposal.status === 'pending')
  const canProposeTag = Boolean(patternId) && Boolean(isOwner)

  const proposalMutation = useMutation({
    mutationFn: () =>
      patternId
        ? patternService.createTagProposal(patternId, {
            name: proposalName.trim(),
            tagCategoryId: proposalCategoryId,
            colorHex: proposalColor,
          })
        : Promise.reject(new Error('Missing Pattern ID')),
    onSuccess: () => {
      setProposalName('')
      setProposalError(null)
      dispatch({ type: 'ADD_TOAST', payload: createToast('Tag vorgeschlagen', 'success') })
      refetch()
    },
    onError: (mutationError) => {
      const message = mutationError instanceof Error ? mutationError.message : 'Vorschlag fehlgeschlagen'
      setProposalError(message)
      dispatch({ type: 'ADD_TOAST', payload: createToast(message, 'error') })
    },
  })

  const approveMutation = useMutation({
    mutationFn: (proposalId: string) => tagService.approveProposal(proposalId),
    onSuccess: () => {
      dispatch({ type: 'ADD_TOAST', payload: createToast('Tag freigegeben', 'success') })
      refetch()
      queryClient.invalidateQueries({ queryKey: ['tagCategories'] })
      queryClient.invalidateQueries({ queryKey: ['tagProposals'] })
    },
    onError: (mutationError) => {
      const message = mutationError instanceof Error ? mutationError.message : 'Konnte Vorschlag nicht freigeben'
      dispatch({ type: 'ADD_TOAST', payload: createToast(message, 'error') })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (proposalId: string) => tagService.rejectProposal(proposalId),
    onSuccess: () => {
      dispatch({ type: 'ADD_TOAST', payload: createToast('Vorschlag abgelehnt', 'info') })
      refetch()
      queryClient.invalidateQueries({ queryKey: ['tagCategories'] })
      queryClient.invalidateQueries({ queryKey: ['tagProposals'] })
    },
    onError: (mutationError) => {
      const message = mutationError instanceof Error ? mutationError.message : 'Konnte Vorschlag nicht ablehnen'
      dispatch({ type: 'ADD_TOAST', payload: createToast(message, 'error') })
    },
  })

  if (isLoading) return <div className="flex justify-center py-12"><Loader /></div>
  if (error || !data) return <div className="p-4 text-center text-error">Fehler beim Laden des Schnittmusters</div>

  const thumbnailSrc = resolveAssetUrl(data.thumbnailUrl) ?? 'https://placehold.co/800x600?text=Schnittmuster'

  return (
    <div className="space-y-6 pb-20">
      {/* Hero Image */}
      <div className="aspect-video w-full overflow-hidden rounded-xl shadow-sm bg-background -mt-4 mx-auto max-w-2xl">
        <img
          src={thumbnailSrc}
          alt={data.name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold text-text">{data.name}</h1>
          {canEditPattern && (
            <button
              onClick={() => navigate(`/patterns/${patternId}/edit`)}
              className="p-2 text-primary hover:bg-background rounded-full transition-colors"
              aria-label="Bearbeiten"
            >
              <FaEdit size={20} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {data.tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-primary/10 text-primary"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => data.fileUrl && printAssetFromUrl(data.fileUrl)}
          disabled={!data.fileUrl}
          className="flex items-center justify-center gap-2 p-4 rounded-xl bg-surface border border-border shadow-sm hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaPrint className="text-primary" size={24} />
          <span className="font-medium">Drucken</span>
        </button>
        {/* Add more actions here if needed */}
      </div>

      {/* Tag Proposals Section */}
      {(canProposeTag || (isAdmin && pendingProposals.length > 0)) && (
        <div className="bg-surface rounded-xl p-4 shadow-sm border border-border space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FaTag className="text-primary" />
            Tags verwalten
          </h3>

          {canProposeTag && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                proposalMutation.mutate()
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Neuer Tag</label>
                <input
                  type="text"
                  value={proposalName}
                  onChange={(e) => setProposalName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-border bg-background"
                  placeholder="z.B. Sommerkleid"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={proposalCategoryId}
                  onChange={(e) => setProposalCategoryId(e.target.value)}
                  className="flex-1 p-2 rounded-lg border border-border bg-background"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <input
                  type="color"
                  value={proposalColor}
                  onChange={(e) => setProposalColor(e.target.value)}
                  className="h-10 w-10 rounded-lg border border-border p-1 bg-background cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={!proposalName || proposalMutation.isPending}
                className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
              >
                Vorschlagen
              </button>
            </form>
          )}

          {isAdmin && pendingProposals.length > 0 && (
            <div className="space-y-2 mt-4 pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-text-muted">Ausstehende Vorschläge</h4>
              {pendingProposals.map((proposal) => (
                <div key={proposal.id} className="flex items-center justify-between bg-background p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: proposal.colorHex }} />
                    <span>{proposal.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => approveMutation.mutate(proposal.id)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                    >
                      <FaCheck />
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate(proposal.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

