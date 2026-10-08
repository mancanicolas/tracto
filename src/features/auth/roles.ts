export type UserRole = "admin" | "operador";

export const DEFAULT_ROLE: UserRole = "operador";

export function parseRole(value: unknown): UserRole {
  return value === "admin" ? "admin" : DEFAULT_ROLE;
}
