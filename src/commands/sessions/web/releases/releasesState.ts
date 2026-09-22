import type { IncomingMessage, ServerResponse } from "node:http";
import { loadConfigFrom } from "../../../../shared/loadConfigFrom";
import { respondJson } from "../../../../shared/web";
import { getCwdParam } from "../getCwdParam";
import { toGitCwd } from "../toGitCwd";
import { streamState } from "./streamState";

export async function releasesState(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	let streams;
	try {
		streams = loadConfigFrom(toGitCwd(cwd)).releases?.streams ?? [];
	} catch (error) {
		respondJson(res, 500, {
			error: error instanceof Error ? error.message : "Failed to read config",
		});
		return;
	}
	respondJson(res, 200, {
		streams: await Promise.all(streams.map((s) => streamState(cwd, s))),
	});
}
