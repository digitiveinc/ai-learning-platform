"use client";

import { CsvImportDialog } from "@/components/csv-import-dialog";

type Props = {
  companyId?: string;
};

export function UserCsvImport({ companyId }: Props) {
  return (
    <CsvImportDialog
      title="ユーザーCSV一括登録"
      description="CSVファイルからユーザーを一括登録します。1行につき1ユーザーです。"
      templateHeaders="社員ID,パスワード,表示名,レベル,アクセスモード"
      templateExample="EMP001,password123,山田太郎,beginner,cumulative"
      apiEndpoint="/api/admin/users/bulk"
      extraBody={companyId ? { companyId } : undefined}
      parseRow={(cols) => ({
        employeeId: cols[0]?.trim() || "",
        password: cols[1]?.trim() || "",
        displayName: cols[2]?.trim() || "",
        level: cols[3]?.trim() || "",
        accessMode: cols[4]?.trim() || "cumulative",
      })}
    />
  );
}
