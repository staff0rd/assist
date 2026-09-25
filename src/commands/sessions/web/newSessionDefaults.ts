import type { IncomingMessage, ServerResponse } from "node:http";
import { loadConfig } from "../../../shared/loadConfig";
import { respondJson } from "../../../shared/web";

export function newSessionDefaults(
	_req: IncomingMessage,
	res: ServerResponse,
): void {
	const mode = loadConfig().sessions?.newSessionMode ?? "draft";
	respondJson(res, 200, { mode });
}
