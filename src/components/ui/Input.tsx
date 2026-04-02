import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '../../utils/helpers'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-extrabold text-[#000]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full px-4 py-2.5 rounded-sm bg-white border-2 border-[#000]',
            'text-[#000] placeholder:text-[#94a3b8]',
            'focus:outline-none focus:ring-2 focus:ring-[#96c3e0] focus:border-[#96c3e0]',
            'transition-all duration-150',
            'box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);',
            error && 'border-[#ff7b7b] focus:ring-[#ff7b7b]',
            className
          )}
          {...props}
        />
        {error && <span className="text-sm font-semibold text-[#ff7b7b]">{error}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
