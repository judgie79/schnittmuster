import { useGlobalContext } from '@/context'
import styles from './Toast.module.css'

export const ToastStack = () => {
  const {
    state: {
      ui: { toasts },
    },
    dispatch,
  } = useGlobalContext()

  if (!toasts.length) {
    return null
  }

  return (
    <div className={styles.stack}>
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.tone]}`}>
          <p>{toast.message}</p>
          <button type="button" onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}>
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
