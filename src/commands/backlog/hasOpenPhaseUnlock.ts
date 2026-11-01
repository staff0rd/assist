import { and, eq, notInArray, sql } from "drizzle-orm";
import { getDb } from "../../shared/db/getDb";
import { itemGitRefs, items } from "../../shared/db/schema";

export async function hasOpenPhaseUnlock(
	itemId: number,
	kind: "docs-unlock" | "schema-unlock",
): Promise<boolean> {
	const orm = await getDb();
	const [row] = await orm
		.select({ itemId: itemGitRefs.itemId })
		.from(itemGitRefs)
		.innerJoin(items, eq(items.id, itemGitRefs.itemId))
		.where(
			and(
				eq(itemGitRefs.itemId, itemId),
				eq(itemGitRefs.kind, kind),
				eq(
					itemGitRefs.ref,
					sql`'phase-' || coalesce(${items.currentPhase}, 1)`,
				),
				notInArray(items.status, ["done", "wontdo"]),
			),
		)
		.limit(1);
	return row !== undefined;
}
