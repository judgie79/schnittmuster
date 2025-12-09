import type { PropsWithChildren } from 'react'
import clsx from 'clsx'

interface CardProps extends PropsWithChildren {
  className?: string
}

export const Card = ({ children, className }: CardProps) => {
  return <div className={clsx("bg-surface rounded-xl border border-border shadow-sm overflow-hidden", className)}>{children}</div>
}
