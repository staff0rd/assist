import type { Migration } from "./Migration";

const sql = `
	ALTER TABLE plan_phases ADD COLUMN IF NOT EXISTS depends_on INTEGER[];
`;

export const migration0012PhaseDependsOn: Migration = {
	id: 12,
	name: "phase-depends-on",
	sql,
};
