import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { leftoverReport } from "../daemon/worktree/leftoverReport";

export async function leftovers(
	_req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	respondJson(res, 200, leftoverReport());
}
