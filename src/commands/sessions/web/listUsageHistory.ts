import type { IncomingMessage, ServerResponse } from "node:http";
import { getDb } from "../../../shared/db/getDb";
import { listUsagePeaks } from "../../../shared/db/listUsagePeaks";
import { respondJson } from "../../../shared/web";

/** Recorded per-cycle peak 5h/7d usage, newest cycle first, for the history page. */
export async function listUsageHistory(
	_req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	respondJson(res, 200, await listUsagePeaks(await getDb()));
}
