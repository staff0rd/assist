import type { IncomingMessage, ServerResponse } from "node:http";
import { expandTilde } from "../../../shared/expandTilde";
import { loadConfig } from "../../../shared/loadConfig";
import { respondJson } from "../../../shared/web";
import { resolveRepoLocation } from "../resolveRepoLocation";

export function getRepoLocation(
	req: IncomingMessage,
	res: ServerResponse,
): void {
	const origin = new URL(req.url ?? "/", "http://localhost").searchParams.get(
		"origin",
	);
	if (!origin) {
		respondJson(res, 400, { error: "Missing origin" });
		return;
	}
	const baseDir = expandTilde(loadConfig().clone.baseDir);
	respondJson(res, 200, resolveRepoLocation(origin, undefined, baseDir));
}
