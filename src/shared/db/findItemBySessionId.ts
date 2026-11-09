import { asc, eq } from "drizzle-orm";
import type { Db } from "./Db";
import { phaseSessions, phaseUsage } from "./schema";

async function fromPhaseSessions(
	db: Db,
	conversationId: string,
): Promise<number | undefined> {
	const rows = await db
		.select({ itemId: phaseSessions.itemId })
		.from(phaseSessions)
		.where(eq(phaseSessions.claudeSessionId, conversationId))
		.orderBy(asc(phaseSessions.itemId), asc(phaseSessions.phaseIdx))
		.limit(1);
	return rows[0]?.itemId;
}

async function fromPhaseUsage(
	db: Db,
	conversationId: string,
): Promise<number | undefined> {
	const rows = await db
		.select({ itemId: phaseUsage.itemId })
		.from(phaseUsage)
		.where(eq(phaseUsage.claudeSessionId, conversationId))
		.orderBy(asc(phaseUsage.itemId), asc(phaseUsage.phaseIdx))
		.limit(1);
	return rows[0]?.itemId;
}

export async function findItemBySessionId(
	db: Db,
	conversationId: string,
): Promise<number | undefined> {
	return (
		(await fromPhaseSessions(db, conversationId)) ??
		(await fromPhaseUsage(db, conversationId))
	);
}
