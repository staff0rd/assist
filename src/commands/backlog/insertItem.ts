import type { BacklogDb } from "./BacklogDb";
import type { BacklogItem } from "./types";

type NewBacklogItem = Omit<BacklogItem, "id">;

/**
 * Insert a brand-new item, tagging it with `origin` and letting the database
 * assign a globally-unique auto-increment id. Returns the new id.
 */
export async function insertItem(
	db: BacklogDb,
	item: NewBacklogItem,
	origin: string,
): Promise<number> {
	const row = await db.get<{ id: number }>(
		`INSERT INTO items (origin, type, name, description, acceptance_criteria, status, current_phase)
		 VALUES (?, ?, ?, ?, ?, ?, ?)
		 RETURNING id`,
		[
			origin,
			item.type,
			item.name,
			item.description ?? null,
			JSON.stringify(item.acceptanceCriteria),
			item.status,
			item.currentPhase ?? null,
		],
	);
	if (!row) throw new Error("Failed to insert backlog item");
	return row.id;
}
