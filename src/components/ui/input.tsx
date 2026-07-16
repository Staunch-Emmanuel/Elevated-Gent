import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex min-h-12 w-full border border-[#b9ae9d] bg-[#f2eadf] px-4 py-3 font-serif text-base text-[#24231d] outline-none transition-colors placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b] focus:ring-0 disabled:cursor-not-allowed disabled:bg-[#e9dfd1] disabled:text-[#625e53] disabled:opacity-70',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }