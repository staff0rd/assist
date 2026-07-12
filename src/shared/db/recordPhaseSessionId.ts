import type { Db } from "./Db";
import { phaseUsage } from "./schema";

export async function recordPhaseSessionId(
	db: Db,
	itemId: number,
	phaseIdx: number,
	claudeSessionId: string,
): Promise<void> {
	await db
		.insert(phaseUsage)
		.values({ itemId, phaseIdx, claudeSessionId })
		.onConflictDoUpdate({
			target: [phaseUsage.itemId, phaseUsage.phaseIdx],
			set: { claudeSessionId },
		});
}
