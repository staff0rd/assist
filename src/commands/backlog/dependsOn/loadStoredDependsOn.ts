import { asc, eq } from "drizzle-orm";
import type { BacklogDatabase } from "../../../shared/db/Db";
import { planPhases } from "../../../shared/db/schema";

/** Each phase's stored 0-based dependencies, in phase order. */
export async function loadStoredDependsOn(
	db: BacklogDatabase,
	itemId: number,
): Promise<(number[] | null)[]> {
	const rows = await db
		.select({ dependsOn: planPhases.dependsOn })
		.from(planPhases)
		.where(eq(planPhases.itemId, itemId))
		.orderBy(asc(planPhases.idx));
	return rows.map((row) => row.dependsOn);
}
