"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Pill, Plus, CheckCircle2, Clock, AlertCircle, TrendingUp, Calendar, Loader2, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { medications as medsApi } from "@/lib/api";
import type { Medication, TodayMedication } from "@/lib/api";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MedicationsPage() {
  const [todayMeds, setTodayMeds] = useState<TodayMedication[]>([]);
  const [allMeds, setAllMeds] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logLoading, setLogLoading] = useState<string | null>(null);

  // Add modal
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "", dosage: "", frequency: "Once daily", times: "8:00 AM",
    condition: "", startDate: new Date().toISOString().split("T")[0], stock: "",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [todayRes, allRes] = await Promise.all([
        medsApi.today(),
        medsApi.list(),
      ]);
      setTodayMeds(todayRes.data);
      setAllMeds(allRes.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load medications");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const logDose = async (medId: string, doseTime: string, taken: boolean) => {
    const key = `${medId}-${doseTime}`;
    setLogLoading(key);
    try {
      await medsApi.logDose(medId, { scheduledAt: new Date().toISOString(), status: taken ? "missed" : "taken" });
      setTodayMeds((prev) => prev.map((m) => {
        if (m._id !== medId) return m;
        return {
          ...m,
          doses: (m.doses ?? []).map((d) =>
            d.time === doseTime ? { ...d, taken: !taken } : d
          ),
        };
      }));
    } catch {} finally { setLogLoading(null); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError("");
    try {
      await medsApi.create({
        ...addForm,
        times: addForm.times.split(",").map((t) => t.trim()),
        pillsRemaining: addForm.stock ? Number(addForm.stock) : undefined,
      });
      setShowAdd(false);
      setAddForm({ name: "", dosage: "", frequency: "Once daily", times: "8:00 AM", condition: "", startDate: new Date().toISOString().split("T")[0], stock: "" });
      await fetchData();
    } catch (e: unknown) {
      setAddError(e instanceof Error ? e.message : "Failed to add medication");
    } finally { setAddLoading(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await medsApi.delete(id);
      setAllMeds((prev) => prev.filter((m) => m._id !== id));
      setTodayMeds((prev) => prev.filter((m) => m._id !== id));
    } catch {}
  };

  const takenCount = todayMeds.reduce((a, m) => a + (m.doses?.filter((d) => d.taken).length ?? 0), 0);
  const totalDoses = todayMeds.reduce((a, m) => a + (m.doses?.length ?? 1), 0);
  const avgAdherence = allMeds.length > 0 ? Math.round(allMeds.reduce((a, _) => a + 85, 0) / allMeds.length) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Medications</h1>
          <p className="text-sm text-slate-500">Track your daily medications and adherence</p>
        </div>
        <Button className="gap-2" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" /> Add Medication
        </Button>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">Add Medication</h2>
                <button onClick={() => setShowAdd(false)}><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              {addError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 mb-4">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600">{addError}</p>
                </div>
              )}
              <form onSubmit={handleAdd} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Name</label>
                    <input required value={addForm.name} onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Metformin"
                      className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Dosage</label>
                    <input required value={addForm.dosage} onChange={(e) => setAddForm((p) => ({ ...p, dosage: e.target.value }))}
                      placeholder="e.g. 500mg"
                      className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Frequency</label>
                  <select value={addForm.frequency} onChange={(e) => setAddForm((p) => ({ ...p, frequency: e.target.value }))}
                    className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="once_daily">Once daily</option>
                    <option value="twice_daily">Twice daily</option>
                    <option value="thrice_daily">Three times daily</option>
                    <option value="as_needed">As needed</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Times (comma separated)</label>
                  <input value={addForm.times} onChange={(e) => setAddForm((p) => ({ ...p, times: e.target.value }))}
                    placeholder="e.g. 8:00 AM, 8:00 PM"
                    className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Condition</label>
                    <input value={addForm.condition} onChange={(e) => setAddForm((p) => ({ ...p, condition: e.target.value }))}
                      placeholder="e.g. Diabetes"
                      className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Stock (pills)</label>
                    <input type="number" value={addForm.stock} onChange={(e) => setAddForm((p) => ({ ...p, stock: e.target.value }))}
                      placeholder="e.g. 30"
                      className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Start Date</label>
                  <input type="date" value={addForm.startDate} onChange={(e) => setAddForm((p) => ({ ...p, startDate: e.target.value }))}
                    className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1" disabled={addLoading}>
                    {addLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                  </Button>
                  <Button type="button" variant="muted" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Today's Doses", value: `${takenCount}/${totalDoses}`, icon: Pill, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
              { label: "Avg Adherence", value: `${avgAdherence}%`, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
              { label: "Active Meds", value: allMeds.filter((m) => m.isActive).length.toString(), icon: CheckCircle2, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
              { label: "Next Refill", value: "—", icon: Calendar, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30" },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <div className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Medication list */}
          {allMeds.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Pill className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No medications added yet</p>
              <Button className="mt-4 gap-2" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" /> Add Medication</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {allMeds.map((med) => {
                const todayMed = todayMeds.find((t) => t._id === med._id);
                const colors = ["bg-blue-500", "bg-red-500", "bg-orange-500", "bg-pink-500", "bg-purple-500"];
                const color = colors[allMeds.indexOf(med) % colors.length];
                return (
                  <Card key={med._id} className="overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`h-12 w-12 rounded-2xl ${color} flex items-center justify-center shrink-0`}>
                          <Pill className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-slate-900 dark:text-white">
                                {med.name} <span className="font-normal text-slate-500">{med.dosage}</span>
                              </h3>
                              <p className="text-sm text-slate-500">{med.frequency}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                {med.pillsRemaining !== undefined && <p className="text-xs text-slate-400">Stock: {med.pillsRemaining} pills</p>}
                              </div>
                              <button onClick={() => handleDelete(med._id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-3 flex-wrap">
                            {(todayMed?.doses ?? (med.times ?? []).map((t) => ({ time: t, taken: false }))).map((dose, idx) => {
                              const key = `${med._id}-${dose.time}`;
                              return (
                                <button key={idx}
                                  onClick={() => logDose(med._id, dose.time, dose.taken)}
                                  disabled={logLoading === key}
                                  className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border",
                                    dose.taken
                                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-300"
                                  )}>
                                  {logLoading === key
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : dose.taken
                                      ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                      : <Clock className="h-4 w-4 text-slate-400" />
                                  }
                                  {dose.time}{dose.taken ? " ✓" : ""}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
