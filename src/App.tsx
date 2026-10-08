import { AuthLayout } from "@/components/layout/AuthLayout";
import { LicenseBlockedScreen } from "@/features/auth/components/LicenseBlockedScreen";
import { RoleProvider } from "@/features/auth/RoleContext";
import { LoginScreen } from "@/features/auth/components/LoginScreen";
import { useAuth } from "@/features/auth/useAuth";
import { OverlayShell } from "@/features/overlay/components/OverlayShell";

export function App() {
  const { access, signIn, recheckLicense, signOut } = useAuth();

  switch (access.status) {
    case "loading":
      return <AuthLayout busy />;
    case "signed_out":
      return <LoginScreen onSignIn={signIn} />;
    case "unlicensed":
    case "license_error":
      return (
        <LicenseBlockedScreen
          email={access.email}
          reason={access.status === "unlicensed" ? "unlicensed" : "check_failed"}
          onRecheck={recheckLicense}
          onSignOut={signOut}
        />
      );
    case "licensed":
      return (
        <RoleProvider role={access.role} adminId={access.adminId}>
          <OverlayShell email={access.email} operatorName={access.operatorName} onSignOut={signOut} />
        </RoleProvider>
      );
  }
}
