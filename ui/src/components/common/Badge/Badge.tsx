import clsx from 'clsx'
import type { PropsWithChildren } from 'react'

interface BadgeProps extends PropsWithChildren {
  className?: string
}

export const Badge = ({ children, className }: BadgeProps) => (
  <span className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary", className)}>{children}</span>
)
