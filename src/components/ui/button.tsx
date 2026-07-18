import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'relative inline-flex cursor-pointer items-center justify-center overflow-hidden border text-center font-sans text-sm font-semibold uppercase tracking-[0.1em] transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-eg-espresso-deep)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-eg-cream)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-[var(--color-eg-espresso-deep)] bg-[var(--color-eg-espresso-deep)] text-[var(--color-eg-cream)] shadow-[0_8px_22px_rgba(24,23,17,0.14)] hover:bg-transparent hover:text-[var(--color-eg-espresso-deep)] hover:shadow-none',
        inverse:
          'border-[var(--color-eg-cream)] bg-[var(--color-eg-cream)] text-[var(--color-eg-espresso-deep)] shadow-[0_8px_22px_rgba(24,23,17,0.14)] hover:bg-transparent hover:text-[var(--color-eg-cream)] hover:shadow-none',
        outline:
          'border-[var(--color-eg-espresso-deep)] bg-transparent text-[var(--color-eg-espresso-deep)] hover:bg-[var(--color-eg-espresso-deep)] hover:text-[var(--color-eg-cream)]',
        ghost:
          'border-transparent bg-transparent text-[var(--color-eg-espresso-deep)] hover:border-[var(--color-eg-line)] hover:bg-[var(--color-eg-paper)]',
      },
      size: {
        default: 'min-h-12 px-7 py-3',
        sm: 'min-h-10 px-5 py-2.5 text-xs',
        lg: 'min-h-14 px-9 py-4 text-sm',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }