"use client";

type CacheEntry<T> = { data: T; expires: number };

export function cacheGet<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() > entry.expires) {
      sessionStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, data: T, ttlMinutes: number): void {
  if (typeof window === "undefined") return;
  try {
    const entry: CacheEntry<T> = { data, expires: Date.now() + ttlMinutes * 60 * 1000 };
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // sessionStorage が使えない場合はスキップ
  }
}

export function cacheInvalidate(prefix: string): void {
  if (typeof window === "undefined") return;
  const keys: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(prefix)) keys.push(key);
  }
  keys.forEach((k) => sessionStorage.removeItem(k));
}
