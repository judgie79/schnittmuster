import type { ChangeEvent, DragEvent, KeyboardEvent } from 'react'
import { useEffect, useId, useRef, useState } from 'react'
import { FaCloudUploadAlt, FaFile, FaImage } from 'react-icons/fa'
import { clsx } from 'clsx'

interface FileUploadProps {
  label: string
  onFileChange: (file: File | null) => void
  accept?: string
}

export const FileUpload = ({ label, onFileChange, accept }: FileUploadProps) => {
  const inputId = useId()
  const labelId = useId()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const openFileDialog = () => {
    inputRef.current?.click()
  }

  const updateFile = (file: File | null) => {
    onFileChange(file)
    setFileName(file?.name ?? null)
    if (file && file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setPreviewUrl(null)
    }
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    updateFile(file)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0] ?? null
    updateFile(file)
    event.dataTransfer.clearData()
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!isDragging) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openFileDialog()
    }
  }

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <div className="w-full">
      <label id={labelId} htmlFor={inputId} className="block text-sm font-medium text-text-muted mb-2">
        {label}
      </label>
      
      <div
        role="button"
        tabIndex={0}
        aria-labelledby={labelId}
        onKeyDown={handleKeyDown}
        onClick={openFileDialog}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={clsx(
          "relative flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden",
          isDragging 
            ? "border-primary bg-primary/5" 
            : "border-border bg-background hover:bg-surface hover:border-primary/50"
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="hidden"
          onChange={handleChange}
          accept={accept}
          aria-hidden="true"
        />

        {previewUrl ? (
          <img 
            src={previewUrl} 
            alt="Vorschau" 
            className="absolute inset-0 w-full h-full object-cover opacity-50" 
          />
        ) : null}

        <div className="relative z-10 flex flex-col items-center text-center p-4">
          {previewUrl ? (
            <FaImage className="text-primary mb-2" size={32} />
          ) : fileName ? (
            <FaFile className="text-primary mb-2" size={32} />
          ) : (
            <FaCloudUploadAlt className="text-text-muted mb-2" size={40} />
          )}
          
          <p className="text-sm font-medium text-text">
            {fileName ? fileName : 'Datei auswählen oder hierher ziehen'}
          </p>
          {!fileName && (
            <p className="text-xs text-text-muted mt-1">
              Klicken zum Durchsuchen
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
