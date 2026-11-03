import type { IncomingMessage, ServerResponse } from "node:http";
import { getInstallDir } from "../../../../shared/getInstallDir";
import { respondJson } from "../../../../shared/web";
import { isBuildPending } from "../../../watch/isBuildPending";
import { readBuiltVersion } from "../../../watch/readBuiltVersion";
import { ASSIST_VERSION } from "../../daemon/buildHello";
import { requestDaemonReply } from "../../daemon/requestDaemonReply";
import type { AutoUpdateReply } from "../../shared/AutoUpdateLoopState";
import type { NodeUpdateStatus } from "../../shared/NodeUpdateStatus";
import { resolveNodeName } from "../../shared/resolveNodeName";
import { extensionUpdateStatus } from "../../../extension/extensionUpdateStatus";
import { browserLink } from "../browser/browserLink";
import { latestSignedExtension } from "./latestSignedExtension";
import { pendingRestarts } from "./pendingRestarts";
import { readUpdateHistory } from "./readUpdateHistory";
import { webStartCommit } from "./webStartCommit";
import { changedSince } from "./changedSince";

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
	const buildPending = isBuildPending(installDir);
	const status: NodeUpdateStatus = {
		nodeName: resolveNodeName(),
		installDir,
		running: reply?.version ?? ASSIST_VERSION,
		built,
		buildPending,
		restart: pendingRestarts({
			daemonVersion: reply?.version,
			daemonStartCommit: reply?.startCommit,
			webStartCommit: webStartCommit.value(),
			built,
			buildPending,
			changedSince: changedSince(installDir),
		}),
		daemonReachable: reply !== undefined,
		loop: reply?.loop ?? {
			phase: "off",
			since: new Date().toISOString(),
			reason: "daemon not reachable",
		},
		history: readUpdateHistory(installDir),
		extension: extensionUpdateStatus(
			browserLink.connectedVersion(),
			await latestSignedExtension(),
		),
	};
	respondJson(res, 200, status);
}
