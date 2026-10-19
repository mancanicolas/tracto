import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_ROLE, hasAdminAccess, type UserRole } from "./roles";

interface RoleValue {
  role: UserRole;
  adminId: string | null;
}

const RoleContext = createContext<RoleValue>({ role: DEFAULT_ROLE, adminId: null });

interface RoleProviderProps extends RoleValue {
  children: ReactNode;
}

export function RoleProvider({ role, adminId, children }: RoleProviderProps) {
  return <RoleContext value={{ role, adminId }}>{children}</RoleContext>;
}

export function useRole(): RoleValue & { isAdmin: boolean } {
  const value = useContext(RoleContext);
  return { ...value, isAdmin: hasAdminAccess(value.role) };
}

interface RoleGateProps {
  allow: UserRole;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGate({ allow, children, fallback = null }: RoleGateProps) {
  const { role } = useRole();
  const isAllowed = allow === "admin" ? hasAdminAccess(role) : role === allow;
  return isAllowed ? children : fallback;
}
