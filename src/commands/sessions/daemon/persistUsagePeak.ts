import { getDb } from "../../../shared/db/getDb";
import { recordUsagePeak } from "../../../shared/db/recordUsagePeak";
import { loadConfig } from "../../../shared/loadConfig";
import type { RateLimits } from "../../../shared/RateLimits";
import { daemonLog } from "./daemonLog";

/**
 * Best-effort persistence of the per-cycle usage peaks for a limits update.
 * Returns early when no database is configured — so getDb never trips its
 * process.exit — and swallows+logs any write failure, so persistence can never
 * block, or crash, the limits broadcast to web clients.
 */
export async function persistUsagePeak(rateLimits: RateLimits): Promise<void> {
	try {
		if (!process.env.ASSIST_DATABASE_URL && !loadConfig().database.url) return;
		await recordUsagePeak(await getDb(), rateLimits);
	} catch (error) {
		daemonLog(`usage-peak persist failed: ${String(error)}`);
	}
}
