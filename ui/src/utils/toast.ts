import type { Dispatch } from 'react'
import type { GlobalAction, ToastItem } from '@/context/types'

type ToastTone = ToastItem['tone']

const generateToastId = () => window.crypto?.randomUUID?.() ?? `toast-${Date.now()}`

export const createToast = (message: string, tone: ToastTone = 'info'): ToastItem => ({
  id: generateToastId(),
  message,
  tone,
})

export const dispatchToast = (
  dispatch: Dispatch<GlobalAction>,
  message: string,
  tone: ToastTone = 'info'
) => {
  dispatch({ type: 'ADD_TOAST', payload: createToast(message, tone) })
}
