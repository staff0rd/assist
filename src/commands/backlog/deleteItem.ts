import { deleteItemRelations } from "./deleteItemRelations";
import type { BacklogDb } from "./openDb";

export function deleteItem(db: BacklogDb, id: number): boolean {
	const del = db.transaction(() => {
		deleteItemRelations(db, id);
		const result = db.prepare("DELETE FROM items WHERE id = ?").run(id);
		return result.changes > 0;
	});
	return del();
}
