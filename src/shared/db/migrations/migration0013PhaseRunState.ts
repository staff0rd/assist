import type { Migration } from "./Migration";

const sql = `
	ALTER TABLE plan_phases ADD COLUMN IF NOT EXISTS run_state TEXT;
	ALTER TABLE plan_phases ADD COLUMN IF NOT EXISTS run_token TEXT;
`;

export const migration0013PhaseRunState: Migration = {
	id: 13,
	name: "phase-run-state",
	sql,
};
