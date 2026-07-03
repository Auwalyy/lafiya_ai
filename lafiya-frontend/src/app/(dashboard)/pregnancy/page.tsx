"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Baby, Heart, Calendar, CheckCircle2, Plus, AlertCircle, Stethoscope, Loader2, X } from "lucide-react";
import { pregnancy as pregnancyApi } from "@/lib/api";
import type { Pregnancy, Milestone } from "@/lib/api";

const severityColors: Record<string, "default" | "amber" | "red"> = {
  mild: "default", moderate: "amber", severe: "red",
};

export default function PregnancyPage() {
  const [data, setData] = useState<Pregnancy | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Start tracker modal
  const [showStart, setShowStart] = useState(false);
  const [startForm, setStartForm] = useState({ lastMenstrualPeriod: "", doctorId: "", isHighRisk: false });
  const [startLoading, setStartLoading] = useState(false);
  const [startError, setStartError] = useState("");

  // Log symptom modal
  const [showSymptom, setShowSymptom] = useState(false);
  const [symptomForm, setSymptomForm] = useState({ symptom: "", severity: "mild", notes: "" });
  const [symptomLoading, setSymptomLoading] = useState(false);

  // Log visit modal
  const [showVisit, setShowVisit] = useState(false);
  const [visitForm, setVisitForm] = useState({ date: "", weight: "", systolic: "", diastolic: "", fetalHeartRate: "", notes: "" });
  const [visitLoading, setVisitLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [pregnancyRes, milestonesRes] = await Promise.all([
        pregnancyApi.my().catch(() => null),
        pregnancyApi.milestones().catch(() => ({ data: [] })),
      ]);
      setData(pregnancyRes?.data ?? null);
      setMilestones(milestonesRes.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load pregnancy data");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setStartLoading(true);
    setStartError("");
    try {
      await pregnancyApi.start({ lastMenstrualPeriod: startForm.lastMenstrualPeriod, isHighRisk: startForm.isHighRisk });
      setShowStart(false);
      await fetchData();
    } catch (e: unknown) {
      setStartError(e instanceof Error ? e.message : "Failed to start tracker");
    } finally { setStartLoading(false); }
  };

  const handleSymptom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setSymptomLoading(true);
    try {
      await pregnancyApi.logSymptom(data._id, symptomForm);
      setShowSymptom(false);
      setSymptomForm({ symptom: "", severity: "mild", notes: "" });
      await fetchData();
    } catch {} finally { setSymptomLoading(false); }
  };

  const handleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setVisitLoading(true);
    try {
      await pregnancyApi.logAntenatalVisit(data._id, {
        date: visitForm.date,
        weight: visitForm.weight ? Number(visitForm.weight) : undefined,
        bloodPressure: visitForm.systolic ? { systolic: Number(visitForm.systolic), diastolic: Number(visitForm.diastolic) } : undefined,
        fetalHeartRate: visitForm.fetalHeartRate ? Number(visitForm.fetalHeartRate) : undefined,
        notes: visitForm.notes || undefined,
      });
      setShowVisit(false);
      setVisitForm({ date: "", weight: "", systolic: "", diastolic: "", fetalHeartRate: "", notes: "" });
      await fetchData();
    } catch {} finally { setVisitLoading(false); }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pregnancy Tracker</h1>
          <p className="text-sm text-slate-500">Track your pregnancy journey</p>
        </div>

        {showStart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg text-slate-900 dark:text-white">Start Pregnancy Tracker</h2>
                  <button onClick={() => setShowStart(false)}><X className="h-5 w-5 text-slate-400" /></button>
                </div>
                {startError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 mb-4">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    <p className="text-sm text-red-600">{startError}</p>
                  </div>
                )}
                <form onSubmit={handleStart} className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Last Menstrual Period (LMP)</label>
                    <input type="date" required value={startForm.lastMenstrualPeriod}
                      onChange={(e) => setStartForm((p) => ({ ...p, lastMenstrualPeriod: e.target.value }))}
                      className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">High Risk Pregnancy?</label>
                    <select value={startForm.isHighRisk ? "yes" : "no"}
                      onChange={(e) => setStartForm((p) => ({ ...p, isHighRisk: e.target.value === "yes" }))}
                      className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="submit" className="flex-1" disabled={startLoading}>
                      {startLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start Tracking"}
                    </Button>
                    <Button type="button" variant="muted" className="flex-1" onClick={() => setShowStart(false)}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="gradient-primary text-white">
          <CardContent className="p-8 text-center">
            <Baby className="h-16 w-16 mx-auto mb-4 text-emerald-100" />
            <h2 className="text-xl font-bold mb-2">Start Your Pregnancy Journey</h2>
            <p className="text-emerald-100 text-sm mb-6">Track milestones, symptoms, and antenatal visits</p>
            <Button className="bg-white text-emerald-700 hover:bg-emerald-50" onClick={() => setShowStart(true)}>
              Start Pregnancy Tracker
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentWeek = data.currentWeek;
  const totalWeeks = 40;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Modals */}
      {showSymptom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">Log Symptom</h2>
                <button onClick={() => setShowSymptom(false)}><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSymptom} className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Symptom</label>
                  <input required value={symptomForm.symptom}
                    onChange={(e) => setSymptomForm((p) => ({ ...p, symptom: e.target.value }))}
                    placeholder="e.g. Back pain"
                    className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Severity</label>
                  <select value={symptomForm.severity}
                    onChange={(e) => setSymptomForm((p) => ({ ...p, severity: e.target.value }))}
                    className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Notes</label>
                  <textarea value={symptomForm.notes}
                    onChange={(e) => setSymptomForm((p) => ({ ...p, notes: e.target.value }))}
                    rows={2} className="w-full rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1" disabled={symptomLoading}>
                    {symptomLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log"}
                  </Button>
                  <Button type="button" variant="muted" className="flex-1" onClick={() => setShowSymptom(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {showVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">Log Antenatal Visit</h2>
                <button onClick={() => setShowVisit(false)}><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleVisit} className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Date</label>
                  <input type="date" required value={visitForm.date}
                    onChange={(e) => setVisitForm((p) => ({ ...p, date: e.target.value }))}
                    className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Weight (kg)</label>
                    <input type="number" value={visitForm.weight}
                      onChange={(e) => setVisitForm((p) => ({ ...p, weight: e.target.value }))}
                      className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Fetal HR (bpm)</label>
                    <input type="number" value={visitForm.fetalHeartRate}
                      onChange={(e) => setVisitForm((p) => ({ ...p, fetalHeartRate: e.target.value }))}
                      className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Systolic (mmHg)</label>
                    <input type="number" value={visitForm.systolic} placeholder="120"
                      onChange={(e) => setVisitForm((p) => ({ ...p, systolic: e.target.value }))}
                      className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Diastolic (mmHg)</label>
                    <input type="number" value={visitForm.diastolic} placeholder="80"
                      onChange={(e) => setVisitForm((p) => ({ ...p, diastolic: e.target.value }))}
                      className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Notes</label>
                  <textarea value={visitForm.notes}
                    onChange={(e) => setVisitForm((p) => ({ ...p, notes: e.target.value }))}
                    rows={2} className="w-full rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1" disabled={visitLoading}>
                    {visitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                  </Button>
                  <Button type="button" variant="muted" className="flex-1" onClick={() => setShowVisit(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pregnancy Tracker</h1>
          <p className="text-sm text-slate-500">Week {currentWeek} of {totalWeeks} · Trimester {data.trimester}</p>
        </div>
        <Button variant="muted" className="gap-2" onClick={() => setShowSymptom(true)}>
          <Plus className="h-4 w-4" /> Log Symptom
        </Button>
      </div>

      {/* Hero card */}
      <Card className="gradient-primary text-white overflow-hidden relative">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="bg-white/20 text-white border-0 mb-3">Week {currentWeek}</Badge>
              <h2 className="text-3xl font-black">{currentWeek} <span className="text-xl font-normal text-emerald-100">/ {totalWeeks} weeks</span></h2>
              <p className="text-emerald-100 mt-1">{totalWeeks - currentWeek} weeks until due date</p>
              {data.dueDate && (
                <p className="text-white font-semibold mt-3">
                  Due: {new Date(data.dueDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              )}
            </div>
            <div className="hidden sm:flex flex-col items-center">
              <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center">
                <Baby className="h-12 w-12 text-white" />
              </div>
              <p className="text-xs text-emerald-100 mt-2">Trimester {data.trimester}</p>
            </div>
          </div>
          <Progress value={currentWeek} max={totalWeeks} className="mt-4" color="emerald" />
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Milestones */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Pregnancy Milestones</h2>
              {milestones.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No milestone data available</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800" />
                  <div className="space-y-4">
                    {milestones.map((m, i) => {
                      const done = m.week <= currentWeek;
                      return (
                        <div key={i} className="flex items-center gap-4 relative">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10 ${done ? "gradient-primary" : "bg-slate-100 dark:bg-slate-800"}`}>
                            {done
                              ? <CheckCircle2 className="h-4 w-4 text-white" />
                              : <span className="text-xs font-bold text-slate-400">{m.week}</span>
                            }
                          </div>
                          <div className={`flex-1 flex items-center justify-between p-3 rounded-xl ${
                            m.week === currentWeek
                              ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
                              : "bg-slate-50 dark:bg-slate-800/50"
                          }`}>
                            <div>
                              <p className={`text-sm font-semibold ${done ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                                {m.title}
                              </p>
                              <p className="text-xs text-slate-400">Week {m.week}{m.babySize ? ` · ${m.babySize}` : ""}</p>
                            </div>
                            {m.week === currentWeek && <Badge variant="default">Current</Badge>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Symptoms */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-sm text-slate-900 dark:text-white">Recent Symptoms</p>
                <Button variant="ghost" size="sm" className="text-emerald-600 text-xs gap-1" onClick={() => setShowSymptom(true)}>
                  <Plus className="h-3 w-3" /> Log
                </Button>
              </div>
              {(data.symptoms ?? []).length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">No symptoms logged</p>
              ) : (
                <div className="space-y-2">
                  {[...(data.symptoms ?? [])].reverse().slice(0, 3).map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <div>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{s.symptom}</p>
                        <p className="text-xs text-slate-400">{new Date(s.date).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={severityColors[s.severity]}>{s.severity}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Antenatal visits */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-sm text-slate-900 dark:text-white">Antenatal Visits</p>
                <Stethoscope className="h-4 w-4 text-emerald-500" />
              </div>
              {(data.antenatalVisits ?? []).length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">No visits logged</p>
              ) : (
                <div className="space-y-3">
                  {[...(data.antenatalVisits ?? [])].reverse().slice(0, 2).map((v, i) => (
                    <div key={i} className="p-3 rounded-xl border">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {new Date(v.date).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                        </p>
                        {v.weight && <Badge variant="slate" size="sm">{v.weight}kg</Badge>}
                      </div>
                      {v.doctorId && <p className="text-xs text-slate-500">{v.doctorId}</p>}
                      {v.notes && <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{v.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => setShowVisit(true)}>
                Log Visit
              </Button>
            </CardContent>
          </Card>

          {/* Warning signs */}
          <Card className="border-red-200 dark:border-red-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="font-semibold text-sm text-red-600">Warning Signs</p>
              </div>
              <ul className="space-y-1.5">
                {["Severe headache", "Blurred vision", "Heavy bleeding", "Severe abdominal pain", "No fetal movement"].map((w) => (
                  <li key={w} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
              <a href="tel:199">
                <Button variant="danger" size="sm" className="w-full mt-3">Call Emergency</Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
