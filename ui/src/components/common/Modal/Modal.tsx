import type { PropsWithChildren } from 'react'
import { Button } from '../Button/Button'
import styles from './Modal.module.css'

interface ModalProps extends PropsWithChildren {
  title: string
  onClose: () => void
}

export const Modal = ({ title, children, onClose }: ModalProps) => {
  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label={title}>
      <div className={styles.dialog}>
        <header>
          <h3>{title}</h3>
        </header>
        <div>{children}</div>
        <footer>
          <Button onClick={onClose} variant="secondary">
            Schließen
          </Button>
        </footer>
      </div>
    </div>
  )
}
