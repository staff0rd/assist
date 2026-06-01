import type { BacklogDb } from "./BacklogDb";
import type { BacklogItem } from "./types";

/** Renumber an item's phases to be contiguous from 0 after a deletion. */
export async function reindexPhases(
	db: BacklogDb,
	itemId: number,
): Promise<void> {
	const remaining = await db.all<{ idx: number }>(
		"SELECT idx FROM plan_phases WHERE item_id = ? ORDER BY idx",
		[itemId],
	);

	for (let i = 0; i < remaining.length; i++) {
		const oldIdx = remaining[i].idx;
		if (oldIdx === i) continue;
		await db.run(
			"UPDATE plan_tasks SET phase_idx = ? WHERE item_id = ? AND phase_idx = ?",
			[i, itemId, oldIdx],
		);
		await db.run(
			"UPDATE plan_phases SET idx = ? WHERE item_id = ? AND idx = ?",
			[i, itemId, oldIdx],
		);
	}
}

/** Shift currentPhase to stay valid after the phase at `removedIdx` is removed. */
export async function adjustCurrentPhase(
	db: BacklogDb,
	item: BacklogItem,
	removedIdx: number,
): Promise<void> {
	const currentPhase = item.currentPhase;
	if (currentPhase === undefined) return;
	const currentIdx = currentPhase - 1;

	if (removedIdx < currentIdx) {
		await db.run("UPDATE items SET current_phase = ? WHERE id = ?", [
			currentPhase - 1,
			item.id,
		]);
		return;
	}
	if (removedIdx !== currentIdx) return;

	const row = await db.get<{ cnt: number }>(
		"SELECT COUNT(*)::int as cnt FROM plan_phases WHERE item_id = ?",
		[item.id],
	);
	const cnt = row?.cnt ?? 0;
	await db.run("UPDATE items SET current_phase = ? WHERE id = ?", [
		cnt === 0 ? null : Math.min(currentPhase, cnt),
		item.id,
	]);
}
