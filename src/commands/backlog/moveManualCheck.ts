import { and, eq } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { planPhases, planTasks } from "../../shared/db/schema";
import { buildReviewPhase } from "./buildReviewPhase";
import { serializeManualChecks } from "./serializeManualChecks";
import type { BacklogItem } from "./types";

function setManualChecks(
	tx: Pick<Db, "update">,
	itemId: number,
	phaseIdx: number,
	checks: string[],
) {
	return tx
		.update(planPhases)
		.set({ manualChecks: serializeManualChecks(checks) })
		.where(and(eq(planPhases.itemId, itemId), eq(planPhases.idx, phaseIdx)));
}

export async function moveManualCheck(
	orm: Db,
	item: BacklogItem,
	fromIdx: number,
	checkIdx: number,
	toIdx: number,
): Promise<void> {
	const plan = item.plan ?? [];
	const from = [...(plan[fromIdx]?.manualChecks ?? [])];
	const [check] = from.splice(checkIdx, 1);
	if (check === undefined) throw new Error(`No manual check ${checkIdx + 1}`);

	await orm.transaction(async (tx) => {
		await setManualChecks(tx, item.id, fromIdx, from);
		const target = plan[toIdx];
		if (target) {
			await setManualChecks(tx, item.id, toIdx, [
				...(target.manualChecks ?? []),
				check,
			]);
			return;
		}
		const review = buildReviewPhase();
		await tx.insert(planPhases).values({
			itemId: item.id,
			idx: toIdx,
			name: review.name,
			manualChecks: serializeManualChecks([check]),
		});
		await tx.insert(planTasks).values(
			review.tasks.map(({ task }, i) => ({
				itemId: item.id,
				phaseIdx: toIdx,
				idx: i,
				task,
			})),
		);
	});
}
