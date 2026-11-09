import os from "node:os";
import { getDb } from "../../../shared/db/getDb";
import { recordPhaseSession } from "../../../shared/db/recordPhaseSession";
import { loadConfig } from "../../../shared/loadConfig";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { sessionBacklogPhase } from "./sessionBacklogPhase";

export async function recordBoundPhaseSession(
	session: Session,
	conversationId: string,
): Promise<void> {
	const phase = sessionBacklogPhase(session);
	if (!phase) return;
	try {
		if (!process.env.ASSIST_DATABASE_URL && !loadConfig().database.url) return;
		await recordPhaseSession(
			await getDb(),
			phase.itemId,
			phase.phaseIdx,
			conversationId,
			os.hostname(),
			os.userInfo().username,
		);
		daemonLog(
			`session ${session.id} recorded conversation ${conversationId} for item ${phase.itemId} phase ${phase.phaseIdx + 1}`,
		);
	} catch (error) {
		daemonLog(
			`session ${session.id} failed to record conversation ${conversationId} for item ${phase.itemId}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
