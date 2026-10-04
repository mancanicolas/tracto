import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, TriangleAlert } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Kbd } from "@/components/ui/Kbd";
import { TextField } from "@/components/ui/TextField";
import type { Result } from "@/lib/result";
import { useShortcut } from "@/lib/shortcuts";
import { loginSchema, type LoginValues } from "../schemas";

interface LoginScreenProps {
  onSignIn: (email: string, password: string) => Promise<Result>;
}

export function LoginScreen({ onSignIn }: LoginScreenProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useShortcut("mod+Enter", () => formRef.current?.requestSubmit(), { allowInInput: true });

  const submit = handleSubmit(async ({ email, password }) => {
    setFormError(null);
    const result = await onSignIn(email, password);
    if (!result.ok) {
      setFormError(result.error);
      setFocus("password");
    }
  });

  return (
    <AuthLayout>
      <form ref={formRef} onSubmit={submit} noValidate className="flex w-full max-w-80 flex-col gap-4">
        <h1 className="text-xl leading-7 font-semibold text-fg">Ingresá a Tracto</h1>
        <TextField
          label="Email"
          type="email"
          autoComplete="username"
          autoFocus
          placeholder="nombre@empresa.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <TextField
          label="Contraseña"
          type={isPasswordVisible ? "text" : "password"}
          autoComplete="current-password"
          error={errors.password?.message}
          trailing={
            <IconButton
              label={isPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={isPasswordVisible}
              onClick={() => setIsPasswordVisible((visible) => !visible)}
            >
              {isPasswordVisible ? <EyeOff strokeWidth={1.75} /> : <Eye strokeWidth={1.75} />}
            </IconButton>
          }
          {...register("password")}
        />
        <div aria-live="polite">
          {formError ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-sm border border-danger-border bg-danger-subtle px-2.5 py-2 text-[13px] text-danger"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden />
              {formError}
            </p>
          ) : null}
        </div>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {isSubmitting ? "Ingresando" : "Ingresar"}
          {isSubmitting ? null : <Kbd tone="onAccent">Enter</Kbd>}
        </Button>
      </form>
    </AuthLayout>
  );
}
