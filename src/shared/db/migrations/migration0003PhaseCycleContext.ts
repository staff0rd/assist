import type { Migration } from "./Migration";

const sql = `
	CREATE TABLE IF NOT EXISTS phase_cycle_context (
		item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
		phase_idx INTEGER NOT NULL,
		"window" TEXT NOT NULL,
		resets_at BIGINT NOT NULL,
		peak_context_pct DOUBLE PRECISION NOT NULL DEFAULT 0,
		PRIMARY KEY (item_id, phase_idx, "window", resets_at)
	);
`;

export const migration0003PhaseCycleContext: Migration = {
	id: 3,
	name: "phase-cycle-context",
	sql,
};
