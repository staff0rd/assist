import type { Migration } from "./Migration";

const sql = `
	CREATE TEMP TABLE fold_targets ON COMMIT DROP AS
	WITH last_phases AS (
		SELECT p.item_id, max(p.idx) AS last_idx
		FROM plan_phases p
		JOIN items i ON i.id = p.item_id
		WHERE i.status = 'todo'
		GROUP BY p.item_id
	),
	shaped AS (
		SELECT l.item_id, l.last_idx, (r.name = 'Review') AS has_review,
			CASE WHEN r.name = 'Review' THEN l.last_idx - 1 ELSE l.last_idx END AS authored_idx
		FROM last_phases l
		JOIN plan_phases r ON r.item_id = l.item_id AND r.idx = l.last_idx
	)
	SELECT s.item_id, s.has_review, s.authored_idx, a.manual_checks AS checks
	FROM shaped s
	JOIN plan_phases a ON a.item_id = s.item_id AND a.idx = s.authored_idx
	WHERE a.manual_checks IS NOT NULL AND a.manual_checks::jsonb <> '[]'::jsonb;

	UPDATE plan_phases r
	SET manual_checks = (coalesce(r.manual_checks, '[]')::jsonb || t.checks::jsonb)::text
	FROM fold_targets t
	WHERE t.has_review AND r.item_id = t.item_id AND r.idx = t.authored_idx + 1;

	INSERT INTO plan_phases (item_id, idx, name, manual_checks)
	SELECT item_id, authored_idx + 1, 'Review', checks
	FROM fold_targets
	WHERE NOT has_review;

	INSERT INTO plan_tasks (item_id, phase_idx, idx, task)
	SELECT item_id, authored_idx + 1, 0,
		'Verify acceptance criteria, confirm manual checks, commit, mark done, and signal phase-done.'
	FROM fold_targets
	WHERE NOT has_review;

	UPDATE plan_phases a
	SET manual_checks = NULL
	FROM fold_targets t
	WHERE a.item_id = t.item_id AND a.idx = t.authored_idx;
`;

export const migration0015FoldLastManualChecks: Migration = {
	id: 15,
	name: "fold-last-manual-checks",
	sql,
};
