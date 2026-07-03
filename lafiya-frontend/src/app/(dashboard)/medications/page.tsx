"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Pill, Plus, CheckCircle2, Clock, AlertCircle, TrendingUp, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const medications = [
  {
    name: "Metformin", dosage: "500mg", frequency: "Twice daily", times: ["8:00 AM", "8:00 PM"],
    condition: "Diabetes", color: "bg-blue-500", taken: [true, false], refillDate: "Jul 15",
    adherence: 87, stock: 24,
  },
  {
    name: "Lisinopril", dosage: "10mg", frequency: "Once daily", times: ["8:00 AM"],
    condition: "Hypertension", color: "bg-red-500", taken: [true], refillDate: "Jul 20",
    adherence: 94, stock: 18,
  },
  {
    name: "Aspirin", dosage: "81mg", frequency: "Once daily", times: ["8:00 PM"],
    condition: "Heart Health", color: "bg-orange-500", taken: [false], refillDate: "Aug 1",
    adherence: 78, stock: 45,
  },
  {
    name: "Folic Acid", dosage: "5mg", frequency: "Once daily", times: ["Morning"],
    condition: "Prenatal", color: "bg-pink-500", taken: [true], refillDate: "Jul 25",
    adherence: 96, stock: 30,
  },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekData = [true, true, false, true, true, true, false];

export default function MedicationsPage() {
  const [takenState, setTakenState] = useState<Record<string, boolean[]>>(
    Object.fromEntries(medications.map((m) => [m.name, [...m.taken]]))
  );

  const toggleDose = (name: string, idx: number) => {
    setTakenState((prev) => {
      const arr = [...prev[name]];
      arr[idx] = !arr[idx];
      return { ...prev, [name]: arr };
    });
  };

  const totalDoses = medications.reduce((a, m) => a + m.times.length, 0);
  const takenDoses = Object.entries(takenState).reduce(
    (a, [name, taken]) => a + taken.filter(Boolean).length, 0
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Medications</h1>
          <p className="text-sm text-slate-500">Track your daily medications and adherence</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Medication
        </Button>
      </div>

      {/* Today's summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Today's Doses", value: `${takenDoses}/${totalDoses}`, icon: Pill, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
          { label: "Avg Adherence", value: "89%", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
          { label: "Active Meds", value: medications.length.toString(), icon: CheckCircle2, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
          { label: "Next Refill", value: "Jul 15", icon: Calendar, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30" },
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

      {/* Weekly adherence */}
      <Card>
        <CardContent className="p-5">
          <p className="font-semibold text-sm text-slate-900 dark:text-white mb-4">This Week&apos;s Adherence</p>
          <div className="flex gap-2 justify-between">
            {weekDays.map((day, i) => (
              <div key={day} className="flex flex-col items-center gap-2">
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center",
                  weekData[i] ? "gradient-primary" : "bg-slate-100 dark:bg-slate-800",
                  i === 3 && "ring-2 ring-emerald-400 ring-offset-2"
                )}>
                  {weekData[i]
                    ? <CheckCircle2 className="h-5 w-5 text-white" />
                    : <AlertCircle className="h-5 w-5 text-slate-400" />
                  }
                </div>
                <span className={cn("text-xs font-medium", i === 3 ? "text-emerald-600" : "text-slate-500")}>{day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Medication list */}
      <div className="space-y-4">
        {medications.map((med) => (
          <Card key={med.name} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-2xl ${med.color} flex items-center justify-center shrink-0`}>
                  <Pill className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{med.name} <span className="font-normal text-slate-500">{med.dosage}</span></h3>
                      <p className="text-sm text-slate-500">{med.frequency} · {med.condition}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Stock: {med.stock} pills</p>
                      <p className="text-xs text-orange-500">Refill: {med.refillDate}</p>
                    </div>
                  </div>

                  <Progress value={med.adherence} label="Adherence" color="emerald" size="sm" className="mt-3" />

                  <div className="flex gap-2 mt-3 flex-wrap">
                    {med.times.map((time, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleDose(med.name, idx)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border",
                          takenState[med.name]?.[idx]
                            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-300"
                        )}
                      >
                        {takenState[med.name]?.[idx]
                          ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          : <Clock className="h-4 w-4 text-slate-400" />
                        }
                        {time}
                        {takenState[med.name]?.[idx] ? " ✓" : ""}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
