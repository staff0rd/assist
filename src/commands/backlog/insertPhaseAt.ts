import type { BacklogDb } from "./openDb";

export function insertPhaseAt(
	db: BacklogDb,
	itemId: number,
	phaseIdx: number,
	name: string,
	tasks: string[],
	manualChecks: string | null,
	currentPhase: number | undefined,
): void {
	const run = db.transaction(() => {
		db.pragma("defer_foreign_keys = ON");
		// Shift existing phases at or after insertIdx (reverse order to avoid PK conflicts)
		const toShift = db
			.prepare(
				"SELECT idx FROM plan_phases WHERE item_id = ? AND idx >= ? ORDER BY idx DESC",
			)
			.all(itemId, phaseIdx) as { idx: number }[];

		for (const p of toShift) {
			db.prepare(
				"UPDATE plan_tasks SET phase_idx = ? WHERE item_id = ? AND phase_idx = ?",
			).run(p.idx + 1, itemId, p.idx);
			db.prepare(
				"UPDATE plan_phases SET idx = ? WHERE item_id = ? AND idx = ?",
			).run(p.idx + 1, itemId, p.idx);
		}

		// Insert the new phase
		db.prepare(
			"INSERT INTO plan_phases (item_id, idx, name, manual_checks) VALUES (?, ?, ?, ?)",
		).run(itemId, phaseIdx, name, manualChecks);

		const taskStmt = db.prepare(
			"INSERT INTO plan_tasks (item_id, phase_idx, idx, task) VALUES (?, ?, ?, ?)",
		);
		for (let i = 0; i < tasks.length; i++) {
			taskStmt.run(itemId, phaseIdx, i, tasks[i]);
		}

		// Adjust currentPhase if it's at or after the insertion point
		if (currentPhase !== undefined && currentPhase - 1 >= phaseIdx) {
			db.prepare("UPDATE items SET current_phase = ? WHERE id = ?").run(
				currentPhase + 1,
				itemId,
			);
		}
	});
	run();
}
