# Database

## Do not add persistence for a value you can derive

Before adding any column, table, or write path, prove the value is not already
recoverable from what is stored. A schema change is only justified when the raw
material genuinely isn't persisted — not when it merely isn't _shaped_ the way a
feature wants to read it. Reshaping is a query's job.

Check, in order:

1. **Is the underlying figure already persisted?** An aggregate (average, total,
   rate) over rows you already store is a `SELECT ... GROUP BY`, not a new
   `*_sum`/`*_count` accumulator column.
2. **Is the grouping key already available at write time?** If the key you'd
   group by is in hand when the base fact is written, persist that association
   rather than standing up a parallel accumulator.
3. **Does the new write answer a _different_ question?** A sum/count of samples
   is a sample-weighted mean; an average of per-row peaks is a row-weighted mean.
   Persisting a metric that silently differs from the one asked for is worse than
   adding none.

Only author a migration once these confirm the value truly can't be derived, and
prefer the smallest addition that unlocks a query over a bespoke accumulator.

**Confirm any schema change with the user before writing it.** Once the three
checks above point to a genuine schema addition, present it and get explicit
sign-off first — do not add columns, tables, or migrations unsupervised.

## Database schema changes (versioned migrations)

**Once a migration has been _executed_ against any database — your own local dev DB included, committed or not — its id is permanently spent. Never edit, delete, or repurpose that id; only ever append a new numbered migration.** "Executed" is the trigger, not "committed" — the moment `assist db migrate` runs an id, `applied_migrations` records it, and `assist db status` thereafter compares ids only, so redefining that id reports a false "in sync" while the real schema silently diverges. If a just-authored migration is wrong, fix it with a _new_ append-only migration, not by rewriting the executed one.

Migrations are numbered TS modules under `src/shared/db/migrations/`, each exporting `{ id, name, sql }`, aggregated in id order by `index.ts`. `getDb` mutates nothing on connect: it runs a read-only guard comparing bundled migrations to the `applied_migrations` table (behind → run `assist db migrate`; ahead → update assist). `assist db migrate` applies pending migrations; `assist db status` reports.

### Authoring a migration

To change schema/data, append the next numbered module and register it in `index.ts` — never edit or reorder a shipped migration:

1. Add `migration000NName.ts` exporting `{ id: N, name, sql }` where `N` is one past the current highest id and the filename's zero-padded number matches `id`.
2. Register it in `migrations/index.ts`, appended after the existing entries so the array stays in ascending id order.
3. Run `assist db migrate` to apply it locally, then `assist db status` to confirm the DB is in sync. Data backfills are ordinary migrations too — express them as SQL in a new module rather than an ad-hoc `metadata`-flag pass.

`verify:migrations` gates all of this: it fails on a numbering gap, a file/registration mismatch, an edit or removal of a migration that already ships on the default branch (append-only), or unacknowledged destructive DDL.

### Expand/contract for destructive changes

Keep changes additive: a dropped or renamed column also breaks older builds' Drizzle `select()` reads (columns are named explicitly), so never drop or rename in the same migration that stops using the column. Split it across releases:

- **Expand**: add the new column/table and start writing to it; leave the old one in place. Ships and back-fills without breaking older builds.
- **Contract**: in a _later_ migration, once no live build reads the old column/table, drop it. A `DROP TABLE`, `DROP COLUMN`, or `RENAME COLUMN` must carry a `-- destructive-ok` comment in that migration's `sql` to pass `verify:migrations`; the marker is the explicit acknowledgement that the expand step shipped and nothing still reads the target.
