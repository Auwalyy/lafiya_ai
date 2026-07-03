"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  AlertTriangle, Phone, MapPin, Flame,
  Wind, Zap, Droplets, Thermometer, ChevronDown, ChevronUp, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { emergency as emergencyApi } from "@/lib/api";
import type { EmergencyContact, FirstAidGuide, Hospital } from "@/lib/api";

const conditionIcons: Record<string, React.ElementType> = {
  malaria: Thermometer, choking: Wind, burns: Flame,
  seizure: Zap, bleeding: Droplets, heatstroke: Thermometer,
};
const conditionColors: Record<string, { color: string; bg: string }> = {
  malaria: { color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30" },
  choking: { color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
  burns: { color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30" },
  seizure: { color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
  bleeding: { color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
  heatstroke: { color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
};
const conditions = ["malaria", "choking", "burns", "seizure", "bleeding", "heatstroke"];

const fallbackContacts = [
  { name: "Emergency", number: "112", description: "General emergency", color: "bg-red-500" },
  { name: "Ambulance", number: "199", description: "Medical emergency", color: "bg-orange-500" },
  { name: "Police", number: "199", description: "Security", color: "bg-blue-500" },
  { name: "Fire Service", number: "193", description: "Fire emergency", color: "bg-amber-500" },
  { name: "NEMA", number: "0800-NEMA", description: "Disaster mgmt", color: "bg-purple-500" },
];

export default function EmergencyPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sosActive, setSosActive] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [contacts, setContacts] = useState<(EmergencyContact & { color?: string })[]>([]);
  const [nearbyHospitals, setNearbyHospitals] = useState<Hospital[]>([]);
  const [guides, setGuides] = useState<Record<string, FirstAidGuide>>({});
  const [guideLoading, setGuideLoading] = useState<string | null>(null);

  useEffect(() => {
    emergencyApi.contacts()
      .then((r) => setContacts(r.data))
      .catch(() => setContacts(fallbackContacts));

    const loadHospitals = (lat?: number, lng?: number) =>
      emergencyApi.nearbyHospitals(lat, lng)
        .then((r) => setNearbyHospitals(r.data.slice(0, 3)))
        .catch(() => {});

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => loadHospitals(pos.coords.latitude, pos.coords.longitude),
        () => loadHospitals()
      );
    } else {
      loadHospitals();
    }
  }, []);

  const loadGuide = async (condition: string) => {
    if (expanded === condition) { setExpanded(null); return; }
    setExpanded(condition);
    if (guides[condition]) return;
    setGuideLoading(condition);
    try {
      const res = await emergencyApi.firstAid(condition);
      setGuides((prev) => ({ ...prev, [condition]: res.data }));
    } catch {} finally { setGuideLoading(null); }
  };

  const handleSOS = async () => {
    setSosLoading(true);
    const send = async (lat?: number, lng?: number) => {
      try {
        await emergencyApi.sendAlert(lat ? { location: { lat, lng: lng! } } : {});
        setSosActive(true);
      } catch {} finally { setSosLoading(false); }
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => send(p.coords.latitude, p.coords.longitude),
        () => send()
      );
    } else { send(); }
  };

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
                onClick={sosActive ? () => setSosActive(false) : handleSOS}
                disabled={sosLoading}
                className={cn(
                  "h-24 w-24 rounded-full flex items-center justify-center font-black text-2xl text-white transition-all duration-300 shadow-2xl",
                  sosActive ? "bg-red-600 scale-110 shadow-red-500/50" : "bg-red-500 hover:bg-red-600 hover:scale-105 shadow-red-500/30"
                )}>
                {sosLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : "SOS"}
              </button>
              {sosActive && <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping" />}
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
              <Button variant="danger" onClick={() => setSosActive(false)}>Cancel Alert</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <div>
        <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Emergency Contacts — Nigeria</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {contacts.map((c, i) => {
            const colors = ["bg-red-500", "bg-orange-500", "bg-blue-500", "bg-amber-500", "bg-purple-500"];
            const bg = (c as { color?: string }).color ?? colors[i % colors.length];
            return (
              <a key={c.name} href={`tel:${c.number}`}>
                <Card hover className="text-center overflow-hidden">
                  <CardContent className="p-4">
                    <div className={`h-12 w-12 rounded-2xl ${bg} flex items-center justify-center mx-auto mb-3`}>
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <p className="font-bold text-lg text-slate-900 dark:text-white">{c.number}</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{c.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{c.description}</p>
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </div>
      </div>

      {/* Nearby Hospitals */}
      {nearbyHospitals.length > 0 && (
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Nearby Hospitals</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {nearbyHospitals.map((h) => (
              <Card key={h._id} hover>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">{h.name}</p>
                      <p className="text-xs text-slate-500">{h.address}</p>
                      {h.distance !== undefined && (
                        <p className="text-xs text-emerald-600 mt-1">{h.distance.toFixed(1)} km away</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* First Aid Guides */}
      <div>
        <h2 className="font-semibold text-slate-900 dark:text-white mb-3">First Aid Guides</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {conditions.map((condition) => {
            const Icon = conditionIcons[condition] ?? Thermometer;
            const { color, bg } = conditionColors[condition] ?? { color: "text-slate-500", bg: "bg-slate-50" };
            const guide = guides[condition];
            return (
              <Card key={condition} className="overflow-hidden">
                <button className="w-full p-4 flex items-center gap-3 text-left" onClick={() => loadGuide(condition)}>
                  <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white capitalize">{condition}</p>
                    <p className="text-xs text-slate-500">{guide ? `${guide.steps.length} steps` : "Tap to load guide"}</p>
                  </div>
                  {guideLoading === condition
                    ? <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
                    : expanded === condition
                      ? <ChevronUp className="h-4 w-4 text-slate-400" />
                      : <ChevronDown className="h-4 w-4 text-slate-400" />
                  }
                </button>
                {expanded === condition && guide && (
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
                    {guide.warning && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 dark:text-amber-400">{guide.warning}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
