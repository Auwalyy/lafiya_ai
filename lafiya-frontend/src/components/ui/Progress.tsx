import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  color?: "emerald" | "blue" | "orange" | "red" | "purple";
  size?: "sm" | "md";
  label?: string;
}

const colors = {
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
};

export function Progress({ value, max = 100, className, color = "emerald", size = "md", label }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{label}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div className={cn("w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden", size === "sm" ? "h-1.5" : "h-2.5")}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", colors[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
