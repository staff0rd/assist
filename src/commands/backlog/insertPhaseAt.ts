import { count, eq } from "drizzle-orm";
import type { BacklogOrm } from "./BacklogOrm";
import { items, planPhases, planTasks } from "./backlogSchema";
import { shiftPhasesUp } from "./shiftPhasesUp";

export async function insertPhaseAt(
	orm: BacklogOrm,
	itemId: number,
	phaseIdx: number,
	name: string,
	tasks: string[],
	manualChecks: string | null,
	currentPhase: number | undefined,
): Promise<void> {
	await orm.transaction(async (tx) => {
		const [row] = await tx
			.select({ cnt: count() })
			.from(planPhases)
			.where(eq(planPhases.itemId, itemId));
		const phaseCount = row?.cnt ?? 0;

		// Open a gap by shifting existing phases at or after the insertion point.
		await shiftPhasesUp(tx, itemId, phaseIdx);

		await tx
			.insert(planPhases)
			.values({ itemId, idx: phaseIdx, name, manualChecks });

		if (tasks.length) {
			await tx
				.insert(planTasks)
				.values(tasks.map((task, i) => ({ itemId, phaseIdx, idx: i, task })));
		}

		// Adjust currentPhase if it's at or after the insertion point
		if (currentPhase !== undefined && currentPhase - 1 >= phaseIdx) {
			// At the review slot (all authored phases complete) the usual shift would
			// keep currentPhase pointing at review and skip the new phase on restart;
			// rewind to the inserted phase so it runs before review instead.
			const atReviewSlot = currentPhase - 1 >= phaseCount;
			await tx
				.update(items)
				.set({ currentPhase: atReviewSlot ? phaseIdx + 1 : currentPhase + 1 })
				.where(eq(items.id, itemId));
		}
	});
}
