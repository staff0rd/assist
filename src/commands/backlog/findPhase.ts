import chalk from "chalk";
import { and, count, eq } from "drizzle-orm";
import { planPhases } from "../../shared/db/schema";
import { findOneItem } from "./shared";

export async function findPhase(id: string, phase: string) {
	const found = await findOneItem(id);
	if (!found) return undefined;

	const { orm, item } = found;
	const itemId = item.id;
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

	return { item, orm, itemId, phaseIdx };
}
