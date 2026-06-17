import { and, asc, eq, ilike, or } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { comments, items, planPhases } from "../../shared/db/schema";

/**
 * Returns distinct item IDs matching the query across items, comments, and
 * plan_phases, scoped to `origin` when provided. Uses case-insensitive matching.
 */
export async function searchItemIds(
	orm: Db,
	query: string,
	origin?: string,
): Promise<number[]> {
	const pattern = `%${query}%`;
	const rows = await orm
		.selectDistinct({ id: items.id })
		.from(items)
		.leftJoin(comments, eq(comments.itemId, items.id))
		.leftJoin(planPhases, eq(planPhases.itemId, items.id))
		.where(
			and(
				origin ? eq(items.origin, origin) : undefined,
				or(
					ilike(items.name, pattern),
					ilike(items.description, pattern),
					ilike(items.acceptanceCriteria, pattern),
					ilike(comments.text, pattern),
					ilike(planPhases.name, pattern),
				),
			),
		)
		.orderBy(asc(items.id));
	return rows.map((r) => r.id);
}
