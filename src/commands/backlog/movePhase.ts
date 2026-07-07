import chalk from "chalk";
import { count, eq } from "drizzle-orm";
import { planPhases } from "../../shared/db/schema";
import { reorderPhaseRows } from "./reorderPhaseRows";
import { findOneItem } from "./shared";

function toIndex(value: string, phaseCount: number): number | undefined {
	const pos = Number.parseInt(value, 10);
	if (Number.isNaN(pos) || pos < 1 || pos > phaseCount) {
		console.log(
			chalk.red(
				`Position "${value}" is out of range. Must be between 1 and ${phaseCount}.`,
			),
		);
		process.exitCode = 1;
		return undefined;
	}
	return pos - 1;
}

export async function movePhase(
	id: string,
	from: string,
	to: string,
): Promise<void> {
	const found = await findOneItem(id);
	if (!found) return;
	const { orm, item } = found;
	const itemId = item.id;

	const [row] = await orm
		.select({ cnt: count() })
		.from(planPhases)
		.where(eq(planPhases.itemId, itemId));
	const phaseCount = row?.cnt ?? 0;

	const fromIdx = toIndex(from, phaseCount);
	if (fromIdx === undefined) return;
	const toIdx = toIndex(to, phaseCount);
	if (toIdx === undefined) return;

	if (fromIdx !== toIdx) {
		await reorderPhaseRows(orm, itemId, fromIdx, toIdx);
	}

	console.log(chalk.green(`Moved phase ${from} to position ${to}.`));
}
