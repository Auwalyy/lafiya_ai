import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Baby, Heart, Calendar, CheckCircle2, Plus, AlertCircle, Stethoscope } from "lucide-react";

const currentWeek = 28;
const totalWeeks = 40;
const trimester = currentWeek <= 12 ? 1 : currentWeek <= 27 ? 2 : 3;

const milestones = [
  { week: 4, title: "Implantation", done: true },
  { week: 8, title: "Heartbeat detected", done: true },
  { week: 12, title: "End of 1st trimester", done: true },
  { week: 20, title: "Anatomy scan", done: true },
  { week: 24, title: "Viability milestone", done: true },
  { week: 28, title: "3rd trimester begins", done: true },
  { week: 32, title: "Baby position check", done: false },
  { week: 36, title: "Full term preparation", done: false },
  { week: 40, title: "Due date", done: false },
];

const symptoms = [
  { name: "Back pain", severity: "mild", date: "Today" },
  { name: "Nausea", severity: "mild", date: "Yesterday" },
  { name: "Fatigue", severity: "moderate", date: "2 days ago" },
];

const visits = [
  { date: "Jun 15", doctor: "Dr. Fatima Aliyu", notes: "BP normal, baby position good", weight: "68kg" },
  { date: "May 20", doctor: "Dr. Fatima Aliyu", notes: "Anatomy scan completed — healthy", weight: "66kg" },
];

const severityColors: Record<string, "default" | "amber" | "red"> = {
  mild: "default",
  moderate: "amber",
  severe: "red",
};

export default function PregnancyPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pregnancy Tracker</h1>
          <p className="text-sm text-slate-500">Week {currentWeek} of {totalWeeks} · Trimester {trimester}</p>
        </div>
        <Button variant="muted" className="gap-2">
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
              <p className="text-white font-semibold mt-3">Your baby is the size of an eggplant 🍆</p>
              <p className="text-emerald-100 text-sm mt-1">~37cm long · ~1kg weight</p>
            </div>
            <div className="hidden sm:flex flex-col items-center">
              <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center">
                <Baby className="h-12 w-12 text-white" />
              </div>
              <p className="text-xs text-emerald-100 mt-2">Trimester {trimester}</p>
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
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800" />
                <div className="space-y-4">
                  {milestones.map((m, i) => (
                    <div key={i} className="flex items-center gap-4 relative">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        m.done ? "gradient-primary" : "bg-slate-100 dark:bg-slate-800"
                      }`}>
                        {m.done
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
                          <p className={`text-sm font-semibold ${m.done ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                            {m.title}
                          </p>
                          <p className="text-xs text-slate-400">Week {m.week}</p>
                        </div>
                        {m.week === currentWeek && <Badge variant="default">Current</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                <Button variant="ghost" size="sm" className="text-emerald-600 text-xs gap-1">
                  <Plus className="h-3 w-3" /> Log
                </Button>
              </div>
              <div className="space-y-2">
                {symptoms.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <div>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{s.name}</p>
                      <p className="text-xs text-slate-400">{s.date}</p>
                    </div>
                    <Badge variant={severityColors[s.severity]}>{s.severity}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Antenatal visits */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-sm text-slate-900 dark:text-white">Antenatal Visits</p>
                <Stethoscope className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="space-y-3">
                {visits.map((v, i) => (
                  <div key={i} className="p-3 rounded-xl border">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{v.date}</p>
                      <Badge variant="slate" size="sm">{v.weight}</Badge>
                    </div>
                    <p className="text-xs text-slate-500">{v.doctor}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{v.notes}</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3">
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
              <Button variant="danger" size="sm" className="w-full mt-3">
                Call Emergency
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
