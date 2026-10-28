<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import links from '#lib/data/issue-links.json';
  import engineering from '#lib/data/engineering-4471.json';
  import { tenantOf } from '#lib/kb/locales';
  import { summarise } from '#lib/kb/split-summary';
  import type { Report } from '#lib/kb/causes';

  const summary = $derived(summarise(reports as Report[], tenantOf));
  const anomalies = $derived(summary.reports.filter((r) => notes.oneDayMove.includes(r.id)));
  const titles: Record<string, string> = { parser: 'Shared parser ignores tenant date order', hint: 'Booking-v3 hint contradicts tenant parsing', unplaced: 'Needs investigation' };
  const issueLinks = links as Record<string, string>;
</script>

<p class="split-summary__total"><strong>{summary.reports.length}</strong> unique reports · <strong>{summary.groups.length}</strong> classified causes · <strong>{summary.disagreements}</strong> intake tags disagree with the tenant-based classification.</p>
<div class="split-summary__scroll">
  <table>
    <thead><tr><th>Problem</th><th>Reports</th><th>Tenants</th><th>First received</th><th>Last received</th><th>Ticket</th></tr></thead>
    <tbody>
      {#each summary.groups as group (group.cause)}
        <tr><td>{titles[group.cause]}</td><td>{group.reports.length}</td><td>{group.tenants}</td><td>{group.firstSeen}</td><td>{group.lastSeen}</td><td>{#if issueLinks[group.cause]}<a href={issueLinks[group.cause]}>GitHub issue</a>{:else}Draft prepared{/if}</td></tr>
      {/each}
    </tbody>
  </table>
</div>

<h2>Engineering update</h2>
<p>Engineering closed #{engineering.ticket} on {engineering.closed}, with different outcomes:</p>
<ul>
  {#each engineering.outcomes as result (result.cause)}
    <li><strong>{result.cause}: {result.outcome}</strong> — {result.note}.
      {#if issueLinks[result.cause]}<a href={issueLinks[result.cause]}>GitHub issue</a>{/if}
    </li>
  {/each}
</ul>
<p>Source: <a href={engineering.source}>the course's engineering update</a>, read on {engineering.observed}. The parser is reported fixed; the form-hint problem was closed because the form was retired. Closing a ticket does not imply that its original defect was repaired.</p>

<h2>Received is not merged</h2>
<p>Incoming reports span the months below. A bulk merge records when the desk filed them, not when the problem began. The July merge spike cannot date the incident's onset.</p>
<table><thead><tr><th>Month</th><th>Reports received</th><th>Reports merged</th></tr></thead><tbody>{#each summary.months as row (row.month)}<tr><td>{row.month}</td><td>{row.received}</td><td>{row.merged}</td></tr>{/each}</tbody></table>

<h2>Evidence that still needs investigation</h2>
<p>{anomalies.length} reports were read by the desk as a one-day move or timing anomaly. They remain included in their tenant-based group; this is a classification, not proof that a date-order defect caused each observation. Check original timestamps, timezone, booking payload and invite payload before deciding whether another ticket is needed.</p>
{#each anomalies as report (report.id)}<details><summary>{report.id} · {report.tenant} · {report.channel}</summary><p>{report.body}</p></details>{/each}

<style>
  .split-summary__total { padding: 1rem; background: var(--note-bg); border-left: 4px solid var(--accent); }
  .split-summary__scroll { overflow-x: auto; }
  details { padding: 0.6rem 0; border-bottom: 1px solid var(--line); }
  summary { cursor: pointer; }
</style>
