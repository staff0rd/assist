import { and, desc, eq, isNull } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { handovers } from "../../shared/db/schema";

type PendingHandover = {
	id: number;
	summary: string;
	createdAt: Date;
};

/** List the unrecalled handover notes for `origin`, most recent first. */
export async function listPendingHandovers(
	orm: Db,
	origin: string,
): Promise<PendingHandover[]> {
	return orm
		.select({
			id: handovers.id,
			summary: handovers.summary,
			createdAt: handovers.createdAt,
		})
		.from(handovers)
		.where(and(eq(handovers.origin, origin), isNull(handovers.recalledAt)))
		.orderBy(desc(handovers.createdAt), desc(handovers.id));
}
