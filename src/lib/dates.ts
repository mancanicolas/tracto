import { TZDate } from "@date-fns/tz";
import { addDays, addMonths, format, startOfMonth } from "date-fns";
import { TIME_ZONE, formatDate, formatRelativeDay } from "./format";

const ISO_DATE_FORMAT = "yyyy-MM-dd";

export function parseIsoDate(iso: string): TZDate {
  const [year = 0, month = 1, day = 1] = iso.split("-").map(Number);
  return new TZDate(year, month - 1, day, TIME_ZONE);
}

export function todayIso(now: Date = new Date()): string {
  return format(new TZDate(now, TIME_ZONE), ISO_DATE_FORMAT);
}

export function addDaysIso(iso: string, days: number): string {
  return format(addDays(parseIsoDate(iso), days), ISO_DATE_FORMAT);
}

export function addMonthsIso(iso: string, months: number): string {
  return format(addMonths(parseIsoDate(iso), months), ISO_DATE_FORMAT);
}

export function startOfMonthIso(iso: string): string {
  return format(startOfMonth(parseIsoDate(iso)), ISO_DATE_FORMAT);
}

export function isInCurrentMonth(iso: string, now: Date = new Date()): boolean {
  return iso.slice(0, 7) === todayIso(now).slice(0, 7);
}

export function formatIsoDate(iso: string, now?: Date): string {
  return formatDate(parseIsoDate(iso), now);
}

export function formatIsoRelativeDay(iso: string, now?: Date): string {
  return formatRelativeDay(parseIsoDate(iso), now);
}
