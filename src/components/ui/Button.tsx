import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/helpers'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'warning' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    // Notebook Design System Variants
    const variants = {
      primary: 'notebook-button primary border-2 border-[#000] bg-[#7dc280] text-[#000] font-extrabold hover:shadow-[3px_3px_0_rgba(0,0,0,0.12)] active:shadow-[1px_1px_0_rgba(0,0,0,0.08)]',
      secondary: 'notebook-button secondary border-2 border-[#000] bg-[#96c3e0] text-[#000] font-extrabold hover:shadow-[3px_3px_0_rgba(0,0,0,0.12)] active:shadow-[1px_1px_0_rgba(0,0,0,0.08)]',
      warning: 'notebook-button warning border-2 border-[#000] bg-[#ff7b7b] text-white font-extrabold hover:shadow-[3px_3px_0_rgba(0,0,0,0.15)] active:shadow-[1px_1px_0_rgba(0,0,0,0.1)]',
      outline: 'border-2 border-[#000] bg-white text-[#000] font-semibold hover:bg-[#fafafa] hover:shadow-[2px_2px_0_rgba(0,0,0,0.08)]',
      ghost: 'text-[#000] font-semibold hover:bg-[#f8f8f8] hover:shadow-[2px_2px_0_rgba(0,0,0,0.06)]',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-sm font-extrabold transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-[#96c3e0] focus:ring-offset-2',
          'disabled:opacity-60 disabled:pointer-events-none',
          'transform hover:-translate-y-0.5',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
