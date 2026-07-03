"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import {
  Search, MapPin, Phone, Star, Navigation,
  CheckCircle2, Video, Loader2, AlertCircle,
} from "lucide-react";
import { hospitals as hospitalsApi } from "@/lib/api";
import type { Hospital } from "@/lib/api";

const types = ["All", "federal", "state", "private", "ngo", "clinic", "pharmacy"];

export default function HospitalsPage() {
  const [list, setList] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [nearbyMode, setNearbyMode] = useState(false);
  const [ratingId, setRatingId] = useState<string | null>(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [ratingLoading, setRatingLoading] = useState(false);

  const fetchHospitals = useCallback(async (lat?: number, lng?: number) => {
    setLoading(true);
    setError("");
    try {
      let res;
      if (lat !== undefined) {
        res = await hospitalsApi.nearby(`lat=${lat}&lng=${lng}`);
      } else {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (type !== "All") params.set("type", type);
        res = await hospitalsApi.list(params.toString());
      }
      setList(res.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load hospitals");
    } finally { setLoading(false); }
  }, [search, type]);

  useEffect(() => { fetchHospitals(); }, [fetchHospitals]);

  const findNearby = () => {
    setNearbyMode(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => fetchHospitals(p.coords.latitude, p.coords.longitude),
        () => fetchHospitals()
      );
    } else { fetchHospitals(); }
  };

  const handleRate = async () => {
    if (!ratingId) return;
    setRatingLoading(true);
    try {
      await hospitalsApi.rate(ratingId, { rating: ratingVal });
      setRatingId(null);
    } catch {} finally { setRatingLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hospitals & Clinics</h1>
        <p className="text-sm text-slate-500">Find healthcare facilities near you</p>
      </div>

      {/* Rate Modal */}
      {ratingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-xs">
            <CardContent className="p-6">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Rate Hospital</h2>
              <div className="flex gap-2 justify-center mb-4">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button key={v} onClick={() => setRatingVal(v)}>
                    <Star className={`h-8 w-8 transition-colors ${v <= ratingVal ? "text-amber-400 fill-amber-400" : "text-slate-300"}`} />
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button className="flex-1" onClick={handleRate} disabled={ratingLoading}>
                  {ratingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
                </Button>
                <Button variant="muted" className="flex-1" onClick={() => setRatingId(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search hospitals by name, state, or service..."
                className="bg-transparent flex-1 outline-none text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400" />
            </div>
            <Button variant="outline" className="h-11 gap-2" onClick={findNearby}>
              <Navigation className="h-4 w-4" /> Nearby
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {types.map((t) => (
          <button key={t} onClick={() => { setType(t); setNearbyMode(false); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all capitalize ${
              type === t && !nearbyMode
                ? "gradient-primary text-white shadow-md"
                : "bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-400 hover:border-emerald-300"
            }`}>
            {t}
          </button>
        ))}
        {nearbyMode && (
          <span className="px-4 py-2 rounded-xl text-sm font-medium gradient-primary text-white shadow-md whitespace-nowrap">
            📍 Nearby
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No hospitals found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {list.map((h) => (
            <Card key={h._id} hover className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
                    <MapPin className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">{h.name}</h3>
                        <p className="text-xs text-emerald-600 capitalize">{h.type}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {h.emergencyAvailable && <Badge variant="red" size="sm">Emergency</Badge>}
                        {h.acceptsTelemedicine && (
                          <Badge variant="blue" size="sm" className="gap-1">
                            <Video className="h-3 w-3" /> Telemedicine
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      <span className="text-xs text-slate-500 truncate">{h.address}{h.lga ? `, ${h.lga}` : ""}{h.state ? `, ${h.state}` : ""}</span>
                    </div>
                    {h.distance !== undefined && (
                      <p className="text-xs text-emerald-600 mt-1">{(h.distance / 1000).toFixed(1)} km away</p>
                    )}
                    {h.rating !== undefined && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{h.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {(h.services ?? []).length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {(h.services ?? []).slice(0, 3).map((s) => (
                          <Badge key={s} variant="slate" size="sm" className="capitalize">{s}</Badge>
                        ))}
                        {(h.services ?? []).length > 3 && (
                          <Badge variant="slate" size="sm">+{(h.services ?? []).length - 3}</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex gap-2">
                  {(h.phone ?? []).length > 0 && (
                    <a href={`tel:${h.phone![0]}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> Call
                      </Button>
                    </a>
                  )}
                  {h.emergencyPhone && (
                    <a href={`tel:${h.emergencyPhone}`} className="flex-1">
                      <Button variant="danger" size="sm" className="w-full gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> Emergency
                      </Button>
                    </a>
                  )}
                  <Button variant="muted" size="sm" className="gap-1.5" onClick={() => setRatingId(h._id)}>
                    <Star className="h-3.5 w-3.5" /> Rate
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
