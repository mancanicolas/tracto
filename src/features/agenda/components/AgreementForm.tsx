import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { Kbd } from "@/components/ui/Kbd";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { ENTIDADES, hasMultipleProducts } from "@/constants/entidades";
import { useSubmitShortcut } from "@/hooks/useSubmitShortcut";
import type { NewAgreement } from "@/lib/agreements";
import { cn } from "@/lib/cn";
import { addDaysIso, todayIso } from "@/lib/dates";
import { formatMoney, parseMoneyToCents } from "@/lib/format";
import { MOD_LABEL } from "@/lib/shortcuts";
import type { AgreementKind } from "@/lib/types";
import { agreementSchema, type AgreementValues } from "../schemas";

interface AgreementFormProps {
  entidad?: string;
  balance?: number;
  onSave: (agreement: NewAgreement) => void;
}

const MONEY_INPUT_CLASS = "font-mono tabular-nums text-right";

const KINDS: { key: AgreementKind; label: string }[] = [
  { key: "cuotas", label: "Cuotas" },
  { key: "parcial", label: "Pago parcial" },
];

export function AgreementForm({ entidad, balance, onSave }: AgreementFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const requiresProduct = hasMultipleProducts(entidad);
  const schema = useMemo(() => agreementSchema(requiresProduct, balance), [requiresProduct, balance]);
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<AgreementValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo: "cuotas",
      producto: "",
      cuotas: "",
      monto_cuota: "",
      primer_vencimiento: addDaysIso(todayIso(), 30),
      tiene_anticipo: false,
      anticipo_fecha: addDaysIso(todayIso(), 1),
      anticipo_monto: "",
      monto_parcial: "",
      fecha_parcial: addDaysIso(todayIso(), 1),
    },
  });

  useSubmitShortcut(formRef);

  const [kind, cuotas, montoCuota, hasDownPayment, downPayment, partialAmount] = useWatch({
    control,
    name: ["tipo", "cuotas", "monto_cuota", "tiene_anticipo", "anticipo_monto", "monto_parcial"],
  });
  const installmentCents = parseMoneyToCents(montoCuota);
  const downPaymentCents = hasDownPayment ? parseMoneyToCents(downPayment) : 0;
  const installmentTotal = /^\d+$/.test(cuotas) ? Number(cuotas) : null;
  const planTotal =
    installmentCents !== null && installmentTotal !== null && downPaymentCents !== null
      ? installmentCents * installmentTotal + downPaymentCents
      : null;
  const partialCents = parseMoneyToCents(partialAmount);
  const remaining =
    balance !== undefined && partialCents !== null && partialCents > 0 && partialCents < balance
      ? balance - partialCents
      : null;

  const selectKind = (next: AgreementKind) => {
    setValue("tipo", next);
    clearErrors();
  };

  const submit = handleSubmit((values) => {
    const producto = requiresProduct ? values.producto : undefined;
    if (values.tipo === "parcial") {
      const amount = parseMoneyToCents(values.monto_parcial);
      if (amount === null) return;
      onSave({ tipo: "parcial", monto: amount, fecha: values.fecha_parcial, producto });
    } else {
      const installmentAmount = parseMoneyToCents(values.monto_cuota);
      const downPaymentAmount = parseMoneyToCents(values.anticipo_monto);
      if (installmentAmount === null) return;
      onSave({
        tipo: "cuotas",
        cuotas: Number(values.cuotas),
        monto_cuota: installmentAmount,
        primer_vencimiento: values.primer_vencimiento,
        producto,
        anticipo:
          values.tiene_anticipo && downPaymentAmount !== null
            ? { fecha: values.anticipo_fecha, monto: downPaymentAmount }
            : undefined,
      });
    }
    reset();
  });

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="flex flex-col gap-3">
      {requiresProduct ? (
        <SelectField
          label="Producto"
          placeholder="Elegir el producto"
          options={(ENTIDADES[entidad ?? ""]?.productos ?? []).map((value) => ({ value, label: value }))}
          error={errors.producto?.message}
          {...register("producto")}
        />
      ) : null}

      <div role="group" aria-label="Tipo de acuerdo" className="flex rounded-sm border border-line p-0.5">
        {KINDS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            aria-pressed={kind === key}
            onClick={() => selectKind(key)}
            className={cn(
              "h-6 flex-1 rounded-xs text-xs font-medium transition-colors duration-100 motion-reduce:transition-none",
              kind === key ? "bg-raised text-fg shadow-[var(--shadow-inset)]" : "text-fg-secondary hover:text-fg",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {kind === "cuotas" ? (
        <>
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
            <TextField
              label="Fecha de primera cuota"
              type="date"
              min={todayIso()}
              className="font-mono tabular-nums"
              error={errors.primer_vencimiento?.message}
              {...register("primer_vencimiento")}
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
        </>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Monto a abonar"
            inputMode="decimal"
            autoComplete="off"
            data-first-field
            placeholder="0,00"
            className={MONEY_INPUT_CLASS}
            error={errors.monto_parcial?.message}
            {...register("monto_parcial")}
          />
          <TextField
            label="Fecha de vencimiento"
            type="date"
            min={todayIso()}
            className="font-mono tabular-nums"
            error={errors.fecha_parcial?.message}
            {...register("fecha_parcial")}
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-fg-muted" aria-live="polite">
          {kind === "cuotas" && planTotal !== null && planTotal > 0 ? (
            <>
              Total del plan <span className="font-mono tabular-nums text-fg-secondary">{formatMoney(planTotal)}</span>
            </>
          ) : null}
          {kind === "parcial" && remaining !== null ? (
            <>
              Saldo pendiente <span className="font-mono tabular-nums text-fg-secondary">{formatMoney(remaining)}</span>
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
