import { getDb } from "../../../shared/db/getDb";
import { recordPhaseTokens } from "../../../shared/db/recordPhaseTokens";
import { loadConfig } from "../../../shared/loadConfig";
import { daemonLog } from "./daemonLog";

/**
 * Best-effort persistence of a phase's token spend. Returns early when no
 * database is configured — so getDb never trips its process.exit — and
 * swallows+logs any write failure, so accounting can never crash the daemon.
 */
export async function persistPhaseTokens(
	itemId: number,
	phaseIdx: number,
	totalIn: number,
	totalOut: number,
): Promise<void> {
	try {
		if (!process.env.ASSIST_DATABASE_URL && !loadConfig().database.url) return;
		await recordPhaseTokens(await getDb(), itemId, phaseIdx, totalIn, totalOut);
	} catch (error) {
		daemonLog(`phase-tokens persist failed: ${String(error)}`);
	}
}
