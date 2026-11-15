import { eq } from "drizzle-orm";
import type { Db } from "../../../shared/db/Db";
import { items, planPhases, planTasks } from "../../../shared/db/schema";
import { toStoredDependsOn } from "../dependsOn/toStoredDependsOn";
import { serializeManualChecks } from "../serializeManualChecks";
import { clampCurrentPhase } from "./clampCurrentPhase";
import type { PlanUpdatePhase } from "./planUpdateSchema";

export async function replacePlan(
	orm: Db,
	itemId: number,
	phases: PlanUpdatePhase[],
	currentPhase: number | undefined,
): Promise<void> {
	await orm.transaction(async (tx) => {
		await tx.delete(planTasks).where(eq(planTasks.itemId, itemId));
		await tx.delete(planPhases).where(eq(planPhases.itemId, itemId));

		if (phases.length > 0) {
			await tx.insert(planPhases).values(
				phases.map((phase, idx) => ({
					itemId,
					idx,
					name: phase.name,
					manualChecks: serializeManualChecks(phase.manualChecks),
					dependsOn: toStoredDependsOn(phase.dependsOn, idx),
				})),
			);
		}

		const tasks = phases.flatMap((phase, phaseIdx) =>
			phase.tasks.map((task, idx) => ({ itemId, phaseIdx, idx, task })),
		);
		if (tasks.length > 0) await tx.insert(planTasks).values(tasks);

		if (currentPhase === undefined) return;
		const clamped = clampCurrentPhase(currentPhase, phases.length);
		if (clamped === currentPhase) return;
		await tx
			.update(items)
			.set({ currentPhase: clamped })
			.where(eq(items.id, itemId));
	});
}
