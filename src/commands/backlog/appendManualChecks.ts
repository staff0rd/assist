import type { BacklogDatabase } from "../../shared/db/Db";
import { insertReviewPhase } from "./insertReviewPhase";
import { setManualChecks } from "./setManualChecks";

export async function appendManualChecks(
	db: BacklogDatabase,
	itemId: number,
	phaseIdx: number,
	target: { manualChecks?: string[] } | undefined,
	checks: string[],
): Promise<void> {
	if (!target) {
		await insertReviewPhase(db, itemId, phaseIdx, checks);
		return;
	}
	await setManualChecks(db, itemId, phaseIdx, [
		...(target.manualChecks ?? []),
		...checks,
	]);
}
