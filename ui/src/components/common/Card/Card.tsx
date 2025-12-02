import type { PropsWithChildren } from 'react'
import clsx from 'clsx'
import styles from './Card.module.css'

interface CardProps extends PropsWithChildren {
  className?: string
}

export const Card = ({ children, className }: CardProps) => {
  return <div className={clsx(styles.card, className)}>{children}</div>
}
