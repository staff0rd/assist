import type { BacklogDb } from "./BacklogDb";

/**
 * Returns distinct item IDs matching the query across items, comments, and
 * plan_phases, scoped to `origin` when provided. Uses case-insensitive matching.
 */
export async function searchItemIds(
	db: BacklogDb,
	query: string,
	origin?: string,
): Promise<number[]> {
	const pattern = `%${query}%`;
	const rows = await db.all<{ id: number }>(
		`SELECT DISTINCT i.id
		 FROM items i
		 LEFT JOIN comments c ON c.item_id = i.id
		 LEFT JOIN plan_phases p ON p.item_id = i.id
		 WHERE (?::text IS NULL OR i.origin = ?)
		   AND (
		     i.name ILIKE ?
		     OR i.description ILIKE ?
		     OR i.acceptance_criteria ILIKE ?
		     OR c.text ILIKE ?
		     OR p.name ILIKE ?
		   )
		 ORDER BY i.id`,
		[
			origin ?? null,
			origin ?? null,
			pattern,
			pattern,
			pattern,
			pattern,
			pattern,
		],
	);
	return rows.map((r) => r.id);
}
