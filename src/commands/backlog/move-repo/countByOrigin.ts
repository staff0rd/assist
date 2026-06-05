import { count, eq } from "drizzle-orm";
import type { BacklogOrm } from "../BacklogOrm";
import { items } from "../backlogSchema";

/** Number of backlog items tagged with `origin`. */
export async function countByOrigin(
	orm: BacklogOrm,
	origin: string,
): Promise<number> {
	const [{ cnt }] = await orm
		.select({ cnt: count() })
		.from(items)
		.where(eq(items.origin, origin));
	return cnt;
}
