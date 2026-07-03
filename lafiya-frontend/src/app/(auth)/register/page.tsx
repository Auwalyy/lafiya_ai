"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, Mail, Lock, Eye, EyeOff, Stethoscope, Baby, Heart, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";

const roles = [
  { id: "patient", label: "Patient", icon: Heart, desc: "I'm seeking healthcare" },
  { id: "doctor", label: "Doctor", icon: Stethoscope, desc: "I'm a healthcare provider" },
  { id: "nurse", label: "Nurse", icon: Baby, desc: "I'm a nursing professional" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("patient");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "", preferredLanguage: "en",
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ ...form, role: selectedRole, preferredLanguage: form.preferredLanguage });
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-2xl">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Create your account</h1>
          <p className="text-slate-500 text-sm mt-1">Join 50,000+ users on LafiyaAI</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 mb-4">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Role selection */}
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">I am a...</p>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center",
                  selectedRole === role.id
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                    : "border-slate-200 dark:border-slate-700 hover:border-emerald-300"
                )}
              >
                <role.icon className={cn("h-5 w-5", selectedRole === role.id ? "text-emerald-600" : "text-slate-400")} />
                <span className={cn("text-xs font-semibold", selectedRole === role.id ? "text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400")}>
                  {role.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" placeholder="Amina" icon={<User className="h-4 w-4" />} value={form.firstName} onChange={set("firstName")} required />
            <Input label="Last name" placeholder="Bello" value={form.lastName} onChange={set("lastName")} required />
          </div>
          <Input label="Email address" type="email" placeholder="you@example.com" icon={<Mail className="h-4 w-4" />} value={form.email} onChange={set("email")} required />
          <Input label="Phone number" type="tel" placeholder="+234 800 000 0000" value={form.phone} onChange={set("phone")} />
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 characters"
            icon={<Lock className="h-4 w-4" />}
            value={form.password}
            onChange={set("password")}
            suffix={
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            required
          />

          <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
            <input type="checkbox" className="mt-0.5 rounded" required />
            <span>
              I agree to the{" "}
              <a href="#" className="text-emerald-600 hover:underline">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-emerald-600 hover:underline">Privacy Policy</a>
            </span>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
