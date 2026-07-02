import { and, eq } from "drizzle-orm";
import type { Db } from "./Db";
import { phaseUsage } from "./schema";

export async function getPhaseActiveMs(
	db: Db,
	itemId: number,
	phaseIdx: number,
): Promise<number> {
	const [row] = await db
		.select({ activeMs: phaseUsage.activeMs })
		.from(phaseUsage)
		.where(
			and(eq(phaseUsage.itemId, itemId), eq(phaseUsage.phaseIdx, phaseIdx)),
		);
	return row?.activeMs ?? 0;
}
