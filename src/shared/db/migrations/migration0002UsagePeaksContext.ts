import type { Migration } from "./Migration";

const sql = `
	ALTER TABLE usage_peaks ADD COLUMN IF NOT EXISTS context_pct_sum DOUBLE PRECISION NOT NULL DEFAULT 0;
	ALTER TABLE usage_peaks ADD COLUMN IF NOT EXISTS context_readings BIGINT NOT NULL DEFAULT 0;
`;

export const migration0002UsagePeaksContext: Migration = {
	id: 2,
	name: "usage-peaks-context",
	sql,
};
