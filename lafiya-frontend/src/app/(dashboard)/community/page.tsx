"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import {
  Search, Heart, MessageCircle, Share2, Bookmark,
  Plus, TrendingUp, Users, CheckCircle2, Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", label: "All" },
  { id: "diabetes", label: "Diabetes" },
  { id: "pregnancy_maternal", label: "Pregnancy" },
  { id: "hypertension", label: "Hypertension" },
  { id: "mental_health", label: "Mental Health" },
  { id: "malaria", label: "Malaria" },
  { id: "heart_conditions", label: "Heart" },
];

const communities = [
  { name: "Diabetes Support", members: 2840, posts: 156, category: "diabetes", joined: true, color: "bg-blue-500" },
  { name: "Pregnancy & Maternal", members: 4120, posts: 289, category: "pregnancy_maternal", joined: true, color: "bg-pink-500" },
  { name: "Hypertension Warriors", members: 1930, posts: 98, category: "hypertension", joined: false, color: "bg-red-500" },
  { name: "Mental Health Circle", members: 3200, posts: 201, category: "mental_health", joined: false, color: "bg-purple-500" },
  { name: "Malaria Awareness", members: 5600, posts: 342, category: "malaria", joined: false, color: "bg-orange-500" },
  { name: "Heart Health", members: 1450, posts: 87, category: "heart_conditions", joined: false, color: "bg-rose-500" },
];

const posts = [
  {
    id: 1, community: "Diabetes Support", author: "Aisha Kabir", role: "patient",
    content: "Has anyone tried the new continuous glucose monitor? My doctor recommended it last week and I'm wondering about experiences from others in the community. The cost is a concern for me.",
    likes: 24, comments: 8, time: "1h ago", liked: false, saved: false,
    tags: ["CGM", "Type 2 Diabetes"],
  },
  {
    id: 2, community: "Pregnancy & Maternal", author: "Dr. Fatima Aliyu", role: "doctor",
    content: "Important reminder for all expecting mothers: Your Week 28 glucose screening is crucial for detecting gestational diabetes. Don't skip this appointment! 🤰\n\nIf you have questions about the test, feel free to ask below.",
    likes: 67, comments: 23, time: "3h ago", liked: true, saved: true,
    tags: ["Prenatal Care", "Gestational Diabetes"],
  },
  {
    id: 3, community: "Hypertension Warriors", author: "Musa Bello", role: "patient",
    content: "Update: After 3 weeks of reducing salt intake and daily 30-minute walks, my BP dropped from 150/95 to 128/82! Small changes make a huge difference. Stay consistent everyone! 💪",
    likes: 89, comments: 31, time: "5h ago", liked: false, saved: false,
    tags: ["Success Story", "Lifestyle"],
  },
];

const roleColors: Record<string, string> = {
  doctor: "blue",
  patient: "slate",
  nurse: "purple",
};

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set([2]));
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set([2]));

  const toggleLike = (id: number) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSave = (id: number) => {
    setSavedPosts((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Community</h1>
          <p className="text-sm text-slate-500">Connect, share, and support each other</p>
        </div>
        <Button className="gap-2 self-start">
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main feed */}
        <div className="flex-1 space-y-4">
          {/* Search + filter */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border text-sm">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input placeholder="Search posts..." className="bg-transparent flex-1 outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400" />
            </div>
            <Button variant="muted" size="icon"><Filter className="h-4 w-4" /></Button>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                  activeCategory === c.id
                    ? "gradient-primary text-white shadow-md"
                    : "bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-400 hover:border-emerald-300"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Posts */}
          {posts.map((post) => (
            <Card key={post.id} hover className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar name={post.author} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">{post.author}</span>
                      <Badge variant={roleColors[post.role] as "blue" | "slate" | "purple"} size="sm">
                        {post.role === "doctor" && <CheckCircle2 className="h-3 w-3" />}
                        {post.role}
                      </Badge>
                      <span className="text-xs text-slate-400">·</span>
                      <Badge variant="default" size="sm">{post.community}</Badge>
                      <span className="text-xs text-slate-400 ml-auto">{post.time}</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                    {post.tags.length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {post.tags.map((tag) => (
                          <span key={tag} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
                            #{tag.replace(/\s+/g, "")}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={cn(
                          "flex items-center gap-1.5 text-sm transition-colors",
                          likedPosts.has(post.id) ? "text-red-500" : "text-slate-400 hover:text-red-500"
                        )}
                      >
                        <Heart className={cn("h-4 w-4", likedPosts.has(post.id) && "fill-current")} />
                        {post.likes + (likedPosts.has(post.id) && !post.liked ? 1 : 0)}
                      </button>
                      <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-500 transition-colors">
                        <MessageCircle className="h-4 w-4" /> {post.comments}
                      </button>
                      <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-500 transition-colors">
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleSave(post.id)}
                        className={cn(
                          "ml-auto flex items-center gap-1.5 text-sm transition-colors",
                          savedPosts.has(post.id) ? "text-emerald-500" : "text-slate-400 hover:text-emerald-500"
                        )}
                      >
                        <Bookmark className={cn("h-4 w-4", savedPosts.has(post.id) && "fill-current")} />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="lg:w-72 space-y-4">
          {/* My Communities */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-sm text-slate-900 dark:text-white">My Communities</p>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="space-y-2">
                {communities.map((c) => (
                  <div key={c.name} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors group">
                    <div className={`h-8 w-8 rounded-lg ${c.color} flex items-center justify-center shrink-0`}>
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.members.toLocaleString()} members</p>
                    </div>
                    {c.joined ? (
                      <Badge variant="default" size="sm">Joined</Badge>
                    ) : (
                      <Button variant="outline" size="sm" className="text-xs h-7 px-2">Join</Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trending */}
          <Card>
            <CardContent className="p-4">
              <p className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Trending Topics</p>
              {["#MalariaAwareness", "#DiabetesTips", "#MaternalHealth", "#HypertensionControl", "#MentalHealthMatters"].map((tag, i) => (
                <div key={tag} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">{tag}</span>
                  <span className="text-xs text-slate-400">{[234, 189, 156, 134, 98][i]} posts</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
