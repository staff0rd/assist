import type { Migration } from "./Migration";

const sql = `
	CREATE TABLE IF NOT EXISTS repo_configs (
		repo_key TEXT PRIMARY KEY,
		config JSONB NOT NULL,
		updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
	);
`;

export const migration0008RepoConfigs: Migration = {
	id: 8,
	name: "repo-configs",
	sql,
};
