import { and, asc, eq } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { planPhases, planTasks } from "../../shared/db/schema";
import { reindexPhases } from "./reindexPhases";
import { shiftPhasesUp } from "./shiftPhasesUp";

export async function reorderPhaseRows(
	orm: Db,
	itemId: number,
	fromIdx: number,
	toIdx: number,
): Promise<void> {
	await orm.transaction(async (tx) => {
		const [phaseRow] = await tx
			.select({ name: planPhases.name, manualChecks: planPhases.manualChecks })
			.from(planPhases)
			.where(and(eq(planPhases.itemId, itemId), eq(planPhases.idx, fromIdx)));
		const tasks = await tx
			.select({ idx: planTasks.idx, task: planTasks.task })
			.from(planTasks)
			.where(and(eq(planTasks.itemId, itemId), eq(planTasks.phaseIdx, fromIdx)))
			.orderBy(asc(planTasks.idx));

		await tx
			.delete(planTasks)
			.where(
				and(eq(planTasks.itemId, itemId), eq(planTasks.phaseIdx, fromIdx)),
			);
		await tx
			.delete(planPhases)
			.where(and(eq(planPhases.itemId, itemId), eq(planPhases.idx, fromIdx)));
		await reindexPhases(tx, itemId);
		await shiftPhasesUp(tx, itemId, toIdx);
		await tx.insert(planPhases).values({
			itemId,
			idx: toIdx,
			name: phaseRow.name,
			manualChecks: phaseRow.manualChecks,
		});
		if (tasks.length) {
			await tx.insert(planTasks).values(
				tasks.map((t) => ({
					itemId,
					phaseIdx: toIdx,
					idx: t.idx,
					task: t.task,
				})),
			);
		}
	});
}
