import { groupByCause, uniqueById, type Report, type Tenant } from './causes.ts';

export function summarise(reports: Report[], tenantOf: (r: Report) => Tenant | undefined, ticket = 4471) {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const groups = groupByCause(merged, tenantOf);
  const months = new Map<string, { month: string; received: number; merged: number }>();
  for (const r of merged) {
    for (const [field, date] of [['received', r.receivedAt], ['merged', r.mergedAt]] as const) {
      if (!date) continue;
      const month = date.slice(0, 7);
      const row = months.get(month) ?? { month, received: 0, merged: 0 };
      row[field]++;
      months.set(month, row);
    }
  }
  return { reports: merged, groups, months: [...months.values()].sort((a, b) => a.month.localeCompare(b.month)), disagreements: groups.reduce((n, g) => n + g.reports.filter((r) => r.meta.intakeTag !== g.cause).length, 0) };
}
