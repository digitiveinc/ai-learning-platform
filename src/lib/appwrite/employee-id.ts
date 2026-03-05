const INTERNAL_DOMAIN = "internal.digitive.jp";

export function employeeIdToEmail(employeeId: string): string {
  return `${employeeId.toLowerCase()}@${INTERNAL_DOMAIN}`;
}

export function emailToEmployeeId(email: string): string {
  return email.split("@")[0].toUpperCase();
}

export function isInternalEmail(email: string): boolean {
  return email.endsWith(`@${INTERNAL_DOMAIN}`);
}
