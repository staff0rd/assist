import type { IncomingMessage, ServerResponse } from "node:http";
import { getDb } from "../../../shared/db/getDb";
import { listJobRuns } from "../../../shared/db/listJobRuns";
import { respondPagedRows } from "./respondPagedRows";

export function listUsageJobs(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	return respondPagedRows(req, res, async (range) =>
		listJobRuns(await getDb(), range),
	);
}
