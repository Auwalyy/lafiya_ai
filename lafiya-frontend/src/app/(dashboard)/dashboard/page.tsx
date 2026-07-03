import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Avatar } from "@/components/ui/Avatar";
import {
  Heart, Activity, Pill, Calendar, Bot, ArrowRight,
  TrendingUp, Users, Stethoscope, AlertTriangle, Baby,
  CheckCircle2, Clock, ChevronRight,
} from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Heart Rate", value: "72 bpm", icon: Heart, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30", trend: "+2%" },
  { label: "Blood Pressure", value: "120/80", icon: Activity, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30", trend: "Normal" },
  { label: "Medications", value: "3 Today", icon: Pill, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30", trend: "1 pending" },
  { label: "Next Appointment", value: "Jul 8", icon: Calendar, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30", trend: "Dr. Musa" },
];

const quickActions = [
  { label: "Ask AI", desc: "Symptom check", icon: Bot, href: "/ai", color: "gradient-primary text-white" },
  { label: "Book Doctor", desc: "Find & schedule", icon: Stethoscope, href: "/doctors", color: "bg-blue-500 text-white" },
  { label: "Community", desc: "Join discussions", icon: Users, href: "/community", color: "bg-purple-500 text-white" },
  { label: "Emergency", desc: "SOS & first aid", icon: AlertTriangle, href: "/emergency", color: "bg-red-500 text-white" },
];

const appointments = [
  { doctor: "Dr. Ibrahim Musa", specialty: "Cardiologist", time: "Today, 2:00 PM", status: "confirmed", avatar: undefined },
  { doctor: "Dr. Fatima Aliyu", specialty: "Gynecologist", time: "Jul 10, 10:00 AM", status: "pending", avatar: undefined },
];

const communityPosts = [
  { community: "Diabetes Support", author: "Aisha K.", content: "Has anyone tried the new insulin pump? My doctor recommended it last week...", likes: 24, time: "1h ago" },
  { community: "Pregnancy & Maternal", author: "Zainab M.", content: "Week 28 update — baby is kicking so much! Any tips for back pain?", likes: 41, time: "3h ago" },
  { community: "Hypertension", author: "Musa B.", content: "Reminder: reduce salt intake. My BP dropped from 150/95 to 128/82 in 3 weeks!", likes: 67, time: "5h ago" },
];

const medications = [
  { name: "Metformin 500mg", time: "8:00 AM", taken: true },
  { name: "Lisinopril 10mg", time: "12:00 PM", taken: true },
  { name: "Aspirin 81mg", time: "8:00 PM", taken: false },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Good morning, Amina 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Your health summary for today, Thursday July 3
          </p>
        </div>
        <Link href="/ai">
          <Button size="md" className="gap-2">
            <Bot className="h-4 w-4" />
            Ask AI Assistant
          </Button>
        </Link>
      </div>

      {/* Health Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} hover className="animate-fade-in">
            <CardContent className="p-4">
              <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{s.value}</p>
              <p className="text-xs text-emerald-600 mt-1">{s.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((a) => (
            <Link key={a.label} href={a.href}>
              <Card hover className="overflow-hidden">
                <CardContent className="p-4">
                  <div className={`h-10 w-10 rounded-xl ${a.color} flex items-center justify-center mb-3 shadow-lg`}>
                    <a.icon className="h-5 w-5" />
                  </div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{a.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{a.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Appointments */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between pb-4">
                <h2 className="font-semibold text-slate-900 dark:text-white">Upcoming Appointments</h2>
                <Link href="/appointments">
                  <Button variant="ghost" size="sm" className="text-emerald-600 gap-1">
                    View all <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {appointments.map((apt, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <Avatar name={apt.doctor} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{apt.doctor}</p>
                    <p className="text-xs text-slate-500">{apt.specialty}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span className="text-xs text-slate-500">{apt.time}</span>
                    </div>
                  </div>
                  <Badge variant={apt.status === "confirmed" ? "default" : "amber"}>
                    {apt.status}
                  </Badge>
                </div>
              ))}
              <Link href="/appointments">
                <Button variant="outline" size="sm" className="w-full mt-2">
                  Book Appointment
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Medication Tracker */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between pb-4">
                <h2 className="font-semibold text-slate-900 dark:text-white">Today&apos;s Medications</h2>
                <Badge variant="blue">{medications.filter(m => m.taken).length}/{medications.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <Progress
                value={medications.filter(m => m.taken).length}
                max={medications.length}
                label="Adherence"
                color="emerald"
              />
              <div className="space-y-2 mt-3">
                {medications.map((med, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <CheckCircle2 className={`h-5 w-5 shrink-0 ${med.taken ? "text-emerald-500" : "text-slate-300"}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{med.name}</p>
                      <p className="text-xs text-slate-500">{med.time}</p>
                    </div>
                    {!med.taken && (
                      <Button variant="muted" size="sm">Take</Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Community Feed */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between pb-4">
                <h2 className="font-semibold text-slate-900 dark:text-white">Community Feed</h2>
                <Link href="/community">
                  <Button variant="ghost" size="sm" className="text-emerald-600 gap-1">
                    View all <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {communityPosts.map((post, i) => (
                <div key={i} className="p-4 rounded-xl border hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default" size="sm">{post.community}</Badge>
                    <span className="text-xs text-slate-400">{post.time}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Avatar name={post.author} size="sm" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{post.author}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{post.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors">
                      <Heart className="h-3.5 w-3.5" /> {post.likes}
                    </button>
                    <button className="text-xs text-slate-400 hover:text-emerald-600 transition-colors">Reply</button>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 ml-auto group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Health Tip Banner */}
      <Card className="gradient-primary text-white overflow-hidden relative">
        <CardContent className="p-6 flex items-center justify-between gap-4">
          <div>
            <Badge className="bg-white/20 text-white border-0 mb-2">AI Health Tip</Badge>
            <h3 className="font-bold text-lg">Stay hydrated this season</h3>
            <p className="text-emerald-100 text-sm mt-1 max-w-md">
              Northern Nigeria&apos;s dry season increases dehydration risk. Aim for 8–10 glasses of water daily, especially if you have diabetes or hypertension.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/ai">
              <Button className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-none">
                Learn More
              </Button>
            </Link>
          </div>
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -right-4 -bottom-8 h-24 w-24 rounded-full bg-white/10" />
        </CardContent>
      </Card>
    </div>
  );
}
