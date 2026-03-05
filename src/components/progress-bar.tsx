type ProgressBarProps = {
  watched: number;
  total: number;
  color?: string;
};

export function ProgressBar({ watched, total, color = "bg-emerald-500" }: ProgressBarProps) {
  const percent = total === 0 ? 0 : Math.round((watched / total) * 100);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-500">
        <span>{watched} / {total} 完了</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
