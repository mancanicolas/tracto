import { LockKeyhole, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Kbd } from "@/components/ui/Kbd";

type BlockReason = "unlicensed" | "check_failed";

interface LicenseBlockedScreenProps {
  email: string;
  reason: BlockReason;
  onRecheck: () => Promise<void>;
  onSignOut: () => Promise<void>;
}

const COPY: Record<BlockReason, { title: string; body: (email: string) => string }> = {
  unlicensed: {
    title: "Licencia inactiva",
    body: (email) =>
      `La cuenta ${email} no tiene una licencia activa. Pedile a tu administrador que la active y después verificá de nuevo.`,
  },
  check_failed: {
    title: "No se pudo verificar la licencia",
    body: () => "Revisá la conexión y probá de nuevo.",
  },
};

export function LicenseBlockedScreen({ email, reason, onRecheck, onSignOut }: LicenseBlockedScreenProps) {
  const [isRechecking, setIsRechecking] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { title, body } = COPY[reason];
  const Icon = reason === "unlicensed" ? LockKeyhole : TriangleAlert;

  const recheck = async () => {
    setIsRechecking(true);
    await onRecheck();
    setIsRechecking(false);
  };

  const signOut = async () => {
    setIsSigningOut(true);
    await onSignOut();
  };

  return (
    <AuthLayout>
      <section className="flex w-full max-w-80 flex-col gap-4" aria-labelledby="license-title">
        <div className="flex items-center gap-2 text-fg">
          <Icon className="size-4 shrink-0 text-fg-muted" strokeWidth={1.75} aria-hidden />
          <h1 id="license-title" className="text-xl leading-7 font-semibold">
            {title}
          </h1>
        </div>
        <p role="status" className="text-[13px] leading-5 text-fg-secondary">
          {body(email)}
        </p>
        <div className="flex flex-col gap-2">
          <Button variant="primary" autoFocus loading={isRechecking} disabled={isSigningOut} onClick={recheck}>
            {isRechecking ? "Verificando" : "Verificar licencia"}
            {isRechecking ? null : <Kbd tone="onAccent">Enter</Kbd>}
          </Button>
          <Button loading={isSigningOut} disabled={isRechecking} onClick={signOut}>
            Cerrar sesión
          </Button>
        </div>
      </section>
    </AuthLayout>
  );
}
