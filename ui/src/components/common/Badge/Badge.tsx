import clsx from 'clsx'
import type { PropsWithChildren } from 'react'
import styles from './Badge.module.css'

interface BadgeProps extends PropsWithChildren {
  className?: string
}

export const Badge = ({ children, className }: BadgeProps) => (
  <span className={clsx(styles.badge, className)}>{children}</span>
)
