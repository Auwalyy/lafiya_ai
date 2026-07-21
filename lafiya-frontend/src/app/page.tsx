"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Heart, Bot, Users, Stethoscope, Shield, Globe,
  Star, ArrowRight, CheckCircle2, Smartphone, Zap,
  Baby, Pill, AlertTriangle, FileText,
} from "lucide-react";

const features = [
  { icon: Bot, title: "AI Health Assistant", desc: "24/7 symptom analysis in English & Hausa, powered by GPT-4o", color: "bg-emerald-500" },
  { icon: Stethoscope, title: "Verified Doctors", desc: "Book consultations with certified healthcare professionals", color: "bg-blue-500" },
  { icon: Users, title: "Health Communities", desc: "Join condition-specific support groups with thousands of members", color: "bg-purple-500" },
  { icon: Baby, title: "Pregnancy Tracker", desc: "Week-by-week guidance for expecting mothers", color: "bg-pink-500" },
  { icon: Pill, title: "Medication Manager", desc: "Never miss a dose with smart reminders and adherence tracking", color: "bg-orange-500" },
  { icon: AlertTriangle, title: "Emergency SOS", desc: "One-tap emergency alerts with first aid guides", color: "bg-red-500" },
  { icon: FileText, title: "Health Records", desc: "Secure digital storage for all your medical documents", color: "bg-teal-500" },
  { icon: Globe, title: "Hausa-First Design", desc: "Built for Northern Nigeria with full Hausa language support", color: "bg-amber-500" },
];

const stats = [
  { value: "50,000+", label: "Active Patients" },
  { value: "500+", label: "Verified Doctors" },
  { value: "13", label: "Health Communities" },
  { value: "4.9★", label: "App Rating" },
];

const testimonials = [
  { name: "Aisha Kabir", role: "Diabetes Patient, Kano", text: "LafiyaAI helped me understand my condition in Hausa. The AI explains things my doctor doesn't have time to.", avatar: "AK" },
  { name: "Dr. Ibrahim Musa", role: "Cardiologist, AKTH", text: "The platform connects me with patients who need care. The appointment system is seamless.", avatar: "IM" },
  { name: "Zainab Mohammed", role: "Pregnant Mother, Kaduna", text: "The pregnancy tracker gives me peace of mind every week. I know exactly what to expect.", avatar: "ZM" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">LafiyaAI</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
            <a href="#communities" className="hover:text-emerald-600 transition-colors">Communities</a>
            <a href="#doctors" className="hover:text-emerald-600 transition-colors">Doctors</a>
            <a href="#about" className="hover:text-emerald-600 transition-colors">About</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-hero py-20 md:py-32 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <Badge variant="default" size="md" className="mb-6 inline-flex">
            <Zap className="h-3.5 w-3.5" />
            AI + Doctors + Community
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
            Healthcare for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">
              Northern Nigeria
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            LafiyaAI combines AI health assistance, verified doctors, and community support — all in English and Hausa. Healthcare that understands you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link href="/register">
              <Button size="xl" className="gap-2 w-full sm:w-auto">
                Start for Free <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/ai">
              <Button variant="outline" size="xl" className="gap-2 w-full sm:w-auto">
                <Bot className="h-5 w-5" /> Try AI Assistant
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-12">
            {["No subscription required", "Available in Hausa", "HIPAA-compliant", "24/7 AI support"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 border-y bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="default" size="md" className="mb-4">Everything you need</Badge>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">
              Complete Health Platform
            </h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">
              From AI symptom checking to doctor appointments — all in one place, designed for Northern Nigeria.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <Card key={f.title} hover className="overflow-hidden group">
                <CardContent className="p-5">
                  <div className={`h-12 w-12 rounded-2xl ${f.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <f.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{f.title}</h3>
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">Trusted by thousands</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 mt-5">
                    <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="gradient-primary rounded-3xl p-10 md:p-16 text-white relative overflow-hidden">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Start your health journey today</h2>
            <p className="text-emerald-100 text-lg mb-8">Free to join. No credit card required.</p>
            <Link href="/register">
              <Button className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-none" size="xl">
                Create Free Account <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
            <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/10" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl gradient-primary flex items-center justify-center">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">LafiyaAI</span>
          </div>
          <p className="text-sm text-slate-500">© 2025 LafiyaAI. Built for Northern Nigeria 🇳🇬</p>
          <div className="flex gap-4 text-sm text-slate-500">
            <a href="#" className="hover:text-emerald-600">Privacy</a>
            <a href="#" className="hover:text-emerald-600">Terms</a>
            <a href="#" className="hover:text-emerald-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
