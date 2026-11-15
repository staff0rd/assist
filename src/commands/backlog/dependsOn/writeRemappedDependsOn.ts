import { and, eq } from "drizzle-orm";
import type { BacklogDatabase } from "../../../shared/db/Db";
import { planPhases } from "../../../shared/db/schema";
import { remapDependsOn } from "./remapDependsOn";

/** Rewrite every phase's dependencies after its rows were renumbered per `remapDependsOn`. */
export async function writeRemappedDependsOn(
	db: BacklogDatabase,
	itemId: number,
	remap: Parameters<typeof remapDependsOn>[0],
): Promise<void> {
	const remapped = remapDependsOn(remap);
	for (const [idx, dependsOn] of remapped.entries()) {
		await db
			.update(planPhases)
			.set({ dependsOn })
			.where(and(eq(planPhases.itemId, itemId), eq(planPhases.idx, idx)));
	}
}
