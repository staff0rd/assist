import chalk from "chalk";
import { findPhase } from "./findPhase";
import { adjustCurrentPhase, reindexPhases } from "./reindexPhases";

export async function removePhase(id: string, phase: string): Promise<void> {
	const found = await findPhase(id, phase);
	if (!found) return;
	const { result, db, itemId, phaseIdx } = found;

	await db.transaction(async (tx) => {
		await tx.run("DELETE FROM plan_tasks WHERE item_id = ? AND phase_idx = ?", [
			itemId,
			phaseIdx,
		]);
		await tx.run("DELETE FROM plan_phases WHERE item_id = ? AND idx = ?", [
			itemId,
			phaseIdx,
		]);
		await reindexPhases(tx, itemId);
		await adjustCurrentPhase(tx, result.item, phaseIdx);
	});

	console.log(
		chalk.green(`Removed phase ${phaseIdx + 1} from item #${itemId}.`),
	);
}
