import { useCallback, useEffect, useRef, useState } from 'react'
import { Directory, File, Paths } from 'expo-file-system'
import { resolveAssetUrl, STORAGE_KEYS, getStorage } from '@schnittmuster/core'

export interface PatternFileHandle {
  uri: string
  contentUri: string | null
  fileName: string | null
  mimeType: string | null
}

interface UsePatternFileResult {
  fileUri: string | null
  fileName: string | null
  mimeType: string | null
  isPreparing: boolean
  error: Error | null
  prepare: () => Promise<PatternFileHandle>
  clear: () => Promise<void>
}

const DIRECTORY_SUFFIX = 'pattern-files'
const FALLBACK_NAME = 'schnittmuster-datei.pdf'

const parseFileName = (contentDisposition?: string | null) => {
  if (!contentDisposition) {
    return null
  }
  const matches = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(contentDisposition)
  if (!matches) {
    return null
  }
  if (matches[1]) {
    try {
      return decodeURIComponent(matches[1])
    } catch {
      return matches[1]
    }
  }
  return matches[2] ?? null
}

const sanitizeFileName = (input?: string | null) => {
  if (!input) {
    return FALLBACK_NAME
  }
  const normalized = input.trim().replace(/[/\\]/g, '_')
  return normalized.length ? normalized : FALLBACK_NAME
}

const getExtension = (input?: string | null) => {
  if (!input) {
    return undefined
  }
  const sanitized = input.split(/[?#]/)[0]
  const match = sanitized.match(/\.([a-z0-9]+)$/i)
  return match ? match[1].toLowerCase() : undefined
}

const buildDownloadDirectory = () => {
  const baseDirectory = Paths.cache ?? Paths.document
  return new Directory(baseDirectory, DIRECTORY_SUFFIX)
}

const ensureDirectory = () => {
  const directory = buildDownloadDirectory()
  try {
    directory.create({ intermediates: true, idempotent: true })
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes('already exists')) {
      throw error
    }
  }
  return directory
}

const guessFileNameFromUrl = (input: string) => {
  const sanitized = input.split(/[?#]/)[0]
  const segments = sanitized.split('/')
  const candidate = segments.pop() || FALLBACK_NAME
  try {
    return decodeURIComponent(candidate)
  } catch {
    return candidate
  }
}

const buildAuthHeaders = async () => {
  const headers: Record<string, string> = { Accept: '*/*' }
  const token = await getStorage().getItem(STORAGE_KEYS.accessToken)
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

const fetchRemoteMetadata = async (url: string, headers: Record<string, string>) => {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers,
    })
    if (!response.ok) {
      return { mimeType: null, fileName: null }
    }
    const mimeType = response.headers.get('content-type')
    const fileName = parseFileName(response.headers.get('content-disposition'))
    return { mimeType: mimeType ?? null, fileName }
  } catch {
    return { mimeType: null, fileName: null }
  }
}

const downloadPatternFile = async (fileUrl: string): Promise<PatternFileHandle> => {
  const resolvedUrl = resolveAssetUrl(fileUrl) ?? fileUrl
  const headers = await buildAuthHeaders()
  const directory = ensureDirectory()
  const metadata = await fetchRemoteMetadata(resolvedUrl, headers)
  const fallbackName = sanitizeFileName(metadata.fileName ?? guessFileNameFromUrl(resolvedUrl))
  const uniquePart = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  const storageName = `${uniquePart}-${fallbackName}`
  const destination = new File(directory, storageName)

  const downloadedFile = await File.downloadFileAsync(resolvedUrl, destination, {
    headers,
    idempotent: true,
  })

  return {
    uri: downloadedFile.uri,
    contentUri: downloadedFile.contentUri ?? null,
    fileName: metadata.fileName ? sanitizeFileName(metadata.fileName) : fallbackName,
    mimeType: metadata.mimeType ?? downloadedFile.type ?? null,
  }
}

export const usePatternFile = (fileUrl?: string | null): UsePatternFileResult => {
  const [file, setFile] = useState<PatternFileHandle | null>(null)
  const [isPreparing, setIsPreparing] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const activeDownloadRef = useRef<Promise<PatternFileHandle> | null>(null)
  const storedUriRef = useRef<string | null>(null)
  const currentSourceRef = useRef<string | null>(null)

  const clearCachedFile = useCallback(async () => {
    if (!storedUriRef.current) {
      return
    }
    try {
      const cachedFile = new File(storedUriRef.current)
      if (cachedFile.exists) {
        cachedFile.delete()
      }
    } catch {
      // ignore delete issues – cache cleanup best effort only
    } finally {
      storedUriRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!fileUrl) {
      currentSourceRef.current = null
      setFile(null)
      setError(null)
      activeDownloadRef.current = null
      clearCachedFile().catch(() => undefined)
      return
    }

    if (currentSourceRef.current !== fileUrl) {
      currentSourceRef.current = fileUrl
      setFile(null)
      setError(null)
      activeDownloadRef.current = null
      clearCachedFile().catch(() => undefined)
    }
  }, [fileUrl, clearCachedFile])

  useEffect(() => {
    return () => {
      clearCachedFile().catch(() => undefined)
    }
  }, [clearCachedFile])

  const prepare = useCallback(async () => {
    if (!fileUrl) {
      throw new Error('Für dieses Schnittmuster liegt keine Datei vor.')
    }

    if (file && currentSourceRef.current === fileUrl) {
      return file
    }

    if (activeDownloadRef.current) {
      return activeDownloadRef.current
    }

    const pendingDownload = (async () => {
      setIsPreparing(true)
      setError(null)
      const handle = await downloadPatternFile(fileUrl)
      storedUriRef.current = handle.uri
      setFile(handle)
      return handle
    })()
      .catch((downloadError) => {
        const normalizedError =
          downloadError instanceof Error ? downloadError : new Error('Datei konnte nicht geladen werden.')
        setError(normalizedError)
        throw normalizedError
      })
      .finally(() => {
        setIsPreparing(false)
        activeDownloadRef.current = null
      })

    activeDownloadRef.current = pendingDownload
    return pendingDownload
  }, [file, fileUrl])

  const clear = useCallback(async () => {
    setFile(null)
    setError(null)
    await clearCachedFile()
  }, [clearCachedFile])

  return {
    fileUri: file?.uri ?? null,
    fileName: file?.fileName ?? null,
    mimeType: file?.mimeType ?? null,
    isPreparing,
    error,
    prepare,
    clear,
  }
}
