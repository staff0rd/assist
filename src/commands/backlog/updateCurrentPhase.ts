import type { BacklogDb } from "./BacklogDb";

export async function updateCurrentPhase(
	db: BacklogDb,
	id: number,
	phase: number,
): Promise<boolean> {
	const result = await db.run(
		"UPDATE items SET current_phase = ? WHERE id = ?",
		[phase, id],
	);
	return result.changes > 0;
}
