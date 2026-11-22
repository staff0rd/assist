import { asc, eq } from "drizzle-orm";
import type { BacklogDatabase } from "../../shared/db/Db";
import { planPhases } from "../../shared/db/schema";
import { appendManualChecks } from "./appendManualChecks";
import { REVIEW_PHASE_NAME } from "./buildPhasePrompt";
import { setManualChecks } from "./setManualChecks";

function parseChecks(raw: string | null): string[] {
	return raw ? JSON.parse(raw) : [];
}

export async function foldStoredManualChecks(
	db: BacklogDatabase,
	itemId: number,
): Promise<void> {
	const rows = await db
		.select({ name: planPhases.name, manualChecks: planPhases.manualChecks })
		.from(planPhases)
		.where(eq(planPhases.itemId, itemId))
		.orderBy(asc(planPhases.idx));
	const hasReview = rows.at(-1)?.name === REVIEW_PHASE_NAME;
	const lastIdx = hasReview ? rows.length - 2 : rows.length - 1;
	if (lastIdx < 0) return;
	const checks = parseChecks(rows[lastIdx].manualChecks);
	if (checks.length === 0) return;

	await setManualChecks(db, itemId, lastIdx, []);
	const review = hasReview
		? { manualChecks: parseChecks(rows[lastIdx + 1].manualChecks) }
		: undefined;
	await appendManualChecks(db, itemId, lastIdx + 1, review, checks);
}
