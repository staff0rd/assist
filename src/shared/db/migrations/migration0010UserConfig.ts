import type { Migration } from "./Migration";

const sql = `
	CREATE TABLE IF NOT EXISTS user_config (
		id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
		config JSONB NOT NULL,
		updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
	);
`;

export const migration0010UserConfig: Migration = {
	id: 10,
	name: "user-config",
	sql,
};
