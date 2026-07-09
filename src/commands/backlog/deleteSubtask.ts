import { and, asc, eq } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { itemSubtasks } from "../../shared/db/schema";

export async function deleteSubtask(
	orm: Db,
	itemId: number,
	idx: number,
): Promise<string | undefined> {
	const [row] = await orm
		.delete(itemSubtasks)
		.where(and(eq(itemSubtasks.itemId, itemId), eq(itemSubtasks.idx, idx)))
		.returning({ title: itemSubtasks.title });
	if (!row) return undefined;

	const remaining = await orm
		.select({ idx: itemSubtasks.idx })
		.from(itemSubtasks)
		.where(eq(itemSubtasks.itemId, itemId))
		.orderBy(asc(itemSubtasks.idx));

	for (let i = 0; i < remaining.length; i++) {
		const oldIdx = remaining[i].idx;
		if (oldIdx === i) continue;
		await orm
			.update(itemSubtasks)
			.set({ idx: i })
			.where(
				and(eq(itemSubtasks.itemId, itemId), eq(itemSubtasks.idx, oldIdx)),
			);
	}

	return row.title;
}
