import chalk from "chalk";
import { and, eq } from "drizzle-orm";
import { planPhases, planTasks } from "./backlogSchema";
import { findPhase } from "./findPhase";
import { adjustCurrentPhase, reindexPhases } from "./reindexPhases";

export async function removePhase(id: string, phase: string): Promise<void> {
	const found = await findPhase(id, phase);
	if (!found) return;
	const { item, orm, itemId, phaseIdx } = found;

	await orm.transaction(async (tx) => {
		await tx
			.delete(planTasks)
			.where(
				and(eq(planTasks.itemId, itemId), eq(planTasks.phaseIdx, phaseIdx)),
			);
		await tx
			.delete(planPhases)
			.where(and(eq(planPhases.itemId, itemId), eq(planPhases.idx, phaseIdx)));
		await reindexPhases(tx, itemId);
		await adjustCurrentPhase(tx, item, phaseIdx);
	});

	console.log(
		chalk.green(`Removed phase ${phaseIdx + 1} from item #${itemId}.`),
	);
}
