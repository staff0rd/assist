import type { IncomingMessage, ServerResponse } from "node:http";
import {
	getConfigDirFrom,
	loadConfigFrom,
} from "../../../shared/loadConfigFrom";
import { resolveRunConfigs } from "../../../shared/resolveRunConfigs";
import { respondJson } from "../../../shared/web";
import { getCwdParam } from "./getCwdParam";

export type ServerRunInfo = { name: string; port?: number };

function getServerRuns(cwd: string): ServerRunInfo[] {
	try {
		const { run } = loadConfigFrom(cwd);
		return resolveRunConfigs(run, getConfigDirFrom(cwd))
			.filter((r) => r.server)
			.map((r) => ({ name: r.name, port: r.port }));
	} catch {
		return [];
	}
}

export function handleServerRuns(
	req: IncomingMessage,
	res: ServerResponse,
): void {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	respondJson(res, 200, { runs: getServerRuns(cwd) });
}
