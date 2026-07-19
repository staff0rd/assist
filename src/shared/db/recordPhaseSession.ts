import { sql } from "drizzle-orm";
import type { Db } from "./Db";
import { phaseSessions } from "./schema";

export async function recordPhaseSession(
	db: Db,
	itemId: number,
	phaseIdx: number,
	claudeSessionId: string,
	hostname: string,
	osUser: string,
): Promise<void> {
	await db
		.insert(phaseSessions)
		.values({ itemId, phaseIdx, claudeSessionId, hostname, osUser })
		.onConflictDoUpdate({
			target: [
				phaseSessions.itemId,
				phaseSessions.phaseIdx,
				phaseSessions.claudeSessionId,
			],
			set: { hostname, osUser },
			setWhere: sql`${phaseSessions.hostname} = 'unknown'`,
		});
}
