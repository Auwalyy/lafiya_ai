import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  online?: boolean;
}

const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-base", xl: "h-16 w-16 text-xl" };

function getInitials(name?: string) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

const colors = [
  "bg-emerald-500","bg-blue-500","bg-purple-500","bg-orange-500","bg-pink-500","bg-teal-500",
];

function getColor(name?: string) {
  if (!name) return colors[0];
  return colors[name.charCodeAt(0) % colors.length];
}

export function Avatar({ src, name, size = "md", className, online }: AvatarProps) {
  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      <div className={cn("rounded-full overflow-hidden flex items-center justify-center font-semibold text-white", sizes[size], !src && getColor(name))}>
        {src ? (
          <img src={src} alt={name ?? "avatar"} className="w-full h-full object-cover" />
        ) : (
          getInitials(name)
        )}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
      )}
    </div>
  );
}
