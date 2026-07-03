// Central API client — maps every backend endpoint

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://lafiya-ai-backend.onrender.com/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${getToken()}`;
      const retry = await fetch(`${BASE_URL}${path}`, { ...options, headers });
      if (!retry.ok) throw new ApiError(retry.status, await retry.json());
      return retry.json();
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
    throw new ApiError(401, { message: "Unauthorized" });
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    localStorage.setItem("accessToken", data.token ?? data.data?.accessToken);
    return true;
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  constructor(public status: number, public body: { message?: string; [k: string]: unknown }) {
    super(body?.message ?? "Request failed");
  }
}

async function upload<T>(path: string, form: FormData, method = "POST"): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { method, headers, body: form });
  if (!res.ok) throw new ApiError(res.status, await res.json().catch(() => ({})));
  return res.json();
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const auth = {
  register: (body: {
    firstName: string; lastName: string; email: string;
    password: string; phone?: string; role?: string; preferredLanguage?: string;
  }) => request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  me: () => request<{ success: boolean; data: User }>("/auth/me"),

  verifyEmail: (token: string) =>
    request("/auth/verify-email", { method: "POST", body: JSON.stringify({ token }) }),

  forgotPassword: (email: string) =>
    request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),

  resetPassword: (body: { token: string; password: string }) =>
    request("/auth/reset-password", { method: "POST", body: JSON.stringify(body) }),

  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    request("/auth/change-password", { method: "PUT", body: JSON.stringify(body) }),

  refreshToken: (refreshToken: string) =>
    request<AuthResponse>("/auth/refresh-token", { method: "POST", body: JSON.stringify({ refreshToken }) }),

  updateFcmToken: (fcmToken: string) =>
    request("/auth/fcm-token", { method: "PUT", body: JSON.stringify({ fcmToken }) }),
};

// ─── USERS ────────────────────────────────────────────────────────────────────
export const users = {
  getProfile: () => request<{ success: boolean; data: User }>("/users/profile"),

  updateProfile: (body: Partial<UpdateProfileBody>) =>
    request<{ success: boolean; data: User }>("/users/profile", { method: "PUT", body: JSON.stringify(body) }),

  uploadAvatar: (form: FormData) => upload<{ success: boolean; data: User }>("/users/avatar", form, "PUT"),

  deleteAccount: () => request("/users/me", { method: "DELETE" }),

  getMyCommunities: () => request<PaginatedResponse<Community>>("/users/me/communities"),

  getById: (id: string) => request<{ success: boolean; data: User }>(`/users/${id}`),

  getAll: (params?: string) => request<PaginatedResponse<User>>(`/users${params ? `?${params}` : ""}`),
};

// ─── COMMUNITIES ──────────────────────────────────────────────────────────────
export const communities = {
  list: (params?: string) =>
    request<PaginatedResponse<Community>>(`/communities${params ? `?${params}` : ""}`),

  getById: (id: string) => request<{ success: boolean; data: Community }>(`/communities/${id}`),

  getMembers: (id: string, params?: string) =>
    request<PaginatedResponse<User>>(`/communities/${id}/members${params ? `?${params}` : ""}`),

  create: (form: FormData) => upload<{ success: boolean; data: Community }>("/communities", form),

  update: (id: string, form: FormData) =>
    upload<{ success: boolean; data: Community }>(`/communities/${id}`, form, "PUT"),

  join: (id: string) => request(`/communities/${id}/join`, { method: "POST" }),

  leave: (id: string) => request(`/communities/${id}/leave`, { method: "POST" }),

  addDoctor: (id: string, body: { doctorId: string; userId: string }) =>
    request(`/communities/${id}/add-doctor`, { method: "POST", body: JSON.stringify(body) }),
};

// ─── POSTS ────────────────────────────────────────────────────────────────────
export const posts = {
  list: (params?: string) =>
    request<PaginatedResponse<Post>>(`/posts${params ? `?${params}` : ""}`),

  getById: (id: string) => request<{ success: boolean; data: Post }>(`/posts/${id}`),

  create: (form: FormData) => upload<{ success: boolean; data: Post }>("/posts", form),

  update: (id: string, body: { title?: string; content?: string; tags?: string[] }) =>
    request<{ success: boolean; data: Post }>(`/posts/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  delete: (id: string) => request(`/posts/${id}`, { method: "DELETE" }),

  like: (id: string) => request(`/posts/${id}/like`, { method: "POST" }),

  save: (id: string) => request(`/posts/${id}/save`, { method: "POST" }),

  flag: (id: string, reason: string) =>
    request(`/posts/${id}/flag`, { method: "POST", body: JSON.stringify({ reason }) }),

  pin: (id: string) => request(`/posts/${id}/pin`, { method: "POST" }),
};

// ─── COMMENTS ─────────────────────────────────────────────────────────────────
export const comments = {
  list: (postId: string, params?: string) =>
    request<PaginatedResponse<Comment>>(`/comments?post=${postId}${params ? `&${params}` : ""}`),

  create: (body: { postId: string; content: string; parentCommentId?: string; isAnonymous?: boolean }) =>
    request<{ success: boolean; data: Comment }>("/comments", { method: "POST", body: JSON.stringify(body) }),

  update: (id: string, content: string) =>
    request<{ success: boolean; data: Comment }>(`/comments/${id}`, { method: "PUT", body: JSON.stringify({ content }) }),

  delete: (id: string) => request(`/comments/${id}`, { method: "DELETE" }),

  like: (id: string) => request(`/comments/${id}/like`, { method: "POST" }),
};

// ─── DOCTORS ──────────────────────────────────────────────────────────────────
export const doctors = {
  list: (params?: string) =>
    request<PaginatedResponse<Doctor>>(`/doctors${params ? `?${params}` : ""}`),

  getById: (id: string) => request<{ success: boolean; data: Doctor }>(`/doctors/${id}`),

  getAvailability: (id: string) => request<{ success: boolean; data: Slot[] }>(`/doctors/${id}/availability`),

  register: (form: FormData) => upload<{ success: boolean; data: Doctor }>("/doctors/register", form),

  updateMe: (body: Partial<Doctor>) =>
    request<{ success: boolean; data: Doctor }>("/doctors/me", { method: "PUT", body: JSON.stringify(body) }),

  rate: (id: string, body: { rating: number; review?: string; appointmentId?: string }) =>
    request(`/doctors/${id}/rate`, { method: "POST", body: JSON.stringify(body) }),
};

// ─── HOSPITALS ────────────────────────────────────────────────────────────────
export const hospitals = {
  list: (params?: string) =>
    request<PaginatedResponse<Hospital>>(`/hospitals${params ? `?${params}` : ""}`),

  nearby: (params?: string) =>
    request<PaginatedResponse<Hospital>>(`/hospitals/nearby${params ? `?${params}` : ""}`),

  getById: (id: string) => request<{ success: boolean; data: Hospital }>(`/hospitals/${id}`),

  create: (form: FormData) => upload<{ success: boolean; data: Hospital }>("/hospitals", form),

  update: (id: string, form: FormData) =>
    upload<{ success: boolean; data: Hospital }>(`/hospitals/${id}`, form, "PUT"),

  deactivate: (id: string) => request(`/hospitals/${id}`, { method: "DELETE" }),

  rate: (id: string, body: { rating: number }) =>
    request(`/hospitals/${id}/rate`, { method: "POST", body: JSON.stringify(body) }),
};

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────────
export const appointments = {
  mine: (params?: string) =>
    request<PaginatedResponse<Appointment>>(`/appointments/me${params ? `?${params}` : ""}`),

  doctorAppointments: (params?: string) =>
    request<PaginatedResponse<Appointment>>(`/appointments/doctor${params ? `?${params}` : ""}`),

  getById: (id: string) => request<{ success: boolean; data: Appointment }>(`/appointments/${id}`),

  book: (body: {
    doctorId: string; hospitalId?: string; type: string;
    scheduledAt: string; reason: string; symptoms?: string[];
  }) => request<{ success: boolean; data: Appointment }>("/appointments", { method: "POST", body: JSON.stringify(body) }),

  confirm: (id: string) =>
    request<{ success: boolean; data: Appointment }>(`/appointments/${id}/confirm`, { method: "PUT" }),

  cancel: (id: string, reason?: string) =>
    request<{ success: boolean; data: Appointment }>(`/appointments/${id}/cancel`, { method: "PUT", body: JSON.stringify({ reason }) }),

  complete: (id: string, body: { doctorNotes: string; prescription?: string }) =>
    request<{ success: boolean; data: Appointment }>(`/appointments/${id}/complete`, { method: "PUT", body: JSON.stringify(body) }),
};

// ─── HEALTH RECORDS ───────────────────────────────────────────────────────────
export const healthRecords = {
  list: (params?: string) =>
    request<PaginatedResponse<HealthRecord>>(`/health-records${params ? `?${params}` : ""}`),

  vitalsTimeline: () =>
    request<{ success: boolean; data: HealthRecord[] }>("/health-records/vitals/timeline"),

  patientRecords: (userId: string) =>
    request<PaginatedResponse<HealthRecord>>(`/health-records/patient/${userId}`),

  getById: (id: string) => request<{ success: boolean; data: HealthRecord }>(`/health-records/${id}`),

  create: (form: FormData) => upload<{ success: boolean; data: HealthRecord }>("/health-records", form),

  update: (id: string, body: Partial<HealthRecord>) =>
    request<{ success: boolean; data: HealthRecord }>(`/health-records/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  delete: (id: string) => request(`/health-records/${id}`, { method: "DELETE" }),

  share: (id: string, doctorId: string) =>
    request(`/health-records/${id}/share`, { method: "POST", body: JSON.stringify({ doctorId }) }),
};

// ─── AI ───────────────────────────────────────────────────────────────────────
export const ai = {
  chat: (body: { message: string; sessionId?: string; language?: "en" | "ha"; inputType?: string }) =>
    request<AIChatResponse>("/ai/chat", { method: "POST", body: JSON.stringify(body) }),

  symptomCheck: (body: { symptoms: string[]; age?: number; gender?: string; language?: "en" | "ha" }) =>
    request<{ success: boolean; data: SymptomCheckResponse }>("/ai/symptom-check", { method: "POST", body: JSON.stringify(body) }),

  getSessions: () => request<PaginatedResponse<AISession>>("/ai/sessions"),

  getSession: (sessionId: string) => request<{ success: boolean; data: AISession }>(`/ai/sessions/${sessionId}`),

  deleteSession: (sessionId: string) => request(`/ai/sessions/${sessionId}`, { method: "DELETE" }),
};

// ─── MEDICATIONS ──────────────────────────────────────────────────────────────
export const medications = {
  list: (params?: string) =>
    request<PaginatedResponse<Medication>>(`/medications${params ? `?${params}` : ""}`),

  today: () => request<{ success: boolean; data: TodayMedication[] }>("/medications/today"),

  getById: (id: string) => request<{ success: boolean; data: Medication }>(`/medications/${id}`),

  adherence: (id: string) => request<{ success: boolean; data: AdherenceStats }>(`/medications/${id}/adherence`),

  create: (body: {
    name: string; dosage: string; form?: string; frequency: string;
    times: string[]; startDate: string; endDate?: string;
    prescribedBy?: string; instructions?: string;
    sideEffects?: string[]; pillsRemaining?: number;
  }) => request<{ success: boolean; data: Medication }>("/medications", { method: "POST", body: JSON.stringify(body) }),

  update: (id: string, body: Partial<Medication>) =>
    request<{ success: boolean; data: Medication }>(`/medications/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  delete: (id: string) => request(`/medications/${id}`, { method: "DELETE" }),

  logDose: (id: string, body: { scheduledAt: string; status: "taken" | "missed" | "skipped" }) =>
    request(`/medications/${id}/log`, { method: "POST", body: JSON.stringify(body) }),
};

// ─── PREGNANCY ────────────────────────────────────────────────────────────────
export const pregnancy = {
  milestones: () => request<{ success: boolean; data: Milestone[] }>("/pregnancy/milestones"),

  my: () => request<{ success: boolean; data: Pregnancy }>("/pregnancy/my"),

  history: () => request<{ success: boolean; data: Pregnancy[] }>("/pregnancy/history"),

  start: (body: {
    lastMenstrualPeriod: string; doctorId?: string;
    hospitalId?: string; isHighRisk?: boolean; riskFactors?: string[];
  }) => request<{ success: boolean; data: Pregnancy }>("/pregnancy", { method: "POST", body: JSON.stringify(body) }),

  update: (id: string, body: Partial<Pregnancy>) =>
    request<{ success: boolean; data: Pregnancy }>(`/pregnancy/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  logAntenatalVisit: (id: string, body: AntenatalVisit) =>
    request(`/pregnancy/${id}/antenatal-visit`, { method: "POST", body: JSON.stringify(body) }),

  logSymptom: (id: string, body: { symptom: string; severity: string }) =>
    request(`/pregnancy/${id}/symptom`, { method: "POST", body: JSON.stringify(body) }),

  logVaccination: (id: string, body: { vaccine: string; date: string }) =>
    request(`/pregnancy/${id}/vaccination`, { method: "POST", body: JSON.stringify(body) }),
};

// ─── CAMPAIGNS ────────────────────────────────────────────────────────────────
export const campaigns = {
  list: (params?: string) =>
    request<PaginatedResponse<Campaign>>(`/campaigns${params ? `?${params}` : ""}`),

  getById: (id: string) => request<{ success: boolean; data: Campaign }>(`/campaigns/${id}`),

  create: (form: FormData) => upload<{ success: boolean; data: Campaign }>("/campaigns", form),

  publish: (id: string) => request(`/campaigns/${id}/publish`, { method: "PUT" }),

  delete: (id: string) => request(`/campaigns/${id}`, { method: "DELETE" }),
};

// ─── EMERGENCY ────────────────────────────────────────────────────────────────
export const emergency = {
  contacts: () => request<{ success: boolean; data: EmergencyContact[] }>("/emergency/contacts"),

  nearbyHospitals: (lat?: number, lng?: number) =>
    request<{ success: boolean; data: Hospital[] }>(
      `/emergency/nearby-hospitals${lat !== undefined ? `?lat=${lat}&lng=${lng}` : ""}`
    ),

  firstAid: (condition: string) =>
    request<{ success: boolean; data: FirstAidGuide }>(`/emergency/first-aid/${condition}`),

  sendAlert: (body: { location?: { lat: number; lng: number }; message?: string }) =>
    request("/emergency/alert", { method: "POST", body: JSON.stringify(body) }),
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const notifications = {
  list: (params?: string) =>
    request<NotificationsResponse>(`/notifications${params ? `?${params}` : ""}`),

  readAll: () => request("/notifications/read-all", { method: "PUT" }),

  clearAll: () => request("/notifications/clear-all", { method: "DELETE" }),

  read: (id: string) => request(`/notifications/${id}/read`, { method: "PUT" }),

  delete: (id: string) => request(`/notifications/${id}`, { method: "DELETE" }),
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────
export const admin = {
  stats: () => request<{ success: boolean; data: AdminStats }>("/admin/stats"),

  pendingDoctors: () => request<PaginatedResponse<Doctor>>("/admin/doctors/pending"),

  verifyDoctor: (id: string, body: { isVerified: boolean; reason?: string }) =>
    request(`/admin/doctors/${id}/verify`, { method: "PUT", body: JSON.stringify(body) }),

  flaggedPosts: () => request<PaginatedResponse<Post>>("/admin/posts/flagged"),

  approvePost: (id: string) => request(`/admin/posts/${id}/approve`, { method: "PUT" }),

  deletePost: (id: string) => request(`/admin/posts/${id}`, { method: "DELETE" }),

  toggleUser: (id: string) => request(`/admin/users/${id}/toggle-active`, { method: "PUT" }),

  changeRole: (id: string, role: string) =>
    request(`/admin/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }),

  activityLogs: (params?: string) =>
    request<{ success: boolean; data: ActivityLog[] }>(`/admin/activity-logs${params ? `?${params}` : ""}`),
};

// ─── TYPES ────────────────────────────────────────────────────────────────────
export interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  user: User;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination?: { total: number; page: number; limit: number; pages: number };
}

export interface NotificationsResponse {
  success: boolean;
  unreadCount: number;
  notifications: Notification[];
  pagination?: { total: number; page: number; limit: number; pages: number };
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  preferredLanguage?: string;
  dateOfBirth?: string;
  gender?: string;
  location?: { state?: string; lga?: string; address?: string };
  healthConditions?: string[];
  emergencyContact?: { name: string; phone: string; relationship: string };
  isAnonymousMode?: boolean;
  anonymousName?: string;
  createdAt: string;
}

export interface UpdateProfileBody {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  preferredLanguage: string;
  location: { state?: string; lga?: string; address?: string };
  healthConditions: string[];
  emergencyContact: { name: string; phone: string; relationship: string };
  isAnonymousMode: boolean;
  anonymousName: string;
}

export interface Doctor {
  _id: string;
  user: User;
  specialization: string;
  subSpecialization?: string;
  licenseNumber?: string;
  yearsOfExperience: number;
  qualifications?: { degree: string; institution: string; year: number }[];
  bio?: string;
  languages: string[];
  consultationFee: number;
  isVerified: boolean;
  isAvailableForTelemedicine: boolean;
  availability?: { day: string; startTime: string; endTime: string }[];
  rating?: number;
  reviewCount?: number;
  hospital?: string;
  location?: string;
}

export interface Community {
  _id: string;
  name: string;
  category: string;
  description: string;
  language?: string;
  isPrivate?: boolean;
  rules?: string[];
  tags?: string[];
  memberCount: number;
  postCount: number;
  isJoined?: boolean;
  coverImage?: string;
}

export interface Post {
  _id: string;
  author: User;
  community: Community | string;
  title?: string;
  content: string;
  type?: string;
  language?: string;
  media?: string[];
  likes: string[];
  savedBy?: string[];
  isPinned?: boolean;
  isFlagged?: boolean;
  tags?: string[];
  isAnonymous?: boolean;
  createdAt: string;
}

export interface Comment {
  _id: string;
  post: string;
  author: User;
  content: string;
  likes: string[];
  parentComment?: string;
  isAnonymous?: boolean;
  createdAt: string;
}

export interface Hospital {
  _id: string;
  name: string;
  type: string;
  address: string;
  lga?: string;
  state?: string;
  location?: { type: string; coordinates: [number, number] };
  phone?: string[];
  email?: string;
  services?: string[];
  specialties?: string[];
  emergencyAvailable?: boolean;
  emergencyPhone?: string;
  acceptsTelemedicine?: boolean;
  rating?: number;
  isActive: boolean;
  distance?: number;
}

export interface Appointment {
  _id: string;
  patient: User;
  doctor: Doctor;
  hospitalId?: string;
  type: string;
  scheduledAt: string;
  reason: string;
  symptoms?: string[];
  status: string;
  doctorNotes?: string;
  prescription?: string;
  createdAt: string;
}

export interface HealthRecord {
  _id: string;
  user: string;
  type: string;
  title: string;
  description?: string;
  date: string;
  doctorId?: string;
  hospitalId?: string;
  fileUrl?: string;
  files?: string[];
  tags?: string[];
  vitals?: Record<string, unknown>;
  status?: string;
  createdAt: string;
}

export interface AIChatResponse {
  success: boolean;
  sessionId: string;
  reply: string;
  urgencyLevel?: "low" | "moderate" | "high" | "emergency";
  recommendedHospital?: string | null;
}

export interface SymptomCheckResponse {
  analysis: string;
  possibleConditions: string[];
  urgency: "low" | "medium" | "high";
  recommendations: string[];
  sessionId: string;
}

export interface AISession {
  _id: string;
  title: string;
  messages: { role: string; content: string; createdAt: string }[];
  language: string;
  createdAt: string;
}

export interface Medication {
  _id: string;
  user: string;
  name: string;
  dosage: string;
  form?: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate?: string;
  prescribedBy?: string;
  instructions?: string;
  sideEffects?: string[];
  pillsRemaining?: number;
  isActive: boolean;
}

export interface TodayMedication extends Medication {
  doses: { time: string; taken: boolean; scheduledAt: string; logId?: string }[];
}

export interface AdherenceStats {
  rate: number;
  taken: number;
  missed: number;
  streak: number;
}

export interface Pregnancy {
  _id: string;
  user: string;
  lastMenstrualPeriod: string;
  dueDate: string;
  currentWeek: number;
  trimester: number;
  isActive: boolean;
  isHighRisk?: boolean;
  riskFactors?: string[];
  antenatalVisits: AntenatalVisit[];
  symptoms: PregnancySymptom[];
  vaccinations: { vaccine: string; date: string }[];
}

export interface AntenatalVisit {
  date: string;
  week?: number;
  weight?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  fetalHeartRate?: number;
  fundalHeight?: number;
  notes?: string;
  doctorId?: string;
}

export interface PregnancySymptom {
  symptom: string;
  severity: string;
  date: string;
  notes?: string;
}

export interface Milestone {
  week: number;
  title: string;
  description?: string;
  babySize?: string;
}

export interface Campaign {
  _id: string;
  title: string;
  description?: string;
  type?: string;
  content: string;
  language?: string;
  targetAudience?: string;
  startDate?: string;
  endDate?: string;
  sponsor?: string;
  author: User;
  isPublished: boolean;
  createdAt: string;
}

export interface EmergencyContact {
  name: string;
  number: string;
  description: string;
}

export interface FirstAidGuide {
  condition: string;
  steps: string[];
  warning: string;
}

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalDoctors: number;
  totalPosts: number;
  totalAppointments: number;
  pendingDoctors: number;
  flaggedPosts: number;
}

export interface ActivityLog {
  action: string;
  user: string;
  createdAt: string;
}

export interface Slot {
  date: string;
  time: string;
  isAvailable: boolean;
}
