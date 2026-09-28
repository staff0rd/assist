import type { IncomingMessage, ServerResponse } from "node:http";
import { loadConfig } from "../../../shared/loadConfig";
import { loadConfigFrom } from "../../../shared/loadConfigFrom";
import { respondJson } from "../../../shared/web";

export function newSessionDefaults(
	req: IncomingMessage,
	res: ServerResponse,
): void {
	const url = new URL(req.url ?? "/", "http://localhost");
	const cwd = url.searchParams.get("cwd");
	const config = cwd ? loadConfigFrom(cwd) : loadConfig();
	const mode = config.sessions?.newSessionMode ?? "draft";
	respondJson(res, 200, { mode });
}
