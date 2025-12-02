import type { PropsWithChildren } from 'react'
import styles from './Container.module.css'

export const Container = ({ children }: PropsWithChildren) => {
  return <div className={styles.container}>{children}</div>
}
