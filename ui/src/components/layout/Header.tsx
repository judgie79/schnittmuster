import type { ReactNode } from 'react'
import styles from './Header.module.css'

interface HeaderProps {
  title: string
  actions?: ReactNode
}

export const Header = ({ title, actions }: HeaderProps) => {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  )
}
