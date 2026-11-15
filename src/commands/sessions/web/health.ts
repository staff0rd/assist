import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { ASSIST_VERSION, PROTOCOL_VERSION } from "../daemon/buildHello";
import { isDaemonRunning } from "../daemon/connectToDaemon";
import { readNodeRuntimeReport } from "../daemon/runtime/readNodeRuntimeReport";
import { queryNodes } from "../nodes/queryNodes";
import { resolveNodeName } from "../shared/resolveNodeName";
import { webStartCommit } from "./updates/webStartCommit";

export async function health(
	_req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const [reachable, nodes] = await Promise.all([
		isDaemonRunning(),
		queryNodes(),
	]);
	respondJson(res, 200, {
		nodeName: resolveNodeName(),
		version: ASSIST_VERSION,
		startCommit: webStartCommit.value(),
		protocol: PROTOCOL_VERSION,
		daemon: { reachable, runtime: readNodeRuntimeReport() },
		links: nodes?.links ?? [],
	});
}
