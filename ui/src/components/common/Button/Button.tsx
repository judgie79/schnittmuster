import clsx from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export const Button = ({ variant = 'primary', className, ...props }: ButtonProps) => {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover focus:ring-primary",
    secondary: "bg-surface text-text border border-border hover:bg-background focus:ring-gray-500",
    ghost: "bg-transparent text-text hover:bg-surface focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
  }

  return (
    <button 
      className={clsx(
        "inline-flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]",
        variants[variant],
        className
      )} 
      {...props} 
    />
  )
}
