import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { docsRefreshAfter } from "../docsRefreshAfter";
import { requestDocsRefresh } from "../requestDocsRefresh";
import { getOrigin, getReady } from "../shared";
import { applyCwdFromReq } from "./applyCwdFromReq";

export async function postDocsRefresh(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	applyCwdFromReq(req);
	if (docsRefreshAfter() === undefined) {
		respondJson(res, 409, {
			error:
				"Refresh docs is off for this repo; run `assist config set docs.refreshAfter <n>` to turn it on",
		});
		return;
	}
	const { orm } = await getReady();
	respondJson(res, 200, await requestDocsRefresh(orm, getOrigin()));
}
