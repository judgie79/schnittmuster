import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Loader } from '@/components/common/Loader'
import { useGlobalContext } from '@/context'
import { useTagProposals, useTags } from '@/hooks'
import { tagService } from '@/services'
import { createToast } from '@/utils'
import type { TagCategoryDTO, TagDTO } from '@schnittmuster/dtos'
import styles from './AdminPage.module.css'

const emptyCategoryDraft = { name: '', displayOrder: '' }
const emptyTagDraft = { name: '', colorHex: '#4e8cff' }

export const AdminTagsScreen = () => {
  const queryClient = useQueryClient()
  const { dispatch } = useGlobalContext()
  const { categories, isLoading, isFetching, refetch: refetchTags } = useTags()
  const {
    data: proposalData,
    isLoading: areProposalsLoading,
    isFetching: isFetchingProposals,
    refetch: refetchProposals,
    approve,
    reject,
    isApproving,
    isRejecting,
  } = useTagProposals()

  const proposals = proposalData ?? []

  const [categoryForm, setCategoryForm] = useState(emptyCategoryDraft)
  const [categoryDrafts, setCategoryDrafts] = useState<Record<string, { name: string; displayOrder: string }>>({})
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [tagForm, setTagForm] = useState(emptyTagDraft)
  const [tagDrafts, setTagDrafts] = useState<Record<string, { name: string; colorHex: string }>>({})

  useEffect(() => {
    if (!selectedCategoryId && categories.length) {
      setSelectedCategoryId(categories[0].id)
    }
  }, [categories, selectedCategoryId])

  useEffect(() => {
    const nextDrafts = categories.reduce<Record<string, { name: string; displayOrder: string }>>((acc, category) => {
      acc[category.id] = {
        name: category.name,
        displayOrder: typeof category.displayOrder === 'number' ? String(category.displayOrder) : '',
      }
      return acc
    }, {})
    setCategoryDrafts(nextDrafts)
  }, [categories])

  useEffect(() => {
    if (!selectedCategoryId) {
      setTagDrafts({})
      return
    }
    const category = categories.find((entry) => entry.id === selectedCategoryId)
    if (!category) {
      setTagDrafts({})
      return
    }
    const nextDrafts = category.tags.reduce<Record<string, { name: string; colorHex: string }>>((acc, tag) => {
      acc[tag.id] = { name: tag.name, colorHex: tag.colorHex ?? '#4e8cff' }
      return acc
    }, {})
    setTagDrafts(nextDrafts)
  }, [categories, selectedCategoryId])

  const selectedCategory = useMemo<TagCategoryDTO | undefined>(
    () => categories.find((category) => category.id === selectedCategoryId),
    [categories, selectedCategoryId]
  )

  const notify = (message: string, tone: 'success' | 'error' | 'info' = 'success') => {
    dispatch({ type: 'ADD_TOAST', payload: createToast(message, tone) })
  }

  const invalidateTags = async () => {
    await queryClient.invalidateQueries({ queryKey: ['tagCategories'] })
  }

  const handleCreateCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!categoryForm.name.trim()) {
      return
    }
    try {
      await tagService.createCategory({
        name: categoryForm.name.trim(),
        displayOrder: categoryForm.displayOrder ? Number(categoryForm.displayOrder) : undefined,
      })
      setCategoryForm(emptyCategoryDraft)
      notify('Kategorie erstellt', 'success')
      await invalidateTags()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Kategorie konnte nicht erstellt werden'
      notify(message, 'error')
    }
  }

  const handleUpdateCategory = async (event: FormEvent<HTMLFormElement>, categoryId: string) => {
    event.preventDefault()
    const draft = categoryDrafts[categoryId]
    if (!draft) return
    try {
      await tagService.updateCategory(categoryId, {
        name: draft.name.trim(),
        displayOrder: draft.displayOrder ? Number(draft.displayOrder) : undefined,
      })
      notify('Kategorie aktualisiert', 'success')
      await invalidateTags()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Kategorie konnte nicht gespeichert werden'
      notify(message, 'error')
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Kategorie wirklich löschen?')) {
      return
    }
    try {
      await tagService.deleteCategory(categoryId)
      notify('Kategorie gelöscht', 'info')
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId('')
      }
      await invalidateTags()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Kategorie konnte nicht gelöscht werden'
      notify(message, 'error')
    }
  }

  const handleCreateTag = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedCategoryId || !tagForm.name.trim()) {
      return
    }
    try {
      await tagService.createTag({
        name: tagForm.name.trim(),
        colorHex: tagForm.colorHex,
        tagCategoryId: selectedCategoryId,
      })
      setTagForm(emptyTagDraft)
      notify('Tag erstellt', 'success')
      await invalidateTags()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tag konnte nicht erstellt werden'
      notify(message, 'error')
    }
  }

  const handleUpdateTag = async (tag: TagDTO) => {
    const draft = tagDrafts[tag.id]
    if (!draft) return
    try {
      await tagService.updateTag(tag.id, {
        name: draft.name.trim() || tag.name,
        colorHex: draft.colorHex,
      })
      notify('Tag gespeichert', 'success')
      await invalidateTags()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tag konnte nicht gespeichert werden'
      notify(message, 'error')
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    if (!window.confirm('Tag wirklich löschen?')) {
      return
    }
    try {
      await tagService.deleteTag(tagId)
      notify('Tag gelöscht', 'info')
      await invalidateTags()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tag konnte nicht gelöscht werden'
      notify(message, 'error')
    }
  }

  const handleApprove = async (proposalId: string) => {
    try {
      await approve(proposalId)
      notify('Vorschlag freigegeben', 'success')
      await Promise.all([invalidateTags(), refetchProposals()])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Freigabe fehlgeschlagen'
      notify(message, 'error')
    }
  }

  const handleReject = async (proposalId: string) => {
    try {
      await reject(proposalId)
      notify('Vorschlag abgelehnt', 'info')
      await Promise.all([invalidateTags(), refetchProposals()])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ablehnung fehlgeschlagen'
      notify(message, 'error')
    }
  }

  if (isLoading && !categories.length) {
    return (
      <section className={styles.section}>
        <Loader />
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <div>
          <h2>Tags & Kategorien</h2>
          <p className={styles.notificationMeta}>Verwalte Kategorien, Tags und Vorschläge</p>
        </div>
        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={() => {
              refetchTags()
              refetchProposals()
            }}
            disabled={isFetching || isFetchingProposals}
          >
            Aktualisieren
          </Button>
        </div>
      </header>

      <div className={styles.managementGrid}>
        <Card>
          <h3>Kategorie anlegen</h3>
          <form className={styles.inlineForm} onSubmit={handleCreateCategory}>
            <label>
              <span>Name*</span>
              <input
                type="text"
                value={categoryForm.name}
                onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </label>
            <label>
              <span>Anzeige-Reihenfolge</span>
              <input
                type="number"
                value={categoryForm.displayOrder}
                min={0}
                onChange={(event) => setCategoryForm((prev) => ({ ...prev, displayOrder: event.target.value }))}
              />
            </label>
            <Button type="submit" disabled={!categoryForm.name.trim()}>
              Kategorie speichern
            </Button>
          </form>
        </Card>

        <Card>
          <h3>Kategorie bearbeiten</h3>
          <div className={styles.inlineForm}>
            {categories.length === 0 ? (
              <p className={styles.notificationMeta}>Noch keine Kategorien vorhanden.</p>
            ) : (
              categories.map((category) => (
                <form key={category.id} className={styles.inlineFormRow} onSubmit={(event) => handleUpdateCategory(event, category.id)}>
                  <input
                    type="text"
                    value={categoryDrafts[category.id]?.name ?? category.name}
                    onChange={(event) =>
                      setCategoryDrafts((prev) => ({
                        ...prev,
                        [category.id]: {
                          ...(prev[category.id] ?? { name: '', displayOrder: '' }),
                          name: event.target.value,
                        },
                      }))
                    }
                    placeholder="Name"
                  />
                  <input
                    type="number"
                    value={categoryDrafts[category.id]?.displayOrder ?? ''}
                    onChange={(event) =>
                      setCategoryDrafts((prev) => ({
                        ...prev,
                        [category.id]: {
                          ...(prev[category.id] ?? { name: '', displayOrder: '' }),
                          displayOrder: event.target.value,
                        },
                      }))
                    }
                    placeholder="Reihenfolge"
                  />
                  <div className={styles.inlineFormActions}>
                    <Button type="submit" variant="secondary">
                      Speichern
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => handleDeleteCategory(category.id)}>
                      Entfernen
                    </Button>
                  </div>
                </form>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className={styles.sectionHeader}>
          <div>
            <h3>Tags verwalten</h3>
            <p className={styles.notificationMeta}>
              {selectedCategory ? `${selectedCategory.tags.length} Tags in ${selectedCategory.name}` : 'Kategorie auswählen'}
            </p>
          </div>
          <select value={selectedCategoryId} onChange={(event) => setSelectedCategoryId(event.target.value)}>
            <option value="">Kategorie wählen</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCategory ? (
          <>
            <form className={styles.inlineFormRow} onSubmit={handleCreateTag}>
              <input
                type="text"
                value={tagForm.name}
                onChange={(event) => setTagForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Tag-Name"
                required
              />
              <input
                type="color"
                value={tagForm.colorHex}
                onChange={(event) => setTagForm((prev) => ({ ...prev, colorHex: event.target.value }))}
                aria-label="Farbe"
              />
              <Button type="submit" disabled={!tagForm.name.trim()}>
                Tag hinzufügen
              </Button>
            </form>

            <div className={styles.tagRows}>
              {selectedCategory.tags.length === 0 ? (
                <p className={styles.notificationMeta}>Keine Tags in dieser Kategorie.</p>
              ) : (
                selectedCategory.tags.map((tag) => (
                  <div key={tag.id} className={styles.tagRow}>
                    <div className={styles.tagRowInputs}>
                      <input
                        type="text"
                        value={tagDrafts[tag.id]?.name ?? tag.name}
                        onChange={(event) =>
                          setTagDrafts((prev) => ({
                            ...prev,
                            [tag.id]: { ...(prev[tag.id] ?? { name: '', colorHex: '#4e8cff' }), name: event.target.value },
                          }))
                        }
                      />
                      <input
                        type="color"
                        value={tagDrafts[tag.id]?.colorHex ?? tag.colorHex ?? '#4e8cff'}
                        onChange={(event) =>
                          setTagDrafts((prev) => ({
                            ...prev,
                            [tag.id]: { ...(prev[tag.id] ?? { name: '', colorHex: '#4e8cff' }), colorHex: event.target.value },
                          }))
                        }
                        aria-label="Farbe wählen"
                      />
                    </div>
                    <div className={styles.tagRowActions}>
                      <Button type="button" variant="secondary" onClick={() => handleUpdateTag(tag)}>
                        Speichern
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => handleDeleteTag(tag.id)}>
                        Entfernen
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <p className={styles.notificationMeta}>Bitte wähle eine Kategorie aus, um Tags zu verwalten.</p>
        )}
      </Card>

      <Card>
        <div className={styles.sectionHeader}>
          <div>
            <h3>Tag-Vorschläge</h3>
            <p className={styles.notificationMeta}>
              {proposals.length ? `${proposals.length} offen` : 'Keine offenen Vorschläge'}
            </p>
          </div>
        </div>
        {areProposalsLoading ? (
          <Loader />
        ) : proposals.length === 0 ? (
          <p>Keine Vorschläge warten auf Moderation.</p>
        ) : (
          <div className={styles.notificationList}>
            {proposals.map((proposal) => (
              <div key={proposal.id} className={styles.notificationItem}>
                <div>
                  <strong>{proposal.name}</strong>
                  <p className={styles.notificationMeta}>{proposal.category?.name ?? 'Kategorie unbekannt'}</p>
                  <p className={styles.notificationMeta}>
                    Vorgeschlagen von {proposal.proposedBy?.username ?? 'Unbekannt'} ·{' '}
                    {new Date(proposal.createdAt).toLocaleString('de-DE')}
                  </p>
                </div>
                <div className={styles.actions}>
                  <Button
                    type="button"
                    onClick={() => handleApprove(proposal.id)}
                    disabled={isApproving || isRejecting}
                  >
                    Freigeben
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleReject(proposal.id)}
                    disabled={isApproving || isRejecting}
                  >
                    Ablehnen
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </section>
  )
}
