import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/common/Button'
import { Loader } from '@/components/common/Loader'
import { Badge } from '@/components/common/Badge'
import { usePattern, useTags, useProtectedFile } from '@/hooks'
import { useGlobalContext } from '@/context'
import { patternService, tagService, fileService } from '@/services'
import { createToast } from '@/utils'
import type { PatternTagProposalDTO, TagProposalStatus } from 'shared-dtos'
import styles from './Page.module.css'

const PROPOSAL_STATUS_LABELS: Record<TagProposalStatus, string> = {
  pending: 'Ausstehend',
  approved: 'Freigegeben',
  rejected: 'Abgelehnt',
}

const DEFAULT_PROPOSAL_COLOR = '#2F6FED'

export const PatternDetailScreen = () => {
  const { patternId } = useParams()
  const queryClient = useQueryClient()
  const { state, dispatch } = useGlobalContext()
  const { categories } = useTags()
  const { data, isLoading, error, refetch } = usePattern(patternId)
  const { url: thumbnailBlobUrl } = useProtectedFile(data?.thumbnailUrl)
  const [proposalName, setProposalName] = useState('')
  const [proposalCategoryId, setProposalCategoryId] = useState('')
  const [proposalColor, setProposalColor] = useState(DEFAULT_PROPOSAL_COLOR)
  const [proposalError, setProposalError] = useState<string | null>(null)
  const [isDownloadingFile, setIsDownloadingFile] = useState(false)

  const userId = state.auth.user?.id
  const isAdmin = Boolean(state.auth.user?.adminRole)
  const isOwner = data?.ownerId === userId

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

  const handleProposalSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!proposalName.trim() || !proposalCategoryId || proposalMutation.isPending) {
      return
    }
    proposalMutation.mutate()
  }

  const handleApprove = (proposalId: string) => {
    approveMutation.mutate(proposalId)
  }

  const handleReject = (proposalId: string) => {
    rejectMutation.mutate(proposalId)
  }

  const handleFileOpen = async () => {
    if (!data?.fileUrl || isDownloadingFile) {
      return
    }
    setIsDownloadingFile(true)
    try {
      const blob = await fileService.get(data.fileUrl)
      const objectUrl = URL.createObjectURL(blob)
      const newWindow = window.open(objectUrl, '_blank', 'noopener')
      if (newWindow) {
        newWindow.focus()
      }
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : 'Datei konnte nicht geladen werden.'
      dispatch({ type: 'ADD_TOAST', payload: createToast(message, 'error') })
    } finally {
      setIsDownloadingFile(false)
    }
  }

  const getStatusClass = (status: TagProposalStatus) => {
    switch (status) {
      case 'approved':
        return styles.proposalStatusApproved
      case 'rejected':
        return styles.proposalStatusRejected
      default:
        return styles.proposalStatusPending
    }
  }

  const sortedProposals = useMemo<PatternTagProposalDTO[]>(() => {
    return [...proposals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [proposals])

  if (isLoading) {
    return <Loader />
  }

  if (error || !data) {
    return <p>Pattern konnte nicht geladen werden.</p>
  }

  return (
    <section className={styles.section}>
      <img
        src={thumbnailBlobUrl ?? 'https://placehold.co/1200x800?text=Schnittmuster'}
        alt={data.name}
        className={styles.detailImage}
      />
      <header className={styles.sectionHeader}>
        <div>
          <h2>{data.name}</h2>
          <p className={styles.helperText}>{data.description ?? 'Keine Beschreibung hinterlegt.'}</p>
        </div>
        <Badge>{data.status.toUpperCase()}</Badge>
      </header>

      <div className={styles.tagSection}>
        <h3>Tags</h3>
        <div className={styles.tagList}>
          {data.tags.length ? (
            data.tags.map((tag) => (
              <span key={tag.id} className={styles.tagChip}>
                <span className={styles.colorDot} style={{ backgroundColor: tag.colorHex ?? '#555' }} aria-hidden />
                {tag.name}
              </span>
            ))
          ) : (
            <p className={styles.helperText}>Noch keine Tags zugewiesen.</p>
          )}
        </div>
      </div>

      <div className={styles.actionGrid}>
        <Button
          type="button"
          onClick={handleFileOpen}
          disabled={!data.fileUrl || isDownloadingFile}
        >
          {isDownloadingFile ? 'Datei öffnen …' : '📥 Datei öffnen'}
        </Button>
        <Button variant="secondary">✓ Als genäht markieren</Button>
        <Button variant="ghost">★ Favorisieren</Button>
      </div>

      {canProposeTag ? (
        <div className={styles.proposalForm}>
          <h3>Neuen Tag vorschlagen</h3>
          <form className={styles.formGrid} onSubmit={handleProposalSubmit}>
            <label>
              <span>Bezeichnung</span>
              <input
                type="text"
                value={proposalName}
                onChange={(event) => setProposalName(event.target.value)}
                placeholder="z. B. Oversized"
                required
              />
            </label>
            <label>
              <span>Kategorie</span>
              <select value={proposalCategoryId} onChange={(event) => setProposalCategoryId(event.target.value)} required>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Farbe</span>
              <input type="color" value={proposalColor} onChange={(event) => setProposalColor(event.target.value)} />
            </label>
            <Button
              type="submit"
              disabled={!proposalName.trim() || !proposalCategoryId || proposalMutation.isPending}
            >
              {proposalMutation.isPending ? 'Sende Vorschlag ...' : 'Tag vorschlagen'}
            </Button>
          </form>
          {proposalError ? <p className={styles.errorMessage}>{proposalError}</p> : null}
        </div>
      ) : null}

      {sortedProposals.length > 0 && (
        <section className={styles.proposalSection}>
          <header className={styles.sectionHeader}>
            <h3>Vorgeschlagene Tags</h3>
            <span className={styles.helperText}>
              {pendingProposals.length ? `${pendingProposals.length} offen` : 'Nichts offen'}
            </span>
          </header>
          <div className={styles.proposalList}>
            {sortedProposals.map((proposal) => (
              <article key={proposal.id} className={styles.proposalCard}>
                <div className={styles.proposalHeader}>
                  <div className={styles.proposalTitle}>
                    <span className={styles.colorDot} style={{ backgroundColor: proposal.colorHex }} aria-hidden />
                    <div>
                      <strong>{proposal.name}</strong>
                      <p className={styles.helperText}>{proposal.category?.name ?? 'Kategorie unbekannt'}</p>
                    </div>
                  </div>
                  <Badge className={clsx(styles.proposalStatus, getStatusClass(proposal.status))}>
                    {PROPOSAL_STATUS_LABELS[proposal.status]}
                  </Badge>
                </div>
                <p className={styles.helperText}>
                  Vorgeschlagen von {proposal.proposedBy?.username ?? 'Unbekannt'} ·{' '}
                  {new Date(proposal.createdAt).toLocaleDateString('de-DE')}
                </p>
                {isAdmin && proposal.status === 'pending' ? (
                  <div className={styles.proposalActions}>
                    <Button
                      type="button"
                      onClick={() => handleApprove(proposal.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                    >
                      Freigeben
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleReject(proposal.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                    >
                      Ablehnen
                    </Button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  )
}
