"use client";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Progress } from "@/components/ui/Progress";
import { Camera, Bell, Shield, Globe, Moon, LogOut, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { users as usersApi } from "@/lib/api";

const settingsSections = [
  {
    title: "Notifications", icon: Bell,
    items: ["Medication reminders", "Appointment alerts", "Community updates", "AI health tips"],
  },
  {
    title: "Privacy & Security", icon: Shield,
    items: ["Two-factor authentication", "Share health data with doctors", "Anonymous community posts"],
  },
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    bloodType: "", height: "", weight: "",
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [avatarLoading, setAvatarLoading] = useState(false);

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    "Medication reminders": true, "Appointment alerts": true,
    "Community updates": false, "AI health tips": true,
    "Two-factor authentication": false, "Share health data with doctors": true,
    "Anonymous community posts": false,
  });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        bloodType: user.bloodType ?? "",
        height: user.height?.toString() ?? "",
        weight: user.weight?.toString() ?? "",
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      await usersApi.updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        bloodType: form.bloodType || undefined,
        height: form.height ? Number(form.height) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Failed to save");
    } finally { setSaveLoading(false); }
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      await usersApi.uploadAvatar(fd);
    } catch {} finally { setAvatarLoading(false); }
  };

  const completionFields = [form.firstName, form.lastName, form.email, form.phone, form.bloodType, form.height, form.weight];
  const completion = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

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
              <Avatar name={user ? `${user.firstName} ${user.lastName}` : "User"} size="xl" online />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={avatarLoading}
                className="absolute bottom-0 right-0 h-7 w-7 rounded-full gradient-primary flex items-center justify-center shadow-md">
                {avatarLoading ? <Loader2 className="h-3.5 w-3.5 text-white animate-spin" /> : <Camera className="h-3.5 w-3.5 text-white" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </h2>
                <Badge variant="default">{user?.role ?? "patient"}</Badge>
              </div>
              <p className="text-slate-500 text-sm mt-1">{user?.email}{user?.phone ? ` · ${user.phone}` : ""}</p>
              {user?.location && <p className="text-slate-500 text-sm">{user.location}</p>}
              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-1.5">Profile completion</p>
                <Progress value={completion} label="" color="emerald" size="sm" />
                <p className="text-xs text-slate-400 mt-1">{completion}% complete</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit profile */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Personal Information</h3>
          {saveSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 mb-4">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <p className="text-sm text-emerald-700">Profile updated successfully!</p>
            </div>
          )}
          {saveError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 mb-4">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-600">{saveError}</p>
            </div>
          )}
          <form onSubmit={handleSave}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="First name" value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
              <Input label="Last name" value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
              <Input label="Email" type="email" value={form.email} disabled />
              <Input label="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="flex gap-3 mt-5">
              <Button type="submit" size="md" disabled={saveLoading}>
                {saveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Health info */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Health Information</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Blood type" value={form.bloodType} onChange={(e) => setForm((p) => ({ ...p, bloodType: e.target.value }))} placeholder="e.g. O+" />
            <Input label="Height (cm)" type="number" value={form.height} onChange={(e) => setForm((p) => ({ ...p, height: e.target.value }))} />
            <Input label="Weight (kg)" type="number" value={form.weight} onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))} />
          </div>
          {(user?.conditions ?? []).length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Conditions</p>
              <div className="flex gap-2 flex-wrap">
                {(user?.conditions ?? []).map((c) => <Badge key={c} variant="default" size="md">{c}</Badge>)}
              </div>
            </div>
          )}
          <Button size="md" className="mt-4" onClick={handleSave} disabled={saveLoading}>
            {saveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Health Info"}
          </Button>
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
                <div key={item} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                  <button onClick={() => setToggles((prev) => ({ ...prev, [item]: !prev[item] }))}
                    className={cn("h-6 w-11 rounded-full transition-all duration-200 relative",
                      toggles[item] ? "gradient-primary" : "bg-slate-200 dark:bg-slate-700"
                    )}>
                    <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200",
                      toggles[item] ? "left-5.5 translate-x-0.5" : "left-0.5"
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
            <button onClick={toggle}
              className={cn("h-6 w-11 rounded-full transition-all duration-200 relative",
                theme === "dark" ? "gradient-primary" : "bg-slate-200"
              )}>
              <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200",
                theme === "dark" ? "left-5.5 translate-x-0.5" : "left-0.5"
              )} />
            </button>
          </div>
        </CardContent>
      </Card>

      <Button variant="danger" className="gap-2" onClick={logout}>
        <LogOut className="h-4 w-4" /> Sign Out
      </Button>
    </div>
  );
}
