import type { BacklogDatabase } from "../../shared/db/Db";
import { planPhases, planTasks } from "../../shared/db/schema";
import { buildReviewPhase } from "./buildReviewPhase";
import { serializeManualChecks } from "./serializeManualChecks";

export async function insertReviewPhase(
	db: BacklogDatabase,
	itemId: number,
	phaseIdx: number,
	checks: string[],
): Promise<void> {
	const review = buildReviewPhase();
	await db.insert(planPhases).values({
		itemId,
		idx: phaseIdx,
		name: review.name,
		manualChecks: serializeManualChecks(checks),
	});
	await db.insert(planTasks).values(
		review.tasks.map(({ task }, idx) => ({
			itemId,
			phaseIdx,
			idx,
			task,
		})),
	);
}
