"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ImportResult = {
  row: number;
  success: boolean;
  error?: string;
  [key: string]: unknown;
};

type Props = {
  title: string;
  description: string;
  templateHeaders: string;
  templateExample: string;
  apiEndpoint: string;
  parseRow: (columns: string[]) => Record<string, string>;
  extraBody?: Record<string, unknown>;
};

export function CsvImportDialog({
  title,
  description,
  templateHeaders,
  templateExample,
  apiEndpoint,
  parseRow,
  extraBody,
}: Props) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResults(null);
    setError("");

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim());

      // ヘッダー行をスキップするかどうか判定
      const firstLine = lines[0];
      const isHeader =
        firstLine.includes("社員") ||
        firstLine.includes("パスワード") ||
        firstLine.includes("企業") ||
        firstLine.includes("employee") ||
        firstLine.includes("company");

      const dataLines = isHeader ? lines.slice(1) : lines;
      const rows = dataLines.map((line) => parseRow(line.split(",")));
      setPreview(rows.slice(0, 5));
    };
    reader.readAsText(f, "UTF-8");
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError("");

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim());

      const firstLine = lines[0];
      const isHeader =
        firstLine.includes("社員") ||
        firstLine.includes("パスワード") ||
        firstLine.includes("企業") ||
        firstLine.includes("employee") ||
        firstLine.includes("company");

      const dataLines = isHeader ? lines.slice(1) : lines;
      const rows = dataLines.map((line) => parseRow(line.split(",")));

      try {
        const res = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows, ...extraBody }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "インポートに失敗しました");
          setLoading(false);
          return;
        }

        setResults(data.results);
        setLoading(false);
        router.refresh();
      } catch {
        setError("通信エラーが発生しました");
        setLoading(false);
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const downloadTemplate = () => {
    const bom = "\uFEFF";
    const content = bom + templateHeaders + "\n" + templateExample + "\n";
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const successCount = results?.filter((r) => r.success).length ?? 0;
  const failCount = results?.filter((r) => !r.success).length ?? 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setFile(null);
          setPreview([]);
          setResults(null);
          setError("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">CSV一括登録</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-600">{description}</p>

        <div className="flex gap-2">
          <Button variant="link" size="sm" className="p-0 h-auto" onClick={downloadTemplate}>
            テンプレートCSVをダウンロード
          </Button>
        </div>

        <div className="space-y-4">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
          />

          {/* プレビュー */}
          {preview.length > 0 && !results && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                プレビュー（先頭{preview.length}件）
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      {Object.keys(preview[0]).map((key) => (
                        <th key={key} className="px-3 py-1.5 text-left text-xs font-medium text-slate-500">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-b last:border-0">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-3 py-1.5 text-xs">
                            {val || <span className="text-gray-300">-</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 結果 */}
          {results && (
            <div className="space-y-3">
              <div className="flex gap-4 text-sm">
                <span className="text-green-700 font-medium">成功: {successCount}件</span>
                {failCount > 0 && (
                  <span className="text-red-700 font-medium">失敗: {failCount}件</span>
                )}
              </div>
              {failCount > 0 && (
                <div className="border border-red-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                  {results
                    .filter((r) => !r.success)
                    .map((r, i) => (
                      <div key={i} className="px-3 py-2 text-xs border-b last:border-0 bg-red-50">
                        <span className="font-medium">行{r.row}:</span> {r.error}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {file && !results && (
            <Button onClick={handleImport} disabled={loading} className="w-full">
              {loading ? "登録中..." : "一括登録を実行"}
            </Button>
          )}

          {results && (
            <Button variant="outline" onClick={() => setOpen(false)} className="w-full">
              閉じる
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
