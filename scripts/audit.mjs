import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { causeOf, uniqueById } from '../src/lib/kb/causes.ts';
import { summarise } from '../src/lib/kb/split-summary.ts';
import { deskRef } from '../src/lib/kb/desk-ref.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, 'src/lib/data', p), 'utf8'));
const raw = read('reports-4471.json');
const tenants = new Map(fs.readdirSync(path.join(root, 'src/lib/data/tenants')).filter((p) => p.endsWith('.json')).map((p) => { const t = read(`tenants/${p}`); return [t.handle, t]; }));
const tenantOf = (r) => tenants.get(r.tenant);
const summary = summarise(raw, tenantOf);
const signature = 'Codex with Cheryl Laird · what it shows · 2026-10-28';
const result = {
  snapshot: '2026-10-04', reviewed: '2026-10-28', signature, deskRef: deskRef(signature),
  rawRows: raw.length, uniqueReports: uniqueById(raw).length, ticketReports: summary.reports.length,
  overlappingRows: raw.length - uniqueById(raw).length,
  intakeDisagreements: summary.disagreements,
  groups: summary.groups.map((g) => ({ cause: g.cause, count: g.reports.length, tenants: g.tenants, firstSeen: g.firstSeen, lastSeen: g.lastSeen, taggedAs: g.taggedAs, reportIds: g.reports.map((r) => r.id) })),
  months: summary.months,
  anomalies: summary.reports.filter((r) => read('desk-notes.json').oneDayMove.includes(r.id)).map((r) => ({ id: r.id, classifiedAs: causeOf(r, tenantOf(r)), body: r.body }))
};
fs.mkdirSync(path.join(root, 'evidence'), { recursive: true });
fs.writeFileSync(path.join(root, 'evidence/4471-audit.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ ...result, groups: result.groups.map(({ reportIds, ...g }) => g) }, null, 2));
