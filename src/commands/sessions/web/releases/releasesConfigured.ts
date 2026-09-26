import type { IncomingMessage, ServerResponse } from "node:http";
import { loadConfigFrom } from "../../../../shared/loadConfigFrom";
import { respondJson } from "../../../../shared/web";
import { getCwdParam } from "../getCwdParam";

export function releasesConfigured(
	req: IncomingMessage,
	res: ServerResponse,
): void {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	try {
		const streams = loadConfigFrom(cwd).releases?.streams ?? [];
		respondJson(res, 200, { configured: streams.length > 0 });
	} catch (error) {
		respondJson(res, 500, {
			error: error instanceof Error ? error.message : "Failed to read config",
		});
	}
}
