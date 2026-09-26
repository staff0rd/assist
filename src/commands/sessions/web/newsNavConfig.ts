import type { IncomingMessage, ServerResponse } from "node:http";
import { loadConfig } from "../../../shared/loadConfig";
import { respondJson } from "../../../shared/web";

export function newsNavConfig(
	_req: IncomingMessage,
	res: ServerResponse,
): void {
	const showInNav = loadConfig().news?.showInNav ?? false;
	respondJson(res, 200, { showInNav });
}
