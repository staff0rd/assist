import type { Migration } from "./Migration";

const sql = `
	CREATE TEMP TABLE cycle_canon ON COMMIT DROP AS
	WITH cycles AS (
		SELECT "window", resets_at FROM usage_peaks
		UNION
		SELECT "window", resets_at FROM phase_cycle_context
	),
	breaks AS (
		SELECT "window", resets_at,
			CASE WHEN resets_at - lag(resets_at) OVER (PARTITION BY "window" ORDER BY resets_at) <= 600
				THEN 0 ELSE 1 END AS starts_group
		FROM cycles
	),
	grouped AS (
		SELECT "window", resets_at,
			sum(starts_group) OVER (PARTITION BY "window" ORDER BY resets_at) AS grp
		FROM breaks
	)
	SELECT "window", resets_at, min(resets_at) OVER (PARTITION BY "window", grp) AS canon
	FROM grouped;

	DELETE FROM cycle_canon c
	WHERE NOT EXISTS (
		SELECT 1 FROM cycle_canon o
		WHERE o."window" = c."window" AND o.canon = c.canon AND o.resets_at <> c.resets_at
	);

	CREATE TEMP TABLE merged_peaks ON COMMIT DROP AS
	SELECT p."window", c.canon AS resets_at, p.segment,
		max(p.used_percentage) AS used_percentage,
		bool_or(p.reset_detected) AS reset_detected,
		sum(p.tokens_up) AS tokens_up,
		sum(p.tokens_down) AS tokens_down,
		min(p.created_at) AS created_at
	FROM usage_peaks p
	JOIN cycle_canon c ON c."window" = p."window" AND c.resets_at = p.resets_at
	GROUP BY p."window", c.canon, p.segment;

	DELETE FROM usage_peaks p
	USING cycle_canon c
	WHERE c."window" = p."window" AND c.resets_at = p.resets_at;

	INSERT INTO usage_peaks ("window", resets_at, segment, used_percentage, reset_detected, tokens_up, tokens_down, created_at)
	SELECT "window", resets_at, segment, used_percentage, reset_detected, tokens_up, tokens_down, created_at
	FROM merged_peaks;

	CREATE TEMP TABLE merged_phase_context ON COMMIT DROP AS
	SELECT x.item_id, x.phase_idx, x."window", c.canon AS resets_at,
		max(x.peak_context_pct) AS peak_context_pct
	FROM phase_cycle_context x
	JOIN cycle_canon c ON c."window" = x."window" AND c.resets_at = x.resets_at
	GROUP BY x.item_id, x.phase_idx, x."window", c.canon;

	DELETE FROM phase_cycle_context x
	USING cycle_canon c
	WHERE c."window" = x."window" AND c.resets_at = x.resets_at;

	INSERT INTO phase_cycle_context (item_id, phase_idx, "window", resets_at, peak_context_pct)
	SELECT item_id, phase_idx, "window", resets_at, peak_context_pct
	FROM merged_phase_context;
`;

export const migration0014MergeJitteredCycles: Migration = {
	id: 14,
	name: "merge-jittered-cycles",
	sql,
};
