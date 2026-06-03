import { eq } from "drizzle-orm";
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
			await tx
				.update(items)
				.set({ currentPhase: currentPhase + 1 })
				.where(eq(items.id, itemId));
		}
	});
}
