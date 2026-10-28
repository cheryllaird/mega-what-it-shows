import { uniqueById, type Report } from './causes.ts';

const DAY = 86_400_000;
const WEEK = 7 * DAY;
const day = (iso: string) => Date.parse(iso.slice(0, 10));
const monday = (at: number) => at - ((new Date(at).getUTCDay() + 6) % 7) * DAY;

export function queueWeeks(reports: Report[], ticket: number, from?: string, to?: string) {
  const selected = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const dates = selected.flatMap((r) => [r.receivedAt, ...(r.mergedAt ? [r.mergedAt] : [])]).map(day);
  if (!dates.length) return [];
  const start = from ? day(from) : monday(Math.min(...dates));
  const end = to ? day(to) : monday(Math.max(...dates)) + WEEK;
  const count = Math.max(0, Math.ceil((end - start) / WEEK));
  const rows = Array.from({ length: count }, (_, i) => ({ at: start + i * WEEK, received: 0, merged: 0 }));
  const weekOf = (iso: string) => rows[Math.floor((day(iso) - start) / WEEK)];
  for (const r of selected) {
    const incoming = weekOf(r.receivedAt);
    if (incoming) incoming.received++;
    const merged = r.mergedAt ? weekOf(r.mergedAt) : undefined;
    if (merged) merged.merged++;
  }
  return rows;
}
