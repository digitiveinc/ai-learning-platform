"use client";

import { useEffect, useRef, useCallback } from "react";

type YouTubePlayerProps = {
  videoId: string;
  videoDbId: string;
  initialProgress?: number;
};

export function YouTubePlayer({ videoId, videoDbId, initialProgress = 0 }: YouTubePlayerProps) {
  const playerRef = useRef<YT.Player | null>(null);
  const maxProgressRef = useRef(initialProgress);
  const lastSentRef = useRef(initialProgress);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendProgress = useCallback(
    async (progress: number, force = false) => {
      // 5%以上増加時 or 強制送信の場合のみ
      if (!force && progress - lastSentRef.current < 5) return;
      lastSentRef.current = progress;

      await fetch("/api/watch-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: videoDbId, progress }),
      });
    },
    [videoDbId]
  );

  useEffect(() => {
    // YouTube iframe API を読み込み
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    const initPlayer = () => {
      playerRef.current = new window.YT.Player("yt-player", {
        videoId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            // 進捗トラッキング開始
            intervalRef.current = setInterval(() => {
              if (!playerRef.current) return;
              const current = playerRef.current.getCurrentTime();
              const duration = playerRef.current.getDuration();
              if (duration <= 0) return;

              const pct = Math.round((current / duration) * 100);
              if (pct > maxProgressRef.current) {
                maxProgressRef.current = pct;
                sendProgress(pct);
              }
            }, 10000);
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            // 動画終了時に最終進捗送信
            if (event.data === 0) {
              maxProgressRef.current = 100;
              sendProgress(100, true);
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current) playerRef.current.destroy();
    };
  }, [videoId, sendProgress]);

  const progressPct = maxProgressRef.current;

  return (
    <div>
      <div className="aspect-video w-full bg-black">
        <div id="yt-player" className="w-full h-full" />
      </div>
      {/* 進捗バー */}
      <div className="h-1 bg-slate-200">
        <div
          className="h-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
