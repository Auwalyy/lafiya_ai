"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FileText, Plus, Upload, Share2, Download, Activity, Droplets, Thermometer, Weight, Loader2, AlertCircle, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { healthRecords as hrApi, doctors as doctorsApi } from "@/lib/api";
import type { HealthRecord, Doctor } from "@/lib/api";

const recordTypes = ["All", "Lab Results", "Prescriptions", "Vitals", "Imaging", "Vaccination"];

const statusColors: Record<string, "default" | "amber" | "red" | "blue" | "slate"> = {
  normal: "default", elevated: "amber", active: "blue", completed: "slate", abnormal: "red",
};

export default function HealthRecordsPage() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeType, setActiveType] = useState("All");

  // Upload modal
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ type: "Lab Results", title: "", date: new Date().toISOString().split("T")[0], doctor: "" });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Share modal
  const [shareId, setShareId] = useState<string | null>(null);
  const [doctorList, setDoctorList] = useState<Doctor[]>([]);
  const [shareDoctor, setShareDoctor] = useState("");
  const [shareLoading, setShareLoading] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await hrApi.list();
      setRecords(res.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load records");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const openShare = async (id: string) => {
    setShareId(id);
    setShareDoctor("");
    if (doctorList.length === 0) {
      const res = await doctorsApi.list().catch(() => ({ data: [] }));
      setDoctorList(res.data);
    }
  };

  const handleShare = async () => {
    if (!shareId || !shareDoctor) return;
    setShareLoading(true);
    try {
      await hrApi.share(shareId, shareDoctor);
      setShareId(null);
    } catch {} finally { setShareLoading(false); }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadLoading(true);
    setUploadError("");
    try {
      const form = new FormData();
      form.append("type", uploadForm.type);
      form.append("title", uploadForm.title);
      form.append("date", uploadForm.date);
      if (uploadForm.doctor) form.append("doctor", uploadForm.doctor);
      if (uploadFile) form.append("file", uploadFile);
      await hrApi.create(form);
      setShowUpload(false);
      setUploadForm({ type: "Lab Results", title: "", date: new Date().toISOString().split("T")[0], doctor: "" });
      setUploadFile(null);
      await fetchRecords();
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally { setUploadLoading(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await hrApi.delete(id);
      setRecords((prev) => prev.filter((r) => r._id !== id));
    } catch {}
  };

  const filtered = activeType === "All" ? records : records.filter((r) => r.type === activeType);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Health Records</h1>
          <p className="text-sm text-slate-500">Your complete medical history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="muted" className="gap-2" onClick={() => setShowUpload(true)}>
            <Upload className="h-4 w-4" /> Upload
          </Button>
          <Button className="gap-2" onClick={() => setShowUpload(true)}>
            <Plus className="h-4 w-4" /> Add Record
          </Button>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">Add Health Record</h2>
                <button onClick={() => setShowUpload(false)}><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              {uploadError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 mb-4">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600">{uploadError}</p>
                </div>
              )}
              <form onSubmit={handleUpload} className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Type</label>
                  <select value={uploadForm.type} onChange={(e) => setUploadForm((p) => ({ ...p, type: e.target.value }))}
                    className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {recordTypes.filter((t) => t !== "All").map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Title</label>
                  <input required value={uploadForm.title} onChange={(e) => setUploadForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Blood Sugar Test"
                    className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Date</label>
                  <input type="date" value={uploadForm.date} onChange={(e) => setUploadForm((p) => ({ ...p, date: e.target.value }))}
                    className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">File (optional)</label>
                  <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                    className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1" disabled={uploadLoading}>
                    {uploadLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                  </Button>
                  <Button type="button" variant="muted" className="flex-1" onClick={() => setShowUpload(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Share Modal */}
      {shareId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">Share with Doctor</h2>
                <button onClick={() => setShareId(null)}><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <select value={shareDoctor} onChange={(e) => setShareDoctor(e.target.value)}
                className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4">
                <option value="">Select a doctor</option>
                {doctorList.map((d) => (
                  <option key={d._id} value={d._id}>Dr. {d.user?.firstName} {d.user?.lastName}</option>
                ))}
              </select>
              <div className="flex gap-3">
                <Button className="flex-1" disabled={!shareDoctor || shareLoading} onClick={handleShare}>
                  {shareLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Share"}
                </Button>
                <Button variant="muted" className="flex-1" onClick={() => setShareId(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {recordTypes.map((type) => (
          <button key={type} onClick={() => setActiveType(type)}
            className={cn("px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
              activeType === type
                ? "gradient-primary text-white shadow-md"
                : "bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-400 hover:border-emerald-300"
            )}>
            {type}
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
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No records found</p>
          <Button className="mt-4 gap-2" onClick={() => setShowUpload(true)}><Plus className="h-4 w-4" /> Add Record</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rec) => (
            <Card key={rec._id} hover className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{rec.title}</h3>
                      {rec.status && <Badge variant={statusColors[rec.status] ?? "slate"}>{rec.status}</Badge>}
                      <Badge variant="slate" size="sm">{rec.type}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {rec.doctor ? `Dr. ${rec.doctor}` : "Self-recorded"} · {new Date(rec.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" aria-label="Share" onClick={() => openShare(rec._id)}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    {rec.fileUrl && (
                      <a href={rec.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" aria-label="Download">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => handleDelete(rec._id)}>
                      <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
