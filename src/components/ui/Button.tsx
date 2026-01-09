'use client'

import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  loading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)]
    text-white font-medium
    shadow-md shadow-[var(--primary-500)]/25
    hover:shadow-lg hover:shadow-[var(--primary-500)]/30
    hover:-translate-y-0.5
    active:translate-y-0
  `,
  secondary: `
    bg-white border border-slate-200
    text-slate-700 font-medium
    hover:bg-slate-50 hover:border-slate-300
    active:bg-slate-100
  `,
  ghost: `
    bg-transparent
    text-slate-600 font-medium
    hover:bg-slate-100 hover:text-slate-900
    active:bg-slate-200
  `,
  danger: `
    bg-red-500 text-white font-medium
    shadow-md shadow-red-500/25
    hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30
    hover:-translate-y-0.5
    active:translate-y-0
  `,
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm gap-2 rounded-xl',
  lg: 'px-6 py-3 text-base gap-2 rounded-xl',
}

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      leftIcon,
      rightIcon,
      fullWidth = false,
      loading = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center
          transition-all duration-200 ease-out
          focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <Loader2 className={`${iconSizeClasses[size]} animate-spin`} />
        ) : leftIcon ? (
          <span className={iconSizeClasses[size]}>{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !loading && (
          <span className={iconSizeClasses[size]}>{rightIcon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
