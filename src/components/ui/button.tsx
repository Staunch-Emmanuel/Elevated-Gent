import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center text-center font-sans text-sm font-medium uppercase tracking-[0.08em] border transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer relative overflow-hidden transform hover:scale-[1.02] active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--color-eg-espresso)] text-[var(--color-eg-cream)] border-[var(--color-eg-espresso)] hover:bg-[var(--color-eg-cream)] hover:text-[var(--color-eg-espresso)] hover:shadow-lg',
        inverse:
          'bg-[var(--color-eg-cream)] text-[var(--color-eg-espresso)] border-[var(--color-eg-espresso)] hover:bg-[var(--color-eg-espresso)] hover:text-[var(--color-eg-cream)] hover:shadow-lg',
        outline:
          'border-[var(--color-eg-espresso)] bg-transparent text-[var(--color-eg-espresso)] hover:bg-[var(--color-eg-espresso)] hover:text-[var(--color-eg-cream)] hover:shadow-lg',
        ghost:
          'border-transparent bg-transparent text-[var(--color-eg-espresso)] hover:bg-[var(--color-eg-espresso)] hover:text-[var(--color-eg-cream)] hover:shadow-md',
      },
      size: {
        default: 'px-8 py-4',
        sm: 'px-5 py-3',
        lg: 'px-10 py-5 text-base',
        icon: 'h-10 w-10',
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