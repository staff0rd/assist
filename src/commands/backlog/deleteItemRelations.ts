import type { BacklogDb } from "./BacklogDb";

export async function deleteItemRelations(
	db: BacklogDb,
	itemId: number,
): Promise<void> {
	await db.run("DELETE FROM plan_tasks WHERE item_id = ?", [itemId]);
	await db.run("DELETE FROM plan_phases WHERE item_id = ?", [itemId]);
	await db.run("DELETE FROM comments WHERE item_id = ?", [itemId]);
	await db.run("DELETE FROM links WHERE item_id = ?", [itemId]);
}
