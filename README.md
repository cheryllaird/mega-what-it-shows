# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.

## This review

Start at `/kb/incidents/4471-split`. Its source is
`src/routes/kb/incidents/4471-split/+page.svx`; the compiled page is
`build/kb/incidents/4471-split.html`. `build/` includes the assets and the other kb pages.
The source export is retained separately in the local challenge folder.

The review follows the supplied tenant-based classifier. Timing anomalies remain visible
and unresolved. Decision 0001 is unchanged; decision 0002 proposes a replacement policy.

Install the locked dependencies with `npm ci --ignore-scripts`, then:

```
npm test
node scripts/audit.mjs
npm run build
npm run preview
```

Open `http://localhost:4173/kb/incidents/4471-split`. Totals and charts are computed from
the report JSON and tenant directory at build time. They are not a connection to the live
support desk. Refresh the export and rebuild before making current claims. The audit
records dated counts and report-ID membership in `evidence/4471-audit.json`.

Set `src/lib/data/issue-links.json` to the filed GitHub issue URLs, keyed by `parser` and
`hint`, then rebuild. Until then the rendered table labels them as prepared drafts.

Original ZIP SHA-256:
`267efc5ea61aca6efaaca842160ac4d0377d56bcbf5123e61c604d6ae99597f2`.
