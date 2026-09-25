import type { IncomingMessage, ServerResponse } from "node:http";
import { countUsagePeaks } from "../../../shared/db/countUsagePeaks";
import { getDb } from "../../../shared/db/getDb";
import {
	listUsagePeaks,
	type UsagePeakWindow,
} from "../../../shared/db/listUsagePeaks";
import {
	parseUsageWindowKey,
	usageWindowKey,
} from "../../../shared/usageWindowKey";
import { respondPagedRows } from "./respondPagedRows";

function parseWindow(value: string | null): UsagePeakWindow | undefined {
	if (!value) return undefined;
	const parsed = parseUsageWindowKey(value);
	return parsed ? usageWindowKey(parsed.harness, parsed.window) : undefined;
}

/** Recorded per-cycle peak 5h/7d usage per harness, newest cycle first, for the history page. */
export function listUsageHistory(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	return respondPagedRows(req, res, async (range, params) => {
		const window = parseWindow(params.get("window"));
		const db = await getDb();
		const [rows, total] = await Promise.all([
			listUsagePeaks(db, { ...range, window }),
			countUsagePeaks(db, window),
		]);
		return { rows, total };
	});
}
