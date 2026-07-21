"use client";

import { Heart } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      <nav className="p-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">LafiyaAI</span>
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}
