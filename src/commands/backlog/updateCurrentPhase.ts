import type { BacklogDb } from "./openDb";

export function updateCurrentPhase(
	db: BacklogDb,
	id: number,
	phase: number,
): boolean {
	const result = db
		.prepare("UPDATE items SET current_phase = ? WHERE id = ?")
		.run(phase, id);
	return result.changes > 0;
}
