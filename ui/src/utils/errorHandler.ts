import type { AxiosError } from 'axios'

type ErrorLike = Error | AxiosError<{ message?: string }>

export const getErrorMessage = (error: ErrorLike) => {
  if ('response' in error && error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return 'Etwas ist schiefgelaufen. Bitte versuch es später erneut.'
}
