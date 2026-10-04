import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Kbd } from "@/components/ui/Kbd";
import { TextField } from "@/components/ui/TextField";
import { useSubmitShortcut } from "@/hooks/useSubmitShortcut";
import { todayIso } from "@/lib/dates";
import { formatMoney, parseMoneyToCents } from "@/lib/format";
import { MOD_LABEL } from "@/lib/shortcuts";
import { partialSchema, type PartialValues } from "../schemas";
import type { NewAgreement } from "../useCases";

interface PartialFormProps {
  balance: number | undefined;
  onSave: (agreement: NewAgreement) => void;
}

export function PartialForm({ balance, onSave }: PartialFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const schema = useMemo(() => partialSchema(balance), [balance]);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PartialValues>({
    resolver: zodResolver(schema),
    defaultValues: { fecha: todayIso(), monto: "" },
  });

  useSubmitShortcut(formRef);

  const paymentCents = parseMoneyToCents(useWatch({ control, name: "monto" }));
  const remaining =
    balance !== undefined && paymentCents !== null && paymentCents > 0 && paymentCents < balance
      ? balance - paymentCents
      : null;

  const submit = handleSubmit((values) => {
    const cents = parseMoneyToCents(values.monto);
    if (cents === null) return;
    onSave({ tipo: "parcial", fecha: values.fecha, monto: cents });
    reset();
  });

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Fecha del pago"
          type="date"
          min={todayIso()}
          data-first-field
          className="font-mono tabular-nums"
          error={errors.fecha?.message}
          {...register("fecha")}
        />
        <TextField
          label="Monto del pago"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0,00"
          className="font-mono tabular-nums text-right"
          error={errors.monto?.message}
          {...register("monto")}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-fg-muted" aria-live="polite">
          {remaining !== null ? (
            <>
              Saldo pendiente <span className="font-mono tabular-nums text-fg-secondary">{formatMoney(remaining)}</span>
            </>
          ) : null}
        </p>
        <Button type="submit" variant="primary">
          Registrar pago parcial
          <Kbd tone="onAccent">{MOD_LABEL}+Enter</Kbd>
        </Button>
      </div>
    </form>
  );
}
