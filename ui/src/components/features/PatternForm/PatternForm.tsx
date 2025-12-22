import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/common/Button'
import { FileUpload } from '@/components/features/FileUpload/FileUpload'
import { TagSelector } from '@/components/features/TagSelector/TagSelector'
import { useProtectedFile } from '@/hooks'
import { fileService } from '@/services'
import { resolveAssetUrl } from '@/utils/url'
import type { PatternFormValues } from '@/types'
import type { PatternStatus, TagCategoryDTO, TagDTO } from '@schnittmuster/dtos'
import styles from './PatternForm.module.css'

const STATUS_OPTIONS: Array<{ value: PatternStatus; label: string }> = [
  { value: 'draft', label: 'Entwurf' },
  { value: 'geplant', label: 'Geplant' },
  { value: 'genaeht', label: 'Genäht' },
  { value: 'getestet', label: 'Getestet' },
  { value: 'archiviert', label: 'Archiviert' },
]

export interface PatternFormProps {
  initialValues?: Partial<PatternFormValues>
  initialTags?: TagDTO[]
  tagCategories: TagCategoryDTO[]
  areTagsLoading?: boolean
  existingThumbnailUrl?: string
  existingFileUrl?: string
  onSubmit: (values: PatternFormValues) => void | Promise<void>
  submitLabel?: string
  isSubmitting?: boolean
  errorMessage?: string | null
  requireFile?: boolean
  uploadProgress?: number | null
  maxFileSizeBytes?: number
}

const DEFAULT_VALUES: PatternFormValues = {
  name: '',
  description: '',
  status: 'draft',
  isFavorite: false,
  file: null,
  thumbnail: null,
  tagIds: [],
  notes: '',
}

const getFileNameFromPath = (path?: string): string | null => {
  if (!path) {
    return null
  }
  const sanitized = path.split(/[?#]/)[0]
  const segments = sanitized.split('/').filter(Boolean)
  return segments.length ? segments[segments.length - 1] : null
}

export const PatternForm = ({
  initialValues,
  initialTags = [],
  tagCategories,
  areTagsLoading = false,
  existingThumbnailUrl,
  existingFileUrl,
  onSubmit,
  submitLabel = 'Speichern',
  isSubmitting = false,
  errorMessage,
  requireFile = false,
  uploadProgress = null,
  maxFileSizeBytes = 52_428_800,
}: PatternFormProps) => {
  const mergedInitial = useMemo(() => ({ ...DEFAULT_VALUES, ...initialValues }), [initialValues])
  const maxFileSizeMB = Math.round(maxFileSizeBytes / (1024 * 1024))

  const [name, setName] = useState(mergedInitial.name)
  const [description, setDescription] = useState(mergedInitial.description ?? '')
  const [status, setStatus] = useState<PatternStatus>(mergedInitial.status)
  const [isFavorite, setIsFavorite] = useState<boolean>(mergedInitial.isFavorite)
  const [notes, setNotes] = useState(mergedInitial.notes ?? '')
  const [patternFile, setPatternFile] = useState<File | null>(mergedInitial.file ?? null)
  const [thumbnail, setThumbnail] = useState<File | null>(mergedInitial.thumbnail ?? null)
  const [selectedTags, setSelectedTags] = useState<TagDTO[]>(initialTags)
  const [localError, setLocalError] = useState<string | null>(null)
  const [fileSeed, setFileSeed] = useState(0)
  const [isOpeningExistingFile, setIsOpeningExistingFile] = useState(false)
  const [existingFileError, setExistingFileError] = useState<string | null>(null)
  const resetSnapshotRef = useRef<string | null>(null)
  const { url: existingThumbnailPreview } = useProtectedFile(existingThumbnailUrl)
  const existingFileName = useMemo(() => getFileNameFromPath(existingFileUrl ?? undefined), [existingFileUrl])

  useEffect(() => {
    const snapshot = JSON.stringify({
      name: mergedInitial.name,
      description: mergedInitial.description ?? '',
      status: mergedInitial.status,
      isFavorite: mergedInitial.isFavorite,
      notes: mergedInitial.notes ?? '',
      tags: initialTags
        .map((tag) => tag.id)
        .sort()
        .join(','),
    })

    if (resetSnapshotRef.current === snapshot) {
      return
    }

    resetSnapshotRef.current = snapshot
    setName(mergedInitial.name)
    setDescription(mergedInitial.description ?? '')
    setStatus(mergedInitial.status)
    setIsFavorite(mergedInitial.isFavorite)
    setNotes(mergedInitial.notes ?? '')
    setPatternFile(mergedInitial.file ?? null)
    setThumbnail(mergedInitial.thumbnail ?? null)
    setSelectedTags(initialTags)
    setFileSeed((seed) => seed + 1)
  }, [initialTags, mergedInitial])

  const toggleTag = (tag: TagDTO) => {
    setSelectedTags((prev) => {
      const exists = prev.some((item) => item.id === tag.id)
      return exists ? prev.filter((item) => item.id !== tag.id) : [...prev, tag]
    })
  }

  const handleExistingFileOpen = async () => {
    if (!existingFileUrl || isOpeningExistingFile) {
      return
    }
    const resolvedUrl = resolveAssetUrl(existingFileUrl)
    if (!resolvedUrl) {
      setExistingFileError('Datei nicht verfügbar.')
      return
    }

    setIsOpeningExistingFile(true)
    setExistingFileError(null)

    try {
      const blob = await fileService.get(resolvedUrl)
      const objectUrl = URL.createObjectURL(blob)
      const newWindow = window.open(objectUrl, '_blank', 'noopener')
      if (newWindow) {
        newWindow.focus()
      }
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Datei konnte nicht geöffnet werden.'
      setExistingFileError(message)
    } finally {
      setIsOpeningExistingFile(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (requireFile && !patternFile) {
      setLocalError('Bitte lade dein Schnittmuster als Datei hoch.')
      return
    }
    if (patternFile && patternFile.size > maxFileSizeBytes) {
      setLocalError(`Die Schnittmuster-Datei darf maximal ${maxFileSizeMB} MB groß sein.`)
      return
    }
    if (thumbnail && thumbnail.size > maxFileSizeBytes) {
      setLocalError(`Das Vorschaubild darf maximal ${maxFileSizeMB} MB groß sein.`)
      return
    }
    setLocalError(null)
    onSubmit({
      name,
      description,
      status,
      isFavorite,
      notes,
      file: patternFile,
      thumbnail,
      tagIds: selectedTags.map((tag) => tag.id),
    })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.stack}>
        <div>
          <FileUpload key={`pattern-file-${fileSeed}`} label={`Schnittmuster hochladen (max. ${maxFileSizeMB} MB)`} onFileChange={setPatternFile} />
          {patternFile ? <p className={styles.helper}>Ausgewählte Datei: {patternFile.name}</p> : null}
          {!patternFile && existingFileUrl ? (
            <div className={styles.previewCard}>
              <span className={styles.previewLabel}>Aktuelle PDF-Datei</span>
              <div className={styles.previewFileRow}>
                <p className={styles.previewFileName}>{existingFileName ?? 'Schnittmuster.pdf'}</p>
                <Button type="button" variant="secondary" onClick={handleExistingFileOpen} disabled={isOpeningExistingFile}>
                  {isOpeningExistingFile ? 'Öffne …' : 'Anzeigen'}
                </Button>
              </div>
              {existingFileError ? <p className={styles.previewError}>{existingFileError}</p> : null}
            </div>
          ) : null}
        </div>
        <div>
          <FileUpload
            key={`thumbnail-file-${fileSeed}`}
            label={`Vorschaubild (max. ${maxFileSizeMB} MB)`}
            onFileChange={setThumbnail}
          />
          {thumbnail ? <p className={styles.helper}>Vorschaubild: {thumbnail.name}</p> : null}
          {!thumbnail && existingThumbnailPreview ? (
            <div className={styles.previewCard}>
              <span className={styles.previewLabel}>Aktuelles Vorschaubild</span>
              <img src={existingThumbnailPreview} alt="Aktuelles Vorschaubild" className={styles.previewImage} />
            </div>
          ) : null}
        </div>
      </div>

      <label>
        <span className={styles.sectionTitle}>Name</span>
        <input type="text" value={name} onChange={(event) => setName(event.target.value)} required />
      </label>

      <label>
        <span className={styles.sectionTitle}>Beschreibung</span>
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>

      <label>
        <span className={styles.sectionTitle}>Status</span>
        <select value={status} onChange={(event) => setStatus(event.target.value as PatternStatus)}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.checkboxRow}>
        <input type="checkbox" checked={isFavorite} onChange={(event) => setIsFavorite(event.target.checked)} />
        Zu Favoriten hinzufügen
      </label>

      <label>
        <span className={styles.sectionTitle}>Notizen</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Optionale Hinweise"
        />
      </label>

      <div>
        <span className={styles.sectionTitle}>Kategorien & Tags</span>
        <TagSelector categories={tagCategories} selected={selectedTags} onToggle={toggleTag} isLoading={areTagsLoading} />
      </div>

      {localError ? <p className={styles.error}>{localError}</p> : null}
      {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}

      <div className={styles.actions}>
        <Button type="submit" disabled={!name || (requireFile && !patternFile) || isSubmitting}>
          {isSubmitting ? 'Speichern ...' : submitLabel}
        </Button>
        {typeof uploadProgress === 'number' && (
          <div className={styles.progressWrapper} aria-live="polite">
            <div className={styles.progressTrack}>
              <div className={styles.progressBar} style={{ width: `${uploadProgress}%` }} />
            </div>
            <span className={styles.helper}>{uploadProgress}% hochgeladen</span>
          </div>
        )}
      </div>
    </form>
  )
}
