import type { BacklogDb } from "./BacklogDb";
import { deleteItemRelations } from "./deleteItemRelations";
import { insertItemRelations } from "./insertItemRelations";
import type { BacklogFile, BacklogItem } from "./types";

async function upsertItem(
	db: BacklogDb,
	item: BacklogItem,
	origin: string,
): Promise<void> {
	await db.run(
		`INSERT INTO items (id, origin, type, name, description, acceptance_criteria, status, current_phase)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		 ON CONFLICT(id) DO UPDATE SET
			origin = excluded.origin,
			type = excluded.type,
			name = excluded.name,
			description = excluded.description,
			acceptance_criteria = excluded.acceptance_criteria,
			status = excluded.status,
			current_phase = excluded.current_phase`,
		[
			item.id,
			origin,
			item.type,
			item.name,
			item.description ?? null,
			JSON.stringify(item.acceptanceCriteria),
			item.status,
			item.currentPhase ?? null,
		],
	);
	await deleteItemRelations(db, item.id);
	await insertItemRelations(db, item);
}

/**
 * Keep the IDENTITY sequences ahead of any explicitly-inserted ids so that
 * subsequent auto-assigned ids never collide with existing rows.
 */
async function resyncSequences(db: BacklogDb): Promise<void> {
	await db.exec(
		"SELECT setval(pg_get_serial_sequence('items', 'id'), COALESCE((SELECT MAX(id) FROM items), 0) + 1, false)",
	);
	await db.exec(
		"SELECT setval(pg_get_serial_sequence('comments', 'id'), COALESCE((SELECT MAX(id) FROM comments), 0) + 1, false)",
	);
}

/**
 * Reconcile the set of items belonging to `origin`: items missing from `items`
 * are deleted, the rest are upserted. Items belonging to other origins are left
 * untouched, so saving from one repository never affects another's backlog.
 */
export async function saveAllItems(
	db: BacklogDb,
	items: BacklogFile,
	origin: string,
): Promise<void> {
	await db.transaction(async (tx) => {
		const existingIds = await tx.all<{ id: number }>(
			"SELECT id FROM items WHERE origin = ?",
			[origin],
		);
		const newIds = new Set(items.map((i) => i.id));

		for (const { id } of existingIds) {
			if (!newIds.has(id)) {
				await deleteItemRelations(tx, id);
				await tx.run("DELETE FROM items WHERE id = ?", [id]);
			}
		}

		for (const item of items) {
			await upsertItem(tx, item, origin);
		}

		await resyncSequences(tx);
	});
}
