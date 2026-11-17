import { and, between, eq, sql } from "drizzle-orm";
import type { UsageWindowKey } from "../usageWindowKey";
import type { BacklogDatabase } from "./Db";
import { usagePeaks } from "./schema";

const CYCLE_RESET_TOLERANCE_SECONDS = 600;

export async function resolveCycleResetsAt(
	db: BacklogDatabase,
	window: UsageWindowKey,
	resetsAt: number,
): Promise<number> {
	const [nearest] = await db
		.select({ resetsAt: usagePeaks.resetsAt })
		.from(usagePeaks)
		.where(
			and(
				eq(usagePeaks.window, window),
				between(
					usagePeaks.resetsAt,
					resetsAt - CYCLE_RESET_TOLERANCE_SECONDS,
					resetsAt + CYCLE_RESET_TOLERANCE_SECONDS,
				),
			),
		)
		.orderBy(
			sql`abs(${usagePeaks.resetsAt} - ${resetsAt})`,
			usagePeaks.resetsAt,
		)
		.limit(1);
	return nearest?.resetsAt ?? resetsAt;
}
