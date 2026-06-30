import type { IncomingMessage, ServerResponse } from "node:http";
import { getDb } from "../../../shared/db/getDb";
import {
	countUsagePeaks,
	listUsagePeaks,
} from "../../../shared/db/listUsagePeaks";
import { respondJson } from "../../../shared/web";

const DEFAULT_PAGE_SIZE = 30;

/** Recorded per-cycle peak 5h/7d usage, newest cycle first, for the history page. */
export async function listUsageHistory(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const params = new URL(req.url ?? "/", "http://localhost").searchParams;
	const page = Math.max(0, Number(params.get("page")) || 0);
	const pageSize = Number(params.get("pageSize")) || DEFAULT_PAGE_SIZE;
	const db = await getDb();
	const [rows, total] = await Promise.all([
		listUsagePeaks(db, { limit: pageSize, offset: page * pageSize }),
		countUsagePeaks(db),
	]);
	respondJson(res, 200, { rows, total });
}
