import { and, eq } from "drizzle-orm";
import type { BacklogDatabase } from "../../../shared/db/Db";
import { planPhases } from "../../../shared/db/schema";
import { REVIEW_PHASE_NAME } from "../buildPhasePrompt";
import { buildReviewPhase } from "../buildReviewPhase";
import { foldLastManualChecks } from "../foldLastManualChecks";
import type { PlanUpdatePhase } from "./planUpdateSchema";

async function loadStoredReviewChecks(
	db: BacklogDatabase,
	itemId: number,
): Promise<string[]> {
	const rows = await db
		.select({ idx: planPhases.idx, manualChecks: planPhases.manualChecks })
		.from(planPhases)
		.where(
			and(
				eq(planPhases.itemId, itemId),
				eq(planPhases.name, REVIEW_PHASE_NAME),
			),
		);
	const last = rows.sort((a, b) => b.idx - a.idx)[0];
	return last?.manualChecks ? JSON.parse(last.manualChecks) : [];
}

export async function withFoldedReview(
	db: BacklogDatabase,
	itemId: number,
	authored: PlanUpdatePhase[],
): Promise<PlanUpdatePhase[]> {
	const stored = await loadStoredReviewChecks(db, itemId);
	const { phases, reviewChecks } = foldLastManualChecks(authored, stored);
	if (reviewChecks.length === 0) return phases;
	const review = buildReviewPhase();
	return [
		...phases,
		{
			name: review.name,
			tasks: review.tasks.map(({ task }) => task),
			manualChecks: reviewChecks,
		},
	];
}
