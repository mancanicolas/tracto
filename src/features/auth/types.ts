export type AccessState =
  | { status: "loading" }
  | { status: "signed_out" }
  | { status: "licensed"; email: string }
  | { status: "unlicensed"; email: string }
  | { status: "license_error"; email: string };
