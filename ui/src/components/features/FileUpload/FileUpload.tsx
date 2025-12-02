import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'
import styles from './FileUpload.module.css'

interface FileUploadProps {
  label: string
  onFileChange: (file: File | null) => void
}

export const FileUpload = ({ label, onFileChange }: FileUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    onFileChange(file)
    if (file && file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setPreviewUrl(null)
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
    <label className={styles.dropzone}>
      <span>{label}</span>
      <input type="file" hidden onChange={handleChange} />
      {previewUrl ? <img src={previewUrl} alt="Vorschau" className={styles.preview} /> : null}
    </label>
  )
}
