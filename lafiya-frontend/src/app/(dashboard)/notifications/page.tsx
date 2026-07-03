"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Bell, Trash2, CheckCheck, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { notifications as notifApi } from "@/lib/api";
import type { Notification } from "@/lib/api";

export default function NotificationsPage() {
  const [list, setList] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await notifApi.list();
      setList(res.notifications ?? []);
      setUnreadCount(res.unreadCount ?? 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  const markRead = async (id: string) => {
    try {
      await notifApi.read(id);
      setList((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await notifApi.readAll();
      setList((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const deleteNotif = async (id: string) => {
    try {
      await notifApi.delete(id);
      const n = list.find((x) => x._id === id);
      setList((prev) => prev.filter((x) => x._id !== id));
      if (n && !n.isRead) setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const clearAll = async () => {
    try {
      await notifApi.clearAll();
      setList([]);
      setUnreadCount(0);
    } catch {}
  };

  const filtered = filter === "unread" ? list.filter((n) => !n.isRead) : list;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-slate-500">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="muted" size="sm" className="gap-1.5" onClick={markAllRead}>
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </Button>
          )}
          {list.length > 0 && (
            <Button variant="ghost" size="sm" className="gap-1.5 text-red-500 hover:text-red-600" onClick={clearAll}>
              <Trash2 className="h-3.5 w-3.5" /> Clear all
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        {(["all", "unread"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
              filter === f
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}>
            {f}
            {f === "unread" && unreadCount > 0 && (
              <Badge variant="red" size="sm" className="ml-1.5">{unreadCount}</Badge>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>{filter === "unread" ? "No unread notifications" : "No notifications yet"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
            <Card key={n._id} className={cn("overflow-hidden transition-all", !n.isRead && "border-emerald-200 dark:border-emerald-800")}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn("h-2.5 w-2.5 rounded-full mt-1.5 shrink-0", n.isRead ? "bg-slate-300" : "bg-emerald-500")} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm font-semibold", n.isRead ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-white")}>
                        {n.title}
                      </p>
                      <span className="text-xs text-slate-400 shrink-0">
                        {new Date(n.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="slate" size="sm">{n.type}</Badge>
                      {!n.isRead && (
                        <button onClick={() => markRead(n._id)} className="text-xs text-emerald-600 hover:underline">
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                  <button onClick={() => deleteNotif(n._id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
