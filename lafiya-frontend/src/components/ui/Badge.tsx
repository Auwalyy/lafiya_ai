import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
        blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
        orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
        red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
        amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
        slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: { variant: "default", size: "sm" },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}
