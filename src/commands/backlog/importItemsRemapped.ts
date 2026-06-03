import type { BacklogOrm } from "./BacklogOrm";
import { insertItem } from "./insertItem";
import { insertItemRelations } from "./insertItemRelations";
import type { BacklogItem } from "./types";

/** Rewrite an item's cross-item references onto the freshly-assigned global ids. */
function remap(
	item: BacklogItem,
	newId: number,
	oldToNew: Map<number, number>,
) {
	const remapped: BacklogItem = {
		...item,
		id: newId,
		// comment ids are per-repo; drop them so the global comments table assigns
		// fresh ids rather than colliding with rows from other repositories.
		comments: item.comments?.map((c) => ({ ...c, id: undefined })),
		links: item.links?.flatMap((l) => {
			const targetId = oldToNew.get(l.targetId);
			return targetId === undefined ? [] : [{ type: l.type, targetId }];
		}),
	};
	return remapped;
}

/**
 * Insert items under `origin` in a single transaction, letting the database
 * assign fresh globally-unique ids and rewriting every link target from its old
 * id to the new one. A two-pass approach is used so links can reference items
 * that appear later in the input. Returns the number of items imported.
 */
export async function importItemsRemapped(
	orm: BacklogOrm,
	items: BacklogItem[],
	origin: string,
): Promise<number> {
	return orm.transaction(async (tx) => {
		const oldToNew = new Map<number, number>();
		for (const item of items) {
			// insertItem ignores the incoming id and lets the DB assign a global one.
			oldToNew.set(item.id, await insertItem(tx, item, origin));
		}
		for (const item of items) {
			const newId = oldToNew.get(item.id);
			if (newId === undefined) continue;
			await insertItemRelations(tx, remap(item, newId, oldToNew));
		}
		return items.length;
	});
}
