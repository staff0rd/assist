import { eq } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { items, planPhases, planTasks } from "../../shared/db/schema";
import { shiftPhasesUp } from "./shiftPhasesUp";

export async function insertPhaseAt(
	orm: Db,
	itemId: number,
	phaseIdx: number,
	name: string,
	tasks: string[],
	manualChecks: string | null,
	currentPhase: number | undefined,
): Promise<void> {
	await orm.transaction(async (tx) => {
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

		if (currentPhase !== undefined && currentPhase - 1 >= phaseIdx) {
			await tx
				.update(items)
				.set({ currentPhase: phaseIdx + 1 })
				.where(eq(items.id, itemId));
		}
	});
}
