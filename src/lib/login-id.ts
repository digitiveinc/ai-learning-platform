/** 企業ID + ユーザーIDをFirebase Auth用の内部メールアドレスに変換する */
export function buildLoginEmail(companyId: string, employeeId: string): string {
  return `${employeeId.toLowerCase()}@${companyId.toLowerCase()}.internal`;
}
