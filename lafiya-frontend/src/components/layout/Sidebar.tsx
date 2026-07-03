"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import {
  LayoutDashboard, Bot, Users, Calendar, FileText,
  Pill, Baby, Stethoscope, AlertTriangle, Bell,
  Settings, LogOut, Heart, ChevronLeft, ChevronRight,
  Building2, Megaphone, ShieldCheck,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/ai", icon: Bot, label: "AI Assistant" },
  { href: "/community", icon: Users, label: "Community" },
  { href: "/appointments", icon: Calendar, label: "Appointments" },
  { href: "/health-records", icon: FileText, label: "Health Records" },
  { href: "/medications", icon: Pill, label: "Medications" },
  { href: "/pregnancy", icon: Baby, label: "Pregnancy" },
  { href: "/doctors", icon: Stethoscope, label: "Doctors" },
  { href: "/emergency", icon: AlertTriangle, label: "Emergency" },
  { href: "/hospitals", icon: Building2, label: "Hospitals" },
  { href: "/campaigns", icon: Megaphone, label: "Campaigns" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 border-r bg-[var(--card)] transition-all duration-300 z-30",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 p-4 border-b", collapsed && "justify-center")}>
        <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
          <Heart className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">LafiyaAI</p>
            <p className="text-xs text-slate-500">Health Network</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                active
                  ? "gradient-primary text-white shadow-md shadow-emerald-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t space-y-1">
        <Link
          href="/admin"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all",
            collapsed && "justify-center px-2"
          )}
        >
          <ShieldCheck className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Admin</span>}
        </Link>
        <Link
          href="/notifications"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all",
            collapsed && "justify-center px-2"
          )}
        >
          <Bell className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Notifications</span>}
        </Link>
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all",
            collapsed && "justify-center px-2"
          )}
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>

        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 mt-2">
            <Avatar name="Amina Bello" size="sm" online />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">Amina Bello</p>
              <p className="text-xs text-slate-500 truncate">Patient</p>
            </div>
            <LogOut className="h-4 w-4 text-slate-400 hover:text-red-500 cursor-pointer transition-colors" />
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-slate-500 hover:text-emerald-600 transition-colors"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}
