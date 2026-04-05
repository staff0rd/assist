import type { BacklogDb } from "./openDb";

export function deleteItemRelations(db: BacklogDb, itemId: number): void {
	db.prepare("DELETE FROM plan_tasks WHERE item_id = ?").run(itemId);
	db.prepare("DELETE FROM plan_phases WHERE item_id = ?").run(itemId);
	db.prepare("DELETE FROM comments WHERE item_id = ?").run(itemId);
	db.prepare("DELETE FROM links WHERE item_id = ?").run(itemId);
}
