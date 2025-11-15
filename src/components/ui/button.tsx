import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground hover:shadow-warm hover:scale-105 active:scale-95",
        secondary: "bg-gradient-secondary text-secondary-foreground hover:shadow-warm hover:scale-105 active:scale-95",
        outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-warm transition-all duration-300",
        ghost: "text-primary hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-gradient-to-r from-error to-red-500 text-error-foreground hover:shadow-lg hover:scale-105 active:scale-95",
        success: "bg-gradient-to-r from-success to-green-500 text-success-foreground hover:shadow-lg hover:scale-105 active:scale-95",
        warning: "bg-gradient-to-r from-warning to-amber-400 text-warning-foreground hover:shadow-warm hover:scale-105 active:scale-95",
        link: "text-primary underline-offset-4 hover:underline",
        upload: "bg-upload-zone border-2 border-dashed border-upload-zone-border text-muted-foreground hover:bg-upload-zone-active hover:border-primary hover:text-primary transition-all duration-300",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-md px-4 text-sm",
        lg: "h-14 rounded-xl px-8 text-base",
        icon: "h-12 w-12",
        xl: "h-16 rounded-xl px-10 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
