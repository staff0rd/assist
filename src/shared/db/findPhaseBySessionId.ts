import { and, eq } from "drizzle-orm";
import type { Db } from "./Db";
import { phaseUsage } from "./schema";

export async function findPhaseBySessionId(
	db: Db,
	itemId: number,
	claudeSessionId: string,
): Promise<number | undefined> {
	const rows = await db
		.select({ phaseIdx: phaseUsage.phaseIdx })
		.from(phaseUsage)
		.where(
			and(
				eq(phaseUsage.itemId, itemId),
				eq(phaseUsage.claudeSessionId, claudeSessionId),
			),
		)
		.limit(1);
	return rows[0]?.phaseIdx;
}
