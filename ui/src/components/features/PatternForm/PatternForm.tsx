import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { FileUpload } from '@/components/features/FileUpload/FileUpload'
import { TagSelector } from '@/components/features/TagSelector/TagSelector'
import type { PatternFormValues } from '@/types'
import type { PatternStatus, TagCategoryDTO, TagDTO } from 'shared-dtos'
import { FaHeart, FaRegHeart } from 'react-icons/fa'

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
  onSubmit: (values: PatternFormValues) => void | Promise<void>
  submitLabel?: string
  isSubmitting?: boolean
  errorMessage?: string | null
  requireFile?: boolean
  uploadProgress?: number | null
  maxFileSizeBytes?: number
  existingFileUrl?: string | null
  existingThumbnailUrl?: string | null
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

export const PatternForm = ({
  initialValues,
  initialTags = [],
  tagCategories,
  areTagsLoading = false,
  onSubmit,
  submitLabel = 'Speichern',
  isSubmitting = false,
  errorMessage,
  requireFile = false,
  uploadProgress = null,
  maxFileSizeBytes = 52_428_800,
  existingFileUrl = null,
  existingThumbnailUrl = null,
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
  const resetSnapshotRef = useRef<string | null>(null)

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
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4 bg-surface p-4 rounded-xl border border-border shadow-sm">
        <div>
          <FileUpload
            key={`pattern-file-${fileSeed}`}
            label={`Schnittmuster hochladen (max. ${maxFileSizeMB} MB)`}
            onFileChange={setPatternFile}
          />
          {patternFile ? (
            <p className="text-sm text-text-muted mt-1">Ausgewählte Datei: {patternFile.name}</p>
          ) : existingFileUrl ? (
            <div className="flex items-center gap-2 mt-2 p-2 bg-background rounded-lg border border-border">
              <span className="text-sm text-text-muted">Aktuelle Datei hinterlegt.</span>
              <a href={existingFileUrl} target="_blank" rel="noreferrer" className="text-primary text-sm font-medium hover:underline">
                Öffnen
              </a>
            </div>
          ) : null}
        </div>
        <div>
          <FileUpload
            key={`thumbnail-file-${fileSeed}`}
            label={`Vorschaubild (max. ${maxFileSizeMB} MB)`}
            onFileChange={setThumbnail}
          />
          {thumbnail ? (
            <p className="text-sm text-text-muted mt-1">Vorschaubild: {thumbnail.name}</p>
          ) : existingThumbnailUrl ? (
            <div className="mt-2">
              <div className="w-24 h-24 rounded-lg overflow-hidden border border-border bg-background">
                <img
                  src={existingThumbnailUrl}
                  alt={name ? `${name} Vorschaubild` : 'Aktuelles Vorschaubild'}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm text-text-muted block mt-1">Aktuelles Vorschaubild</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 bg-surface p-4 rounded-xl border border-border shadow-sm">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(event) => setName(event.target.value)} 
            required 
            className="w-full p-3 rounded-lg border border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">Beschreibung</label>
          <textarea 
            value={description} 
            onChange={(event) => setDescription(event.target.value)} 
            className="w-full p-3 rounded-lg border border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all min-h-[100px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">Status</label>
          <select 
            value={status} 
            onChange={(event) => setStatus(event.target.value as PatternStatus)}
            className="w-full p-3 rounded-lg border border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background cursor-pointer hover:bg-surface transition-colors">
          <input 
            type="checkbox" 
            checked={isFavorite} 
            onChange={(event) => setIsFavorite(event.target.checked)} 
            className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300"
          />
          <span className="flex items-center gap-2 font-medium">
            {isFavorite ? <FaHeart className="text-primary" /> : <FaRegHeart className="text-text-muted" />}
            Zu Favoriten hinzufügen
          </span>
        </label>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">Notizen</label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optionale Hinweise"
            className="w-full p-3 rounded-lg border border-border bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all min-h-[80px]"
          />
        </div>
      </div>

      <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
        <TagSelector categories={tagCategories} selected={selectedTags} onToggle={toggleTag} isLoading={areTagsLoading} />
      </div>

      {localError ? <p className="text-error text-sm bg-error/10 p-3 rounded-lg">{localError}</p> : null}
      {errorMessage ? <p className="text-error text-sm bg-error/10 p-3 rounded-lg">{errorMessage}</p> : null}

      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm p-4 -mx-4 border-t border-border">
        <button 
          type="submit" 
          disabled={!name || (requireFile && !patternFile) || isSubmitting}
          className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-medium shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? 'Speichern ...' : submitLabel}
        </button>
        {typeof uploadProgress === 'number' && (
          <div className="mt-2" aria-live="polite">
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
            <span className="text-xs text-text-muted mt-1 block text-center">{uploadProgress}% hochgeladen</span>
          </div>
        )}
      </div>
    </form>
  )
}

