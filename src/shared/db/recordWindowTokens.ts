import { and, eq, sql } from "drizzle-orm";
import type { Db } from "./Db";
import { usagePeaks } from "./schema";

export async function recordWindowTokens(
	db: Db,
	window: "five_hour" | "seven_day",
	resetsAt: number,
	tokensUp: number,
	tokensDown: number,
): Promise<void> {
	if (tokensUp <= 0 && tokensDown <= 0) return;
	await db
		.update(usagePeaks)
		.set({
			tokensUp: sql`${usagePeaks.tokensUp} + ${tokensUp}`,
			tokensDown: sql`${usagePeaks.tokensDown} + ${tokensDown}`,
		})
		.where(
			and(
				eq(usagePeaks.window, window),
				eq(usagePeaks.resetsAt, resetsAt),
				eq(usagePeaks.segment, 0),
			),
		);
}
