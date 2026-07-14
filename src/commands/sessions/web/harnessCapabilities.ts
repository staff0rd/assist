import type { IncomingMessage, ServerResponse } from "node:http";
import { isHarnessAvailable } from "../../../shared/harnesses";
import { loadConfig } from "../../../shared/loadConfig";
import { respondJson } from "../../../shared/web";

export function harnessCapabilities(
	_req: IncomingMessage,
	res: ServerResponse,
): void {
	const forcedOff = loadConfig().harness.exposeCodexActions === false;
	const exposeCodexActions = !forcedOff && isHarnessAvailable("codex");
	respondJson(res, 200, { exposeCodexActions });
}
