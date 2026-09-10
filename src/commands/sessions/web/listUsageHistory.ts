import type { IncomingMessage, ServerResponse } from "node:http";
import { countUsagePeaks } from "../../../shared/db/countUsagePeaks";
import { getDb } from "../../../shared/db/getDb";
import {
	listUsagePeaks,
	type UsagePeakWindow,
} from "../../../shared/db/listUsagePeaks";
import { respondPagedRows } from "./respondPagedRows";

function parseWindow(value: string | null): UsagePeakWindow | undefined {
	return value === "five_hour" || value === "seven_day" ? value : undefined;
}

/** Recorded per-cycle peak 5h/7d usage, newest cycle first, for the history page. */
export function listUsageHistory(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	return respondPagedRows(req, res, async (range, params) => {
		const window = parseWindow(params.get("window"));
		const db = await getDb();
		return Promise.all([
			listUsagePeaks(db, { ...range, window }),
			countUsagePeaks(db, window),
		]);
	});
}
