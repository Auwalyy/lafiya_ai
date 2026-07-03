"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  AlertTriangle, Phone, MapPin, Heart, Flame,
  Wind, Zap, Droplets, Thermometer, ChevronDown, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const emergencyContacts = [
  { name: "Emergency Services", number: "112", desc: "General emergency", color: "bg-red-500" },
  { name: "Ambulance", number: "199", desc: "Medical emergency", color: "bg-orange-500" },
  { name: "Police", number: "199", desc: "Security emergency", color: "bg-blue-500" },
  { name: "Fire Service", number: "193", desc: "Fire emergency", color: "bg-amber-500" },
  { name: "NEMA", number: "0800-CALL-NEMA", desc: "Disaster management", color: "bg-purple-500" },
];

const firstAidGuides = [
  {
    id: "malaria", icon: Thermometer, title: "Malaria", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30",
    steps: [
      "Move patient to a cool, shaded area",
      "Give paracetamol for fever (not aspirin for children)",
      "Ensure adequate hydration — oral rehydration salts if available",
      "Seek medical care immediately for antimalarial treatment",
      "Do NOT give aspirin to children under 16",
    ],
    warning: "Seek emergency care if: high fever (>39°C), convulsions, loss of consciousness, or severe vomiting",
  },
  {
    id: "choking", icon: Wind, title: "Choking", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30",
    steps: [
      "Ask 'Are you choking?' — if they can't speak, act immediately",
      "Give 5 firm back blows between shoulder blades",
      "Give 5 abdominal thrusts (Heimlich maneuver)",
      "Alternate back blows and abdominal thrusts",
      "Call emergency services if object not dislodged",
    ],
    warning: "For infants: use 5 back blows + 5 chest thrusts. Never do abdominal thrusts on infants.",
  },
  {
    id: "burns", icon: Flame, title: "Burns", color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30",
    steps: [
      "Remove from heat source safely",
      "Cool burn under cool (not cold) running water for 20 minutes",
      "Remove jewelry/clothing near burn (if not stuck)",
      "Cover loosely with clean cling film or non-fluffy material",
      "Do NOT use ice, butter, or toothpaste",
    ],
    warning: "Seek emergency care for: burns larger than palm, burns on face/hands/genitals, chemical/electrical burns",
  },
  {
    id: "seizure", icon: Zap, title: "Seizure", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30",
    steps: [
      "Stay calm and time the seizure",
      "Clear the area of dangerous objects",
      "Cushion the head with something soft",
      "Turn person on their side (recovery position)",
      "Do NOT restrain or put anything in their mouth",
    ],
    warning: "Call emergency if: seizure lasts >5 minutes, person doesn't regain consciousness, or it's their first seizure",
  },
  {
    id: "bleeding", icon: Droplets, title: "Severe Bleeding", color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30",
    steps: [
      "Apply firm, direct pressure with clean cloth",
      "Maintain pressure — do not remove cloth",
      "Elevate the injured area above heart level if possible",
      "Add more cloth if blood soaks through (don't remove first)",
      "Call emergency services immediately",
    ],
    warning: "Do NOT remove embedded objects. Apply pressure around them.",
  },
  {
    id: "heatstroke", icon: Thermometer, title: "Heatstroke", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30",
    steps: [
      "Move to cool, shaded area immediately",
      "Remove excess clothing",
      "Apply cool water to skin, fan vigorously",
      "Place ice packs on neck, armpits, and groin",
      "Give cool water if conscious and able to swallow",
    ],
    warning: "Heatstroke is life-threatening. Call emergency services immediately.",
  },
];

export default function EmergencyPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sosActive, setSosActive] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Emergency</h1>
        <p className="text-sm text-slate-500">Quick access to emergency services and first aid</p>
      </div>

      {/* SOS Button */}
      <Card className={cn("overflow-hidden transition-all", sosActive ? "border-red-400" : "border-red-200 dark:border-red-900")}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setSosActive(!sosActive)}
                className={cn(
                  "h-24 w-24 rounded-full flex items-center justify-center font-black text-2xl text-white transition-all duration-300 shadow-2xl",
                  sosActive
                    ? "bg-red-600 scale-110 shadow-red-500/50"
                    : "bg-red-500 hover:bg-red-600 hover:scale-105 shadow-red-500/30"
                )}
              >
                SOS
              </button>
              {sosActive && (
                <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping" />
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {sosActive ? "🚨 SOS Alert Sent!" : "Emergency SOS"}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {sosActive
                  ? "Your location has been shared with emergency contacts and nearby hospitals."
                  : "Press to send your location to emergency contacts and alert nearby hospitals."}
              </p>
              {sosActive && (
                <div className="flex gap-2 mt-3 justify-center sm:justify-start">
                  <Badge variant="red" size="md">Alert Active</Badge>
                  <Badge variant="orange" size="md">Location Shared</Badge>
                </div>
              )}
            </div>
            {sosActive && (
              <Button variant="danger" onClick={() => setSosActive(false)}>
                Cancel Alert
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <div>
        <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Emergency Contacts — Nigeria</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {emergencyContacts.map((c) => (
            <a key={c.name} href={`tel:${c.number}`}>
              <Card hover className="text-center overflow-hidden">
                <CardContent className="p-4">
                  <div className={`h-12 w-12 rounded-2xl ${c.color} flex items-center justify-center mx-auto mb-3`}>
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-bold text-lg text-slate-900 dark:text-white">{c.number}</p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{c.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{c.desc}</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>

      {/* First Aid Guides */}
      <div>
        <h2 className="font-semibold text-slate-900 dark:text-white mb-3">First Aid Guides</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {firstAidGuides.map((guide) => (
            <Card key={guide.id} className="overflow-hidden">
              <button
                className="w-full p-4 flex items-center gap-3 text-left"
                onClick={() => setExpanded(expanded === guide.id ? null : guide.id)}
              >
                <div className={`h-10 w-10 rounded-xl ${guide.bg} flex items-center justify-center shrink-0`}>
                  <guide.icon className={`h-5 w-5 ${guide.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{guide.title}</p>
                  <p className="text-xs text-slate-500">{guide.steps.length} steps</p>
                </div>
                {expanded === guide.id
                  ? <ChevronUp className="h-4 w-4 text-slate-400" />
                  : <ChevronDown className="h-4 w-4 text-slate-400" />
                }
              </button>

              {expanded === guide.id && (
                <div className="px-4 pb-4 animate-fade-in">
                  <ol className="space-y-2 mb-3">
                    {guide.steps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                        <span className="h-5 w-5 rounded-full gradient-primary text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">{guide.warning}</p>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
