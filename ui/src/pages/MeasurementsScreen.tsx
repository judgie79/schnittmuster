import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Loader } from '@/components/common/Loader'
import { useGlobalContext } from '@/context'
import { useSystemDefaultMeasurements, useUserCustomMeasurements } from '@/hooks'
import { measurementService } from '@/services'
import { createToast } from '@/utils'
import { MeasurementUnit, MeasurementCategory } from '@schnittmuster/dtos'
import type { MeasurementTypeDTO } from '@schnittmuster/dtos'
import styles from './Page.module.css'

const emptyMeasurementDraft = {
  name: '',
  description: '',
  unit: MeasurementUnit.cm,
  category: MeasurementCategory.body,
  displayOrder: '',
}

export const MeasurementsScreen = () => {
  const queryClient = useQueryClient()
  const { dispatch } = useGlobalContext()
  const { systemDefaults, isLoading: isLoadingSystem } = useSystemDefaultMeasurements()
  const { customMeasurements, isLoading: isLoadingCustom, refetch } = useUserCustomMeasurements()

  const [measurementForm, setMeasurementForm] = useState(emptyMeasurementDraft)
  const [measurementDrafts, setMeasurementDrafts] = useState<
    Record<string, { name: string; description: string; unit: MeasurementUnit; category: MeasurementCategory; displayOrder: string }>
  >({})

  useEffect(() => {
    const nextDrafts = customMeasurements.reduce<
      Record<string, { name: string; description: string; unit: MeasurementUnit; category: MeasurementCategory; displayOrder: string }>
    >((acc, measurement) => {
      acc[measurement.id] = {
        name: measurement.name,
        description: measurement.description ?? '',
        unit: measurement.unit,
        category: measurement.category,
        displayOrder: typeof measurement.displayOrder === 'number' ? String(measurement.displayOrder) : '',
      }
      return acc
    }, {})
    setMeasurementDrafts(nextDrafts)
  }, [customMeasurements])

  const notify = (message: string, tone: 'success' | 'error' | 'info' = 'success') => {
    dispatch({ type: 'ADD_TOAST', payload: createToast(message, tone) })
  }

  const invalidateMeasurements = async () => {
    await queryClient.invalidateQueries({ queryKey: ['measurementTypes'] })
  }

  const handleCreateMeasurement = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!measurementForm.name.trim()) {
      return
    }
    try {
      await measurementService.createMeasurementType({
        name: measurementForm.name.trim(),
        description: measurementForm.description.trim() || undefined,
        unit: measurementForm.unit,
        category: measurementForm.category,
        displayOrder: measurementForm.displayOrder ? Number(measurementForm.displayOrder) : undefined,
      })
      setMeasurementForm(emptyMeasurementDraft)
      notify('Maßangabe erstellt', 'success')
      await invalidateMeasurements()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Maßangabe konnte nicht erstellt werden'
      notify(message, 'error')
    }
  }

  const handleUpdateMeasurement = async (measurement: MeasurementTypeDTO) => {
    const draft = measurementDrafts[measurement.id]
    if (!draft) return
    try {
      await measurementService.updateMeasurementType(measurement.id, {
        name: draft.name.trim() || measurement.name,
        description: draft.description.trim() || undefined,
        unit: draft.unit,
        category: draft.category,
        displayOrder: draft.displayOrder ? Number(draft.displayOrder) : undefined,
      })
      notify('Maßangabe gespeichert', 'success')
      await invalidateMeasurements()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Maßangabe konnte nicht gespeichert werden'
      notify(message, 'error')
    }
  }

  const handleDeleteMeasurement = async (measurementId: string) => {
    if (!window.confirm('Maßangabe wirklich löschen?')) {
      return
    }
    try {
      await measurementService.deleteMeasurementType(measurementId)
      notify('Maßangabe gelöscht', 'info')
      await invalidateMeasurements()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Maßangabe konnte nicht gelöscht werden'
      notify(message, 'error')
    }
  }

  if (isLoadingSystem || isLoadingCustom) {
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
          <h2>Maßangaben</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            System-Standardmaße und eigene Maßangaben verwalten
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" onClick={() => refetch()} disabled={isLoadingCustom}>
            Aktualisieren
          </Button>
        </div>
      </header>

      <Card>
        <h3>System-Standardmaße</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Diese Maßangaben sind für alle Benutzer verfügbar und können nicht bearbeitet werden.
        </p>
        <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {systemDefaults.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>Keine Standardmaße vorhanden.</p>
          ) : (
            systemDefaults.map((measurement) => (
              <div
                key={measurement.id}
                style={{
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--background-secondary)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '4px' }}>
                  <strong>{measurement.name}</strong>
                  <span
                    style={{
                      fontSize: '12px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--border-color)',
                    }}
                  >
                    {measurement.unit}
                  </span>
                </div>
                {measurement.description && (
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>{measurement.description}</p>
                )}
                <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  Kategorie: {measurement.category}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <h3>Neue Maßangabe erstellen</h3>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} onSubmit={handleCreateMeasurement}>
          <label>
            <span style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Name*</span>
            <input
              type="text"
              value={measurementForm.name}
              onChange={(event) => setMeasurementForm((prev) => ({ ...prev, name: event.target.value }))}
              required
              placeholder="z.B. Hüftumfang"
              style={{ width: '100%' }}
            />
          </label>
          <label>
            <span style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Beschreibung</span>
            <textarea
              value={measurementForm.description}
              onChange={(event) => setMeasurementForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Optionale Beschreibung für die Maßangabe"
              rows={3}
              style={{ width: '100%' }}
            />
          </label>
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
            <label>
              <span style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Einheit*</span>
              <select
                value={measurementForm.unit}
                onChange={(event) => setMeasurementForm((prev) => ({ ...prev, unit: event.target.value as MeasurementUnit }))}
                required
                style={{ width: '100%' }}
              >
                <option value={MeasurementUnit.cm}>cm</option>
                <option value={MeasurementUnit.inch}>inch</option>
                <option value={MeasurementUnit.mm}>mm</option>
              </select>
            </label>
            <label>
              <span style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Kategorie*</span>
              <select
                value={measurementForm.category}
                onChange={(event) => setMeasurementForm((prev) => ({ ...prev, category: event.target.value as MeasurementCategory }))}
                required
                style={{ width: '100%' }}
              >
                <option value={MeasurementCategory.body}>Körpermaß</option>
                <option value={MeasurementCategory.garment}>Kleidungsmaß</option>
                <option value={MeasurementCategory.custom}>Benutzerdefiniert</option>
              </select>
            </label>
            <label>
              <span style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Reihenfolge</span>
              <input
                type="number"
                value={measurementForm.displayOrder}
                min={0}
                onChange={(event) => setMeasurementForm((prev) => ({ ...prev, displayOrder: event.target.value }))}
                placeholder="0"
                style={{ width: '100%' }}
              />
            </label>
          </div>
          <Button type="submit" disabled={!measurementForm.name.trim()}>
            Maßangabe erstellen
          </Button>
        </form>
      </Card>

      <Card>
        <h3>Eigene Maßangaben bearbeiten</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {customMeasurements.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>Noch keine eigenen Maßangaben vorhanden.</p>
          ) : (
            customMeasurements.map((measurement) => (
              <div
                key={measurement.id}
                style={{
                  padding: '16px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label>
                    <span style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Name</span>
                    <input
                      type="text"
                      value={measurementDrafts[measurement.id]?.name ?? measurement.name}
                      onChange={(event) =>
                        setMeasurementDrafts((prev) => ({
                          ...prev,
                          [measurement.id]: {
                            ...(prev[measurement.id] ?? {
                              name: '',
                              description: '',
                              unit: MeasurementUnit.cm,
                              category: MeasurementCategory.body,
                              displayOrder: '',
                            }),
                            name: event.target.value,
                          },
                        }))
                      }
                      style={{ width: '100%' }}
                    />
                  </label>
                  <label>
                    <span style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Beschreibung</span>
                    <textarea
                      value={measurementDrafts[measurement.id]?.description ?? measurement.description ?? ''}
                      onChange={(event) =>
                        setMeasurementDrafts((prev) => ({
                          ...prev,
                          [measurement.id]: {
                            ...(prev[measurement.id] ?? {
                              name: '',
                              description: '',
                              unit: MeasurementUnit.cm,
                              category: MeasurementCategory.body,
                              displayOrder: '',
                            }),
                            description: event.target.value,
                          },
                        }))
                      }
                      rows={2}
                      style={{ width: '100%' }}
                    />
                  </label>
                  <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                    <label>
                      <span style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Einheit</span>
                      <select
                        value={measurementDrafts[measurement.id]?.unit ?? measurement.unit}
                        onChange={(event) =>
                          setMeasurementDrafts((prev) => ({
                            ...prev,
                            [measurement.id]: {
                              ...(prev[measurement.id] ?? {
                                name: '',
                                description: '',
                                unit: MeasurementUnit.cm,
                                category: MeasurementCategory.body,
                                displayOrder: '',
                              }),
                              unit: event.target.value as MeasurementUnit,
                            },
                          }))
                        }
                        style={{ width: '100%' }}
                      >
                        <option value={MeasurementUnit.cm}>cm</option>
                        <option value={MeasurementUnit.inch}>inch</option>
                        <option value={MeasurementUnit.mm}>mm</option>
                      </select>
                    </label>
                    <label>
                      <span style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Kategorie</span>
                      <select
                        value={measurementDrafts[measurement.id]?.category ?? measurement.category}
                        onChange={(event) =>
                          setMeasurementDrafts((prev) => ({
                            ...prev,
                            [measurement.id]: {
                              ...(prev[measurement.id] ?? {
                                name: '',
                                description: '',
                                unit: MeasurementUnit.cm,
                                category: MeasurementCategory.body,
                                displayOrder: '',
                              }),
                              category: event.target.value as MeasurementCategory,
                            },
                          }))
                        }
                        style={{ width: '100%' }}
                      >
                        <option value={MeasurementCategory.body}>Körpermaß</option>
                        <option value={MeasurementCategory.garment}>Kleidungsmaß</option>
                        <option value={MeasurementCategory.custom}>Benutzerdefiniert</option>
                      </select>
                    </label>
                    <label>
                      <span style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Reihenfolge</span>
                      <input
                        type="number"
                        value={measurementDrafts[measurement.id]?.displayOrder ?? ''}
                        min={0}
                        onChange={(event) =>
                          setMeasurementDrafts((prev) => ({
                            ...prev,
                            [measurement.id]: {
                              ...(prev[measurement.id] ?? {
                                name: '',
                                description: '',
                                unit: MeasurementUnit.cm,
                                category: MeasurementCategory.body,
                                displayOrder: '',
                              }),
                              displayOrder: event.target.value,
                            },
                          }))
                        }
                        style={{ width: '100%' }}
                      />
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Button type="button" variant="secondary" onClick={() => handleUpdateMeasurement(measurement)}>
                      Speichern
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => handleDeleteMeasurement(measurement.id)}>
                      Löschen
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </section>
  )
}
