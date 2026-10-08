import type { UserRole } from "./roles";

export type AccessState =
  | { status: "loading" }
  | { status: "signed_out" }
  | { status: "licensed"; email: string; operatorName: string; role: UserRole; adminId: string | null }
  | { status: "unlicensed"; email: string }
  | { status: "license_error"; email: string };
