import { useState } from 'react'
import type { MeasurementTypeDTO, PatternMeasurementCreateDTO } from '@schnittmuster/dtos'
import { MeasurementCategory } from '@schnittmuster/dtos'
import { Button } from '@/components/common/Button'
import styles from './MeasurementSelector.module.css'

export interface MeasurementSelection extends Omit<PatternMeasurementCreateDTO, 'measurementTypeId'> {
  measurementType: MeasurementTypeDTO
}

interface MeasurementSelectorProps {
  measurementTypes: MeasurementTypeDTO[]
  selectedMeasurements: MeasurementSelection[]
  onChange: (measurements: MeasurementSelection[]) => void
  isLoading?: boolean
}

export const MeasurementSelector = ({
  measurementTypes,
  selectedMeasurements,
  onChange,
  isLoading = false,
}: MeasurementSelectorProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['body']))

  const groupedMeasurements = {
    [MeasurementCategory.body]: measurementTypes.filter((m) => m.category === MeasurementCategory.body),
    [MeasurementCategory.garment]: measurementTypes.filter((m) => m.category === MeasurementCategory.garment),
    [MeasurementCategory.custom]: measurementTypes.filter((m) => m.category === MeasurementCategory.custom),
  }

  const categoryLabels = {
    [MeasurementCategory.body]: 'Körpermaße',
    [MeasurementCategory.garment]: 'Kleidungsmaße',
    [MeasurementCategory.custom]: 'Benutzerdefiniert',
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const isSelected = (measurementTypeId: string) => {
    return selectedMeasurements.some((m) => m.measurementType.id === measurementTypeId)
  }

  const handleAddMeasurement = (measurementType: MeasurementTypeDTO) => {
    onChange([
      ...selectedMeasurements,
      {
        measurementType,
        value: undefined,
        notes: undefined,
        isRequired: false,
      },
    ])
  }

  const handleRemoveMeasurement = (measurementTypeId: string) => {
    onChange(selectedMeasurements.filter((m) => m.measurementType.id !== measurementTypeId))
  }

  const handleUpdateMeasurement = (measurementTypeId: string, updates: Partial<Omit<MeasurementSelection, 'measurementType'>>) => {
    onChange(
      selectedMeasurements.map((m) =>
        m.measurementType.id === measurementTypeId
          ? { ...m, ...updates }
          : m
      )
    )
  }

  if (isLoading) {
    return <p className={styles.helper}>Maßangaben werden geladen ...</p>
  }

  if (!measurementTypes.length) {
    return <p className={styles.helper}>Noch keine Maßangaben verfügbar.</p>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Maßangaben</h3>
        <p className={styles.description}>Wähle benötigte Maßangaben für dieses Schnittmuster</p>
      </div>

      {/* Selected Measurements */}
      {selectedMeasurements.length > 0 && (
        <div className={styles.selectedSection}>
          <h4>Ausgewählte Maßangaben ({selectedMeasurements.length})</h4>
          <div className={styles.selectedList}>
            {selectedMeasurements.map((measurement) => (
              <div key={measurement.measurementType.id} className={styles.selectedItem}>
                <div className={styles.measurementInfo}>
                  <div className={styles.measurementHeader}>
                    <strong>{measurement.measurementType.name}</strong>
                    <span className={styles.unit}>({measurement.measurementType.unit})</span>
                  </div>
                  <div className={styles.measurementInputs}>
                    <label className={styles.inputGroup}>
                      <span>Wert:</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={measurement.value ?? ''}
                        onChange={(e) =>
                          handleUpdateMeasurement(measurement.measurementType.id, {
                            value: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder="Optional"
                        className={styles.input}
                      />
                    </label>
                    <label className={styles.inputGroup}>
                      <span>Notizen:</span>
                      <input
                        type="text"
                        value={measurement.notes ?? ''}
                        onChange={(e) =>
                          handleUpdateMeasurement(measurement.measurementType.id, {
                            notes: e.target.value || undefined,
                          })
                        }
                        placeholder="Optional"
                        className={styles.input}
                      />
                    </label>
                  </div>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={measurement.isRequired ?? false}
                      onChange={(e) =>
                        handleUpdateMeasurement(measurement.measurementType.id, {
                          isRequired: e.target.checked,
                        })
                      }
                    />
                    <span>Erforderlich</span>
                  </label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleRemoveMeasurement(measurement.measurementType.id)}
                  className={styles.removeButton}
                >
                  Entfernen
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Measurements by Category */}
      <div className={styles.availableSection}>
        <h4>Verfügbare Maßangaben</h4>
        {Object.entries(groupedMeasurements).map(([category, measurements]) => {
          if (measurements.length === 0) return null
          const isExpanded = expandedCategories.has(category)
          return (
            <div key={category} className={styles.categorySection}>
              <button
                type="button"
                className={styles.categoryHeader}
                onClick={() => toggleCategory(category)}
              >
                <span className={styles.categoryName}>
                  {categoryLabels[category as MeasurementCategory]}
                </span>
                <span className={styles.categoryCount}>
                  {measurements.length} {isExpanded ? '▼' : '▶'}
                </span>
              </button>
              {isExpanded && (
                <div className={styles.measurementGrid}>
                  {measurements.map((measurementType) => {
                    const selected = isSelected(measurementType.id)
                    return (
                      <div
                        key={measurementType.id}
                        className={`${styles.measurementCard} ${selected ? styles.measurementCardSelected : ''}`}
                      >
                        <div className={styles.measurementCardContent}>
                          <div className={styles.measurementCardHeader}>
                            <strong>{measurementType.name}</strong>
                            <span className={styles.unitBadge}>{measurementType.unit}</span>
                          </div>
                          {measurementType.description && (
                            <p className={styles.measurementDescription}>{measurementType.description}</p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant={selected ? 'ghost' : 'secondary'}
                          
                          onClick={() =>
                            selected
                              ? handleRemoveMeasurement(measurementType.id)
                              : handleAddMeasurement(measurementType)
                          }
                          className={styles.addButton}
                        >
                          {selected ? '✓ Ausgewählt' : '+ Hinzufügen'}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
