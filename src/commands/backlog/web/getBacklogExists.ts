import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { loadBacklog } from "../shared";
import { applyCwdFromReq } from "./applyCwdFromReq";

/**
 * In the Postgres-backed model there is no per-repo file to probe, so a
 * backlog "exists" when its origin has at least one item.
 */
export async function getBacklogExists(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	applyCwdFromReq(req);
	const items = await loadBacklog();
	respondJson(res, 200, { exists: items.length > 0 });
}
