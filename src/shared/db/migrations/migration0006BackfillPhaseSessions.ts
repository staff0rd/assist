import type { Migration } from "./Migration";

const sql = `
	INSERT INTO phase_sessions (item_id, phase_idx, claude_session_id, hostname, os_user)
	SELECT pu.item_id, pu.phase_idx, pu.claude_session_id, 'unknown', 'unknown'
	FROM phase_usage pu
	WHERE pu.claude_session_id IS NOT NULL
		AND EXISTS (SELECT 1 FROM items i WHERE i.id = pu.item_id)
	ON CONFLICT (item_id, phase_idx, claude_session_id) DO NOTHING;
`;

export const migration0006BackfillPhaseSessions: Migration = {
	id: 6,
	name: "backfill-phase-sessions",
	sql,
};
