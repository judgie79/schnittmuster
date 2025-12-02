import type { PatternFormValues } from '@/types'

const appendIfDefined = (formData: FormData, key: string, value?: string | null) => {
  if (value && value.trim().length > 0) {
    formData.append(key, value)
  }
}

export const buildPatternFormData = (values: PatternFormValues) => {
  const formData = new FormData()

  formData.append('name', values.name)
  appendIfDefined(formData, 'description', values.description ?? null)
  appendIfDefined(formData, 'notes', values.notes ?? null)
  formData.append('status', values.status)
  formData.append('isFavorite', String(values.isFavorite))

  if (values.file) {
    formData.append('file', values.file)
  }

  if (values.thumbnail) {
    formData.append('thumbnail', values.thumbnail)
  }

  if (values.tagIds.length) {
    formData.append('tagIds', JSON.stringify(values.tagIds))
  }

  return formData
}
