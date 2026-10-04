import type { IncomingMessage, ServerResponse } from "node:http";
import { getInstallDir } from "../../../../shared/getInstallDir";
import { respondJson } from "../../../../shared/web";
import { changedPaths } from "../../../watch/changedPaths";
import { readBuiltVersion } from "../../../watch/readBuiltVersion";
import { ASSIST_VERSION } from "../../daemon/buildHello";
import { requestDaemonReply } from "../../daemon/requestDaemonReply";
import type { AutoUpdateReply } from "../../shared/AutoUpdateLoopState";
import type { NodeUpdateStatus } from "../../shared/NodeUpdateStatus";
import { resolveNodeName } from "../../shared/resolveNodeName";
import { pendingRestarts } from "./pendingRestarts";
import { readUpdateHistory } from "./readUpdateHistory";
import { webStartCommit } from "./webStartCommit";

function changedSince(installDir: string) {
	return (commit: string): string[] => {
		try {
			return changedPaths(commit, installDir);
		} catch {
			return [];
		}
	};
}

export async function updates(
	_req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const installDir = getInstallDir();
	const reply = await requestDaemonReply<AutoUpdateReply>(
		{ type: "auto-update" },
		"auto-update",
	);
	const built = readBuiltVersion(installDir);
	const status: NodeUpdateStatus = {
		nodeName: resolveNodeName(),
		installDir,
		running: reply?.version ?? ASSIST_VERSION,
		built,
		restart: pendingRestarts({
			daemonVersion: reply?.version,
			daemonStartCommit: reply?.startCommit,
			webStartCommit: webStartCommit.value(),
			built,
			changedSince: changedSince(installDir),
		}),
		daemonReachable: reply !== undefined,
		loop: reply?.loop ?? {
			phase: "off",
			since: new Date().toISOString(),
			reason: "daemon not reachable",
		},
		history: readUpdateHistory(installDir),
	};
	respondJson(res, 200, status);
}
