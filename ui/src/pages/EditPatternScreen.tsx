import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PatternForm } from '@/components/features/PatternForm/PatternForm'
import { Loader } from '@/components/common/Loader'
import { useGlobalContext } from '@/context'
import { usePattern, useTags } from '@/hooks'
import { patternService } from '@/services'
import type { PatternFormValues } from '@/types'
import { buildPatternFormData, createToast } from '@/utils'
import styles from './Page.module.css'

export const EditPatternScreen = () => {
  const { patternId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { dispatch } = useGlobalContext()
  const patternQuery = usePattern(patternId)
  const { categories, isLoading: isLoadingTags } = useTags()
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

  if (patternQuery.isLoading || isLoadingTags) {
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
  }

  const handleSubmit = async (values: PatternFormValues) => {
    setSubmitError(null)
    setUploadProgress(0)
    await updateMutation.mutateAsync({
      values,
      onUploadProgress: (progress) => setUploadProgress(progress),
    })
  }

  return (
    <section className={styles.section}>
      <PatternForm
        key={patternQuery.data.id}
        initialValues={initialValues}
        initialTags={patternQuery.data.tags}
        tagCategories={categories}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        errorMessage={submitError}
        submitLabel="Änderungen speichern"
        uploadProgress={uploadProgress}
      />
    </section>
  )
}
