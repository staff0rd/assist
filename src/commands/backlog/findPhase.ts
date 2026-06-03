import chalk from "chalk";
import { and, count, eq } from "drizzle-orm";
import { planPhases } from "./backlogSchema";
import { getBacklogOrm } from "./getBacklogOrm";
import { loadAndFindItem } from "./shared";

export async function findPhase(id: string, phase: string) {
	const result = await loadAndFindItem(id);
	if (!result) return undefined;

	const orm = await getBacklogOrm();
	const itemId = result.item.id;
	const phaseIdx = Number.parseInt(phase, 10) - 1;

	const [row] = await orm
		.select({ cnt: count() })
		.from(planPhases)
		.where(and(eq(planPhases.itemId, itemId), eq(planPhases.idx, phaseIdx)));

	if (!row || row.cnt === 0) {
		console.log(
			chalk.red(`Phase ${phaseIdx + 1} not found on item #${itemId}.`),
		);
		process.exitCode = 1;
		return undefined;
	}

	return { result, orm, itemId, phaseIdx };
}
