"use client";
import { Bell, Search, Sun, Moon, Menu, Heart } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Bot, Users, Calendar, FileText,
  Pill, Baby, Stethoscope, AlertTriangle,
} from "lucide-react";

const mobileNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/ai", icon: Bot, label: "AI" },
  { href: "/community", icon: Users, label: "Community" },
  { href: "/appointments", icon: Calendar, label: "Appts" },
  { href: "/emergency", icon: AlertTriangle, label: "SOS" },
];

export function Topbar() {
  const { theme, toggle } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-20 h-16 border-b bg-[var(--card)]/80 backdrop-blur-md flex items-center px-4 gap-4">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2">
          <div className="h-8 w-8 rounded-xl gradient-primary flex items-center justify-center">
            <Heart className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-white">LafiyaAI</span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md hidden sm:flex items-center gap-2 h-9 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm">
          <Search className="h-4 w-4 shrink-0" />
          <input
            placeholder="Search doctors, posts, conditions..."
            className="bg-transparent flex-1 outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400 text-sm"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => setNotifOpen(!notifOpen)} aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
            </Button>
            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 rounded-2xl border bg-[var(--card)] shadow-xl p-4 animate-fade-in">
                <p className="font-semibold text-sm mb-3">Notifications</p>
                {[
                  { title: "Dr. Musa confirmed your appointment", time: "2m ago", color: "bg-emerald-500" },
                  { title: "New post in Diabetes Community", time: "15m ago", color: "bg-blue-500" },
                  { title: "Medication reminder: Metformin", time: "1h ago", color: "bg-orange-500" },
                ].map((n, i) => (
                  <div key={i} className="flex gap-3 py-2.5 border-b last:border-0">
                    <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${n.color}`} />
                    <div>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{n.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Avatar name="Amina Bello" size="sm" online className="cursor-pointer" />
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t bg-[var(--card)]/95 backdrop-blur-md flex">
        {mobileNav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                active ? "text-emerald-600" : "text-slate-500"
              )}
            >
              <Icon className={cn("h-5 w-5", href === "/emergency" && "text-red-500")} />
              <span className={href === "/emergency" ? "text-red-500" : ""}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
