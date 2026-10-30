import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { loadDocsRefreshState } from "../loadDocsRefreshState";
import { getOrigin, getReady } from "../shared";
import { applyCwdFromReq } from "./applyCwdFromReq";

export async function getDocsRefresh(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	applyCwdFromReq(req);
	const { orm } = await getReady();
	respondJson(res, 200, await loadDocsRefreshState(orm, getOrigin()));
}
