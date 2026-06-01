import type { BacklogDb } from "./BacklogDb";

type PhaseUpdateFields = {
	name?: string;
	task?: string[];
	manualCheck?: string[];
};

export async function applyPhaseUpdate(
	db: BacklogDb,
	itemId: number,
	phaseIdx: number,
	fields: PhaseUpdateFields,
): Promise<void> {
	await db.transaction(async (tx) => {
		if (fields.name) {
			await tx.run(
				"UPDATE plan_phases SET name = ? WHERE item_id = ? AND idx = ?",
				[fields.name, itemId, phaseIdx],
			);
		}

		if (fields.manualCheck) {
			await tx.run(
				"UPDATE plan_phases SET manual_checks = ? WHERE item_id = ? AND idx = ?",
				[JSON.stringify(fields.manualCheck), itemId, phaseIdx],
			);
		}

		if (fields.task) {
			await tx.run(
				"DELETE FROM plan_tasks WHERE item_id = ? AND phase_idx = ?",
				[itemId, phaseIdx],
			);

			for (let i = 0; i < fields.task.length; i++) {
				await tx.run(
					"INSERT INTO plan_tasks (item_id, phase_idx, idx, task) VALUES (?, ?, ?, ?)",
					[itemId, phaseIdx, i, fields.task[i]],
				);
			}
		}
	});
}
