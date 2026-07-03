"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FileText, Plus, Upload, Share2, Download, Activity, Droplets, Thermometer, Weight } from "lucide-react";
import { cn } from "@/lib/utils";

const recordTypes = ["All", "Lab Results", "Prescriptions", "Vitals", "Imaging", "Vaccination"];

const records = [
  { type: "Lab Results", title: "Blood Sugar Test", date: "Jun 28, 2025", doctor: "Dr. Ibrahim Musa", status: "normal", file: "blood_sugar_jun28.pdf" },
  { type: "Vitals", title: "Blood Pressure Reading", date: "Jun 25, 2025", doctor: "Self-recorded", status: "elevated", file: null },
  { type: "Prescriptions", title: "Metformin Prescription", date: "Jun 15, 2025", doctor: "Dr. Ibrahim Musa", status: "active", file: "prescription_jun15.pdf" },
  { type: "Imaging", title: "Chest X-Ray", date: "May 30, 2025", doctor: "Dr. Usman Garba", status: "normal", file: "xray_may30.pdf" },
  { type: "Vaccination", title: "Hepatitis B Vaccine", date: "Apr 10, 2025", doctor: "Aminu Kano Hospital", status: "completed", file: null },
];

const vitals = [
  { label: "Blood Pressure", value: "128/82", unit: "mmHg", icon: Activity, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30", trend: "↓ Improving" },
  { label: "Blood Sugar", value: "6.2", unit: "mmol/L", icon: Droplets, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30", trend: "→ Stable" },
  { label: "Temperature", value: "36.8", unit: "°C", icon: Thermometer, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30", trend: "✓ Normal" },
  { label: "Weight", value: "68", unit: "kg", icon: Weight, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30", trend: "↑ +0.5kg" },
];

const statusColors: Record<string, "default" | "amber" | "red" | "blue" | "slate"> = {
  normal: "default",
  elevated: "amber",
  active: "blue",
  completed: "slate",
};

export default function HealthRecordsPage() {
  const [activeType, setActiveType] = useState("All");

  const filtered = activeType === "All" ? records : records.filter((r) => r.type === activeType);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Health Records</h1>
          <p className="text-sm text-slate-500">Your complete medical history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="muted" className="gap-2">
            <Upload className="h-4 w-4" /> Upload
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Record
          </Button>
        </div>
      </div>

      {/* Vitals summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {vitals.map((v) => (
          <Card key={v.label} hover>
            <CardContent className="p-4">
              <div className={`h-9 w-9 rounded-xl ${v.bg} flex items-center justify-center mb-3`}>
                <v.icon className={`h-5 w-5 ${v.color}`} />
              </div>
              <p className="text-xs text-slate-500">{v.label}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {v.value} <span className="text-sm font-normal text-slate-400">{v.unit}</span>
              </p>
              <p className="text-xs text-emerald-600 mt-1">{v.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {recordTypes.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
              activeType === type
                ? "gradient-primary text-white shadow-md"
                : "bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-400 hover:border-emerald-300"
            )}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Records list */}
      <div className="space-y-3">
        {filtered.map((rec, i) => (
          <Card key={i} hover className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <FileText className="h-6 w-6 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{rec.title}</h3>
                    <Badge variant={statusColors[rec.status]}>{rec.status}</Badge>
                    <Badge variant="slate" size="sm">{rec.type}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{rec.doctor} · {rec.date}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="ghost" size="icon" aria-label="Share">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  {rec.file && (
                    <Button variant="ghost" size="icon" aria-label="Download">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
