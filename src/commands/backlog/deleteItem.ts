import type { BacklogDb } from "./BacklogDb";
import { deleteItemRelations } from "./deleteItemRelations";

export async function deleteItem(db: BacklogDb, id: number): Promise<boolean> {
	return db.transaction(async (tx) => {
		await deleteItemRelations(tx, id);
		const result = await tx.run("DELETE FROM items WHERE id = ?", [id]);
		return result.changes > 0;
	});
}
