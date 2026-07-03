"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Search, Megaphone, Calendar, User, Loader2, AlertCircle, ChevronRight } from "lucide-react";
import { campaigns as campaignsApi } from "@/lib/api";
import type { Campaign } from "@/lib/api";

const types = ["All", "awareness", "vaccination", "screening", "hygiene", "nutrition", "maternal"];

const typeColors: Record<string, string> = {
  awareness: "bg-blue-500",
  vaccination: "bg-emerald-500",
  screening: "bg-purple-500",
  hygiene: "bg-teal-500",
  nutrition: "bg-orange-500",
  maternal: "bg-pink-500",
};

export default function CampaignsPage() {
  const [list, setList] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (type !== "All") params.set("type", type);
      const res = await campaignsApi.list(params.toString());
      setList(res.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load campaigns");
    } finally { setLoading(false); }
  }, [search, type]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Health Campaigns</h1>
        <p className="text-sm text-slate-500">Public health initiatives and awareness programs</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns..."
              className="bg-transparent flex-1 outline-none text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400" />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {types.map((t) => (
          <button key={t} onClick={() => setType(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all capitalize ${
              type === t
                ? "gradient-primary text-white shadow-md"
                : "bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-400 hover:border-emerald-300"
            }`}>
            {t}
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
      ) : list.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No campaigns found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((c) => {
            const color = typeColors[c.type ?? ""] ?? "bg-slate-500";
            const isExpanded = expanded === c._id;
            return (
              <Card key={c._id} hover className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-2xl ${color} flex items-center justify-center shrink-0`}>
                      <Megaphone className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">{c.title}</h3>
                          {c.description && (
                            <p className="text-sm text-slate-500 mt-0.5">{c.description}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {c.isPublished
                            ? <Badge variant="default" size="sm">Active</Badge>
                            : <Badge variant="slate" size="sm">Draft</Badge>
                          }
                          {c.type && (
                            <Badge variant="blue" size="sm" className="capitalize">{c.type}</Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 mt-3">
                        {c.startDate && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {new Date(c.startDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                            {c.endDate && ` — ${new Date(c.endDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}`}
                          </div>
                        )}
                        {c.sponsor && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            {c.sponsor}
                          </div>
                        )}
                        {c.language && (
                          <Badge variant="slate" size="sm" className="capitalize">{c.language}</Badge>
                        )}
                      </div>

                      {c.targetAudience && (
                        <p className="text-xs text-slate-500 mt-2">
                          🎯 {c.targetAudience}
                        </p>
                      )}

                      {c.content && (
                        <div className="mt-3">
                          <button
                            onClick={() => setExpanded(isExpanded ? null : c._id)}
                            className="flex items-center gap-1 text-xs text-emerald-600 hover:underline"
                          >
                            {isExpanded ? "Show less" : "Read more"}
                            <ChevronRight className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                          </button>
                          {isExpanded && (
                            <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">
                              {c.content}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
