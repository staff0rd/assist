import type { IncomingMessage, ServerResponse } from "node:http";
import { isHarnessAvailable } from "../../../shared/harnesses";
import { loadConfig } from "../../../shared/loadConfig";
import { respondJson } from "../../../shared/web";

export function harnessCapabilities(
	_req: IncomingMessage,
	res: ServerResponse,
): void {
	const config = loadConfig().harness;
	const codexForcedOff = config.exposeCodexActions === false;
	const exposeCodexActions = !codexForcedOff && isHarnessAvailable("codex");
	const piForcedOff = config.exposePiActions === false;
	const exposePiActions = !piForcedOff && isHarnessAvailable("pi");
	respondJson(res, 200, { exposeCodexActions, exposePiActions });
}
