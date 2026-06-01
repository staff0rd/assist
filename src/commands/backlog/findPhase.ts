import chalk from "chalk";
import { getBacklogDb } from "./getBacklogDb";
import { loadAndFindItem } from "./shared";

export async function findPhase(id: string, phase: string) {
	const result = await loadAndFindItem(id);
	if (!result) return undefined;

	const db = await getBacklogDb();
	const itemId = result.item.id;
	const phaseIdx = Number.parseInt(phase, 10) - 1;

	const row = await db.get<{ cnt: number }>(
		"SELECT COUNT(*)::int as cnt FROM plan_phases WHERE item_id = ? AND idx = ?",
		[itemId, phaseIdx],
	);

	if (!row || row.cnt === 0) {
		console.log(
			chalk.red(`Phase ${phaseIdx + 1} not found on item #${itemId}.`),
		);
		process.exitCode = 1;
		return undefined;
	}

	return { result, db, itemId, phaseIdx };
}
