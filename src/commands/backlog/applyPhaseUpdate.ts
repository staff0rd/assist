import { and, eq } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { planPhases, planTasks } from "../../shared/db/schema";

type PhaseUpdateFields = {
	name?: string;
	task?: string[];
	manualCheck?: string[];
};

export async function applyPhaseUpdate(
	orm: Db,
	itemId: number,
	phaseIdx: number,
	fields: PhaseUpdateFields,
): Promise<void> {
	await orm.transaction(async (tx) => {
		if (fields.name) {
			await tx
				.update(planPhases)
				.set({ name: fields.name })
				.where(
					and(eq(planPhases.itemId, itemId), eq(planPhases.idx, phaseIdx)),
				);
		}

		if (fields.manualCheck) {
			await tx
				.update(planPhases)
				.set({ manualChecks: JSON.stringify(fields.manualCheck) })
				.where(
					and(eq(planPhases.itemId, itemId), eq(planPhases.idx, phaseIdx)),
				);
		}

		if (fields.task) {
			await tx
				.delete(planTasks)
				.where(
					and(eq(planTasks.itemId, itemId), eq(planTasks.phaseIdx, phaseIdx)),
				);

			if (fields.task.length) {
				await tx.insert(planTasks).values(
					fields.task.map((task, i) => ({
						itemId,
						phaseIdx,
						idx: i,
						task,
					})),
				);
			}
		}
	});
}
