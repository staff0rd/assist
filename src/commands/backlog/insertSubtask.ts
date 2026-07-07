import { sql } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { itemSubtasks } from "../../shared/db/schema";

export async function insertSubtask(
	orm: Db,
	itemId: number,
	title: string,
	description?: string,
): Promise<void> {
	await orm.insert(itemSubtasks).values({
		itemId,
		idx: sql`(SELECT COALESCE(MAX(${itemSubtasks.idx}) + 1, 0) FROM ${itemSubtasks} WHERE ${itemSubtasks.itemId} = ${itemId})`,
		title,
		description: description ?? null,
		status: "todo",
	});
}
