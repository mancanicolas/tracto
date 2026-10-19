export type UserRole = "admin" | "super_admin" | "operador";

export const DEFAULT_ROLE: UserRole = "operador";

export function parseRole(value: unknown): UserRole {
  if (value === "admin" || value === "super_admin") return value;
  return DEFAULT_ROLE;
}

export function hasAdminAccess(role: UserRole): boolean {
  return role === "admin" || role === "super_admin";
}
