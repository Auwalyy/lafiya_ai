import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, suffix, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3 text-slate-400 pointer-events-none">{icon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-11 rounded-xl border bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all duration-200",
              "border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent",
              icon && "pl-10",
              suffix && "pr-10",
              error && "border-red-400 focus:ring-red-400",
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 text-slate-400">{suffix}</span>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
