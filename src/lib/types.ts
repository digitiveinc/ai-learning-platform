export type UserRole = "superadmin" | "admin" | "user";

export type Profile = {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  level: "beginner" | "intermediate" | "advanced";
  accessMode: "exact" | "cumulative";
  createdAt: string;
  companyId?: string;
  employeeId?: string;
};

export type Video = {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  level: "beginner" | "intermediate" | "advanced";
  sortOrder: number;
  createdAt: string;
  createdBy: string;
};

export type WatchProgress = {
  videoId: string;
  watched: boolean;
  watchedAt?: string;
  progress: number;
};

export type UserProgressDoc = {
  watched: Record<string, { watched: boolean; watchedAt?: string; progress: number }>;
};

export type Quote = {
  id: string;
  text: string;
  author?: string;
  publishDate: string;
  createdAt: string;
  createdBy: string;
};

export type Archive = {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  thumbnailUrl?: string;
  createdAt: string;
  createdBy: string;
};

export type Inquiry = {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
  replyMessage?: string;
  repliedAt?: string;
  repliedBy?: string;
};

export const LEVEL_LABELS: Record<Video["level"], string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "上級",
};

export const LEVEL_COLORS: Record<Video["level"], string> = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-blue-100 text-blue-800",
  advanced: "bg-purple-100 text-purple-800",
};

export const LEVELS_ORDERED: Video["level"][] = ["beginner", "intermediate", "advanced"];

export function getAccessibleLevels(
  userLevel: Video["level"],
  accessMode: "exact" | "cumulative"
): Video["level"][] {
  if (accessMode === "exact") return [userLevel];
  const idx = LEVELS_ORDERED.indexOf(userLevel);
  return LEVELS_ORDERED.slice(0, idx + 1);
}
