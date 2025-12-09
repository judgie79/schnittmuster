import type { PropsWithChildren } from 'react'
import { Button } from '../Button/Button'

interface ModalProps extends PropsWithChildren {
  title: string
  onClose: () => void
}

export const Modal = ({ title, children, onClose }: ModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <header className="p-4 border-b border-border">
          <h3 className="text-lg font-bold text-text">{title}</h3>
        </header>
        <div className="p-4 overflow-y-auto">{children}</div>
        <footer className="p-4 border-t border-border flex justify-end">
          <Button onClick={onClose} variant="secondary">
            Schließen
          </Button>
        </footer>
      </div>
    </div>
  )
}
