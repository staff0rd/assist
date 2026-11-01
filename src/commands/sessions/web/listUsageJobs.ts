import type { IncomingMessage, ServerResponse } from "node:http";
import { getDb } from "../../../shared/db/getDb";
import type { JobKind, JobTrigger } from "../../../shared/db/jobRuns";
import { jobRunTotals } from "../../../shared/db/jobRunTotals";
import {
	type JobRunFilters,
	listJobRuns,
} from "../../../shared/db/listJobRuns";
import { failTimedOutInboxScans } from "../../inbox/failTimedOutInboxScans";
import { respondPagedRows } from "./respondPagedRows";

const TOTALS_WINDOW_MS = 30 * 24 * 60 * 60_000;
const kinds: JobKind[] = ["inbox-scan", "review"];
const triggers: JobTrigger[] = ["scheduled", "manual"];

function pick<T extends string>(allowed: T[], value: string | null) {
	return allowed.find((option) => option === value);
}

function parseJobRunFilters(params: URLSearchParams): JobRunFilters {
	return {
		kind: pick(kinds, params.get("kind")),
		trigger: pick(triggers, params.get("trigger")),
	};
}

export function listUsageJobs(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	return respondPagedRows(req, res, async (range, params) => {
		const db = await getDb();
		await failTimedOutInboxScans(db);
		const [page, totals] = await Promise.all([
			listJobRuns(db, range, parseJobRunFilters(params)),
			jobRunTotals(db, new Date(Date.now() - TOTALS_WINDOW_MS)),
		]);
		return { ...page, totals };
	});
}
