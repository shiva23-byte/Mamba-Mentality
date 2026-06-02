import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active-spring",
  {
    variants: {
      variant: {
        default:
          "bg-accent-teal/10 text-accent-teal border border-accent-teal/30 hover:bg-accent-teal/20 hover:border-accent-teal/50",
        destructive:
          "bg-neon-red/10 text-neon-red border border-neon-red/30 hover:bg-neon-red/20 hover:border-neon-red/50",
        success:
          "bg-neon-green/10 text-neon-green border border-neon-green/30 hover:bg-neon-green/20 hover:border-neon-green/50",
        purple:
          "bg-neon-purple/10 text-neon-purple border border-neon-purple/30 hover:bg-neon-purple/20 hover:border-neon-purple/50",
        ghost:
          "text-slate-muted hover:text-slate-primary hover:bg-sheet-bg",
        outline:
          "border border-sheet-border text-slate-secondary hover:bg-sheet-bg hover:text-slate-primary",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
