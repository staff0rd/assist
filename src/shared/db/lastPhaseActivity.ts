import { sql } from "drizzle-orm";
import type { Db } from "./Db";
import { phaseSessions } from "./schema";

export function lastPhaseActivity(db: Db) {
	return db
		.select({
			itemId: phaseSessions.itemId,
			at: sql<Date | null>`max(${phaseSessions.createdAt})`.as("last_phase_at"),
			atIso: sql<
				string | null
			>`to_char(max(${phaseSessions.createdAt}) at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`.as(
				"last_phase_at_iso",
			),
		})
		.from(phaseSessions)
		.groupBy(phaseSessions.itemId)
		.as("last_phase_activity");
}
