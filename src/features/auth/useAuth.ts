import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { fail, ok, type Result } from "@/lib/result";
import { supabase } from "@/lib/supabase";
import { describeSignInError } from "./errors";
import type { AccessState } from "./types";

async function resolveAccess(session: Session | null): Promise<AccessState> {
  if (!session) return { status: "signed_out" };
  const email = session.user.email ?? "";
  const { data, error } = await supabase
    .from("profiles")
    .select("is_licensed")
    .eq("id", session.user.id)
    .maybeSingle();
  if (error) return { status: "license_error", email };
  return data?.is_licensed === true ? { status: "licensed", email } : { status: "unlicensed", email };
}

export function useAuth() {
  const [access, setAccess] = useState<AccessState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(async ({ data }) => {
      const next = await resolveAccess(data.session);
      if (active) setAccess(next);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" && active) setAccess({ status: "signed_out" });
    });
    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<Result> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return fail(describeSignInError(error));
    setAccess(await resolveAccess(data.session));
    return ok();
  }, []);

  const recheckLicense = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setAccess(await resolveAccess(data.session));
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setAccess({ status: "signed_out" });
  }, []);

  return { access, signIn, recheckLicense, signOut };
}
