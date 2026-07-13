import type { Migration } from "./Migration";

const sql = `
	-- destructive-ok: the context_pct_sum/context_readings accumulator (added in
	-- migration 2) was superseded by phase_cycle_context (migration 3); no build
	-- reads these columns — they are unmapped in Drizzle and never selected.
	ALTER TABLE usage_peaks DROP COLUMN IF EXISTS context_pct_sum;
	ALTER TABLE usage_peaks DROP COLUMN IF EXISTS context_readings;
`;

export const migration0004DropUsagePeaksContext: Migration = {
	id: 4,
	name: "drop-usage-peaks-context",
	sql,
};
