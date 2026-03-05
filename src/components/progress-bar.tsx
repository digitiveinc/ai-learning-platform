type ProgressBarProps = {
  watched: number;
  total: number;
  color?: string;
  variant?: "default" | "hero";
};

export function ProgressBar({ watched, total, color = "bg-emerald-500", variant = "default" }: ProgressBarProps) {
  const percent = total === 0 ? 0 : Math.round((watched / total) * 100);

  if (variant === "hero") {
    return (
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-300">{watched} / {total} 完了</span>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-slate-500">
        <span>{watched} / {total} 完了</span>
        <span className="font-medium">{percent}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
