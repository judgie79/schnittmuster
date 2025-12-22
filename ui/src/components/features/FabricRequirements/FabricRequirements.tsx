import type { FabricRequirementsDTO } from '@schnittmuster/dtos'
import styles from './FabricRequirements.module.css'

interface FabricRequirementsProps {
  fabricRequirements?: FabricRequirementsDTO
  onChange: (fabricRequirements: FabricRequirementsDTO) => void
}

export const FabricRequirements = ({ fabricRequirements, onChange }: FabricRequirementsProps) => {
  const handleChange = (field: keyof FabricRequirementsDTO, value: string) => {
    onChange({
      ...fabricRequirements,
      [field]: value === '' ? undefined : field === 'fabricType' ? value : Number(value),
    })
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Stoffbedarf</h3>
      <p className={styles.description}>Optional: Gib den benötigten Stoff an</p>
      
      <div className={styles.grid}>
        <label className={styles.label}>
          <span>Stoffbreite (cm)</span>
          <input
            type="number"
            min="0"
            step="0.1"
            value={fabricRequirements?.fabricWidth ?? ''}
            onChange={(e) => handleChange('fabricWidth', e.target.value)}
            placeholder="z.B. 140"
            className={styles.input}
          />
        </label>

        <label className={styles.label}>
          <span>Stofflänge (cm)</span>
          <input
            type="number"
            min="0"
            step="0.1"
            value={fabricRequirements?.fabricLength ?? ''}
            onChange={(e) => handleChange('fabricLength', e.target.value)}
            placeholder="z.B. 200"
            className={styles.input}
          />
        </label>

        <label className={styles.label}>
          <span>Stoffart</span>
          <input
            type="text"
            value={fabricRequirements?.fabricType ?? ''}
            onChange={(e) => handleChange('fabricType', e.target.value)}
            placeholder="z.B. Baumwolle, Leinen, Jersey"
            className={styles.input}
          />
        </label>
      </div>
    </div>
  )
}
