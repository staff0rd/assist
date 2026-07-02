import { getDb } from "../../../shared/db/getDb";
import { recordPhaseActiveMs } from "../../../shared/db/recordPhaseActiveMs";
import { loadConfig } from "../../../shared/loadConfig";
import { daemonLog } from "./daemonLog";

/**
 * Best-effort persistence of a phase's active (running) time. Returns early when
 * no database is configured — so getDb never trips its process.exit — and
 * swallows+logs any write failure, so accounting can never crash the daemon.
 */
export async function persistPhaseActiveMs(
	itemId: number,
	phaseIdx: number,
	activeMs: number,
): Promise<void> {
	try {
		if (!process.env.ASSIST_DATABASE_URL && !loadConfig().database.url) return;
		await recordPhaseActiveMs(await getDb(), itemId, phaseIdx, activeMs);
	} catch (error) {
		daemonLog(`phase-active-ms persist failed: ${String(error)}`);
	}
}
