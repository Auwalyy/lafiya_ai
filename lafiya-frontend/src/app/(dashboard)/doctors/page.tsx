"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import {
  Search, Star, MapPin, Clock, CheckCircle2,
  Video, Phone, Calendar, Loader2, AlertCircle,
} from "lucide-react";
import { doctors as doctorsApi, appointments as aptApi } from "@/lib/api";
import type { Doctor } from "@/lib/api";

const specialties = ["All", "General", "Cardiologist", "Gynecologist", "Pediatrician", "Neurologist", "Dermatologist"];

export default function DoctorsPage() {
  const [doctorList, setDoctorList] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookForm, setBookForm] = useState({ date: "", time: "", type: "video", notes: "" });
  const [bookLoading, setBookLoading] = useState(false);
  const [bookError, setBookError] = useState("");
  const [bookSuccess, setBookSuccess] = useState("");

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (specialty !== "All") params.set("specialty", specialty);
      const res = await doctorsApi.list(params.toString());
      setDoctorList(res.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load doctors");
    } finally { setLoading(false); }
  }, [search, specialty]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) return;
    setBookLoading(true);
    setBookError("");
    try {
      await aptApi.book({ doctor: bookingId, ...bookForm });
      setBookSuccess("Appointment booked successfully!");
      setBookingId(null);
      setBookForm({ date: "", time: "", type: "video", notes: "" });
      setTimeout(() => setBookSuccess(""), 3000);
    } catch (e: unknown) {
      setBookError(e instanceof Error ? e.message : "Booking failed");
    } finally { setBookLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Find Doctors</h1>
        <p className="text-sm text-slate-500">Verified healthcare professionals across Northern Nigeria</p>
      </div>

      {bookSuccess && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <p className="text-sm text-emerald-700">{bookSuccess}</p>
        </div>
      )}

      {/* Book Modal */}
      {bookingId && (
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
                    className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="video">Video Call</option>
                    <option value="phone">Phone Call</option>
                    <option value="in-person">In Person</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Notes</label>
                  <textarea value={bookForm.notes}
                    onChange={(e) => setBookForm((p) => ({ ...p, notes: e.target.value }))}
                    rows={2} placeholder="Reason for visit..."
                    className="w-full rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1" disabled={bookLoading}>
                    {bookLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Booking"}
                  </Button>
                  <Button type="button" variant="muted" className="flex-1" onClick={() => setBookingId(null)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, specialty, or condition..."
                className="bg-transparent flex-1 outline-none text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400" />
            </div>
            <Button className="h-11 gap-2" onClick={fetchDoctors}>
              <Search className="h-4 w-4" /> Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Specialty filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {specialties.map((s) => (
          <button key={s} onClick={() => setSpecialty(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              specialty === s
                ? "gradient-primary text-white shadow-md"
                : "bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-400 hover:border-emerald-300"
            }`}>
            {s}
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
      ) : doctorList.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No doctors found. Try a different search.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {doctorList.map((doc) => (
            <Card key={doc._id} hover className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar name={`${doc.user?.firstName ?? ""} ${doc.user?.lastName ?? ""}`} size="lg" online={doc.isAvailable} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        Dr. {doc.user?.firstName} {doc.user?.lastName}
                      </h3>
                      {doc.isVerified && <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />}
                    </div>
                    <p className="text-sm text-emerald-600 font-medium">{doc.specialty}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      <span className="text-xs text-slate-500 truncate">{doc.hospital}, {doc.location}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{doc.rating?.toFixed(1) ?? "N/A"}</span>
                        <span className="text-xs text-slate-400">({doc.reviewCount ?? 0})</span>
                      </div>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500">{doc.experience} yrs exp</span>
                    </div>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {(doc.languages ?? []).map((lang) => (
                        <Badge key={lang} variant="slate" size="sm">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Consultation fee</p>
                    <p className="font-bold text-slate-900 dark:text-white">₦{doc.consultFee?.toLocaleString() ?? "—"}</p>
                  </div>
                  <Badge variant={doc.isAvailable ? "default" : "slate"} size="sm">
                    {doc.isAvailable ? "Available" : "Busy"}
                  </Badge>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5"
                    onClick={() => { setBookingId(doc._id); setBookForm((p) => ({ ...p, type: "video" })); }}>
                    <Video className="h-3.5 w-3.5" /> Video
                  </Button>
                  <Button variant="muted" size="sm" className="flex-1 gap-1.5"
                    onClick={() => { setBookingId(doc._id); setBookForm((p) => ({ ...p, type: "phone" })); }}>
                    <Phone className="h-3.5 w-3.5" /> Call
                  </Button>
                  <Button size="sm" className="flex-1 gap-1.5"
                    onClick={() => { setBookingId(doc._id); setBookForm((p) => ({ ...p, type: "in-person" })); }}>
                    <Calendar className="h-3.5 w-3.5" /> Book
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
