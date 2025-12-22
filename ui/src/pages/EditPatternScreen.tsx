import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PatternForm } from '@/components/features/PatternForm/PatternForm'
import { Loader } from '@/components/common/Loader'
import { useGlobalContext } from '@/context'
import { usePattern, useTags, usePatternMeasurements } from '@/hooks'
import { patternService, measurementService } from '@/services'
import type { PatternFormValues } from '@schnittmuster/core'
import { buildPatternFormData } from '@schnittmuster/core'
import type { MeasurementSelection } from '@/components/features/MeasurementSelector'
import { createToast } from '@/utils'
import styles from './Page.module.css'

export const EditPatternScreen = () => {
  const { patternId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { dispatch } = useGlobalContext()
  const patternQuery = usePattern(patternId)
  const { categories, isLoading: isLoadingTags } = useTags()
  const { measurements: existingMeasurements, isLoading: isLoadingMeasurements } = usePatternMeasurements(patternId)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  const updateMutation = useMutation({
    mutationFn: async ({
      values,
      onUploadProgress,
    }: {
      values: PatternFormValues
      onUploadProgress?: (progress: number) => void
    }) => {
      if (!patternId) {
        throw new Error('Pattern ID fehlt')
      }
      const formData = buildPatternFormData(values)
      return patternService.update(patternId, formData, { onUploadProgress })
    },
    onSuccess: (updatedPattern) => {
      dispatch({ type: 'ADD_TOAST', payload: createToast('Änderungen gespeichert', 'success') })
      queryClient.invalidateQueries({ queryKey: ['pattern', patternId] })
      queryClient.invalidateQueries({ queryKey: ['patterns'] })
      navigate(`/patterns/${updatedPattern.id}`)
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Aktualisierung fehlgeschlagen'
      setSubmitError(message)
      dispatch({ type: 'ADD_TOAST', payload: createToast(message, 'error') })
    },
    onSettled: () => {
      setUploadProgress(null)
    },
  })

  if (patternQuery.isLoading || isLoadingTags || isLoadingMeasurements) {
    return (
      <section className={styles.section}>
        <Loader />
      </section>
    )
  }

  if (!patternQuery.data) {
    return <p>Pattern nicht gefunden.</p>
  }

  const initialValues: PatternFormValues = {
    name: patternQuery.data.name,
    description: patternQuery.data.description ?? '',
    status: patternQuery.data.status,
    isFavorite: patternQuery.data.isFavorite,
    file: null,
    thumbnail: null,
    tagIds: patternQuery.data.tags.map((tag) => tag.id),
    notes: '',
    fabricRequirements: patternQuery.data.fabricRequirements,
  }

  const handleSubmit = async (values: PatternFormValues, measurements: MeasurementSelection[]) => {
    setSubmitError(null)
    setUploadProgress(0)
    
    try {
      await updateMutation.mutateAsync({
        values,
        onUploadProgress: (progress) => setUploadProgress(progress),
      })
      
      // Update measurements
      if (patternId && measurements.length > 0) {
        // Get existing measurement IDs
        const newMeasurementIds = new Set(measurements.map(m => m.measurementType.id))
        
        // Delete measurements that are no longer selected
        const measurementsToDelete = existingMeasurements.filter(
          m => !newMeasurementIds.has(m.measurementType.id)
        )
        for (const measurement of measurementsToDelete) {
          await measurementService.deletePatternMeasurement(patternId, measurement.id)
        }
        
        // Add or update measurements
        for (const measurement of measurements) {
          const existing = existingMeasurements.find(
            m => m.measurementType.id === measurement.measurementType.id
          )
          
          if (existing) {
            // Update existing measurement
            await measurementService.updatePatternMeasurement(patternId, existing.id, {
              value: measurement.value,
              notes: measurement.notes,
              isRequired: measurement.isRequired,
            })
          } else {
            // Add new measurement
            await measurementService.addPatternMeasurement(patternId, {
              measurementTypeId: measurement.measurementType.id,
              value: measurement.value,
              notes: measurement.notes,
              isRequired: measurement.isRequired,
            })
          }
        }
        
        // Invalidate pattern measurements query
        queryClient.invalidateQueries({ queryKey: ['patternMeasurements', patternId] })
      }
    } catch (error) {
      // Error handling is done in mutation onError
    }
  }

  // Convert existing measurements to MeasurementSelection format
  const initialMeasurementsData: MeasurementSelection[] = existingMeasurements.map(m => ({
    measurementType: m.measurementType,
    value: m.value ?? undefined,
    notes: m.notes ?? undefined,
    isRequired: m.isRequired,
  }))

  return (
    <section className={styles.section}>
      <PatternForm
        key={patternQuery.data.id}
        initialValues={initialValues}
        initialTags={patternQuery.data.tags}
        initialMeasurements={initialMeasurementsData}
        tagCategories={categories}
        areTagsLoading={isLoadingTags}
        existingThumbnailUrl={patternQuery.data.thumbnailUrl}
        existingFileUrl={patternQuery.data.fileUrl}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        errorMessage={submitError}
        submitLabel="Änderungen speichern"
        uploadProgress={uploadProgress}
      />
    </section>
  )
}
