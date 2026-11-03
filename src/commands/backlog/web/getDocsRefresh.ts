import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { docsRefreshAfter } from "../docsRefreshAfter";
import {
	type DocsRefreshState,
	loadDocsRefreshState,
} from "../loadDocsRefreshState";
import { getOrigin, getReady } from "../shared";
import { applyCwdFromReq } from "./applyCwdFromReq";

export type DocsRefreshView = DocsRefreshState & { enabled: boolean };

export async function getDocsRefresh(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	applyCwdFromReq(req);
	const { orm } = await getReady();
	const state = await loadDocsRefreshState(orm, getOrigin());
	const view: DocsRefreshView = {
		...state,
		enabled: docsRefreshAfter() !== undefined,
	};
	respondJson(res, 200, view);
}
