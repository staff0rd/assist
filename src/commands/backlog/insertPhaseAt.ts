import type { BacklogDb } from "./BacklogDb";

export async function insertPhaseAt(
	db: BacklogDb,
	itemId: number,
	phaseIdx: number,
	name: string,
	tasks: string[],
	manualChecks: string | null,
	currentPhase: number | undefined,
): Promise<void> {
	await db.transaction(async (tx) => {
		// Shift existing phases at or after insertIdx (reverse order to avoid PK conflicts)
		const toShift = await tx.all<{ idx: number }>(
			"SELECT idx FROM plan_phases WHERE item_id = ? AND idx >= ? ORDER BY idx DESC",
			[itemId, phaseIdx],
		);

		for (const p of toShift) {
			await tx.run(
				"UPDATE plan_tasks SET phase_idx = ? WHERE item_id = ? AND phase_idx = ?",
				[p.idx + 1, itemId, p.idx],
			);
			await tx.run(
				"UPDATE plan_phases SET idx = ? WHERE item_id = ? AND idx = ?",
				[p.idx + 1, itemId, p.idx],
			);
		}

		// Insert the new phase
		await tx.run(
			"INSERT INTO plan_phases (item_id, idx, name, manual_checks) VALUES (?, ?, ?, ?)",
			[itemId, phaseIdx, name, manualChecks],
		);

		for (let i = 0; i < tasks.length; i++) {
			await tx.run(
				"INSERT INTO plan_tasks (item_id, phase_idx, idx, task) VALUES (?, ?, ?, ?)",
				[itemId, phaseIdx, i, tasks[i]],
			);
		}

		// Adjust currentPhase if it's at or after the insertion point
		if (currentPhase !== undefined && currentPhase - 1 >= phaseIdx) {
			await tx.run("UPDATE items SET current_phase = ? WHERE id = ?", [
				currentPhase + 1,
				itemId,
			]);
		}
	});
}
