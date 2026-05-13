import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { backlogExists, getBacklogDir } from "../shared";
import { applyCwdFromReq } from "./applyCwdFromReq";

export function getBacklogExists(
	req: IncomingMessage,
	res: ServerResponse,
): void {
	applyCwdFromReq(req);
	const dir = getBacklogDir();
	const exists = backlogExists();
	console.log("[backlog server] exists check → dir:", dir, "exists:", exists);
	respondJson(res, 200, { exists });
}
