import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PatternForm } from '@/components/features/PatternForm/PatternForm'
import { Loader } from '@/components/common/Loader'
import { useGlobalContext } from '@/context'
import { usePatterns, useTags } from '@/hooks'
import type { PatternFormValues } from '@schnittmuster/core'
import { buildPatternFormData } from '@schnittmuster/core'
import { createToast } from '@/utils'
import styles from './Page.module.css'

export const AddPatternScreen = () => {
  const { categories, isLoading: areTagsLoading } = useTags()
  const { mutate, mutations } = usePatterns()
  const navigate = useNavigate()
  const { dispatch } = useGlobalContext()
  const isSubmitting = mutations.create.isPending
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formKey, setFormKey] = useState(0)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  const handleSubmit = async (values: PatternFormValues) => {
    setSubmitError(null)
    setUploadProgress(0)
    const formData = buildPatternFormData(values)

    try {
      const createdPattern = await mutate.create(formData, {
        onUploadProgress: (progress) => setUploadProgress(progress),
      })
      dispatch({ type: 'ADD_TOAST', payload: createToast('Schnittmuster gespeichert', 'success') })
      setFormKey((key) => key + 1)
      setUploadProgress(null)
      if (createdPattern?.id) {
        navigate(`/patterns/${createdPattern.id}`)
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Speichern fehlgeschlagen'
      setSubmitError(message)
      dispatch({ type: 'ADD_TOAST', payload: createToast(message, 'error') })
    } finally {
      setUploadProgress(null)
    }
  }

  return (
    <section className={styles.section}>
      {areTagsLoading && categories.length === 0 ? (
        <Loader />
      ) : (
        <PatternForm
          key={formKey}
          tagCategories={categories}
          areTagsLoading={areTagsLoading}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errorMessage={submitError}
          submitLabel="Schnittmuster speichern"
          requireFile
          uploadProgress={uploadProgress}
        />
      )}
    </section>
  )
}
