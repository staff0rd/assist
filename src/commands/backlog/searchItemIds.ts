import type { BacklogDb } from "./openDb";

/**
 * Returns distinct item IDs matching the query across items, comments, and plan_phases.
 * Uses case-insensitive SQL LIKE matching.
 */
export function searchItemIds(db: BacklogDb, query: string): number[] {
	const pattern = `%${query}%`;
	const rows = db
		.prepare(
			`SELECT DISTINCT id FROM items
			 WHERE name LIKE ? COLLATE NOCASE
			    OR description LIKE ? COLLATE NOCASE
			    OR acceptance_criteria LIKE ? COLLATE NOCASE
			 UNION
			 SELECT DISTINCT item_id AS id FROM comments
			 WHERE text LIKE ? COLLATE NOCASE
			 UNION
			 SELECT DISTINCT item_id AS id FROM plan_phases
			 WHERE name LIKE ? COLLATE NOCASE
			 ORDER BY id`,
		)
		.all(pattern, pattern, pattern, pattern, pattern) as { id: number }[];
	return rows.map((r) => r.id);
}
