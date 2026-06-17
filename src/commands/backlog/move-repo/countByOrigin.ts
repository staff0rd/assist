import { count, eq } from "drizzle-orm";
import type { Db } from "../../../shared/db/Db";
import { items } from "../../../shared/db/schema";

/** Number of backlog items tagged with `origin`. */
export async function countByOrigin(orm: Db, origin: string): Promise<number> {
	const [{ cnt }] = await orm
		.select({ cnt: count() })
		.from(items)
		.where(eq(items.origin, origin));
	return cnt;
}
