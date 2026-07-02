import { getDb } from "../../../shared/db/getDb";
import { getPhaseActiveMs } from "../../../shared/db/getPhaseActiveMs";
import { loadConfig } from "../../../shared/loadConfig";
import { daemonLog } from "./daemonLog";

export async function loadPhaseActiveMs(
	itemId: number,
	phaseIdx: number,
): Promise<number | null> {
	try {
		if (!process.env.ASSIST_DATABASE_URL && !loadConfig().database.url)
			return null;
		return await getPhaseActiveMs(await getDb(), itemId, phaseIdx);
	} catch (error) {
		daemonLog(`phase-active-ms load failed: ${String(error)}`);
		return null;
	}
}
