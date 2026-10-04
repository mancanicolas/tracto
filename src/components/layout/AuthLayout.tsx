import type { ReactNode } from "react";
import Logo from "@/assets/logo.svg?react";
import { WindowBar } from "@/components/layout/WindowBar";

interface AuthLayoutProps {
  children?: ReactNode;
  busy?: boolean;
}

export function AuthLayout({ children, busy = false }: AuthLayoutProps) {
  return (
    <div className="flex h-full flex-col bg-brand-navy" aria-busy={busy || undefined}>
      <WindowBar />
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-11">
        <Logo className="w-48 text-brand-white" role="img" aria-label="Tracto" />
        {children}
      </main>
    </div>
  );
}
