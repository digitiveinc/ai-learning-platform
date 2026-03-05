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
      <Card className="group transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-1 bg-white border-slate-200 overflow-hidden h-full">
        <div className="relative aspect-video w-full overflow-hidden">
          {videoId ? (
            <Image
              src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
              <span className="text-slate-400">No Thumbnail</span>
            </div>
          )}
          {watched && (
            <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {/* 進捗バー */}
          {progress > 0 && !watched && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
              <div
                className="h-full bg-emerald-400"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-slate-800 line-clamp-2 group-hover:text-slate-900">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{description}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
