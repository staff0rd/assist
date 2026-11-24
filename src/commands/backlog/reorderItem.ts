import { and, eq, ne, sql } from "drizzle-orm";
import type { BacklogDatabase, Db } from "../../shared/db/Db";
import { items } from "../../shared/db/schema";
import { findOrderRow } from "./findOrderRow";
import { formatItemId } from "./formatItemId";
import { itemOrder } from "./itemOrder";
import { orderColumns } from "./orderColumns";
import { placeItemBeside } from "./placeItemBeside";
import { placeRelative } from "./placeRelative";

export type ItemPlacement =
	| { edge: "top" | "bottom" }
	| { side: "before" | "after"; targetId: number };

type OrderKey = { id: number; origin: string };

async function moveToTop(db: BacklogDatabase, moved: OrderKey): Promise<void> {
	const [first] = await db
		.select(orderColumns)
		.from(items)
		.where(and(eq(items.origin, moved.origin), ne(items.id, moved.id)))
		.orderBy(...itemOrder)
		.limit(1);
	if (first) await placeItemBeside(db, moved.id, first, "before");
}

async function moveToBottom(db: BacklogDatabase, id: number): Promise<void> {
	await db
		.update(items)
		.set({ priority: sql`nextval('items_priority_seq')` })
		.where(eq(items.id, id));
}

async function placeItem(
	db: BacklogDatabase,
	itemId: number,
	placement: ItemPlacement,
): Promise<string | undefined> {
	const moved = await findOrderRow(db, itemId);
	if (!moved) return `Item ${formatItemId(itemId)} not found.`;
	if ("side" in placement) return placeRelative(db, moved, placement);
	if (placement.edge === "bottom") await moveToBottom(db, itemId);
	else await moveToTop(db, moved);
	return undefined;
}

export async function reorderItem(
	orm: Db,
	itemId: number,
	placement: ItemPlacement,
): Promise<string | undefined> {
	return orm.transaction((tx) => placeItem(tx, itemId, placement));
}
