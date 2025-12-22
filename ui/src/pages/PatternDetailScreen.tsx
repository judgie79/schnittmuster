import { useEffect, useMemo, useState, useId } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore, getContrastColor, fileService } from '@schnittmuster/core'
import { Button } from '@/components/common/Button'
import { Loader } from '@/components/common/Loader'
import { Badge } from '@/components/common/Badge'
import { usePattern, useProtectedFile, usePatternMeasurements } from '@/hooks'
import { useGlobalContext } from '@/context'
import { patternPrinter, type PatternPrintRenderer } from '@/services'
import { createToast } from '@/utils'
import styles from './Page.module.css'

const PRINT_SCALE_STORAGE_KEY = 'pattern-print-scale'
const clampScaleValue = (value: number) => Math.min(150, Math.max(50, Math.round(value)))

const getFileExtension = (input?: string | null): string | undefined => {
  if (!input) {
    return undefined
  }
  const sanitized = input.split(/[?#]/)[0]
  const match = sanitized.match(/\.([a-z0-9]+)$/i)
  return match ? match[1].toLowerCase() : undefined
}

export const PatternDetailScreen = () => {
  const { patternId } = useParams()
  const navigate = useNavigate()
  const { dispatch } = useGlobalContext()
  const { user } = useAuthStore()
  const { measurements: patternMeasurements } = usePatternMeasurements(patternId)
  const { data, isLoading, error } = usePattern(patternId)
  const { url: thumbnailBlobUrl } = useProtectedFile(data?.thumbnailUrl)
  const [fileMimeType, setFileMimeType] = useState<string | null>(null)
  const fileExtension = useMemo(() => getFileExtension(data?.fileUrl), [data?.fileUrl])
  const isPdfFile = useMemo(() => {
    if (fileMimeType) {
      return fileMimeType.toLowerCase().includes('pdf')
    }
    return fileExtension === 'pdf'
  }, [fileExtension, fileMimeType])
  const [printScale, setPrintScale] = useState(100)
  const [isPrinting, setIsPrinting] = useState(false)
  const [printError, setPrintError] = useState<string | null>(null)
  const [printRenderer, setPrintRenderer] = useState<PatternPrintRenderer>('native')
  const scaleInputId = useId()
  const rendererGroupName = useId()

  const userId = user?.id
  const isAdmin = Boolean(user?.adminRole)
  const isOwner = data?.ownerId === userId
  const canEdit = Boolean(patternId && (isOwner || isAdmin))

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const storedRaw = window.localStorage.getItem(PRINT_SCALE_STORAGE_KEY)
    if (storedRaw === null) {
      return
    }
    const storedValue = Number(storedRaw)
    if (Number.isFinite(storedValue)) {
      setPrintScale(clampScaleValue(storedValue))
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(PRINT_SCALE_STORAGE_KEY, String(printScale))
  }, [printScale])

  useEffect(() => {
    let isActive = true
    const fetchMime = async () => {
      if (!data?.fileUrl) {
        setFileMimeType(null)
        return
      }
      try {
        const metadata = await fileService.getMetadata(data.fileUrl)
        if (isActive) {
          setFileMimeType(metadata.mimeType)
        }
      } catch {
        if (isActive) {
          setFileMimeType(null)
        }
      }
    }
    fetchMime()
    return () => {
      isActive = false
    }
  }, [data?.fileUrl])

  useEffect(() => {
    if (!isPdfFile && printRenderer === 'pdfjs') {
      setPrintRenderer('native')
    }
  }, [isPdfFile, printRenderer])

  const handleEditNavigate = () => {
    if (!patternId) {
      return
    }
    navigate(`/patterns/${patternId}/edit`)
  }

  const handleScaleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value)
    if (Number.isNaN(nextValue)) {
      return
    }
    setPrintScale(clampScaleValue(nextValue))
    setPrintError(null)
  }

  const handleRendererChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextRenderer = event.target.value as PatternPrintRenderer
    setPrintRenderer(nextRenderer)
    setPrintError(null)
  }

  const handlePrint = async () => {
    if (!data?.fileUrl) {
      setPrintError('Keine druckbare Datei gefunden.')
      return
    }
    const renderer: PatternPrintRenderer = isPdfFile ? printRenderer : 'native'
    setIsPrinting(true)
    setPrintError(null)
    try {
      await patternPrinter.print({
        fileUrl: data.fileUrl,
        fileName: data.name,
        scale: printScale / 100,
        renderer,
      })
      dispatch({ type: 'ADD_TOAST', payload: createToast('Druck vorbereitet – prüfe den Dialog.', 'success') })
    } catch (printIssue) {
      const message = printIssue instanceof Error ? printIssue.message : 'Druck fehlgeschlagen.'
      setPrintError(message)
      dispatch({ type: 'ADD_TOAST', payload: createToast(message, 'error') })
    } finally {
      setIsPrinting(false)
    }
  }


  if (isLoading) {
    return <Loader />
  }

  if (error || !data) {
    return <p>Pattern konnte nicht geladen werden.</p>
  }

  return (
    <section className={styles.section}>
      <img
        src={thumbnailBlobUrl ?? 'https://placehold.co/1200x800?text=Schnittmuster'}
        alt={data.name}
        className={styles.detailImage}
      />
      <header className={styles.sectionHeader}>
        <div>
          <h2>{data.name}</h2>
          <p className={styles.helperText}>{data.description ?? 'Keine Beschreibung hinterlegt.'}</p>
        </div>
        <div className={styles.headerActions}>
          <Badge>{data.status.toUpperCase()}</Badge>
          {canEdit ? (
            <Button type="button" variant="secondary" onClick={handleEditNavigate}>
              Bearbeiten
            </Button>
          ) : null}
        </div>
      </header>

      <div className={styles.tagSection}>
        <h3>Tags</h3>
        <div className={styles.tagList}>
          {data.tags.length ? (
            data.tags.map((tag) => {
              const backgroundColor = tag.colorHex ?? '#e2e8f0'
              const textColor = getContrastColor(backgroundColor)
              return (
                <span
                  key={tag.id}
                  className={styles.tagChip}
                  style={{ backgroundColor, color: textColor }}
                >
                  {tag.name}
                </span>
              )
            })
          ) : (
            <p className={styles.helperText}>Noch keine Tags zugewiesen.</p>
          )}
        </div>
      </div>

      {/* Measurements Section */}
      {patternMeasurements.length > 0 && (
        <div className={styles.tagSection}>
          <h3>Maßangaben</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {patternMeasurements.map((measurement) => (
              <div
                key={measurement.id}
                style={{
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--background-secondary)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <strong>{measurement.measurementType.name}</strong>
                    {measurement.value && (
                      <span style={{ marginLeft: '8px', color: 'var(--text-secondary)' }}>
                        {measurement.value} {measurement.measurementType.unit}
                      </span>
                    )}
                    {measurement.isRequired && (
                      <span style={{ marginLeft: '8px', fontSize: '11px', padding: '2px 8px', backgroundColor: 'var(--border-color)', borderRadius: '4px' }}>
                        Erforderlich
                      </span>
                    )}
                  </div>
                </div>
                {measurement.notes && (
                  <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {measurement.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fabric Requirements Section */}
      {data.fabricRequirements && (
        <div className={styles.tagSection}>
          <h3>Stoffbedarf</h3>
          <div
            style={{
              padding: '16px',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              backgroundColor: 'var(--background-secondary)',
            }}
          >
            <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              {data.fabricRequirements.fabricWidth && (
                <div>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>Stoffbreite</strong>
                  <span>{data.fabricRequirements.fabricWidth} cm</span>
                </div>
              )}
              {data.fabricRequirements.fabricLength && (
                <div>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>Stofflänge</strong>
                  <span>{data.fabricRequirements.fabricLength} cm</span>
                </div>
              )}
              {data.fabricRequirements.fabricType && (
                <div>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>Stoffart</strong>
                  <span>{data.fabricRequirements.fabricType}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={styles.printControls}>
        <label htmlFor={scaleInputId}>
          <span>Druck-Skalierung (%)</span>
          <input
            id={scaleInputId}
            type="number"
            min={50}
            max={150}
            step={1}
            value={printScale}
            onChange={handleScaleChange}
            className={styles.printInput}
          />
        </label>
        <p className={styles.helperText}>
          100% = Originalgröße. Passe die Skalierung an, falls dein Testquadrat zu groß oder klein ist.
        </p>
        {isPdfFile ? (
          <div className={styles.printRenderer}>
            <span>Druck-Engine</span>
            <div className={styles.printRendererOptions}>
              <label className={styles.printRendererOption}>
                <input
                  type="radio"
                  name={rendererGroupName}
                  value="native"
                  checked={printRenderer === 'native'}
                  onChange={handleRendererChange}
                />
                Standard (Browser)
              </label>
              <label className={styles.printRendererOption}>
                <input
                  type="radio"
                  name={rendererGroupName}
                  value="pdfjs"
                  checked={printRenderer === 'pdfjs'}
                  onChange={handleRendererChange}
                />
                PDF.js (Beta)
              </label>
            </div>
            <p className={styles.helperText}>
              PDF.js rendert jede Seite verlustfrei im Browser und ermöglicht präzisere 1:1 Ausdrucke, kann aber
              je nach Umfang länger laden.
            </p>
          </div>
        ) : null}
        {printError ? <p className={styles.printError}>{printError}</p> : null}
      </div>

      <div className={styles.actionGrid}>
        <Button type="button" onClick={handlePrint} disabled={!data.fileUrl || isPrinting}>
          {isPrinting ? 'Druck wird vorbereitet ...' : '🖨️ Drucken'}
        </Button>
        <Button variant="secondary">✓ Als genäht markieren</Button>
        <Button variant="ghost">★ Favorisieren</Button>
      </div>
    </section>
  )
}
