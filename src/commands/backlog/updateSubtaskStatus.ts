import { and, eq } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { itemSubtasks } from "../../shared/db/schema";
import type { SubtaskStatus } from "./types";

export async function updateSubtaskStatus(
	orm: Db,
	itemId: number,
	idx: number,
	status: SubtaskStatus,
): Promise<string | undefined> {
	const [row] = await orm
		.update(itemSubtasks)
		.set({ status })
		.where(and(eq(itemSubtasks.itemId, itemId), eq(itemSubtasks.idx, idx)))
		.returning({ title: itemSubtasks.title });
	return row?.title;
}
