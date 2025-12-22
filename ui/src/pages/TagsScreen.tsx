import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Loader } from '@/components/common/Loader'
import { useGlobalContext } from '@/context'
import { useTags } from '@/hooks'
import { tagService } from '@/services'
import { createToast } from '@/utils'
import type { TagCategoryDTO, TagDTO } from '@schnittmuster/dtos'
import styles from './Page.module.css'

const emptyCategoryDraft = { name: '', displayOrder: '' }
const emptyTagDraft = { name: '', colorHex: '#4e8cff' }

export const TagsScreen = () => {
  const queryClient = useQueryClient()
  const { dispatch } = useGlobalContext()
  const { categories, isLoading, isFetching, refetch: refetchTags } = useTags()

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
    if (!window.confirm('Kategorie wirklich löschen? Alle zugehörigen Tags werden ebenfalls gelöscht.')) {
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
          <h2>Meine Tags</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Verwalte deine Kategorien und Tags für Schnittmuster
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" onClick={() => refetchTags()} disabled={isFetching}>
            Aktualisieren
          </Button>
        </div>
      </header>

      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        <Card>
          <h3>Neue Kategorie</h3>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} onSubmit={handleCreateCategory}>
            <label>
              <span style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Name*</span>
              <input
                type="text"
                value={categoryForm.name}
                onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))}
                required
                style={{ width: '100%' }}
              />
            </label>
            <label>
              <span style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Reihenfolge</span>
              <input
                type="number"
                value={categoryForm.displayOrder}
                min={0}
                onChange={(event) => setCategoryForm((prev) => ({ ...prev, displayOrder: event.target.value }))}
                style={{ width: '100%' }}
              />
            </label>
            <Button type="submit" disabled={!categoryForm.name.trim()}>
              Kategorie erstellen
            </Button>
          </form>
        </Card>

        <Card>
          <h3>Kategorien bearbeiten</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {categories.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>Noch keine Kategorien vorhanden.</p>
            ) : (
              categories.map((category) => (
                <form
                  key={category.id}
                  style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                  onSubmit={(event) => handleUpdateCategory(event, category.id)}
                >
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
                    style={{ flex: 1, minWidth: '100px' }}
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
                    style={{ width: '100px' }}
                  />
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <Button type="submit" variant="secondary" style={{ whiteSpace: 'nowrap' }}>
                      Speichern
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => handleDeleteCategory(category.id)}>
                      Löschen
                    </Button>
                  </div>
                </form>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3>Tags verwalten</h3>
            <select
              value={selectedCategoryId}
              onChange={(event) => setSelectedCategoryId(event.target.value)}
              style={{ padding: '8px 12px' }}
            >
              <option value="">Kategorie wählen</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            {selectedCategory ? `${selectedCategory.tags.length} Tags in ${selectedCategory.name}` : 'Bitte wähle eine Kategorie aus'}
          </p>
        </div>

        {selectedCategory ? (
          <>
            <form
              style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}
              onSubmit={handleCreateTag}
            >
              <input
                type="text"
                value={tagForm.name}
                onChange={(event) => setTagForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Tag-Name"
                required
                style={{ flex: 1 }}
              />
              <input
                type="color"
                value={tagForm.colorHex}
                onChange={(event) => setTagForm((prev) => ({ ...prev, colorHex: event.target.value }))}
                aria-label="Farbe"
                style={{ width: '60px', height: '40px' }}
              />
              <Button type="submit" className={styles.primaryButton} style={{ maxWidth: '200px'}} disabled={!tagForm.name.trim()}>
                Tag hinzufügen
              </Button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedCategory.tags.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>Keine Tags in dieser Kategorie.</p>
              ) : (
                selectedCategory.tags.map((tag) => (
                  <div key={tag.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                      <input
                        type="text"
                        value={tagDrafts[tag.id]?.name ?? tag.name}
                        onChange={(event) =>
                          setTagDrafts((prev) => ({
                            ...prev,
                            [tag.id]: { ...(prev[tag.id] ?? { name: '', colorHex: '#4e8cff' }), name: event.target.value },
                          }))
                        }
                        style={{ flex: 1 }}
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
                        style={{ width: '60px', height: '40px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <Button type="button" variant="secondary" onClick={() => handleUpdateTag(tag)}>
                        Speichern
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => handleDeleteTag(tag.id)}>
                        Löschen
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>Bitte wähle eine Kategorie aus, um Tags zu verwalten.</p>
        )}
      </Card>
    </section>
  )
}
