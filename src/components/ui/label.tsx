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
          'relative inline-block cursor-pointer overflow-hidden whitespace-nowrap rounded-full border px-3 py-2 text-xs font-semibold uppercase leading-tight tracking-[0.1em] transition-all duration-300 ease-in-out',
          {
            'border-[var(--color-eg-espresso-deep)] bg-[var(--color-eg-paper)] text-[var(--color-eg-espresso-deep)] hover:bg-[var(--color-eg-espresso-deep)] hover:text-[var(--color-eg-cream)]':
              variant === 'default',
            'border-[var(--color-eg-cream)] bg-[var(--color-eg-espresso-deep)] text-[var(--color-eg-cream)] hover:bg-[var(--color-eg-cream)] hover:text-[var(--color-eg-espresso-deep)]':
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