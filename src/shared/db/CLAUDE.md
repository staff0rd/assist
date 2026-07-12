# Database

## Database schema changes (versioned migrations)

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
