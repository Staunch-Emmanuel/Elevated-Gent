import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex min-h-12 w-full border border-[rgba(129,126,108,0.42)] bg-[#e8ebec] px-4 py-3 font-serif text-base text-[#24231d] outline-none transition-colors placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817e6c] focus:border-[#817e6c] focus:ring-0 disabled:cursor-not-allowed disabled:bg-[#e8ebec] disabled:text-[#625e53] disabled:opacity-70',
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