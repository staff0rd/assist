import type { IncomingMessage, ServerResponse } from "node:http";
import { resolveHotkeys } from "../../../shared/hotkeys/resolveHotkeys";
import { loadConfig } from "../../../shared/loadConfig";
import { respondJson } from "../../../shared/web";

export function hotkeyBindings(
	_req: IncomingMessage,
	res: ServerResponse,
): void {
	respondJson(res, 200, resolveHotkeys(loadConfig().sessions?.hotkeys));
}
