const INTERNAL_DOMAIN = "internal.digitive.jp";

export function employeeIdToEmail(employeeId: string, companyCode?: string): string {
  if (companyCode) {
    return `${companyCode.toLowerCase()}_${employeeId.toLowerCase()}@${INTERNAL_DOMAIN}`;
  }
  return `${employeeId.toLowerCase()}@${INTERNAL_DOMAIN}`;
}

export function emailToEmployeeId(email: string): string {
  const local = email.split("@")[0].toUpperCase();
  // 会社コード_社員ID形式の場合は社員IDのみ返す
  if (local.includes("_")) {
    return local.split("_").slice(1).join("_");
  }
  return local;
}

export function emailToCompanyCode(email: string): string | null {
  const local = email.split("@")[0].toUpperCase();
  if (local.includes("_")) {
    return local.split("_")[0];
  }
  return null;
}

export function isInternalEmail(email: string): boolean {
  return email.endsWith(`@${INTERNAL_DOMAIN}`);
}
