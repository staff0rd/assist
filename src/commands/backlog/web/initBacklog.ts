import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { init } from "../init";
import { applyCwdFromReq } from "./applyCwdFromReq";

export async function initBacklog(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	applyCwdFromReq(req);
	await init();
	respondJson(res, 200, { ok: true });
}
