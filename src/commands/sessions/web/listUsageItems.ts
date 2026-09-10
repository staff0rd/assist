import type { IncomingMessage, ServerResponse } from "node:http";
import { countItemUsageByOrigin } from "../../../shared/db/countItemUsageByOrigin";
import { getDb } from "../../../shared/db/getDb";
import { itemUsageStats } from "../../../shared/db/itemUsageStats";
import { listItemUsageSummaries } from "../../../shared/db/listItemUsageSummaries";
import { respondPagedRows } from "./respondPagedRows";

export function listUsageItems(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	return respondPagedRows(req, res, async (range, params) => {
		const origin = params.get("origin") || undefined;
		const db = await getDb();
		const [rows, summary, origins] = await Promise.all([
			listItemUsageSummaries(db, { ...range, origin }),
			itemUsageStats(db, { origin }),
			countItemUsageByOrigin(db),
		]);
		return { rows, total: summary.itemCount, summary, origins };
	});
}
