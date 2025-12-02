export const logger = {
  info: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      console.info('[schnittmuster]', ...args)
    }
  },
  error: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      console.error('[schnittmuster]', ...args)
    }
  },
}
