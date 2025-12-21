import { useEffect, useState } from 'react'
import { fileService } from '@/services'
import { resolveAssetUrl } from '@/utils/url'

export const useProtectedFile = (sourceUrl?: string) => {
  const [url, setUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const resolvedUrl = resolveAssetUrl(sourceUrl)
    if (!resolvedUrl) {
      setUrl(null)
      setError(null)
      setIsLoading(false)
      return
    }

    let isActive = true
    let objectUrl: string | null = null

    setIsLoading(true)
    setError(null)
    setUrl(null)

    fileService
      .get(resolvedUrl)
      .then((blob) => {
        if (!isActive) {
          return
        }
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
      .catch((fetchError) => {
        if (!isActive) {
          return
        }
        setError(fetchError instanceof Error ? fetchError : new Error('Datei konnte nicht geladen werden'))
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [sourceUrl])

  return { url, isLoading, error }
}
