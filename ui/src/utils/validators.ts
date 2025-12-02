export const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value)

export const isStrongPassword = (value: string) => {
  const minLength = value.length >= 8
  const hasNumber = /\d/.test(value)
  const hasUppercase = /[A-Z]/.test(value)
  return minLength && hasNumber && hasUppercase
}
