import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { readConfigEntries } from "../../config/readConfigEntries";
import { getCwdParam } from "./getCwdParam";
import { toGitCwd } from "./toGitCwd";

export function getConfig(req: IncomingMessage, res: ServerResponse): void {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	try {
		respondJson(res, 200, readConfigEntries(toGitCwd(cwd)));
	} catch (error) {
		respondJson(res, 500, {
			error: error instanceof Error ? error.message : "Failed to read config",
		});
	}
}
