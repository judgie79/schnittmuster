import type { PropsWithChildren } from 'react'

export const Container = ({ children }: PropsWithChildren) => {
  return <div className="w-full max-w-md mx-auto px-4 py-4">{children}</div>
}

