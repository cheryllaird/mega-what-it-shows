import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { causeOf, sameCause, uniqueById } from '../src/lib/kb/causes.ts';
import { summarise } from '../src/lib/kb/split-summary.ts';
import { queueWeeks } from '../src/lib/kb/timeline.ts';

const read = (p) => JSON.parse(fs.readFileSync(new URL(`../src/lib/data/${p}`, import.meta.url), 'utf8'));
const tenants = new Map(fs.readdirSync(new URL('../src/lib/data/tenants', import.meta.url)).map((p) => { const t = read(`tenants/${p}`); return [t.handle, t]; }));
const tenantOf = (r) => tenants.get(r.tenant);
const raw = read('reports-4471.json');
const summary = summarise(raw, tenantOf);

test('overlapping export pages count each report once and partition the ticket', () => {
  assert.equal(raw.length, 427);
  assert.equal(summary.reports.length, 412);
  assert.deepEqual(Object.fromEntries(summary.groups.map((g) => [g.cause, g.reports.length])), { parser: 379, hint: 33 });
  assert.equal(new Set(summary.groups.flatMap((g) => g.reports.map((r) => r.id))).size, 412);
  assert.equal(summary.disagreements, 38);
  assert.deepEqual(uniqueById([raw[0], { ...raw[0], mergedInto: null }]), [{ ...raw[0], mergedInto: null }]);
});

test('tenant context and channel decide cause despite contrary intake tags or subject', () => {
  const a = { channel: 'form', meta: { intakeTag: 'parser' } };
  assert.equal(causeOf(a, tenants.get('alder.physio')), 'hint');
  assert.equal(causeOf(a, tenants.get('morrow.tax')), 'parser');
  assert.equal(causeOf({ ...a, channel: 'app' }, tenants.get('alder.physio')), 'parser');
  assert.equal(sameCause(a, tenants.get('alder.physio'), a, tenants.get('morrow.tax')), false);
  assert.equal(sameCause(a, undefined, a, undefined), false);
  assert.equal(causeOf(a, { locale: 'en-US', form: 'booking-v3' }), null);
});

test('later reports and a new tenant update counts and chart range without editing prose', () => {
  const tenant = { handle: 'new.tenant', locale: 'en-AU', form: 'booking-v3' };
  const report = { ...raw[0], id: 'R-new', tenant: tenant.handle, channel: 'form', receivedAt: '2026-11-02T09:00:00Z', mergedAt: '2026-11-03T09:00:00Z' };
  const lookup = (r) => r.tenant === tenant.handle ? tenant : tenantOf(r);
  const updated = summarise([...raw, report, report, { ...report, id: 'other-ticket', mergedInto: 9999 }], lookup);
  assert.equal(updated.reports.length, 413);
  assert.equal(updated.groups.find((g) => g.cause === 'hint').reports.length, 34);
  assert.deepEqual(updated.months.at(-1), { month: '2026-11', received: 1, merged: 1 });
  const weeks = queueWeeks([...raw, report, report], 4471);
  assert.equal(weeks.reduce((n, w) => n + w.received, 0), 413);
  assert.equal(weeks.reduce((n, w) => n + w.merged, 0), 413);
  assert.equal(new Date(weeks.at(-1).at).toISOString().slice(0, 10), '2026-11-02');
  assert.deepEqual(queueWeeks([], 4471), []);
});

test('receipt history does not inherit the bulk merge date', () => {
  assert.equal(summary.months.find((m) => m.month === '2026-04').received, 56);
  assert.equal(summary.months.find((m) => m.month === '2026-04').merged, 0);
  assert.equal(summary.months.reduce((n, m) => n + m.received, 0), 412);
  assert.equal(summary.months.reduce((n, m) => n + m.merged, 0), 412);
});
