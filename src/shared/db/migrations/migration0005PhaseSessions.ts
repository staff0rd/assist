import type { Migration } from "./Migration";

const sql = `
	CREATE TABLE IF NOT EXISTS phase_sessions (
		item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
		phase_idx INTEGER NOT NULL,
		claude_session_id TEXT NOT NULL,
		hostname TEXT NOT NULL,
		os_user TEXT NOT NULL,
		created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
		PRIMARY KEY (item_id, phase_idx, claude_session_id)
	);
`;

export const migration0005PhaseSessions: Migration = {
	id: 5,
	name: "phase-sessions",
	sql,
};
