import { inArray } from "drizzle-orm";
import { getDb } from "../../../../shared/db/getDb";
import { items } from "../../../../shared/db/schema";

export async function loadItemStatuses(
	ids: number[],
): Promise<Map<number, string>> {
	const orm = await getDb();
	const rows = await orm
		.select({ id: items.id, status: items.status })
		.from(items)
		.where(inArray(items.id, ids));
	return new Map(rows.map((row) => [row.id, row.status]));
}
