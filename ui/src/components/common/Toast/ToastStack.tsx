import { useGlobalContext } from '@/context'
import { clsx } from 'clsx'

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

  const tones = {
    success: "bg-green-100 text-green-800 border border-green-200",
    error: "bg-red-100 text-red-800 border border-red-200",
    info: "bg-blue-100 text-blue-800 border border-blue-200",
    warning: "bg-yellow-100 text-yellow-800 border border-yellow-200"
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none sm:bottom-4 sm:right-4 sm:left-auto sm:w-96">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={clsx(
            "pointer-events-auto p-4 rounded-xl shadow-lg flex justify-between items-start gap-3 animate-in slide-in-from-bottom-2 fade-in duration-300",
            tones[toast.tone]
          )}
        >
          <p className="text-sm font-medium">{toast.message}</p>
          <button 
            type="button" 
            onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
            className="text-current opacity-50 hover:opacity-100 text-xl leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
