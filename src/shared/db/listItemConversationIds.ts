import { asc, eq } from "drizzle-orm";
import type { Db } from "./Db";
import { phaseSessions, phaseUsage } from "./schema";

export async function listItemConversationIds(
	db: Db,
	itemId: number,
): Promise<string[]> {
	const sessions = await db
		.select({ id: phaseSessions.claudeSessionId })
		.from(phaseSessions)
		.where(eq(phaseSessions.itemId, itemId))
		.orderBy(asc(phaseSessions.phaseIdx), asc(phaseSessions.createdAt));
	const usage = await db
		.select({ id: phaseUsage.claudeSessionId })
		.from(phaseUsage)
		.where(eq(phaseUsage.itemId, itemId))
		.orderBy(asc(phaseUsage.phaseIdx));
	const ids = [...sessions, ...usage]
		.map((row) => row.id)
		.filter((id): id is string => Boolean(id));
	return [...new Set(ids)];
}
