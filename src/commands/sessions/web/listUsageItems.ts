import type { IncomingMessage, ServerResponse } from "node:http";
import { countItemUsageSummaries } from "../../../shared/db/countItemUsageSummaries";
import { getDb } from "../../../shared/db/getDb";
import { listItemUsageSummaries } from "../../../shared/db/listItemUsageSummaries";
import { respondPagedRows } from "./respondPagedRows";

export function listUsageItems(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	return respondPagedRows(req, res, async (range) => {
		const db = await getDb();
		return Promise.all([
			listItemUsageSummaries(db, range),
			countItemUsageSummaries(db),
		]);
	});
}
