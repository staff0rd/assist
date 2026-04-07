import chalk from "chalk";
import { commitBacklog } from "./commitBacklog";
import { exportToJsonl } from "./exportToJsonl";
import { adjustCurrentPhase, findPhase, reindexPhases } from "./findPhase";

export function removePhase(id: string, phase: string): void {
	const found = findPhase(id, phase);
	if (!found) return;
	const { result, dir, db, itemId, phaseIdx } = found;

	const run = db.transaction(() => {
		db.prepare(
			"DELETE FROM plan_tasks WHERE item_id = ? AND phase_idx = ?",
		).run(itemId, phaseIdx);

		db.prepare("DELETE FROM plan_phases WHERE item_id = ? AND idx = ?").run(
			itemId,
			phaseIdx,
		);

		reindexPhases(db, itemId);
		adjustCurrentPhase(db, result.item, phaseIdx);
	});
	run();

	exportToJsonl(db, dir);
	commitBacklog(itemId, result.item.name);
	console.log(chalk.green(`Removed phase ${phaseIdx} from item #${itemId}.`));
}
