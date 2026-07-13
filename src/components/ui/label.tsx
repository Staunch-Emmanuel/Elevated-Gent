import * as React from 'react'
import { cn } from '@/lib/utils'

export interface LabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'inverse'
}

const Label = React.forwardRef<HTMLSpanElement, LabelProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-block px-3 py-2 text-xs font-medium uppercase tracking-[0.08em] leading-tight border rounded-full whitespace-nowrap relative overflow-hidden transition-all duration-300 ease-in-out cursor-pointer hover:scale-105 active:scale-95',
          {
            'text-[var(--color-eg-espresso)] bg-[var(--color-eg-paper-soft)] border-[var(--color-eg-espresso)] hover:bg-[var(--color-eg-espresso)] hover:text-[var(--color-eg-cream)]':
              variant === 'default',
            'text-[var(--color-eg-cream)] bg-[var(--color-eg-espresso)] border-[var(--color-eg-cream)] hover:bg-[var(--color-eg-cream)] hover:text-[var(--color-eg-espresso)]':
              variant === 'inverse',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Label.displayName = 'Label'

export { Label }