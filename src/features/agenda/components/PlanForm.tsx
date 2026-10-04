import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { Kbd } from "@/components/ui/Kbd";
import { TextField } from "@/components/ui/TextField";
import { useSubmitShortcut } from "@/hooks/useSubmitShortcut";
import type { NewAgreement } from "@/lib/agreements";
import { addDaysIso, todayIso } from "@/lib/dates";
import { formatMoney, parseMoneyToCents } from "@/lib/format";
import { MOD_LABEL } from "@/lib/shortcuts";
import { planSchema, type PlanValues } from "../schemas";


interface PlanFormProps {
  onSave: (agreement: NewAgreement) => void;
}

const MONEY_INPUT_CLASS = "font-mono tabular-nums text-right";

export function PlanForm({ onSave }: PlanFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PlanValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      cuotas: "",
      monto_cuota: "",
      tiene_anticipo: false,
      anticipo_fecha: addDaysIso(todayIso(), 1),
      anticipo_monto: "",
    },
  });

  useSubmitShortcut(formRef);

  const [cuotas, montoCuota, hasDownPayment, downPayment] = useWatch({
    control,
    name: ["cuotas", "monto_cuota", "tiene_anticipo", "anticipo_monto"],
  });
  const installmentCents = parseMoneyToCents(montoCuota);
  const downPaymentCents = hasDownPayment ? parseMoneyToCents(downPayment) : 0;
  const installmentCount = /^\d+$/.test(cuotas) ? Number(cuotas) : null;
  const total =
    installmentCents !== null && installmentCount !== null && downPaymentCents !== null
      ? installmentCents * installmentCount + downPaymentCents
      : null;

  const submit = handleSubmit((values) => {
    const montoCuotaCents = parseMoneyToCents(values.monto_cuota);
    const anticipoCents = parseMoneyToCents(values.anticipo_monto);
    if (montoCuotaCents === null) return;
    onSave({
      cuotas: Number(values.cuotas),
      monto_cuota: montoCuotaCents,
      anticipo:
        values.tiene_anticipo && anticipoCents !== null
          ? { fecha: values.anticipo_fecha, monto: anticipoCents }
          : undefined,
    });
    reset();
  });

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Cantidad de cuotas"
          inputMode="numeric"
          autoComplete="off"
          data-first-field
          placeholder="6"
          className="font-mono tabular-nums"
          error={errors.cuotas?.message}
          {...register("cuotas")}
        />
        <TextField
          label="Monto por cuota"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0,00"
          className={MONEY_INPUT_CLASS}
          error={errors.monto_cuota?.message}
          {...register("monto_cuota")}
        />
      </div>
      <CheckboxField label="Anticipo" {...register("tiene_anticipo")} />
      {hasDownPayment ? (
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Fecha del anticipo"
            type="date"
            min={todayIso()}
            className="font-mono tabular-nums"
            error={errors.anticipo_fecha?.message}
            {...register("anticipo_fecha")}
          />
          <TextField
            label="Monto del anticipo"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0,00"
            className={MONEY_INPUT_CLASS}
            error={errors.anticipo_monto?.message}
            {...register("anticipo_monto")}
          />
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-fg-muted" aria-live="polite">
          {total !== null && total > 0 ? (
            <>
              Total del plan <span className="font-mono tabular-nums text-fg-secondary">{formatMoney(total)}</span>
            </>
          ) : null}
        </p>
        <Button type="submit" variant="primary">
          Registrar acuerdo
          <Kbd tone="onAccent">{MOD_LABEL}+Enter</Kbd>
        </Button>
      </div>
    </form>
  );
}
