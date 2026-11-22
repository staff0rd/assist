import type { Db } from "../../shared/db/Db";
import { buildReviewPhase } from "./buildReviewPhase";
import { insertPhaseAt } from "./insertPhaseAt";
import { serializeManualChecks } from "./serializeManualChecks";

export async function insertReviewPhase(
	orm: Db,
	itemId: number,
	phaseIdx: number,
	checks: string[],
): Promise<void> {
	const review = buildReviewPhase();
	await insertPhaseAt(
		orm,
		itemId,
		phaseIdx,
		review.name,
		review.tasks.map(({ task }) => task),
		serializeManualChecks(checks),
		undefined,
	);
}
