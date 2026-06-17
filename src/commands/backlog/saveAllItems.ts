import { eq, sql } from "drizzle-orm";
import type { BacklogDatabase, Db } from "../../shared/db/Db";
import { items } from "../../shared/db/schema";
import { deleteItemRelations } from "./deleteItemRelations";
import { insertItemRelations } from "./insertItemRelations";
import { itemColumns } from "./itemColumns";
import type { BacklogFile, BacklogItem } from "./types";

async function upsertItem(
	db: BacklogDatabase,
	item: BacklogItem,
	origin: string,
): Promise<void> {
	const values = itemColumns(item, origin);
	await db
		.insert(items)
		.values({ id: item.id, ...values })
		.onConflictDoUpdate({ target: items.id, set: values });
	await deleteItemRelations(db, item.id);
	await insertItemRelations(db, item);
}

/**
 * Keep the IDENTITY sequences ahead of any explicitly-inserted ids so that
 * subsequent auto-assigned ids never collide with existing rows.
 */
async function resyncSequences(db: BacklogDatabase): Promise<void> {
	await db.execute(
		sql`SELECT setval(pg_get_serial_sequence('items', 'id'), COALESCE((SELECT MAX(id) FROM items), 0) + 1, false)`,
	);
	await db.execute(
		sql`SELECT setval(pg_get_serial_sequence('comments', 'id'), COALESCE((SELECT MAX(id) FROM comments), 0) + 1, false)`,
	);
}

/**
 * Reconcile the set of items belonging to `origin`: items missing from `items`
 * are deleted, the rest are upserted. Items belonging to other origins are left
 * untouched, so saving from one repository never affects another's backlog.
 */
export async function saveAllItems(
	orm: Db,
	file: BacklogFile,
	origin: string,
): Promise<void> {
	await orm.transaction(async (tx) => {
		const existingIds = await tx
			.select({ id: items.id })
			.from(items)
			.where(eq(items.origin, origin));
		const newIds = new Set(file.map((i) => i.id));

		for (const { id } of existingIds) {
			if (!newIds.has(id)) {
				await deleteItemRelations(tx, id);
				await tx.delete(items).where(eq(items.id, id));
			}
		}

		for (const item of file) {
			await upsertItem(tx, item, origin);
		}

		await resyncSequences(tx);
	});
}
