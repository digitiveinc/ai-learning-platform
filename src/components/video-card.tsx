import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { extractYouTubeId } from "@/lib/youtube";

type VideoCardProps = {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  level: string;
  watched?: boolean;
  progress?: number;
};

export function VideoCard({ id, title, description, youtubeUrl, level, watched, progress = 0 }: VideoCardProps) {
  const videoId = extractYouTubeId(youtubeUrl);

  return (
    <Link href={`/videos/${level}/${id}`}>
      <Card className="group transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 bg-white border-slate-200 overflow-hidden h-full">
        <div className="relative aspect-video w-full overflow-hidden">
          {videoId ? (
            <Image
              src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
              <span className="text-slate-400">No Thumbnail</span>
            </div>
          )}

          {/* Hover overlay with play icon */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
              <svg className="w-6 h-6 text-slate-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* Watched badge */}
          {watched && (
            <div className="absolute top-2.5 right-2.5 bg-emerald-500 text-white rounded-lg px-2 py-1 flex items-center gap-1 shadow-md text-xs font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>視聴済み</span>
            </div>
          )}

          {/* Progress bar */}
          {progress > 0 && !watched && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
              <div
                className="h-full bg-indigo-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-slate-800 line-clamp-2 group-hover:text-indigo-700 transition-colors duration-200">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-slate-500 mt-1.5 line-clamp-2">{description}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
