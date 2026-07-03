"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import {
  Users, Stethoscope, FileText, Calendar,
  CheckCircle2, XCircle, Flag, Loader2, AlertCircle, ShieldCheck,
} from "lucide-react";
import { admin as adminApi } from "@/lib/api";
import type { Doctor, Post, AdminStats } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingDoctors, setPendingDoctors] = useState<Doctor[]>([]);
  const [flaggedPosts, setFlaggedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, doctorsRes, postsRes] = await Promise.all([
        adminApi.stats(),
        adminApi.pendingDoctors(),
        adminApi.flaggedPosts(),
      ]);
      setStats(statsRes.data);
      setPendingDoctors(doctorsRes.data);
      setFlaggedPosts(postsRes.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load admin data");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const verifyDoctor = async (id: string, isVerified: boolean) => {
    setActionLoading(id);
    try {
      await adminApi.verifyDoctor(id, { isVerified, reason: isVerified ? "Documents verified" : "Rejected" });
      setPendingDoctors((prev) => prev.filter((d) => d._id !== id));
      if (stats) setStats({ ...stats, pendingDoctors: stats.pendingDoctors - 1 });
    } catch {} finally { setActionLoading(null); }
  };

  const approvePost = async (id: string) => {
    setActionLoading(id);
    try {
      await adminApi.approvePost(id);
      setFlaggedPosts((prev) => prev.filter((p) => p._id !== id));
      if (stats) setStats({ ...stats, flaggedPosts: stats.flaggedPosts - 1 });
    } catch {} finally { setActionLoading(null); }
  };

  const removePost = async (id: string) => {
    setActionLoading(id);
    try {
      await adminApi.deletePost(id);
      setFlaggedPosts((prev) => prev.filter((p) => p._id !== id));
      if (stats) setStats({ ...stats, flaggedPosts: stats.flaggedPosts - 1 });
    } catch {} finally { setActionLoading(null); }
  };

  if (user && user.role !== "admin") return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-emerald-500" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Platform management and moderation</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
                { label: "Doctors", value: stats.totalDoctors, icon: Stethoscope, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
                { label: "Posts", value: stats.totalPosts, icon: FileText, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
                { label: "Appointments", value: stats.totalAppointments, icon: Calendar, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30" },
                { label: "Pending Doctors", value: stats.pendingDoctors, icon: Stethoscope, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
                { label: "Flagged Posts", value: stats.flaggedPosts, icon: Flag, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30" },
              ].map((s) => (
                <Card key={s.label}>
                  <CardContent className="p-4">
                    <div className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
                      <s.icon className={`h-5 w-5 ${s.color}`} />
                    </div>
                    <p className="text-xs text-slate-500">{s.label}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value.toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Pending Doctors */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-900 dark:text-white">Pending Doctor Verifications</h2>
                  <Badge variant="amber">{pendingDoctors.length}</Badge>
                </div>
                {pendingDoctors.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">All doctors verified</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingDoctors.map((doc) => (
                      <div key={doc._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <Avatar name={`${doc.user?.firstName ?? ""} ${doc.user?.lastName ?? ""}`} size="md" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            Dr. {doc.user?.firstName} {doc.user?.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{doc.specialization}</p>
                          {doc.licenseNumber && (
                            <p className="text-xs text-slate-400">License: {doc.licenseNumber}</p>
                          )}
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <Button size="sm" className="gap-1 h-8 px-2.5"
                            disabled={actionLoading === doc._id}
                            onClick={() => verifyDoctor(doc._id, true)}>
                            {actionLoading === doc._id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <CheckCircle2 className="h-3.5 w-3.5" />
                            }
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-1 h-8 px-2.5 text-red-500 hover:text-red-600"
                            disabled={actionLoading === doc._id}
                            onClick={() => verifyDoctor(doc._id, false)}>
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Flagged Posts */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-900 dark:text-white">Flagged Posts</h2>
                  <Badge variant="red">{flaggedPosts.length}</Badge>
                </div>
                {flaggedPosts.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Flag className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No flagged posts</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {flaggedPosts.map((post) => (
                      <div key={post._id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <div className="flex items-start gap-2 mb-2">
                          <Avatar name={`${post.author.firstName} ${post.author.lastName}`} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {post.author.firstName} {post.author.lastName}
                            </p>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{post.content}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1 text-xs h-7"
                            disabled={actionLoading === post._id}
                            onClick={() => approvePost(post._id)}>
                            {actionLoading === post._id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Approve"}
                          </Button>
                          <Button variant="ghost" size="sm" className="flex-1 text-xs h-7 text-red-500 hover:text-red-600"
                            disabled={actionLoading === post._id}
                            onClick={() => removePost(post._id)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
