import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
}

export function Card({ className, hover, glass, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-[var(--card)] text-[var(--card-foreground)] shadow-sm",
        hover && "card-hover cursor-pointer",
        glass && "glass",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pb-0", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-6 pt-0 flex items-center", className)}
      {...props}
    />
  );
}
