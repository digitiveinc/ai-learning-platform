"use client";

import { CsvImportDialog } from "@/components/csv-import-dialog";

export function CompanyCsvImport() {
  return (
    <CsvImportDialog
      title="企業CSV一括登録"
      description="CSVファイルから企業を一括登録します。1行につき1企業です。"
      templateHeaders="企業コード,企業名"
      templateExample="DGT001,digitive株式会社"
      apiEndpoint="/api/admin/companies/bulk"
      parseRow={(cols) => ({
        companyCode: cols[0]?.trim() || "",
        companyName: cols[1]?.trim() || "",
      })}
    />
  );
}
