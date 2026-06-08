import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { backlogHasItems } from "../loadBacklogSummaries";
import { applyCwdFromReq } from "./applyCwdFromReq";

/**
 * In the Postgres-backed model there is no per-repo file to probe, so a
 * backlog "exists" when its origin has at least one item. Probed with a single
 * `LIMIT 1` query — never loads the items or their relations.
 */
export async function getBacklogExists(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	applyCwdFromReq(req);
	respondJson(res, 200, { exists: await backlogHasItems() });
}
