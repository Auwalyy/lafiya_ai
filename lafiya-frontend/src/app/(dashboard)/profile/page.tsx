"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Progress } from "@/components/ui/Progress";
import { Camera, Bell, Shield, Globe, Moon, LogOut, ChevronRight } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

const settingsSections = [
  {
    title: "Notifications",
    icon: Bell,
    items: [
      { label: "Medication reminders", enabled: true },
      { label: "Appointment alerts", enabled: true },
      { label: "Community updates", enabled: false },
      { label: "AI health tips", enabled: true },
    ],
  },
  {
    title: "Privacy & Security",
    icon: Shield,
    items: [
      { label: "Two-factor authentication", enabled: false },
      { label: "Share health data with doctors", enabled: true },
      { label: "Anonymous community posts", enabled: false },
    ],
  },
];

export default function ProfilePage() {
  const { theme, toggle } = useTheme();
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    "Medication reminders": true,
    "Appointment alerts": true,
    "Community updates": false,
    "AI health tips": true,
    "Two-factor authentication": false,
    "Share health data with doctors": true,
    "Anonymous community posts": false,
  });

  const flip = (label: string) =>
    setToggles((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile & Settings</h1>
        <p className="text-sm text-slate-500">Manage your account and preferences</p>
      </div>

      {/* Profile card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            <div className="relative">
              <Avatar name="Amina Bello" size="xl" online />
              <button className="absolute bottom-0 right-0 h-7 w-7 rounded-full gradient-primary flex items-center justify-center shadow-md">
                <Camera className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Amina Bello</h2>
                <Badge variant="default">Patient</Badge>
              </div>
              <p className="text-slate-500 text-sm mt-1">amina.bello@email.com · +234 800 123 4567</p>
              <p className="text-slate-500 text-sm">Kano, Nigeria · Member since Jan 2025</p>

              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-1.5">Profile completion</p>
                <Progress value={75} label="" color="emerald" size="sm" />
                <p className="text-xs text-slate-400 mt-1">75% complete — Add your blood type to reach 100%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit profile */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Personal Information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="First name" defaultValue="Amina" />
            <Input label="Last name" defaultValue="Bello" />
            <Input label="Email" type="email" defaultValue="amina.bello@email.com" />
            <Input label="Phone" defaultValue="+234 800 123 4567" />
            <Input label="Date of birth" type="date" defaultValue="1990-05-15" />
            <Input label="Location" defaultValue="Kano, Nigeria" />
          </div>
          <div className="flex gap-3 mt-5">
            <Button size="md">Save Changes</Button>
            <Button variant="muted" size="md">Cancel</Button>
          </div>
        </CardContent>
      </Card>

      {/* Health info */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Health Information</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Blood type" defaultValue="O+" />
            <Input label="Height (cm)" defaultValue="165" />
            <Input label="Weight (kg)" defaultValue="68" />
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Conditions</p>
            <div className="flex gap-2 flex-wrap">
              {["Type 2 Diabetes", "Hypertension"].map((c) => (
                <Badge key={c} variant="default" size="md">{c} ×</Badge>
              ))}
              <Button variant="muted" size="sm">+ Add</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings toggles */}
      {settingsSections.map((section) => (
        <Card key={section.title}>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <section.icon className="h-5 w-5 text-emerald-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">{section.title}</h3>
            </div>
            <div className="space-y-3">
              {section.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
                  <button
                    onClick={() => flip(item.label)}
                    className={cn(
                      "h-6 w-11 rounded-full transition-all duration-200 relative",
                      toggles[item.label] ? "gradient-primary" : "bg-slate-200 dark:bg-slate-700"
                    )}
                  >
                    <span className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200",
                      toggles[item.label] ? "left-5.5 translate-x-0.5" : "left-0.5"
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Appearance */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Moon className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Appearance</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300">Dark mode</p>
              <p className="text-xs text-slate-400">Switch between light and dark theme</p>
            </div>
            <button
              onClick={toggle}
              className={cn(
                "h-6 w-11 rounded-full transition-all duration-200 relative",
                theme === "dark" ? "gradient-primary" : "bg-slate-200"
              )}
            >
              <span className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200",
                theme === "dark" ? "left-5.5 translate-x-0.5" : "left-0.5"
              )} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Language</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {["English", "Hausa"].map((lang, i) => (
              <button
                key={lang}
                className={cn(
                  "p-3 rounded-xl border-2 text-sm font-medium transition-all",
                  i === 0
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-300"
                )}
              >
                {lang}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button variant="danger" className="gap-2">
        <LogOut className="h-4 w-4" /> Sign Out
      </Button>
    </div>
  );
}
