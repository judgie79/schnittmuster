import type { ChangeEvent, DragEvent, KeyboardEvent } from 'react'
import { useEffect, useId, useRef, useState } from 'react'
import styles from './FileUpload.module.css'

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

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!isDragging) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget as Node | null
    if (nextTarget && event.currentTarget.contains(nextTarget)) {
      return
    }
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
    <div>
      <input
        ref={inputRef}
        id={inputId}
        className={styles.input}
        type="file"
        accept={accept}
        aria-labelledby={labelId}
        onChange={handleChange}
      />
      <div
        role="button"
        tabIndex={0}
        aria-controls={inputId}
        aria-labelledby={labelId}
        className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
        onClick={openFileDialog}
        onKeyDown={handleKeyDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <span id={labelId} className={styles.label}>
          {label}
        </span>
        <p className={styles.hint}>Datei hierher ziehen oder</p>
        <span className={styles.button}>Datei auswählen</span>
        {fileName ? <p className={styles.fileName}>{fileName}</p> : null}
        {previewUrl ? <img src={previewUrl} alt="Vorschau" className={styles.preview} /> : null}
      </div>
    </div>
  )
}
