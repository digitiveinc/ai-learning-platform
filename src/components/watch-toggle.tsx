"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type WatchToggleProps = {
  videoId: string;
  initialWatched: boolean;
};

export function WatchToggle({ videoId, initialWatched }: WatchToggleProps) {
  const [watched, setWatched] = useState(initialWatched);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    const newWatched = !watched;

    const res = await fetch("/api/watch-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, watched: newWatched }),
    });

    if (res.ok) {
      setWatched(newWatched);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <Button
      variant={watched ? "default" : "outline"}
      onClick={handleToggle}
      disabled={loading}
      className={watched ? "bg-emerald-600 hover:bg-emerald-700" : ""}
    >
      {loading ? "..." : watched ? "視聴済み" : "視聴完了にする"}
    </Button>
  );
}
