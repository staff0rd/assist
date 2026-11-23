import { eq } from "drizzle-orm";
import type { BacklogDatabase } from "../../shared/db/Db";
import { items } from "../../shared/db/schema";
import { orderColumns } from "./orderColumns";

export async function findOrderRow(db: BacklogDatabase, id: number) {
	const [row] = await db
		.select(orderColumns)
		.from(items)
		.where(eq(items.id, id));
	return row;
}
