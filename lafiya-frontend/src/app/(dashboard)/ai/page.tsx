"use client";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import {
  Bot, Send, Mic, Plus, Sparkles, AlertCircle,
  Stethoscope, Pill, Baby, Heart, ChevronRight, Loader2, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ai } from "@/lib/api";
import type { AISession } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";

type Message = { id: string; role: "user" | "assistant"; content: string; time: string };

const suggestions = [
  { icon: Stethoscope, text: "I have a headache and fever" },
  { icon: Pill, text: "What are the side effects of Metformin?" },
  { icon: Baby, text: "I'm 20 weeks pregnant, is spotting normal?" },
  { icon: Heart, text: "My blood pressure is 150/95, what should I do?" },
];

export default function AIPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([{
    id: "0", role: "assistant",
    content: "Sannu! I'm LafiyaAI, your personal health assistant. I can help you understand symptoms, medications, and connect you with doctors. How can I help you today?\n\n*Note: I provide health information, not medical diagnoses. Always consult a doctor for serious concerns.*",
    time: "Now",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<"en" | "ha">("en");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [sessions, setSessions] = useState<AISession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    ai.getSessions()
      .then((res) => setSessions(res.data))
      .catch(() => {})
      .finally(() => setSessionsLoading(false));
  }, []);

  const sendMessage = async (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg: Message = {
      id: Date.now().toString(), role: "user", content: msg,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await ai.chat({ message: msg, sessionId, language });
      if (!sessionId) setSessionId(res.sessionId);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(), role: "assistant",
        content: res.reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      // Refresh sessions list
      ai.getSessions().then((r) => setSessions(r.data)).catch(() => {});
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(), role: "assistant",
        content: "Sorry, I couldn't process your request. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setSessionId(undefined);
    setMessages([{
      id: "0", role: "assistant",
      content: "Sannu! Starting a new session. How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);
  };

  const loadSession = async (sid: string) => {
    try {
      const res = await ai.getSession(sid);
      setSessionId(sid);
      setMessages(res.data.messages.map((m, i) => ({
        id: i.toString(), role: m.role as "user" | "assistant",
        content: m.content,
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      })));
    } catch {}
  };

  const deleteSession = async (sid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await ai.deleteSession(sid);
      setSessions((prev) => prev.filter((s) => s._id !== sid));
      if (sessionId === sid) startNewChat();
    } catch {}
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-5rem)] animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Health Assistant</h1>
          <p className="text-sm text-slate-500">Powered by Gemini · Available 24/7</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border overflow-hidden">
            {(["en", "ha"] as const).map((lang) => (
              <button key={lang} onClick={() => setLanguage(lang)}
                className={cn("px-3 py-1.5 text-xs font-medium transition-colors",
                  language === lang ? "gradient-primary text-white" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}>
                {lang === "en" ? "English" : "Hausa"}
              </button>
            ))}
          </div>
          <Button variant="muted" size="sm" className="gap-1.5" onClick={startNewChat}>
            <Plus className="h-3.5 w-3.5" /> New Chat
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-3 animate-fade-in", msg.role === "user" && "flex-row-reverse")}>
                {msg.role === "assistant" ? (
                  <div className="h-8 w-8 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <Avatar name={user ? `${user.firstName} ${user.lastName}` : "User"} size="sm" />
                )}
                <div className={cn("max-w-[75%] rounded-2xl px-4 py-3 text-sm",
                  msg.role === "assistant"
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm"
                    : "gradient-primary text-white rounded-tr-sm"
                )}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <p className={cn("text-xs mt-1.5", msg.role === "assistant" ? "text-slate-400" : "text-emerald-100")}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="h-8 w-8 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5 items-center h-5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length === 1 && (
            <div className="px-4 pb-2 grid grid-cols-2 gap-2">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s.text)}
                  className="flex items-center gap-2 p-3 rounded-xl border text-left text-xs text-slate-600 dark:text-slate-400 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all">
                  <s.icon className="h-4 w-4 text-emerald-500 shrink-0" />
                  {s.text}
                </button>
              ))}
            </div>
          )}

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder={language === "en" ? "Describe your symptoms or ask a health question..." : "Bayyana alamun rashin lafiyarka..."}
                className="flex-1 h-11 rounded-xl border bg-slate-50 dark:bg-slate-800 px-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 border-slate-200 dark:border-slate-700"
              />
              <Button variant="ghost" size="icon" aria-label="Voice input"><Mic className="h-4 w-4" /></Button>
              <Button size="icon" onClick={() => sendMessage()} disabled={!input.trim() || loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Not a substitute for professional medical advice
            </p>
          </div>
        </Card>

        <div className="hidden xl:flex flex-col gap-4 w-72">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <p className="font-semibold text-sm text-slate-900 dark:text-white">Symptom Checker</p>
              </div>
              <p className="text-xs text-slate-500 mb-3">Get an AI-powered analysis of your symptoms</p>
              <Button variant="outline" size="sm" className="w-full" onClick={() => sendMessage("I want to do a symptom check")}>
                Start Symptom Check
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Recent Sessions</p>
              {sessionsLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin text-slate-400" /></div>
              ) : sessions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">No sessions yet</p>
              ) : sessions.slice(0, 5).map((s) => (
                <div key={s._id} onClick={() => loadSession(s._id)}
                  className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800 rounded px-1 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{s.title || "Chat session"}</p>
                    <p className="text-xs text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => deleteSession(s._id, e)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all">
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="gradient-primary text-white">
            <CardContent className="p-4">
              <Stethoscope className="h-6 w-6 mb-2 text-emerald-100" />
              <p className="font-semibold text-sm">Talk to a Doctor</p>
              <p className="text-xs text-emerald-100 mt-1 mb-3">Connect with verified doctors for professional advice</p>
              <a href="/doctors">
                <Button className="bg-white text-emerald-700 hover:bg-emerald-50 w-full shadow-none text-sm">Find Doctors</Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
