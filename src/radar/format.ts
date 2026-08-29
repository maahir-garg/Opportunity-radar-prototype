import { PROTOTYPE_TODAY } from "./data";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Parse an ISO string that carries the +08:00 SGT offset into SGT parts. */
function sgtParts(iso: string) {
  const d = new Date(iso);
  // Shift to SGT (UTC+8) explicitly so output is stable regardless of runtime TZ.
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const local = new Date(utc + 8 * 3600000);
  return {
    day: local.getDate(),
    month: local.getMonth(),
    year: local.getFullYear(),
    hours: local.getHours(),
    minutes: local.getMinutes(),
  };
}

/** e.g. "2 Sep 2026" */
export function formatDate(iso: string): string {
  const p = sgtParts(iso);
  return `${p.day} ${MONTHS[p.month]} ${p.year}`;
}

/** e.g. "2 Sep 2026, 11:59 PM SGT" */
export function formatDeadline(iso: string): string {
  const p = sgtParts(iso);
  const ampm = p.hours >= 12 ? "PM" : "AM";
  let h = p.hours % 12;
  if (h === 0) h = 12;
  const mm = String(p.minutes).padStart(2, "0");
  return `${p.day} ${MONTHS[p.month]} ${p.year}, ${h}:${mm} ${ampm} SGT`;
}

/** e.g. "12–14 Sep 2026" for a programme range (date-only ISO). */
export function formatRange(start: string, end: string): string {
  const s = new Date(start + "T00:00:00+08:00");
  const e = new Date(end + "T00:00:00+08:00");
  const sp = sgtParts(s.toISOString());
  const ep = sgtParts(e.toISOString());
  if (sp.month === ep.month && sp.year === ep.year) {
    return `${sp.day}–${ep.day} ${MONTHS[sp.month]} ${sp.year}`;
  }
  return `${formatDate(s.toISOString())} – ${formatDate(e.toISOString())}`;
}

export function daysUntil(iso: string, from: Date = PROTOTYPE_TODAY): number {
  const target = new Date(iso).getTime();
  const diff = target - from.getTime();
  return Math.ceil(diff / 86400000);
}

/** Secondary relative label such as "Closes in 5 days". */
export function relativeDeadline(iso: string): string {
  const d = daysUntil(iso);
  if (d < 0) return `Closed ${formatDate(iso)}`;
  if (d === 0) return "Closes today";
  if (d === 1) return "Closes tomorrow";
  return `Closes in ${d} days`;
}

export function timestampLabel(iso: string): string {
  const p = sgtParts(iso);
  const ampm = p.hours >= 12 ? "PM" : "AM";
  let h = p.hours % 12;
  if (h === 0) h = 12;
  const mm = String(p.minutes).padStart(2, "0");
  return `${p.day} ${MONTHS[p.month]}, ${h}:${mm} ${ampm}`;
}
