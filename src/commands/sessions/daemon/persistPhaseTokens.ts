import type { ActiveWindow } from "../../../shared/activeWindows";
import { getDb } from "../../../shared/db/getDb";
import { recordPhasePeakContext } from "../../../shared/db/recordPhasePeakContext";
import { recordPhaseTranscriptUsage } from "../../../shared/db/recordPhaseTranscriptUsage";
import { recordWindowTokens } from "../../../shared/db/recordWindowTokens";
import { loadConfig } from "../../../shared/loadConfig";
import { readTranscriptUsage } from "../shared/transcriptUsage";
import { daemonLog } from "./daemonLog";

/**
 * Best-effort persistence of a phase's token spend. Returns early when no
 * database is configured — so getDb never trips its process.exit — and
 * swallows+logs any write failure, so accounting can never crash the daemon.
 */
export async function persistPhaseTokens(
	itemId: number,
	phaseIdx: number,
	transcriptPath: string,
	usedPct: number | undefined,
	windows: ActiveWindow[],
): Promise<void> {
	try {
		if (!process.env.ASSIST_DATABASE_URL && !loadConfig().database.url) return;
		const db = await getDb();
		if (usedPct !== undefined)
			await recordPhasePeakContext(db, itemId, phaseIdx, usedPct);
		const responses = await readTranscriptUsage(transcriptPath);
		if (responses.length === 0) return;
		const { tokensUp, tokensDown } = await recordPhaseTranscriptUsage(
			db,
			itemId,
			phaseIdx,
			responses,
		);
		for (const { window, resetsAt } of windows) {
			await recordWindowTokens(db, window, resetsAt, tokensUp, tokensDown);
		}
	} catch (error) {
		daemonLog(`phase-tokens persist failed: ${String(error)}`);
	}
}
