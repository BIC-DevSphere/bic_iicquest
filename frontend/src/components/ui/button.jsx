import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-bold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-ring active:scale-95 btn-hover-lift",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-professional hover:shadow-premium hover:scale-105",
        destructive:
          "bg-destructive text-white shadow-professional hover:shadow-premium hover:scale-105",
        outline:
          "border border-border glass-card-subtle text-card-foreground hover:shadow-professional hover:scale-105",
        secondary:
          "section-bg-secondary text-secondary-foreground shadow-elegant hover:shadow-professional hover:scale-105",
        ghost:
          "hover:bg-accent/50 hover:text-accent-foreground hover:scale-105 rounded-xl",
        link: 
          "text-primary underline-offset-4 hover:underline hover:text-primary/80 rounded-none shadow-none hover:scale-100",
        gradient:
          "gradient-primary text-white shadow-professional hover:shadow-premium hover:scale-105",
        accent:
          "gradient-accent text-white shadow-professional hover:shadow-premium hover:scale-105",
        elegant:
          "glass-card text-card-foreground shadow-elegant hover:shadow-professional hover:scale-105 border border-border/50",
      },
      size: {
        default: "h-11 px-8 py-2 has-[>svg]:px-6",
        sm: "h-9 rounded-xl gap-1.5 px-6 text-xs has-[>svg]:px-4",
        lg: "h-13 rounded-2xl px-10 text-base has-[>svg]:px-8",
        xl: "h-16 rounded-3xl px-12 text-lg has-[>svg]:px-10",
        icon: "size-11 rounded-2xl",
        "icon-sm": "size-9 rounded-xl",
        "icon-lg": "size-13 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
