"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Calendar, Clock, Video, Phone, MapPin, Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = ["Upcoming", "Past", "Cancelled"];

const appointments = {
  Upcoming: [
    {
      doctor: "Dr. Ibrahim Musa", specialty: "Cardiologist", date: "Today", time: "2:00 PM",
      type: "video", status: "confirmed", hospital: "Aminu Kano Teaching Hospital", notes: "Follow-up on blood pressure medication",
    },
    {
      doctor: "Dr. Fatima Aliyu", specialty: "Gynecologist", date: "Jul 10, 2025", time: "10:00 AM",
      type: "in-person", status: "pending", hospital: "Murtala Muhammad Specialist Hospital", notes: "Routine prenatal checkup",
    },
  ],
  Past: [
    {
      doctor: "Dr. Usman Garba", specialty: "Pediatrician", date: "Jun 28, 2025", time: "11:00 AM",
      type: "video", status: "completed", hospital: "Barau Dikko Teaching Hospital", notes: "Child vaccination review",
    },
    {
      doctor: "Dr. Ibrahim Musa", specialty: "Cardiologist", date: "Jun 15, 2025", time: "3:00 PM",
      type: "in-person", status: "completed", hospital: "Aminu Kano Teaching Hospital", notes: "Initial consultation",
    },
  ],
  Cancelled: [
    {
      doctor: "Dr. Hauwa Suleiman", specialty: "General Practitioner", date: "Jun 20, 2025", time: "9:00 AM",
      type: "phone", status: "cancelled", hospital: "Rasheed Shekoni Specialist Hospital", notes: "Routine checkup",
    },
  ],
};

const statusColors: Record<string, "default" | "amber" | "slate" | "red"> = {
  confirmed: "default",
  pending: "amber",
  completed: "slate",
  cancelled: "red",
};

const typeIcons = { video: Video, phone: Phone, "in-person": MapPin };

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState("Upcoming");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Appointments</h1>
          <p className="text-sm text-slate-500">Manage your doctor consultations</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Book Appointment
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            {tab}
            <span className="ml-1.5 text-xs text-slate-400">
              ({appointments[tab as keyof typeof appointments].length})
            </span>
          </button>
        ))}
      </div>

      {/* Appointment cards */}
      <div className="space-y-4">
        {appointments[activeTab as keyof typeof appointments].map((apt, i) => {
          const TypeIcon = typeIcons[apt.type as keyof typeof typeIcons];
          return (
            <Card key={i} hover className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar name={apt.doctor} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{apt.doctor}</h3>
                        <p className="text-sm text-emerald-600">{apt.specialty}</p>
                      </div>
                      <Badge variant={statusColors[apt.status]}>{apt.status}</Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {apt.date}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Clock className="h-4 w-4 text-slate-400" />
                        {apt.time}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <TypeIcon className="h-4 w-4 text-slate-400" />
                        {apt.type.charAt(0).toUpperCase() + apt.type.slice(1)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                      <MapPin className="h-3.5 w-3.5" />
                      {apt.hospital}
                    </div>

                    {apt.notes && (
                      <p className="text-xs text-slate-500 mt-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                        📝 {apt.notes}
                      </p>
                    )}

                    {apt.status === "confirmed" && (
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" className="gap-1.5">
                          <Video className="h-3.5 w-3.5" /> Join Video Call
                        </Button>
                        <Button variant="muted" size="sm">Reschedule</Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">Cancel</Button>
                      </div>
                    )}
                    {apt.status === "completed" && (
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm">View Notes</Button>
                        <Button variant="muted" size="sm">Book Again</Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
