import { TZDate } from "@date-fns/tz";
import { differenceInCalendarDays, format } from "date-fns";

export const TIME_ZONE = "America/Argentina/Buenos_Aires";
const LOCALE = "es-AR";

export type Cents = bigint | number | string;

const money = new Intl.NumberFormat(LOCALE, { style: "currency", currency: "ARS" });

const amount = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function centsToDecimalString(cents: Cents): string {
  let value: bigint;
  if (typeof cents === "number") {
    if (!Number.isSafeInteger(cents)) throw new RangeError("Los centavos deben ser un entero seguro.");
    value = BigInt(cents);
  } else if (typeof cents === "string") {
    if (!/^-?\d+$/.test(cents)) throw new RangeError("Los centavos deben ser un entero.");
    value = BigInt(cents);
  } else {
    value = cents;
  }
  const negative = value < 0n;
  const digits = (negative ? -value : value).toString().padStart(3, "0");
  return `${negative ? "-" : ""}${digits.slice(0, -2)}.${digits.slice(-2)}`;
}

export function formatMoney(cents: Cents): string {
  return money.format(centsToDecimalString(cents) as unknown as number);
}

export function formatAmount(cents: Cents): string {
  return amount.format(centsToDecimalString(cents) as unknown as number);
}

function toTz(date: Date | string | number): TZDate {
  return new TZDate(new Date(date), TIME_ZONE);
}

export function formatDate(date: Date | string | number, now: Date = new Date()): string {
  const d = toTz(date);
  const sameYear = d.getFullYear() === toTz(now).getFullYear();
  return format(d, sameYear ? "dd/MM" : "dd/MM/yy");
}

export function formatTime(date: Date | string | number): string {
  return format(toTz(date), "HH:mm");
}

export function formatRelativeDay(date: Date | string | number, now: Date = new Date()): string {
  const days = differenceInCalendarDays(toTz(date), toTz(now));
  if (days === 0) return "hoy";
  if (days === 1) return "mañana";
  if (days === -1) return "ayer";
  if (days < 0 && days >= -7) return `hace ${-days} días`;
  if (days > 1 && days <= 7) return `en ${days} días`;
  return formatDate(date, now);
}

export function formatPhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  digits = digits.replace(/^54/, "").replace(/^9(?=\d{10}$)/, "").replace(/^0/, "");
  const areaLength = digits.startsWith("11") ? 2 : 3;
  if (digits.length === 12 && digits.slice(areaLength, areaLength + 2) === "15") {
    digits = digits.slice(0, areaLength) + digits.slice(areaLength + 2);
  }
  if (digits.length !== 10) return raw;
  const area = digits.slice(0, areaLength);
  const local = digits.slice(areaLength);
  const split = local.length - 4;
  return `${area} ${local.slice(0, split)}-${local.slice(split)}`;
}

export function formatDni(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 8) return raw;
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatCuit(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 11) return raw;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
}

export function formatCentsInput(cents: number): string {
  const digits = String(Math.abs(cents)).padStart(3, "0");
  return `${cents < 0 ? "-" : ""}${digits.slice(0, -2)},${digits.slice(-2)}`;
}

export function normalizeDni(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function parseMoneyToCents(input: string): number | null {
  const cleaned = input.replace(/[\s$]/g, "");
  if (!/^\d[\d.,]*$/.test(cleaned)) return null;

  let integerPart: string;
  let fraction = "";
  const lastComma = cleaned.lastIndexOf(",");
  if (lastComma !== -1) {
    integerPart = cleaned.slice(0, lastComma).replace(/\./g, "");
    fraction = cleaned.slice(lastComma + 1);
  } else {
    const lastDot = cleaned.lastIndexOf(".");
    const afterDot = lastDot === -1 ? "" : cleaned.slice(lastDot + 1);
    if (lastDot !== -1 && afterDot.length !== 3) {
      integerPart = cleaned.slice(0, lastDot).replace(/\./g, "");
      fraction = afterDot;
    } else {
      integerPart = cleaned.replace(/\./g, "");
    }
  }

  if (!/^\d+$/.test(integerPart) || !/^\d{0,2}$/.test(fraction)) return null;
  const cents = Number(integerPart) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}
