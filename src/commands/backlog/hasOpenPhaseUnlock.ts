import { and, eq, notInArray, sql } from "drizzle-orm";
import { getDb } from "../../shared/db/getDb";
import { itemGitRefs, items } from "../../shared/db/schema";
import { phaseUnlockSuffix } from "./phaseUnlockRef";

export async function hasOpenPhaseUnlock(
	itemId: number,
	kind: "docs-unlock" | "schema-unlock",
	harness?: string,
): Promise<boolean> {
	const orm = await getDb();
	const suffix = phaseUnlockSuffix(harness);
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
					sql`'phase-' || coalesce(${items.currentPhase}, 1) || ${suffix}`,
				),
				notInArray(items.status, ["done", "wontdo"]),
			),
		)
		.limit(1);
	return row !== undefined;
}
