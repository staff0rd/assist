import type { IncomingMessage, ServerResponse } from "node:http";
import { countItemUsageByOrigin } from "../../../shared/db/countItemUsageByOrigin";
import { getDb } from "../../../shared/db/getDb";
import { parseItemUsageStatus } from "../../../shared/db/itemUsageWhere";
import { parseItemUsageSort } from "../../../shared/db/parseItemUsageSort";
import { itemUsageStats } from "../../../shared/db/itemUsageStats";
import { listItemUsageSummaries } from "../../../shared/db/listItemUsageSummaries";
import { respondPagedRows } from "./respondPagedRows";

export function listUsageItems(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	return respondPagedRows(req, res, async (range, params) => {
		const origin = params.get("origin") || undefined;
		const status = parseItemUsageStatus(params.get("status"));
		const sort = parseItemUsageSort(
			params.get("sort"),
			params.get("direction"),
		);
		const db = await getDb();
		const [rows, summary, origins] = await Promise.all([
			listItemUsageSummaries(db, { ...range, origin, status, sort }),
			itemUsageStats(db, { origin, status }),
			countItemUsageByOrigin(db),
		]);
		return { rows, total: summary.itemCount, summary, origins };
	});
}
