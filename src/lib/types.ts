export type Profile = {
  id: string;
  email: string;
  role: "admin" | "user";
  created_at: string;
};

export type Video = {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  level: "beginner" | "intermediate" | "advanced";
  sort_order: number;
  created_at: string;
  created_by: string;
};

export type UserSettings = {
  user_id: string;
  employee_id: string;
  access_mode: "exact" | "cumulative";
  display_name?: string;
};

export type WatchProgress = {
  user_id: string;
  video_id: string;
  watched: boolean;
  watched_at?: string;
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
