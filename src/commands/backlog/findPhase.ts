import chalk from "chalk";
import type { BacklogDb } from "./openDb";
import { openDb } from "./openDb";
import { getBacklogDir, loadAndFindItem } from "./shared";
import type { BacklogItem } from "./types";

export function findPhase(id: string, phase: string) {
	const result = loadAndFindItem(id);
	if (!result) return undefined;

	const dir = getBacklogDir();
	const db = openDb(dir);
	const itemId = result.item.id;
	const phaseIdx = Number.parseInt(phase, 10);

	const existing = db
		.prepare(
			"SELECT COUNT(*) as cnt FROM plan_phases WHERE item_id = ? AND idx = ?",
		)
		.get(itemId, phaseIdx) as { cnt: number };

	if (existing.cnt === 0) {
		console.log(chalk.red(`Phase ${phaseIdx} not found on item #${itemId}.`));
		process.exitCode = 1;
		return undefined;
	}

	return { result, dir, db, itemId, phaseIdx };
}

export function reindexPhases(db: BacklogDb, itemId: number): void {
	const remaining = db
		.prepare("SELECT idx FROM plan_phases WHERE item_id = ? ORDER BY idx")
		.all(itemId) as { idx: number }[];

	for (let i = 0; i < remaining.length; i++) {
		const oldIdx = remaining[i].idx;
		if (oldIdx !== i) {
			db.prepare(
				"UPDATE plan_tasks SET phase_idx = ? WHERE item_id = ? AND phase_idx = ?",
			).run(i, itemId, oldIdx);
			db.prepare(
				"UPDATE plan_phases SET idx = ? WHERE item_id = ? AND idx = ?",
			).run(i, itemId, oldIdx);
		}
	}
}

export function adjustCurrentPhase(
	db: BacklogDb,
	item: BacklogItem,
	removedIdx: number,
): void {
	if (item.currentPhase === undefined) return;

	if (removedIdx < item.currentPhase) {
		db.prepare("UPDATE items SET current_phase = ? WHERE id = ?").run(
			item.currentPhase - 1,
			item.id,
		);
	} else if (removedIdx === item.currentPhase) {
		const { cnt } = db
			.prepare("SELECT COUNT(*) as cnt FROM plan_phases WHERE item_id = ?")
			.get(item.id) as { cnt: number };
		const newPhase = cnt === 0 ? null : Math.min(item.currentPhase, cnt - 1);
		db.prepare("UPDATE items SET current_phase = ? WHERE id = ?").run(
			newPhase,
			item.id,
		);
	}
}
