import { and, eq } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { itemSubtasks } from "../../shared/db/schema";
import type { SubtaskStatus } from "./types";

export type SubtaskUpdate = {
	title?: string;
	description?: string | null;
	status?: SubtaskStatus;
};

export async function updateSubtask(
	orm: Db,
	itemId: number,
	idx: number,
	fields: SubtaskUpdate,
): Promise<string | undefined> {
	const set: SubtaskUpdate = {};
	if (fields.title !== undefined) set.title = fields.title;
	if (fields.description !== undefined) set.description = fields.description;
	if (fields.status !== undefined) set.status = fields.status;

	const [row] = await orm
		.update(itemSubtasks)
		.set(set)
		.where(and(eq(itemSubtasks.itemId, itemId), eq(itemSubtasks.idx, idx)))
		.returning({ title: itemSubtasks.title });
	return row?.title;
}
