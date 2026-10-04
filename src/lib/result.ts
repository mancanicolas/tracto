export type Result<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export const ok = <T = void>(data?: T): Result<T> => ({ ok: true, data: data as T });

export const fail = (error: string, fieldErrors?: Record<string, string>): Result<never> => ({
  ok: false,
  error,
  fieldErrors,
});
