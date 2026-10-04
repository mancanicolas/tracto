import { isAuthApiError, isAuthRetryableFetchError } from "@supabase/supabase-js";

export const CONNECTION_ERROR = "No se pudo conectar. Revisá la conexión y probá de nuevo.";

export function describeSignInError(error: unknown): string {
  if (isAuthRetryableFetchError(error)) return CONNECTION_ERROR;
  if (isAuthApiError(error)) {
    if (error.code === "invalid_credentials") return "Email o contraseña incorrectos.";
    if (error.code === "email_not_confirmed") return "Confirmá tu email antes de ingresar.";
    if (error.status === 429) return "Demasiados intentos. Esperá un momento y probá de nuevo.";
  }
  return "No se pudo iniciar sesión. Probá de nuevo.";
}
