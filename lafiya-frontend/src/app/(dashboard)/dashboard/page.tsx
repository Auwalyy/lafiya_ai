"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Avatar } from "@/components/ui/Avatar";
import {
  Heart, Activity, Pill, Calendar, Bot, ArrowRight,
  TrendingUp, Users, Stethoscope, AlertTriangle,
  CheckCircle2, Clock, ChevronRight, Loader2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { appointments, medications, posts, communities, notifications } from "@/lib/api";
import type { Appointment, TodayMedication, Post, Notification } from "@/lib/api";

const quickActions = [
  { label: "Ask AI", desc: "Symptom check", icon: Bot, href: "/ai", color: "gradient-primary text-white" },
  { label: "Book Doctor", desc: "Find & schedule", icon: Stethoscope, href: "/doctors", color: "bg-blue-500 text-white" },
  { label: "Community", desc: "Join discussions", icon: Users, href: "/community", color: "bg-purple-500 text-white" },
  { label: "Emergency", desc: "SOS & first aid", icon: AlertTriangle, href: "/emergency", color: "bg-red-500 text-white" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [upcomingApts, setUpcomingApts] = useState<Appointment[]>([]);
  const [todayMeds, setTodayMeds] = useState<TodayMedication[]>([]);
  const [feed, setFeed] = useState<Post[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      appointments.mine().catch(() => ({ data: [] })),
      medications.today().catch(() => ({ data: [] })),
      posts.list("limit=3").catch(() => ({ data: [] })),
      notifications.list().catch(() => ({ data: [] })),
    ]).then(([apts, meds, postsRes, notifs]) => {
      setUpcomingApts((apts.data as Appointment[]).filter((a) => a.status !== "cancelled" && a.status !== "completed").slice(0, 2));
      setTodayMeds((meds.data as TodayMedication[]).slice(0, 3));
      setFeed(postsRes.data as Post[]);
      setUnread((notifs.data as Notification[]).filter((n) => !n.isRead).length);
    }).finally(() => setLoading(false));
  }, []);

  const takenCount = todayMeds.reduce((a, m) => a + (m.doses?.filter((d) => d.taken).length ?? 0), 0);
  const totalDoses = todayMeds.reduce((a, m) => a + (m.doses?.length ?? 1), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Good morning, {user?.firstName ?? "there"} 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            {unread > 0 && <span className="ml-2 text-emerald-600 font-medium">· {unread} new notification{unread > 1 ? "s" : ""}</span>}
          </p>
        </div>
        <Link href="/ai">
          <Button size="md" className="gap-2">
            <Bot className="h-4 w-4" /> Ask AI Assistant
          </Button>
        </Link>
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

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : (
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
                {upcomingApts.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">No upcoming appointments</p>
                ) : upcomingApts.map((apt) => (
                  <div key={apt._id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <Avatar name={typeof apt.doctor === "object" ? apt.doctor.user?.firstName ?? "Dr" : "Dr"} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {typeof apt.doctor === "object" ? `Dr. ${apt.doctor.user?.firstName ?? ""} ${apt.doctor.user?.lastName ?? ""}` : "Doctor"}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-500">{new Date(apt.date).toLocaleDateString()} · {apt.time}</span>
                      </div>
                    </div>
                    <Badge variant={apt.status === "confirmed" ? "default" : "amber"}>{apt.status}</Badge>
                  </div>
                ))}
                <Link href="/appointments">
                  <Button variant="outline" size="sm" className="w-full mt-2">Book Appointment</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Medication Tracker */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between pb-4">
                  <h2 className="font-semibold text-slate-900 dark:text-white">Today's Medications</h2>
                  <Badge variant="blue">{takenCount}/{totalDoses}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {totalDoses > 0 && (
                  <Progress value={takenCount} max={totalDoses} label="Adherence" color="emerald" />
                )}
                <div className="space-y-2 mt-3">
                  {todayMeds.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-2">No medications today</p>
                  ) : todayMeds.map((med) =>
                    (med.doses ?? [{ time: med.times?.[0] ?? "—", taken: false }]).map((dose, i) => (
                      <div key={`${med._id}-${i}`} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <CheckCircle2 className={`h-5 w-5 shrink-0 ${dose.taken ? "text-emerald-500" : "text-slate-300"}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{med.name} {med.dosage}</p>
                          <p className="text-xs text-slate-500">{dose.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Link href="/medications">
                  <Button variant="ghost" size="sm" className="w-full text-emerald-600 gap-1 mt-1">
                    View all <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
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
                {feed.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No posts yet. Join a community!</p>
                ) : feed.map((post) => (
                  <div key={post._id} className="p-4 rounded-xl border hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default" size="sm">
                        {typeof post.community === "object" ? post.community.name : "Community"}
                      </Badge>
                      <span className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Avatar name={`${post.author.firstName} ${post.author.lastName}`} size="sm" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {post.author.firstName} {post.author.lastName}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{post.content}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors">
                        <Heart className="h-3.5 w-3.5" /> {post.likes.length}
                      </button>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-300 ml-auto group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Health Tip Banner */}
      <Card className="gradient-primary text-white overflow-hidden relative">
        <CardContent className="p-6 flex items-center justify-between gap-4">
          <div>
            <Badge className="bg-white/20 text-white border-0 mb-2">AI Health Tip</Badge>
            <h3 className="font-bold text-lg">Stay hydrated this season</h3>
            <p className="text-emerald-100 text-sm mt-1 max-w-md">
              Northern Nigeria's dry season increases dehydration risk. Aim for 8–10 glasses of water daily, especially if you have diabetes or hypertension.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/ai">
              <Button className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-none">Learn More</Button>
            </Link>
          </div>
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -right-4 -bottom-8 h-24 w-24 rounded-full bg-white/10" />
        </CardContent>
      </Card>
    </div>
  );
}
