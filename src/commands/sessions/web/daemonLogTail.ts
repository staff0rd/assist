import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { daemonPaths } from "../daemon/daemonPaths";
import { readLogTail } from "../shared/readLogTail";
import { resolveNodeName } from "../shared/resolveNodeName";

const DEFAULT_LINES = 200;
const MAX_LINES = 10_000;

function requestedLines(req: IncomingMessage): number {
	const raw = new URL(req.url ?? "/", "http://localhost").searchParams.get(
		"lines",
	);
	const parsed = Number.parseInt(raw ?? "", 10);
	if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_LINES;
	return Math.min(parsed, MAX_LINES);
}

export async function daemonLogTail(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	respondJson(res, 200, {
		nodeName: resolveNodeName(),
		path: daemonPaths.log,
		lines: readLogTail(daemonPaths.log, requestedLines(req)),
	});
}
