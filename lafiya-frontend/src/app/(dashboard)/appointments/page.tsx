"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Calendar, Clock, Video, Phone, MapPin, Plus, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { appointments as aptApi, doctors as doctorsApi } from "@/lib/api";
import type { Appointment, Doctor } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";

const tabs = ["Upcoming", "Past", "Cancelled"];

const statusColors: Record<string, "default" | "amber" | "slate" | "red"> = {
  confirmed: "default", pending: "amber", completed: "slate", cancelled: "red",
};

const typeIcons = { video: Video, phone: Phone, "in-person": MapPin };

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [allApts, setAllApts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Book modal state
  const [showBook, setShowBook] = useState(false);
  const [doctorList, setDoctorList] = useState<Doctor[]>([]);
  const [bookForm, setBookForm] = useState({ doctor: "", date: "", time: "", type: "video", notes: "" });
  const [bookLoading, setBookLoading] = useState(false);
  const [bookError, setBookError] = useState("");

  const fetchApts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const isDoctor = user?.role === "doctor";
      const res = isDoctor ? await aptApi.doctorAppointments() : await aptApi.mine();
      setAllApts(res.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchApts(); }, [fetchApts]);

  const filtered = allApts.filter((a) => {
    if (activeTab === "Upcoming") return a.status === "confirmed" || a.status === "pending";
    if (activeTab === "Past") return a.status === "completed";
    return a.status === "cancelled";
  });

  const handleCancel = async (id: string) => {
    setActionLoading(id);
    try {
      await aptApi.cancel(id);
      await fetchApts();
    } catch {} finally { setActionLoading(null); }
  };

  const openBook = async () => {
    setShowBook(true);
    setBookError("");
    if (doctorList.length === 0) {
      const res = await doctorsApi.list().catch(() => ({ data: [] }));
      setDoctorList(res.data);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookLoading(true);
    setBookError("");
    try {
      await aptApi.book(bookForm);
      setShowBook(false);
      setBookForm({ doctor: "", date: "", time: "", type: "video", notes: "" });
      await fetchApts();
    } catch (e: unknown) {
      setBookError(e instanceof Error ? e.message : "Booking failed");
    } finally { setBookLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Appointments</h1>
          <p className="text-sm text-slate-500">Manage your doctor consultations</p>
        </div>
        <Button className="gap-2" onClick={openBook}>
          <Plus className="h-4 w-4" /> Book Appointment
        </Button>
      </div>

      {/* Book Modal */}
      {showBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Book Appointment</h2>
              {bookError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 mb-4">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600">{bookError}</p>
                </div>
              )}
              <form onSubmit={handleBook} className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Doctor</label>
                  <select
                    required value={bookForm.doctor}
                    onChange={(e) => setBookForm((p) => ({ ...p, doctor: e.target.value }))}
                    className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select a doctor</option>
                    {doctorList.map((d) => (
                      <option key={d._id} value={d._id}>
                        Dr. {d.user?.firstName} {d.user?.lastName} — {d.specialty}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Date</label>
                    <input type="date" required value={bookForm.date}
                      onChange={(e) => setBookForm((p) => ({ ...p, date: e.target.value }))}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Time</label>
                    <input type="time" required value={bookForm.time}
                      onChange={(e) => setBookForm((p) => ({ ...p, time: e.target.value }))}
                      className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Type</label>
                  <select value={bookForm.type}
                    onChange={(e) => setBookForm((p) => ({ ...p, type: e.target.value }))}
                    className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="video">Video Call</option>
                    <option value="phone">Phone Call</option>
                    <option value="in-person">In Person</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Notes (optional)</label>
                  <textarea value={bookForm.notes}
                    onChange={(e) => setBookForm((p) => ({ ...p, notes: e.target.value }))}
                    rows={2} placeholder="Reason for visit..."
                    className="w-full rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1" disabled={bookLoading}>
                    {bookLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Book"}
                  </Button>
                  <Button type="button" variant="muted" className="flex-1" onClick={() => setShowBook(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}>
            {tab}
            <span className="ml-1.5 text-xs text-slate-400">
              ({allApts.filter((a) => {
                if (tab === "Upcoming") return a.status === "confirmed" || a.status === "pending";
                if (tab === "Past") return a.status === "completed";
                return a.status === "cancelled";
              }).length})
            </span>
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
        <div className="text-center py-12 text-slate-400">
          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No {activeTab.toLowerCase()} appointments</p>
          {activeTab === "Upcoming" && (
            <Button className="mt-4 gap-2" onClick={openBook}><Plus className="h-4 w-4" /> Book Now</Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((apt) => {
            const TypeIcon = typeIcons[apt.type as keyof typeof typeIcons] ?? MapPin;
            const doctorName = typeof apt.doctor === "object"
              ? `Dr. ${apt.doctor.user?.firstName ?? ""} ${apt.doctor.user?.lastName ?? ""}`
              : "Doctor";
            const specialty = typeof apt.doctor === "object" ? apt.doctor.specialty : "";
            return (
              <Card key={apt._id} hover className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Avatar name={doctorName} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">{doctorName}</h3>
                          {specialty && <p className="text-sm text-emerald-600">{specialty}</p>}
                        </div>
                        <Badge variant={statusColors[apt.status]}>{apt.status}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          {new Date(apt.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Clock className="h-4 w-4 text-slate-400" /> {apt.time}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <TypeIcon className="h-4 w-4 text-slate-400" />
                          {apt.type.charAt(0).toUpperCase() + apt.type.slice(1)}
                        </div>
                      </div>
                      {apt.notes && (
                        <p className="text-xs text-slate-500 mt-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                          📝 {apt.notes}
                        </p>
                      )}
                      {(apt.status === "confirmed" || apt.status === "pending") && (
                        <div className="flex gap-2 mt-4">
                          {apt.type === "video" && apt.status === "confirmed" && (
                            <Button size="sm" className="gap-1.5"><Video className="h-3.5 w-3.5" /> Join Video Call</Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600"
                            disabled={actionLoading === apt._id}
                            onClick={() => handleCancel(apt._id)}>
                            {actionLoading === apt._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Cancel"}
                          </Button>
                        </div>
                      )}
                      {apt.status === "completed" && (
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm">View Notes</Button>
                          <Button variant="muted" size="sm" onClick={openBook}>Book Again</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
