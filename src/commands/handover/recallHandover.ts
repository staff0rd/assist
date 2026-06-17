import { and, desc, eq, isNull } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { handovers } from "../../shared/db/schema";

/**
 * Load an unrecalled handover for `origin`, mark it recalled, and return its
 * content. When `id` is given, recalls that specific note; otherwise recalls
 * the most recent one. Returns `undefined` when no matching unrecalled note
 * exists.
 */
export async function recallHandover(
	orm: Db,
	origin: string,
	id?: number,
): Promise<string | undefined> {
	const [row] = await orm
		.select()
		.from(handovers)
		.where(
			and(
				eq(handovers.origin, origin),
				isNull(handovers.recalledAt),
				...(id === undefined ? [] : [eq(handovers.id, id)]),
			),
		)
		.orderBy(desc(handovers.createdAt), desc(handovers.id))
		.limit(1);
	if (!row) return undefined;

	await orm
		.update(handovers)
		.set({ recalledAt: new Date() })
		.where(eq(handovers.id, row.id));
	return row.content;
}
