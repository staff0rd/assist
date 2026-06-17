import { and, eq, isNull, sql } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { handovers } from "../../shared/db/schema";

/** Count the unrecalled handover notes for `origin`. */
export async function countPendingHandovers(
	orm: Db,
	origin: string,
): Promise<number> {
	const [row] = await orm
		.select({ count: sql<number>`count(*)::int` })
		.from(handovers)
		.where(and(eq(handovers.origin, origin), isNull(handovers.recalledAt)));
	return row?.count ?? 0;
}
