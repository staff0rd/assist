import { deleteItemRelations } from "./deleteItemRelations";
import { insertItemRelations } from "./insertItemRelations";
import type { BacklogDb } from "./openDb";
import type { BacklogFile, BacklogItem } from "./types";

function upsertItem(db: BacklogDb, item: BacklogItem): void {
	db.prepare(
		`INSERT INTO items (id, type, name, description, acceptance_criteria, status, current_phase)
		 VALUES (?, ?, ?, ?, ?, ?, ?)
		 ON CONFLICT(id) DO UPDATE SET
			type = excluded.type,
			name = excluded.name,
			description = excluded.description,
			acceptance_criteria = excluded.acceptance_criteria,
			status = excluded.status,
			current_phase = excluded.current_phase`,
	).run(
		item.id,
		item.type,
		item.name,
		item.description ?? null,
		JSON.stringify(item.acceptanceCriteria),
		item.status,
		item.currentPhase ?? null,
	);
	deleteItemRelations(db, item.id);
	insertItemRelations(db, item);
}

export function saveAllItems(db: BacklogDb, items: BacklogFile): void {
	const save = db.transaction(() => {
		const existingIds = db.prepare("SELECT id FROM items").all() as {
			id: number;
		}[];
		const newIds = new Set(items.map((i) => i.id));

		for (const { id } of existingIds) {
			if (!newIds.has(id)) {
				deleteItemRelations(db, id);
				db.prepare("DELETE FROM items WHERE id = ?").run(id);
			}
		}

		for (const item of items) {
			upsertItem(db, item);
		}
	});
	save();
}
