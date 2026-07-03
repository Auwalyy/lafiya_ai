"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import {
  Search, Heart, MessageCircle, Share2, Bookmark,
  Plus, TrendingUp, Users, CheckCircle2, Loader2, AlertCircle, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { posts as postsApi, communities as commApi, comments as commentsApi } from "@/lib/api";
import type { Post, Community } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";

const categories = [
  { id: "all", label: "All" },
  { id: "diabetes", label: "Diabetes" },
  { id: "pregnancy_maternal", label: "Pregnancy" },
  { id: "hypertension", label: "Hypertension" },
  { id: "mental_health", label: "Mental Health" },
  { id: "malaria", label: "Malaria" },
  { id: "heart_conditions", label: "Heart" },
];

export default function CommunityPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("all");
  const [postsList, setPostsList] = useState<Post[]>([]);
  const [commList, setCommList] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // New post modal
  const [showPost, setShowPost] = useState(false);
  const [postForm, setPostForm] = useState({ content: "", communityId: "", tags: "", type: "text", language: "en" });
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = activeCategory !== "all" ? `category=${activeCategory}` : "";
      const [postsRes, commsRes] = await Promise.all([
        postsApi.list(params),
        commApi.list(),
      ]);
      setPostsList(postsRes.data);
      setCommList(commsRes.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load community");
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleLike = async (id: string) => {
    try {
      await postsApi.like(id);
      setPostsList((prev) => prev.map((p) => {
        if (p._id !== id) return p;
        const liked = p.likes.includes(user?._id ?? "");
        return { ...p, likes: liked ? p.likes.filter((l) => l !== user?._id) : [...p.likes, user?._id ?? ""] };
      }));
    } catch {}
  };

  const toggleSave = async (id: string) => {
    try {
      await postsApi.save(id);
      setPostsList((prev) => prev.map((p) => {
        if (p._id !== id) return p;
        const saved = (p.savedBy ?? []).includes(user?._id ?? "");
        return { ...p, savedBy: saved ? (p.savedBy ?? []).filter((s) => s !== user?._id) : [...(p.savedBy ?? []), user?._id ?? ""] };
      }));
    } catch {}
  };

  const toggleJoin = async (id: string, joined: boolean) => {
    try {
      joined ? await commApi.leave(id) : await commApi.join(id);
      setCommList((prev) => prev.map((c) =>
        c._id === id ? { ...c, isJoined: !joined, memberCount: c.memberCount + (joined ? -1 : 1) } : c
      ));
    } catch {}
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostLoading(true);
    setPostError("");
    try {
      const form = new FormData();
      form.append("communityId", postForm.communityId);
      form.append("content", postForm.content);
      form.append("type", postForm.type);
      form.append("language", postForm.language);
      if (postForm.tags) form.append("tags", postForm.tags);
      await postsApi.create(form);
      setShowPost(false);
      setPostForm({ content: "", communityId: "", tags: "", type: "text", language: "en" });
      await fetchData();
    } catch (e: unknown) {
      setPostError(e instanceof Error ? e.message : "Failed to create post");
    } finally { setPostLoading(false); }
  };

  const filtered = postsList.filter((p) =>
    !search || p.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Community</h1>
          <p className="text-sm text-slate-500">Connect, share, and support each other</p>
        </div>
        <Button className="gap-2 self-start" onClick={() => setShowPost(true)}>
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>

      {/* New Post Modal */}
      {showPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">Create Post</h2>
                <button onClick={() => setShowPost(false)}><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              {postError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 mb-4">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600">{postError}</p>
                </div>
              )}
              <form onSubmit={handlePost} className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Community</label>
                  <select required value={postForm.communityId}
                    onChange={(e) => setPostForm((p) => ({ ...p, communityId: e.target.value }))}
                    className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="">Select community</option>
                    {commList.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Content</label>
                  <textarea required value={postForm.content}
                    onChange={(e) => setPostForm((p) => ({ ...p, content: e.target.value }))}
                    rows={4} placeholder="Share your experience or question..."
                    className="w-full rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Tags (comma separated)</label>
                  <input value={postForm.tags}
                    onChange={(e) => setPostForm((p) => ({ ...p, tags: e.target.value }))}
                    placeholder="e.g. diabetes, tips"
                    className="w-full h-10 rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1" disabled={postLoading}>
                    {postLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
                  </Button>
                  <Button type="button" variant="muted" className="flex-1" onClick={() => setShowPost(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border text-sm">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts..." className="bg-transparent flex-1 outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400" />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((c) => (
              <button key={c.id} onClick={() => setActiveCategory(c.id)}
                className={cn("px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                  activeCategory === c.id
                    ? "gradient-primary text-white shadow-md"
                    : "bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-400 hover:border-emerald-300"
                )}>
                {c.label}
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
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No posts yet. Be the first to share!</p>
            </div>
          ) : filtered.map((post) => {
            const liked = post.likes.includes(user?._id ?? "");
            const saved = (post.savedBy ?? []).includes(user?._id ?? "");
            return (
              <Card key={post._id} hover className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Avatar name={`${post.author.firstName} ${post.author.lastName}`} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          {post.author.firstName} {post.author.lastName}
                        </span>
                        <Badge variant={post.author.role === "doctor" ? "blue" : "slate"} size="sm">
                          {post.author.role === "doctor" && <CheckCircle2 className="h-3 w-3" />}
                          {post.author.role}
                        </Badge>
                        <Badge variant="default" size="sm">
                          {typeof post.community === "object" ? post.community.name : "Community"}
                        </Badge>
                        <span className="text-xs text-slate-400 ml-auto">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </p>
                      {(post.tags ?? []).length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {(post.tags ?? []).map((tag) => (
                            <span key={tag} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
                              #{tag.replace(/\s+/g, "")}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-4 pt-3 border-t">
                        <button onClick={() => toggleLike(post._id)}
                          className={cn("flex items-center gap-1.5 text-sm transition-colors",
                            liked ? "text-red-500" : "text-slate-400 hover:text-red-500"
                          )}>
                          <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                          {post.likes.length}
                        </button>
                        <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-500 transition-colors">
                          <MessageCircle className="h-4 w-4" />
                        </button>
                        <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-500 transition-colors">
                          <Share2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => toggleSave(post._id)}
                          className={cn("ml-auto flex items-center gap-1.5 text-sm transition-colors",
                            saved ? "text-emerald-500" : "text-slate-400 hover:text-emerald-500"
                          )}>
                          <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="lg:w-72 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-sm text-slate-900 dark:text-white">Communities</p>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="space-y-2">
                {commList.slice(0, 6).map((c) => {
                  const colors = ["bg-blue-500", "bg-pink-500", "bg-red-500", "bg-purple-500", "bg-orange-500", "bg-rose-500"];
                  const color = colors[commList.indexOf(c) % colors.length];
                  return (
                    <div key={c._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                      <div className={`h-8 w-8 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.memberCount.toLocaleString()} members</p>
                      </div>
                      {c.isJoined ? (
                        <Button variant="muted" size="sm" className="text-xs h-7 px-2"
                          onClick={() => toggleJoin(c._id, true)}>Leave</Button>
                      ) : (
                        <Button variant="outline" size="sm" className="text-xs h-7 px-2"
                          onClick={() => toggleJoin(c._id, false)}>Join</Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
