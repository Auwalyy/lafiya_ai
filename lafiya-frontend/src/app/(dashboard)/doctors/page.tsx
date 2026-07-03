import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Progress } from "@/components/ui/Progress";
import {
  Search, Star, MapPin, Clock, CheckCircle2,
  Filter, Video, Phone, Calendar,
} from "lucide-react";

const specialties = ["All", "General", "Cardiologist", "Gynecologist", "Pediatrician", "Neurologist", "Dermatologist"];

const doctors = [
  {
    name: "Dr. Ibrahim Musa", specialty: "Cardiologist", hospital: "Aminu Kano Teaching Hospital",
    location: "Kano", rating: 4.9, reviews: 128, experience: 12, available: true,
    languages: ["English", "Hausa"], consultFee: "₦5,000", nextSlot: "Today 2:00 PM",
    verified: true, online: true,
  },
  {
    name: "Dr. Fatima Aliyu", specialty: "Gynecologist", hospital: "Murtala Muhammad Specialist Hospital",
    location: "Kano", rating: 4.8, reviews: 94, experience: 8, available: true,
    languages: ["English", "Hausa", "Fulani"], consultFee: "₦4,500", nextSlot: "Tomorrow 10:00 AM",
    verified: true, online: true,
  },
  {
    name: "Dr. Usman Garba", specialty: "Pediatrician", hospital: "Barau Dikko Teaching Hospital",
    location: "Kaduna", rating: 4.7, reviews: 76, experience: 10, available: false,
    languages: ["English", "Hausa"], consultFee: "₦3,500", nextSlot: "Jul 8, 9:00 AM",
    verified: true, online: false,
  },
  {
    name: "Dr. Hauwa Suleiman", specialty: "General Practitioner", hospital: "Rasheed Shekoni Specialist Hospital",
    location: "Dutse", rating: 4.6, reviews: 52, experience: 5, available: true,
    languages: ["English", "Hausa"], consultFee: "₦2,500", nextSlot: "Today 4:00 PM",
    verified: true, online: true,
  },
];

export default function DoctorsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Find Doctors</h1>
        <p className="text-sm text-slate-500">Verified healthcare professionals across Northern Nigeria</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input placeholder="Search by name, specialty, or condition..." className="bg-transparent flex-1 outline-none text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400" />
            </div>
            <div className="flex items-center gap-2 h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <input placeholder="Location" className="bg-transparent w-32 outline-none text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400" />
            </div>
            <Button className="h-11 gap-2">
              <Search className="h-4 w-4" /> Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Specialty filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {specialties.map((s, i) => (
          <button
            key={s}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              i === 0
                ? "gradient-primary text-white shadow-md"
                : "bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-400 hover:border-emerald-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="grid md:grid-cols-2 gap-4">
        {doctors.map((doc) => (
          <Card key={doc.name} hover className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Avatar name={doc.name} size="lg" online={doc.online} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{doc.name}</h3>
                    {doc.verified && <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />}
                  </div>
                  <p className="text-sm text-emerald-600 font-medium">{doc.specialty}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-500 truncate">{doc.hospital}, {doc.location}</span>
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{doc.rating}</span>
                      <span className="text-xs text-slate-400">({doc.reviews})</span>
                    </div>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500">{doc.experience} yrs exp</span>
                  </div>

                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {doc.languages.map((lang) => (
                      <Badge key={lang} variant="slate" size="sm">{lang}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Consultation fee</p>
                  <p className="font-bold text-slate-900 dark:text-white">{doc.consultFee}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Clock className="h-3 w-3 text-emerald-500" />
                    <p className="text-xs text-emerald-600 font-medium">{doc.nextSlot}</p>
                  </div>
                  <Badge variant={doc.available ? "default" : "slate"} size="sm" className="mt-1">
                    {doc.available ? "Available" : "Busy"}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                  <Video className="h-3.5 w-3.5" /> Video
                </Button>
                <Button variant="muted" size="sm" className="flex-1 gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Call
                </Button>
                <Button size="sm" className="flex-1 gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Book
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
