'use client'

import { forwardRef } from 'react'

type CardVariant = 'default' | 'gradient' | 'stat' | 'clickable'
type CardPadding = 'none' | 'sm' | 'md' | 'lg'
type AccentColor = 'blue' | 'emerald' | 'amber' | 'purple' | 'red' | 'gray'

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant
  padding?: CardPadding
  accentColor?: AccentColor
  as?: 'div' | 'article' | 'section'
}

const variantClasses: Record<CardVariant, string> = {
  default: `
    bg-white border border-slate-200
    shadow-sm
  `,
  gradient: `
    bg-gradient-to-br from-white to-slate-50
    border border-slate-200
    shadow-md
  `,
  stat: `
    bg-white border border-slate-200
    shadow-sm
    border-t-4
  `,
  clickable: `
    bg-white border border-slate-200
    shadow-sm
    cursor-pointer
    hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5
    transition-all duration-200
  `,
}

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

const accentClasses: Record<AccentColor, string> = {
  blue: 'border-t-blue-500',
  emerald: 'border-t-emerald-500',
  amber: 'border-t-amber-500',
  purple: 'border-t-purple-500',
  red: 'border-t-red-500',
  gray: 'border-t-gray-500',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      accentColor,
      as: Component = 'div',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={`
          rounded-xl
          ${variantClasses[variant]}
          ${paddingClasses[padding]}
          ${variant === 'stat' && accentColor ? accentClasses[accentColor] : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Card.displayName = 'Card'

// Card subcomponents
type CardHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function CardHeader({ title, subtitle, action, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`} {...props}>
      <div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function CardContent({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mt-4 pt-4 border-t border-slate-100 ${className}`} {...props}>
      {children}
    </div>
  )
}
