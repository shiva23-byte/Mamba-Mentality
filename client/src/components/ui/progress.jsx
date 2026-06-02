import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "../../lib/utils";

const Progress = React.forwardRef(({ className, value, glowColor = "cyber-blue", ...props }, ref) => {
  const colorMap = {
    'cyber-blue': 'bg-cyber-blue',
    'neon-green': 'bg-neon-green',
    'neon-purple': 'bg-neon-purple',
    'neon-red': 'bg-neon-red',
    'mamba-gold': 'bg-mamba-gold',
  };

  const indicatorColor = colorMap[glowColor] || colorMap['cyber-blue'];

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2.5 w-full overflow-hidden rounded-full bg-zinc-800/80",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full rounded-full transition-all duration-500 ease-out",
          indicatorColor
        )}
        style={{ width: `${value || 0}%` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
